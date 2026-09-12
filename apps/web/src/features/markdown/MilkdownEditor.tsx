import { Editor, defaultValueCtx, rootCtx } from "@milkdown/kit/core";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { Milkdown, useEditor } from "@milkdown/react";
import { editorKeymapPlugin } from "./editorKeymap";
import type { MilkdownEditorProps } from "./markdown.types";

const MilkdownEditor = ({ content, onChange }: MilkdownEditorProps) => {
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
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(clipboard)
        .use(editorKeymapPlugin)
        .use(listener),
    []
  );

  return (
    <div className="milkdown-container w-full text-[19px] leading-[1.65] text-zinc-300 md:text-[20px]">
      <Milkdown />
    </div>
  );
};

export default MilkdownEditor;
