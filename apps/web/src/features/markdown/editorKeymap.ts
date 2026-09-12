import { baseKeymap } from "@milkdown/kit/prose/commands";
import { undo, redo } from "@milkdown/kit/prose/history";
import { keymap } from "@milkdown/kit/prose/keymap";
import type { ResolvedPos } from "@milkdown/kit/prose/model";
import { Selection, type EditorState, type Transaction } from "@milkdown/kit/prose/state";
import { $prose } from "@milkdown/kit/utils";

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

/**
 * Determine the target node depth to delete or move.
 * If inside a list item or task list item, targeting that item allows reordering/deleting within the list.
 * Otherwise, targets the top-level block (depth 1, directly under doc).
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

    // If at boundary of a nested list item, escalate to top-level block
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
      const p = state.schema.nodes.paragraph?.create() || state.schema.node("paragraph");
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
 * ProseMirror keymap plugin ensuring standard editor shortcuts:
 * - Undo: Ctrl+Z / Cmd+Z
 * - Redo: Ctrl+Y / Cmd+Y, Ctrl+Shift+Z / Cmd+Shift+Z
 * - Select All: Ctrl+A / Cmd+A
 * - Delete Line: Shift+Delete
 * - Move Line/Block: Alt+Up / Alt+Down
 * - Backspace / Delete / Enter standard handling
 */
export const editorKeymapPlugin = $prose(() =>
  keymap({
    ...baseKeymap,
    "Mod-z": undo,
    "Mod-y": redo,
    "Shift-Mod-z": redo,
    "Shift-Delete": deleteLineOrBlock,
    "Alt-ArrowUp": moveLineOrBlock("up"),
    "Alt-Up": moveLineOrBlock("up"),
    "Alt-ArrowDown": moveLineOrBlock("down"),
    "Alt-Down": moveLineOrBlock("down"),
  })
);
