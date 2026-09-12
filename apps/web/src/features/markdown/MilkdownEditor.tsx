import { Editor, defaultValueCtx, rootCtx } from "@milkdown/kit/core";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { Milkdown, useEditor } from "@milkdown/react";
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
        .use(listener),
    []
  );

  return (
    <div className="milkdown-container mt-6 w-full text-[16px] leading-8 text-zinc-300">
      <Milkdown />
    </div>
  );
};

export default MilkdownEditor;
