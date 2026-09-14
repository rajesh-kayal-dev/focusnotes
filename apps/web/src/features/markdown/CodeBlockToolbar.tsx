import React, { useEffect, useRef, useState, useCallback } from "react";
import type { EditorView } from "@milkdown/kit/prose/view";
import type { Node as ProseNode } from "@milkdown/kit/prose/model";
import { undo } from "@milkdown/kit/prose/history";

type CodeBlockToolbarProps = {
  editorView: EditorView | null;
  revision?: number;
};

import { LANGUAGES, detectLanguage } from "./codeLanguage";

export const CodeBlockToolbar: React.FC<CodeBlockToolbarProps> = ({ editorView, revision }) => {
  const [activeCodeNode, setActiveCodeNode] = useState<{ node: ProseNode; pos: number } | null>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  // Theme detection (light / dark)
  const [isLight, setIsLight] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains("light"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback(() => {
    if (!editorView) {
      setActiveCodeNode(null);
      setPosition(null);
      return;
    }

    const { state } = editorView;
    const { selection } = state;
    const { $from } = selection;

    let targetNode: ProseNode | null = null;
    let targetPos = -1;

    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name === "code_block") {
        targetNode = node;
        targetPos = $from.before(d);
        break;
      }
    }

    if (!targetNode || targetPos === -1) {
      setActiveCodeNode(null);
      setPosition(null);
      setIsLangOpen(false);
      return;
    }

    setActiveCodeNode({ node: targetNode, pos: targetPos });

    // Locate pre element in DOM
    const dom = editorView.nodeDOM(targetPos);
    let preEl: HTMLElement | null = null;
    if (dom instanceof HTMLElement) {
      preEl = dom.tagName === "PRE" ? dom : dom.querySelector("pre");
    }

    if (!preEl) {
      // Fallback: try finding pre from selection element
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const anchorEl = sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode.parentElement;
        preEl = anchorEl?.closest("pre") || null;
      }
    }

    if (preEl) {
      const rect = preEl.getBoundingClientRect();
      // Position at top-right of pre element
      const top = rect.top + 8;
      const right = Math.max(16, window.innerWidth - rect.right + 12);
      setPosition({ top, right });
    } else {
      setPosition(null);
    }
  }, [editorView]);

  useEffect(() => {
    if (!editorView) return;

    const animId = requestAnimationFrame(updatePosition);

    const onEvent = () => updatePosition();
    const onMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("selectionchange", onEvent);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onEvent, true);
    window.addEventListener("resize", onEvent);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("selectionchange", onEvent);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onEvent, true);
      window.removeEventListener("resize", onEvent);
    };
  }, [editorView, revision, updatePosition]);

  if (!activeCodeNode || !position || !editorView) return null;

  const currentRawLang = (activeCodeNode.node.attrs.language as string) || "";
  const codeContent = activeCodeNode.node.textContent || "";
  const currentLangValue = currentRawLang || detectLanguage(codeContent);
  const currentLangObj =
    LANGUAGES.find((l) => l.value.toLowerCase() === currentLangValue.toLowerCase()) || {
      label: currentLangValue ? currentLangValue.charAt(0).toUpperCase() + currentLangValue.slice(1) : "JavaScript",
      value: currentLangValue || "javascript",
    };

  const handleSelectLanguage = (langValue: string) => {
    const { state, dispatch } = editorView;
    const tr = state.tr.setNodeMarkup(activeCodeNode.pos, undefined, {
      ...activeCodeNode.node.attrs,
      language: langValue,
    });
    dispatch(tr);
    setIsLangOpen(false);
    editorView.focus();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!codeContent) return;
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    undo(editorView.state, editorView.dispatch);
    editorView.focus();
  };

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 9990,
      }}
      className={`flex items-center gap-1.5 rounded-xl border px-2 py-1 text-xs backdrop-blur-md transition-all duration-150 shadow-md ${
        isLight
          ? "bg-[#FCFBF7]/95 border-[#E5E1D8] text-zinc-700 shadow-zinc-900/5"
          : "bg-zinc-900/90 border-zinc-700/60 text-zinc-300 shadow-black/40"
      }`}
    >
      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => setIsLangOpen((prev) => !prev)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
            isLight
              ? "hover:bg-zinc-200/70 text-zinc-800"
              : "hover:bg-white/10 text-zinc-200"
          }`}
          title="Select Language"
        >
          <span>{currentLangObj.label}</span>
          <svg
            className={`h-3 w-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isLangOpen && (
          <div
            onMouseDown={preventBlur}
            className={`absolute right-0 top-full mt-1.5 w-44 rounded-xl border p-1 shadow-xl z-50 max-h-56 overflow-y-auto scrollbar-none backdrop-blur-xl ${
              isLight
                ? "bg-[#FCFBF7] border-[#E5E1D8] text-zinc-800 shadow-zinc-900/15"
                : "bg-zinc-900/95 border-zinc-700/80 text-zinc-200 shadow-black/60"
            }`}
          >
            {LANGUAGES.map((lang) => {
              const isSelected = lang.value.toLowerCase() === currentLangObj.value.toLowerCase();
              return (
                <button
                  key={lang.value}
                  type="button"
                  onMouseDown={preventBlur}
                  onClick={() => handleSelectLanguage(lang.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition ${
                    isSelected
                      ? isLight
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "bg-white/10 text-white font-semibold"
                      : isLight
                        ? "text-zinc-700 hover:bg-zinc-100"
                        : "text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span>{lang.label}</span>
                  {isSelected && <span className="text-blue-500 font-bold">&#10003;</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={`h-3.5 w-px ${isLight ? "bg-[#E5E1D8]" : "bg-zinc-700/60"}`} />

      {/* Copy Button */}
      <button
        type="button"
        onMouseDown={preventBlur}
        onClick={handleCopy}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
          copied
            ? "text-green-500 font-semibold"
            : isLight
              ? "hover:bg-zinc-200/70 text-zinc-700"
              : "hover:bg-white/10 text-zinc-300"
        }`}
        title="Copy Code"
      >
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>

      <div className={`h-3.5 w-px ${isLight ? "bg-[#E5E1D8]" : "bg-zinc-700/60"}`} />

      {/* Undo / Reset Button */}
      <button
        type="button"
        onMouseDown={preventBlur}
        onClick={handleUndo}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
          isLight ? "hover:bg-zinc-200/70 text-zinc-700" : "hover:bg-white/10 text-zinc-300"
        }`}
        title="Undo / Reset"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 0 1 5 5v2M3 10l6-6M3 10l6 6" />
        </svg>
        <span>Undo</span>
      </button>
    </div>
  );
};

export default CodeBlockToolbar;
