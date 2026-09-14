import { Editor, defaultValueCtx, rootCtx } from "@milkdown/kit/core";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import type { EditorView } from "@milkdown/kit/prose/view";
import { $mark, $prose, $remark } from "@milkdown/kit/utils";
import { Milkdown, useEditor } from "@milkdown/react";
import { useState } from "react";
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

const MilkdownEditor = ({ content, onChange }: MilkdownEditorProps) => {
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [revision, setRevision] = useState(0);

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

  return (
    <div className="milkdown-container relative w-full text-[19px] leading-[1.65] text-zinc-300 md:text-[20px]">
      <Milkdown />
      <SelectionToolbar editorView={editorView} revision={revision} />
      <CodeBlockToolbar editorView={editorView} revision={revision} />
    </div>
  );
};

export default MilkdownEditor;













