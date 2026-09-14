import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import html from "highlight.js/lib/languages/xml";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { $prose } from "@milkdown/kit/utils";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("go", go);
hljs.registerLanguage("html", html);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);

const registeredLanguages = new Set([
  "bash", "cpp", "csharp", "css", "go", "html", "java", "javascript",
  "json", "markdown", "php", "python", "rust", "sql", "typescript",
]);

const addTokenDecorations = (
  element: Node,
  offset: number,
  decorations: ReturnType<typeof Decoration.inline>[],
): number => {
  if (element.nodeType === Node.TEXT_NODE) {
    return offset + (element.textContent?.length ?? 0);
  }

  const start = offset;
  for (const child of Array.from(element.childNodes)) {
    offset = addTokenDecorations(child, offset, decorations);
  }

  if (element instanceof HTMLElement && element.className && offset > start) {
    decorations.push(
      Decoration.inline(start, offset, { class: String(element.className) }),
    );
  }

  return offset;
};

const buildDecorations = (doc: Parameters<typeof DecorationSet.create>[0]) => {
  const decorations: ReturnType<typeof Decoration.inline>[] = [];

  doc.descendants((node, position) => {
    if (node.type.name !== "code_block") return;

    const code = node.textContent;
    if (!code) return;

    const explicitLanguage = String(node.attrs.language || "").trim().toLowerCase();
    if (explicitLanguage === "text") return;

    const result = explicitLanguage && registeredLanguages.has(explicitLanguage)
      ? hljs.highlight(code, {
          language: explicitLanguage,
          ignoreIllegals: true,
        })
      : hljs.highlightAuto(code, Array.from(registeredLanguages));
    if (!result.language && !explicitLanguage) return;
    const template = document.createElement("template");
    template.innerHTML = result.value;
    const blockDecorations: ReturnType<typeof Decoration.inline>[] = [];
    addTokenDecorations(template.content, position + 1, blockDecorations);
    decorations.push(...blockDecorations);
  });

  return DecorationSet.create(doc, decorations);
};

const syntaxHighlightingKey = new PluginKey("SYNTAX_HIGHLIGHTING");

export const syntaxHighlightingPlugin = $prose(
  () =>
    new Plugin({
      key: syntaxHighlightingKey,
      state: {
        init: (_, state) => buildDecorations(state.doc),
        apply: (transaction, oldDecorations) =>
          transaction.docChanged
            ? buildDecorations(transaction.doc)
            : oldDecorations,
      },
      props: {
        decorations: (state) => syntaxHighlightingKey.getState(state),
      },
    }),
);





