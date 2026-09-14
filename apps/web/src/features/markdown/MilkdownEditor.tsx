import { Editor, defaultValueCtx, rootCtx } from "@milkdown/kit/core";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { Plugin, PluginKey, TextSelection } from "@milkdown/kit/prose/state";
import type { EditorView } from "@milkdown/kit/prose/view";
import { $mark, $prose, $remark } from "@milkdown/kit/utils";
import { Milkdown, useEditor } from "@milkdown/react";
import { useRef, useState } from "react";
import { editorKeymapPlugin, editorKeyboardCapturePlugin } from "./editorKeymap";
import { taskListItemPlugin } from "./taskListItemView";
import type { MilkdownEditorProps } from "./markdown.types";
import SelectionToolbar from "./SelectionToolbar";
import CodeBlockToolbar from "./CodeBlockToolbar";
import { syntaxHighlightingPlugin } from "./syntaxHighlighting";
import { mediaPreviewPlugin } from "./mediaPreview";

/* eslint-disable @typescript-eslint/no-explicit-any */
function customMarksAttacher(this: any) {
  // 1. Stringifier Extension Ã¢â‚¬â€ registered on the processor, not the transformer
  const data = this.data();
  const toMarkdownExtensions: any[] = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
  toMarkdownExtensions.push({
    handlers: {
      underline: (node: any, _: any, state: any, info: any) => {
        const exit = state.enter('underline');
        const value = state.containerPhrasing(node, info);
        exit();
        return `<u>${value}</u>`;
      },
      textStyle: (node: any, _: any, state: any, info: any) => {
        const exit = state.enter('textStyle');
        const value = state.containerPhrasing(node, info);
        exit();
        const color = node.attributes?.color ? `color: ${node.attributes.color}` : '';
        const bg = node.attributes?.backgroundColor ? `background-color: ${node.attributes.backgroundColor}` : '';
        const style = [color, bg].filter(Boolean).join('; ');
        if (!style) return value;
        return `<span style="${style}">${value}</span>`;
      }
    }
  });

  // 2. Parser Transformer Ã¢â‚¬â€ walks the mdast and converts inline HTML tags to custom nodes
  return function transformer(tree: any) {
    const walk = (node: any) => {
      if (!node.children) return;
      const newChildren: any[] = [];
      const stack: any[] = [{ children: newChildren }];

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        let isTag = false;

        if (child.type === 'html') {
          if (child.value === '<u>') {
            const wrapper = { type: 'underline', children: [] };
            stack[stack.length - 1].children.push(wrapper);
            stack.push(wrapper);
            isTag = true;
          } else if (child.value === '</u>') {
            if (stack.length > 1 && stack[stack.length - 1].type === 'underline') {
              stack.pop();
            }
            isTag = true;
          } else {
            const spanMatch = child.value.match(/<span style="([^"]+)">/);
            if (spanMatch) {
              const style = spanMatch[1];
              const colorMatch = style.match(/color:\s*([^;]+)/);
              const bgMatch = style.match(/background-color:\s*([^;]+)/);
              const wrapper = {
                type: 'textStyle',
                attributes: {
                  color: colorMatch ? colorMatch[1].trim() : null,
                  backgroundColor: bgMatch ? bgMatch[1].trim() : null,
                },
                children: []
              };
              stack[stack.length - 1].children.push(wrapper);
              stack.push(wrapper);
              isTag = true;
            } else if (child.value === '</span>') {
              if (stack.length > 1 && stack[stack.length - 1].type === 'textStyle') {
                stack.pop();
              }
              isTag = true;
            }
          }
        }

        if (!isTag) {
          stack[stack.length - 1].children.push(child);
          walk(child);
        }
      }
      node.children = stack[0].children;
    };
    walk(tree);
  };
}

const customMarksPlugin = $remark("customMarks", () => customMarksAttacher);

const textStyleMark = $mark("textStyle", () => ({
  attrs: {
    color: { default: null },
    backgroundColor: { default: null },
  },
  parseDOM: [
    {
      tag: "span[style]",
      getAttrs: (dom) => {
        const el = dom as HTMLElement;
        return {
          color: el.style.color || null,
          backgroundColor: el.style.backgroundColor || null,
        };
      },
    },
  ],
  toDOM: (mark) => {
    const { color, backgroundColor } = mark.attrs;
    const style: string[] = [];
    if (color) style.push(`color: ${color}`);
    if (backgroundColor) style.push(`background-color: ${backgroundColor}`);
    return ["span", { style: style.join("; ") }, 0];
  },
  parseMarkdown: {
    match: (node) => node.type === "textStyle",
    runner: (state, node, type) => {
      state.openMark(type, (node as { attributes?: Record<string, unknown> }).attributes);
      state.next((node as { children?: unknown }).children as never);
      state.closeMark(type);
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === "textStyle",
    runner: (state, mark) => {
      state.withMark(mark, "textStyle", undefined, { attributes: mark.attrs });
    },
  },
}));

const underlineMark = $mark("underline", () => ({
  parseDOM: [
    { tag: "u" },
    {
      style: "text-decoration",
      getAttrs: (value) => (typeof value === "string" && value.includes("underline") ? {} : false),
    },
  ],
  toDOM: () => ["u", { class: "underline" }, 0],
  parseMarkdown: {
    match: (node) => node.type === "underline",
    runner: (state, node, type) => {
      state.openMark(type);
      state.next((node as { children?: unknown }).children as never);
      state.closeMark(type);
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === "underline",
    runner: (state, mark) => {
      state.withMark(mark, "underline");
    },
  },
}));

const selectionPluginKey = new PluginKey("SELECTION_TOOLBAR_VIEW");

const MilkdownEditor = ({ content, onChange, onOpenFile }: MilkdownEditorProps) => {
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [revision, setRevision] = useState(0);
  const [hoveredBlock, setHoveredBlock] = useState<{ top: number; left: number; from: number; to: number; element: HTMLElement } | null>(null);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const draggedBlockRef = useRef<{ from: number; to: number } | null>(null);
  const handleHideTimerRef = useRef<number | null>(null);

  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              onChange(markdown);
            }
          });
        })
        .use(editorKeyboardCapturePlugin)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(clipboard)
        .use(customMarksPlugin)
        .use(textStyleMark)
        .use(underlineMark)
        .use(taskListItemPlugin)
        .use(syntaxHighlightingPlugin)
        .use(mediaPreviewPlugin)
        .use(
          $prose(() =>
            new Plugin({
              key: selectionPluginKey,
              view: (view) => {
                setEditorView(view);
                setRevision((r) => r + 1);

                // Handle link clicks Ã¢â‚¬â€ open in new tab only when not drag-selecting
                let mouseDownPos: { x: number; y: number } | null = null;
                const onMouseDown = (e: MouseEvent) => {
                  mouseDownPos = { x: e.clientX, y: e.clientY };
                };
                const onClick = (e: MouseEvent) => {
                  // Only open link if it was a genuine click (not a drag)
                  if (mouseDownPos) {
                    const dx = Math.abs(e.clientX - mouseDownPos.x);
                    const dy = Math.abs(e.clientY - mouseDownPos.y);
                    if (dx > 4 || dy > 4) return; // was a drag, skip
                  }
                  const target = e.target as HTMLElement;
                  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
                  if (anchor && anchor.href) {
                    e.preventDefault();
                    window.open(anchor.href, "_blank", "noopener,noreferrer");
                  }
                };
                view.dom.addEventListener("mousedown", onMouseDown);
                view.dom.addEventListener("click", onClick);

                return {
                  update: (updatedView) => {
                    setEditorView(updatedView);
                    setRevision((r) => r + 1);
                  },
                  destroy: () => {
                    view.dom.removeEventListener("mousedown", onMouseDown);
                    view.dom.removeEventListener("click", onClick);
                    setEditorView(null);
                  },
                };
              },
            })
          )
        )
        .use(listener)
        .use(editorKeymapPlugin),
    []
  );

  const handleEditorMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (handleHideTimerRef.current !== null) {
      window.clearTimeout(handleHideTimerRef.current);
      handleHideTimerRef.current = null;
    }
    if (!editorView || !content.trim()) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    // Resolve one stable owner for the whole block, even when the pointer crosses nested content.
    const block = (target.closest("li") || target.closest("blockquote") || target.closest("pre") || target.closest("p, h1, h2, h3, h4, h5, h6")) as HTMLElement | null;
    if (!block || !editorView.dom.contains(block)) {
      setHoveredBlock(null);
      return;
    }

    try {
      // List items and quotes are containers; select their inner text block.
      const inlineBlock = block.matches("p, h1, h2, h3, h4, h5, h6, pre")
        ? block
        : block.querySelector("p, h1, h2, h3, h4, h5, h6, pre");
      if (!inlineBlock) {
        setHoveredBlock(null);
        return;
      }
      const from = editorView.posAtDOM(inlineBlock, 0);
      const to = editorView.posAtDOM(inlineBlock, inlineBlock.childNodes.length);
      if (to <= from) return;
      const blockRect = block.getBoundingClientRect();
      if (hoveredBlock?.element === block) return;
      setHoveredBlock({
        top: blockRect.top + 2,
        left: blockRect.left - (block.tagName === "LI" ? 78 : 44),
        from,
        to,
        element: block,
      });
    } catch {
      setHoveredBlock(null);
    }
  };

  const handleBlockDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    if (!hoveredBlock) return;
    draggedBlockRef.current = { from: hoveredBlock.from, to: hoveredBlock.to };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "focusnotes-block");
  };

  const handleBlockDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedBlockRef.current || !hoveredBlock || !editorView) return;
    event.preventDefault();
    const { state } = editorView;
    const sourceStart = Math.max(0, draggedBlockRef.current.from - 1);
    const sourceNode = state.doc.nodeAt(sourceStart);
    if (!sourceNode) return;
    const targetStart = Math.max(0, hoveredBlock.from - 1);
    if (targetStart === sourceStart) return;
    let transaction = state.tr.delete(sourceStart, sourceStart + sourceNode.nodeSize);
    const mappedTarget = transaction.mapping.map(targetStart);
    transaction = transaction.insert(mappedTarget, sourceNode);
    editorView.dispatch(transaction);
    editorView.focus();
    draggedBlockRef.current = null;
  };

  const selectHoveredBlock = () => {
    if (!editorView || !hoveredBlock) return;
    const { state } = editorView;
    const from = Math.max(1, Math.min(hoveredBlock.from, state.doc.content.size));
    const to = Math.max(from, Math.min(hoveredBlock.to, state.doc.content.size));
    if (to <= from) return;
    editorView.dispatch(state.tr.setSelection(TextSelection.create(state.doc, from, to)));
    editorView.focus();
  };

  return (
    <div
      className="milkdown-container relative w-full text-[19px] leading-[1.65] text-zinc-300 md:text-[20px]"
      onMouseMove={handleEditorMouseMove}
      onMouseLeave={() => {
        if (handleHideTimerRef.current !== null) window.clearTimeout(handleHideTimerRef.current);
        handleHideTimerRef.current = window.setTimeout(() => {
          setHoveredBlock(null);
          setIsHandleHovered(false);
        }, 800);
      }}
      onDragOver={(event) => { if (draggedBlockRef.current) event.preventDefault(); }}
      onDrop={handleBlockDrop}
      onDoubleClick={!content.trim() ? onOpenFile : undefined}
    >
      <Milkdown />
      {hoveredBlock && (
        <div
          className="fixed z-30 flex items-center"
          style={{ top: hoveredBlock.top, left: hoveredBlock.left, width: 48, height: 36 }}
          onMouseEnter={() => {
            if (handleHideTimerRef.current !== null) {
              window.clearTimeout(handleHideTimerRef.current);
              handleHideTimerRef.current = null;
            }
            setIsHandleHovered(true);
          }}
          onMouseLeave={() => {
            setIsHandleHovered(false);
            if (handleHideTimerRef.current !== null) window.clearTimeout(handleHideTimerRef.current);
            handleHideTimerRef.current = window.setTimeout(() => setHoveredBlock(null), 800);
          }}
        >
          <button
            type="button"
            draggable
            aria-label="Select or move block"
            onClick={selectHoveredBlock}
            onDragStart={handleBlockDragStart}
            className="block-handle group relative flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md opacity-70 transition-opacity duration-150 hover:opacity-100 active:cursor-grabbing focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <span className="grid grid-cols-2 gap-[3px]" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-current" />)}
            </span>
            {isHandleHovered && (
              <span className="block-handle-tooltip pointer-events-none absolute left-0 top-full mt-2 w-56 rounded-lg px-3 py-2 text-left text-xs shadow-xl">
                <span className="block text-sm">Drag to move</span>
                <span className="block opacity-70">Click or Ctrl/⌘ to open menu</span>
              </span>
            )}
          </button>
        </div>
      )}
      {!content.trim() && onOpenFile && (
        <div className="fixed bottom-16 left-1/2 z-30 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 justify-center md:bottom-10">
          <button
            type="button"
            onClick={onOpenFile}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " " ) onOpenFile(); }}
            className="group flex h-10 max-w-full items-center gap-3 rounded-full whitespace-nowrap border border-zinc-700/80 bg-zinc-950/70 px-4 text-sm text-zinc-400 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            <svg className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.25 2.25 0 016 4.5h4.129c.597 0 1.17.237 1.591.659l1.121 1.121c.422.422.994.659 1.591.659h3.818A2.25 2.25 0 0120.5 9.189v8.061a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75z" />
            </svg>
            <span>Open file</span>
            <span className="h-5 w-px bg-zinc-700/80" aria-hidden="true" />
            <span className="font-mono text-xs text-zinc-500">Ctrl + O</span>
          </button>
        </div>
      )}
      <SelectionToolbar editorView={editorView} revision={revision} />
      <CodeBlockToolbar editorView={editorView} revision={revision} />
    </div>
  );
};

export default MilkdownEditor;













