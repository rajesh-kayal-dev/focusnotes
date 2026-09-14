import {
  baseKeymap,
  liftEmptyBlock,
  createParagraphNear,
  newlineInCode,
  splitBlock,
} from "@milkdown/kit/prose/commands";
import { undo, redo } from "@milkdown/kit/prose/history";
import { keymap } from "@milkdown/kit/prose/keymap";
import { Plugin } from "@milkdown/kit/prose/state";
import type { Node, ResolvedPos } from "@milkdown/kit/prose/model";
import {
  Selection,
  type EditorState,
  type Transaction,
} from "@milkdown/kit/prose/state";
import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from "@milkdown/kit/prose/schema-list";
import { $prose } from "@milkdown/kit/utils";

type Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => boolean;

/**
 * Determine the target node depth to delete or move.
 */
function getTargetBlockDepth($pos: ResolvedPos): number {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.name === "list_item" || node.type.name === "task_list_item") {
      return d;
    }
    if (d === 1) {
      return 1;
    }
  }
  return 1;
}

/**
 * Move current line/block up or down.
 */
export const moveLineOrBlock = (direction: "up" | "down"): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    if ($from.depth === 0) return false;

    let targetDepth = getTargetBlockDepth($from);
    let parent = $from.node(targetDepth - 1);
    let index = $from.index(targetDepth - 1);

    if (
      targetDepth > 1 &&
      ((direction === "up" && index === 0) ||
        (direction === "down" && index >= parent.childCount - 1))
    ) {
      targetDepth = 1;
      parent = $from.node(0);
      index = $from.index(0);
    }

    if (direction === "up") {
      if (index === 0) return false;
      const node = $from.node(targetDepth);
      const fromPos = $from.before(targetDepth);
      const toPos = $from.after(targetDepth);
      const prevNode = parent.child(index - 1);
      const insertPos = fromPos - prevNode.nodeSize;

      if (dispatch) {
        let tr = state.tr.delete(fromPos, toPos);
        tr = tr.insert(insertPos, node);
        const relOffset = Math.min($from.pos - fromPos, node.nodeSize - 2);
        const targetPos = Math.max(
          1,
          Math.min(insertPos + relOffset, tr.doc.content.size - 1)
        );
        const sel = Selection.near(tr.doc.resolve(targetPos));
        tr = tr.setSelection(sel).scrollIntoView();
        dispatch(tr);
      }
      return true;
    } else {
      if (index >= parent.childCount - 1) return false;
      const node = $from.node(targetDepth);
      const fromPos = $from.before(targetDepth);
      const toPos = $from.after(targetDepth);
      const nextNode = parent.child(index + 1);
      const insertPos = fromPos + nextNode.nodeSize;

      if (dispatch) {
        let tr = state.tr.delete(fromPos, toPos);
        tr = tr.insert(insertPos, node);
        const relOffset = Math.min($from.pos - fromPos, node.nodeSize - 2);
        const targetPos = Math.max(
          1,
          Math.min(insertPos + relOffset, tr.doc.content.size - 1)
        );
        const sel = Selection.near(tr.doc.resolve(targetPos));
        tr = tr.setSelection(sel).scrollIntoView();
        dispatch(tr);
      }
      return true;
    }
  };
};

/**
 * Duplicate the current block or list item above or below the original.
 */
export const duplicateLineOrBlock = (direction: "up" | "down"): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    if ($from.depth === 0) return false;

    const targetDepth = getTargetBlockDepth($from);
    const node = $from.node(targetDepth);
    const fromPos = $from.before(targetDepth);
    const insertPos = direction === "up" ? fromPos : $from.after(targetDepth);

    if (dispatch) {
      const relativeOffset = Math.min(
        Math.max(0, $from.pos - fromPos),
        Math.max(0, node.nodeSize - 2),
      );
      const tr = state.tr.insert(insertPos, node);
      const selectionPos = Math.max(
        1,
        Math.min(insertPos + relativeOffset, tr.doc.content.size - 1),
      );
      dispatch(
        tr
          .setSelection(Selection.near(tr.doc.resolve(selectionPos)))
          .scrollIntoView(),
      );
    }

    return true;
  };
};
/**
 * Delete current line or block (Shift + Delete).
 */
export const deleteLineOrBlock: Command = (state, dispatch) => {
  const { $from, $to } = state.selection;
  if ($from.depth === 0) return false;

  const fromDepth = getTargetBlockDepth($from);
  const toDepth = getTargetBlockDepth($to);
  const fromPos = $from.before(fromDepth);
  const toPos = $to.after(toDepth);

  if (dispatch) {
    let tr = state.tr.delete(fromPos, toPos);
    if (tr.doc.childCount === 0) {
      const p =
        state.schema.nodes.paragraph?.create() ||
        state.schema.node("paragraph");
      tr = tr.replaceWith(0, 0, p);
    }
    const targetPos = Math.max(0, Math.min(fromPos, tr.doc.content.size));
    const sel = Selection.near(tr.doc.resolve(targetPos));
    tr = tr.setSelection(sel).scrollIntoView();
    dispatch(tr);
  }
  return true;
};

/**
 * Helper to find the enclosing list_item node and its position.
 */
function getListItem(
  state: EditorState
): { node: Node; pos: number; depth: number } | null {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === "list_item" || node.type.name === "task_list_item") {
      return { node, pos: $from.before(d), depth: d };
    }
  }
  return null;
}

/**
 * Returns true if cursor is inside a list item.
 */
function insideListItem(state: EditorState): boolean {
  return getListItem(state) !== null;
}

/**
 * Returns true if the list item containing the cursor is empty.
 */
function inEmptyListItem(state: EditorState): boolean {
  const item = getListItem(state);
  if (!item) return false;
  const { $from } = state.selection;
  // If the immediate paragraph/block inside list item is empty
  return $from.parent.isTextblock && $from.parent.content.size === 0;
}

/**
 * Returns true if the current list item is a task list item (has checked attribute).
 */
function isTaskListItem(state: EditorState): boolean {
  const item = getListItem(state);
  return (
    item !== null &&
    item.node.attrs.checked !== null &&
    item.node.attrs.checked !== undefined
  );
}

/**
 * Infallibly lifts or exits an empty list item to become a normal paragraph.
 */
const liftOrExitListItem = (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
  const item = getListItem(state);
  const itemType = item?.node.type;
  if (!itemType) return false;

  // 1. Standard schema-list liftListItem
  if (liftListItem(itemType)(state, dispatch)) return true;

  // 2. liftEmptyBlock
  if (liftEmptyBlock(state, dispatch)) return true;

  // 3. Fallback: replace empty list item with a standard paragraph
  if (item && dispatch) {
    const p =
      state.schema.nodes.paragraph?.createAndFill() ||
      state.schema.node("paragraph");
    let tr = state.tr.delete(item.pos, item.pos + item.node.nodeSize);
    tr = tr.insert(item.pos, p);
    const sel = Selection.near(tr.doc.resolve(item.pos + 1));
    tr = tr.setSelection(sel).scrollIntoView();
    dispatch(tr);
    return true;
  }

  return false;
};

/**
 * Enter key handler:
 * 1. If in a code block -> insert newline
 * 2. If inside a list item:
 *    - 1st Enter on text: split list item (create next item 2., unchecked if task)
 *    - 2nd Enter on empty item (2.): lift out of list (removes number -> normal line)
 *    - 3rd Enter on empty line: normal paragraph split -> next blank line (no number)
 * 3. createParagraphNear -> near node selections
 * 4. liftEmptyBlock -> for blockquotes, etc.
 * 5. splitBlock -> standard paragraph / text split
 */
export const handleEnter: Command = (state, dispatch) => {
  // 1. Code block newline
  if (newlineInCode(state, dispatch)) return true;

  // 2. List item handling
  if (insideListItem(state)) {
    if (inEmptyListItem(state)) {
      // 2nd Enter on empty item -> exit list (removes number, becomes normal paragraph)
      if (liftOrExitListItem(state, dispatch)) return true;
    } else {
      // 1st Enter on filled item -> continue list (next item e.g. 2.)
      const item = getListItem(state);
  const itemType = item?.node.type;
      if (itemType) {
        const isTask = isTaskListItem(state);
        const attrs = isTask ? { checked: false } : undefined;
        if (splitListItem(itemType, attrs)(state, dispatch)) return true;
        if (liftOrExitListItem(state, dispatch)) return true;
      }
    }
  }

  // 3. Fallbacks for non-list blocks
  if (createParagraphNear(state, dispatch)) return true;
  if (liftEmptyBlock(state, dispatch)) return true;

  // 4. Default ProseMirror paragraph/block split (3rd Enter creates next blank line with no number)
  if (splitBlock(state, dispatch)) return true;

  return false;
};

/**
 * Backspace key handler:
 * - If inside an empty list item -> lift out of list to become normal paragraph (removes number)
 * - Otherwise -> standard ProseMirror Backspace (joinBackward, etc.)
 */
const handleBackspace: Command = (state, dispatch) => {
  if (inEmptyListItem(state)) {
    if (liftOrExitListItem(state, dispatch)) {
      return true;
    }
  }

  const baseBackspace = baseKeymap["Backspace"];
  if (baseBackspace && baseBackspace(state, dispatch)) {
    return true;
  }

  return false;
};

/**
 * Insert an indentation character inside the editor instead of moving focus.
 */
const insertEditorIndent: Command = (state, dispatch) => {
  if (!state.selection.$from.parent.isTextblock) return true;
  if (!dispatch) return true;
  const { from, to } = state.selection;
  dispatch(state.tr.insertText("\t", from, to).scrollIntoView());
  return true;
};

/**
 * Tab key handler:
 * - Inside a list item -> indent/sink list item
 * - Inside code or normal text -> insert an indentation character
 */
export const handleTab: Command = (state, dispatch) => {
  if (insideListItem(state)) {
    const item = getListItem(state);
  const itemType = item?.node.type;
    if (itemType && sinkListItem(itemType)(state, dispatch)) return true;
    return true;
  }

  return insertEditorIndent(state, dispatch);
};

/**
 * Shift+Tab key handler:
 * - Inside list item -> un-indent/lift list item
 * - Inside code or normal text -> consume the key without moving focus
 */
export const handleShiftTab: Command = (state, dispatch) => {
  if (insideListItem(state)) {
    const item = getListItem(state);
  const itemType = item?.node.type;
    if (itemType && liftListItem(itemType)(state, dispatch)) return true;
    return true;
  }

  return true;
};

/**
 * ProseMirror keymap plugin ensuring Notion/Google Docs behavior:
 * - Lists: Enter (next item / exit on empty), Backspace on empty item (exit list), Tab (nest), Shift+Tab (un-nest)
 * - Normal text: Enter splits paragraph, Backspace deletes normally
 * - Undo/Redo: Mod-z, Mod-y, Shift-Mod-z
 * - Line/Block movements: Alt+Up / Alt+Down, Shift+Delete
 */
export const editorKeymapPlugin = $prose(() =>
  keymap({
    ...baseKeymap,
    Enter: handleEnter,
    Backspace: handleBackspace,
    Tab: handleTab,
    "Shift-Tab": handleShiftTab,

    "Mod-z": undo,
    "Mod-y": redo,
    "Shift-Mod-z": redo,

    "Shift-Delete": deleteLineOrBlock,
    "Alt-ArrowUp": moveLineOrBlock("up"),
    "Alt-Up": moveLineOrBlock("up"),
    "Alt-ArrowDown": moveLineOrBlock("down"),
    "Alt-Down": moveLineOrBlock("down"),
    "Shift-Alt-ArrowUp": duplicateLineOrBlock("up"),
    "Shift-Alt-Up": duplicateLineOrBlock("up"),
    "Shift-Alt-ArrowDown": duplicateLineOrBlock("down"),
    "Shift-Alt-Down": duplicateLineOrBlock("down"),
  })
);







export const editorKeyboardCapturePlugin = $prose(() =>
  new Plugin({
    view: (view) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        let command: Command | null = null;

        if (event.key === "Enter") {
          command = handleEnter;
        } else if (event.key === "Tab") {
          command = event.shiftKey ? handleShiftTab : handleTab;
        }

        if (!command || !command(view.state, view.dispatch)) return;
        event.preventDefault();
        event.stopPropagation();
      };

      view.dom.addEventListener("keydown", handleKeyDown, true);
      return {
        destroy: () => view.dom.removeEventListener("keydown", handleKeyDown, true),
      };
    },
  }),
);
