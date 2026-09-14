import React, { useEffect, useRef, useState, useCallback } from "react";
import type { EditorView } from "@milkdown/kit/prose/view";
import type { Schema, MarkType, NodeType } from "@milkdown/kit/prose/model";
import { TextSelection, type Transaction } from "@milkdown/kit/prose/state";
import { setBlockType, wrapIn, lift } from "@milkdown/kit/prose/commands";
import { wrapInList, liftListItem } from "@milkdown/kit/prose/schema-list";
import { canJoin } from "@milkdown/kit/prose/transform";
import { detectLanguage } from "./codeLanguage";

const joinAdjacentLists = (tr: Transaction, listType: NodeType) => {
  let changed = true;
  while (changed) {
    changed = false;
    tr.doc.descendants((node, pos) => {
      if (node.type === listType) {
        const nextPos = pos + node.nodeSize;
        if (nextPos < tr.doc.content.size && canJoin(tr.doc, nextPos)) {
          const nextNode = tr.doc.nodeAt(nextPos);
          if (nextNode && nextNode.type === listType) {
            tr.join(nextPos);
            changed = true;
            return false;
          }
        }
      }
    });
  }
};

type SelectionToolbarProps = {
  editorView: EditorView | null;
  revision?: number;
};

type RecentColor = {
  type: "text" | "bg";
  name: string;
  color: string | null;
  displayColor: string;
};

const TEXT_COLORS = [
  { name: "Default text", color: null, displayColor: "#71717a" },
  { name: "Gray text", color: "#9b9b9b", displayColor: "#9b9b9b" },
  { name: "Brown text", color: "#9f6b53", displayColor: "#9f6b53" },
  { name: "Orange text", color: "#d9730d", displayColor: "#d9730d" },
  { name: "Yellow text", color: "#cb912f", displayColor: "#cb912f" },
  { name: "Green text", color: "#448361", displayColor: "#448361" },
  { name: "Blue text", color: "#337ea9", displayColor: "#337ea9" },
  { name: "Purple text", color: "#9065b0", displayColor: "#9065b0" },
  { name: "Pink text", color: "#c14c8a", displayColor: "#c14c8a" },
  { name: "Red text", color: "#d44c47", displayColor: "#d44c47" },
];

const BACKGROUND_COLORS = [
  { name: "Default background", color: null, displayBg: "transparent" },
  { name: "Gray background", color: "rgba(156, 163, 175, 0.22)", displayBg: "#52525b" },
  { name: "Brown background", color: "rgba(180, 130, 90, 0.22)", displayBg: "#603b2c" },
  { name: "Orange background", color: "rgba(249, 115, 22, 0.22)", displayBg: "#854d0e" },
  { name: "Yellow background", color: "rgba(234, 179, 8, 0.25)", displayBg: "#713f12" },
  { name: "Green background", color: "rgba(34, 197, 94, 0.22)", displayBg: "#14532d" },
  { name: "Blue background", color: "rgba(59, 130, 246, 0.22)", displayBg: "#1e3a8a" },
  { name: "Purple background", color: "rgba(168, 85, 247, 0.22)", displayBg: "#581c87" },
  { name: "Pink background", color: "rgba(236, 72, 153, 0.22)", displayBg: "#701a75" },
  { name: "Red background", color: "rgba(239, 68, 68, 0.22)", displayBg: "#7f1d1d" },
];

const DEFAULT_RECENTS: RecentColor[] = [
  { type: "text", name: "Purple text", color: "#9065b0", displayColor: "#9065b0" },
  { type: "bg", name: "Green background", color: "rgba(34, 197, 94, 0.22)", displayColor: "#448361" },
  { type: "text", name: "Blue text", color: "#337ea9", displayColor: "#337ea9" },
  { type: "text", name: "Green text", color: "#448361", displayColor: "#448361" },
  { type: "bg", name: "Yellow background", color: "rgba(234, 179, 8, 0.25)", displayColor: "#cb912f" },
];

const getMarkType = (
  schema: Schema,
  kind: "bold" | "italic" | "underline" | "strike" | "code" | "link" | "textStyle"
): MarkType | null => {
  if (!schema?.marks) return null;
  switch (kind) {
    case "bold": return schema.marks.strong || schema.marks.bold || null;
    case "italic": return schema.marks.emphasis || schema.marks.em || schema.marks.italic || null;
    case "underline": return schema.marks.underline || null;
    case "strike": return schema.marks.strike_through || schema.marks.strikethrough || schema.marks.strike || null;
    case "code": return schema.marks.code_inline || schema.marks.inlineCode || schema.marks.code || null;
    case "link": return schema.marks.link || null;
    case "textStyle": return schema.marks.textStyle || null;
  }
};

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ editorView, revision }) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number }>({ from: 0, to: 0 });
  const [activeDropdown, setActiveDropdown] = useState<"style" | "color" | "link" | "more" | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active theme tracking (light / dark)
  const [isLight, setIsLight] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [recentColors, setRecentColors] = useState<RecentColor[]>(() => {
    if (typeof window === "undefined") return DEFAULT_RECENTS;
    try {
      const saved = localStorage.getItem("focusnotes_recent_colors");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_RECENTS;
  });

  const addRecentColor = useCallback((item: RecentColor) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((r) => !(r.type === item.type && r.color === item.color));
      const updated = [item, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("focusnotes_recent_colors", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastSelectedRangeRef = useRef<{ from: number; to: number } | null>(null);
  const visibleRef = useRef(visible);
  const isExitingRef = useRef(isExiting);

  useEffect(() => {
    visibleRef.current = visible;
    isExitingRef.current = isExiting;
  }, [visible, isExiting]);

  // Stop any ongoing speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const calculatePosition = useCallback((view: EditorView, from: number, to: number) => {
    try {
      const startCoords = view.coordsAtPos(from);
      const endCoords = view.coordsAtPos(to);
      const top = Math.min(startCoords.top, endCoords.top);
      const bottom = Math.max(startCoords.bottom, endCoords.bottom);
      const left = Math.min(startCoords.left, endCoords.left);
      const right = Math.max(startCoords.right, endCoords.right);
      const centerX = (left + right) / 2;
      const toolbarHeight = toolbarRef.current?.offsetHeight || 48;
      const toolbarWidth = toolbarRef.current?.offsetWidth || 440;
      const gap = 10;
      const margin = 16;

      const spaceAbove = top - 12;
      const spaceBelow = window.innerHeight - bottom - 12;
      const neededHeight = toolbarHeight + gap;

      let toolbarTop: number;
      if (spaceAbove >= neededHeight) {
        toolbarTop = top - toolbarHeight - gap;
      } else if (spaceBelow >= neededHeight) {
        toolbarTop = bottom + gap;
      } else {
        if (spaceAbove >= spaceBelow) {
          toolbarTop = Math.max(12, top - toolbarHeight - gap);
        } else {
          toolbarTop = Math.min(window.innerHeight - toolbarHeight - 12, bottom + gap);
        }
      }

      toolbarTop = Math.max(12, Math.min(window.innerHeight - toolbarHeight - 12, toolbarTop));

      let clampedLeft = Math.max(toolbarWidth / 2 + margin, Math.min(window.innerWidth - toolbarWidth / 2 - margin, centerX));
      if (toolbarWidth >= window.innerWidth - margin * 2) clampedLeft = window.innerWidth / 2;
      return { top: toolbarTop, left: clampedLeft };
    } catch {
      return null;
    }
  }, []);

  const hideToolbar = useCallback((immediate = false) => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
    lastSelectedRangeRef.current = null;

    if (immediate) {
      setVisible(false); setIsExiting(false); setAnimating(false);
      setActiveDropdown(null); setLinkInput("");
      return;
    }

    if (visibleRef.current && !isExitingRef.current) {
      setIsExiting(true);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => {
        setVisible(false); setIsExiting(false); setAnimating(false);
        setActiveDropdown(null); setLinkInput("");
      }, 150);
    }
  }, []);

  useEffect(() => {
    if (!editorView) return;

    const checkSelection = () => {
      const { state } = editorView;
      const { selection } = state;
      const isValid = selection && !selection.empty && selection instanceof TextSelection && selection.from !== selection.to;

      if (!isValid) {
        hideToolbar();
        return;
      }

      // Cancel pending exit
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
        setIsExiting(false);
      }

      const currentRange = { from: selection.from, to: selection.to };
      const prevRange = lastSelectedRangeRef.current;
      const isSameRange = prevRange && prevRange.from === currentRange.from && prevRange.to === currentRange.to;

      lastSelectedRangeRef.current = currentRange;

      if (visibleRef.current) {
        if (!isSameRange) {
          setLinkInput("");
        }
        setSelectionRange(currentRange);
        const pos = calculatePosition(editorView, currentRange.from, currentRange.to);
        if (pos) setPosition(pos);
        return;
      }

      // 1-second stable-selection delay
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      delayTimerRef.current = setTimeout(() => {
        delayTimerRef.current = null;
        const cur = editorView.state.selection;
        if (cur && !cur.empty && cur instanceof TextSelection && cur.from === currentRange.from && cur.to === currentRange.to) {
          const pos = calculatePosition(editorView, currentRange.from, currentRange.to);
          if (pos) {
            setSelectionRange(currentRange);
            setPosition(pos);
            setVisible(true);
            setIsExiting(false);
            requestAnimationFrame(() => setAnimating(true));
          }
        }
      }, 1000);
    };

    checkSelection();

    const onEvent = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(checkSelection);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("selectionchange", onEvent);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onEvent);
    window.addEventListener("keyup", onEvent);
    window.addEventListener("dblclick", onEvent);
    window.addEventListener("scroll", onEvent, true);
    window.addEventListener("resize", onEvent);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      document.removeEventListener("selectionchange", onEvent);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onEvent);
      window.removeEventListener("keyup", onEvent);
      window.removeEventListener("dblclick", onEvent);
      window.removeEventListener("scroll", onEvent, true);
      window.removeEventListener("resize", onEvent);
    };
  }, [editorView, revision, calculatePosition, hideToolbar]);

  if (!visible || !editorView) return null;

  const { state, dispatch } = editorView;
  const { schema, selection } = state;
  const liveTextSelection = selection instanceof TextSelection && !selection.empty ? selection : null;
  const from = liveTextSelection?.from ?? selectionRange.from;
  const to = liveTextSelection?.to ?? selectionRange.to;

  // Inline formatting must reflect the complete live character range.
  const isMarkActive = (kind: "bold" | "italic" | "underline" | "strike" | "code" | "link"): boolean => {
    const mt = getMarkType(schema, kind);
    if (!mt || from === to) return false;
    let hasText = false;
    let fullyMarked = true;
    state.doc.nodesBetween(from, to, (node) => {
      if (!node.isText) return;
      hasText = true;
      if (!node.marks.some((mark) => mark.type === mt)) fullyMarked = false;
    });
    return hasText && fullyMarked;
  };

  let activeTextColor: string | null = null;
  let activeBgColor: string | null = null;
  let activeLinkHref: string | null = null;
  const textStyleType = getMarkType(schema, "textStyle");
  const linkType = getMarkType(schema, "link");
  if (from !== to) {
    state.doc.nodesBetween(from, to, (node) => {
      if (textStyleType) {
        const m = node.marks.find((mk) => mk.type === textStyleType);
        if (m) {
          if (m.attrs.color) activeTextColor = m.attrs.color;
          if (m.attrs.backgroundColor) activeBgColor = m.attrs.backgroundColor;
        }
      }
      if (linkType) {
        const lm = node.marks.find((mk) => mk.type === linkType);
        if (lm?.attrs?.href && !activeLinkHref) activeLinkHref = lm.attrs.href;
      }
    });
  }

  // Block type detection
  const getCurrentBlockInfo = (): { label: string; key: string } => {
    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name === "heading") return { label: `Heading ${node.attrs.level || 1}`, key: `h${node.attrs.level || 1}` };
      if (node.type.name === "ordered_list") return { label: "Numbered list", key: "ordered_list" };
      if (node.type.name === "bullet_list") {
        if (node.childCount > 0 && node.child(0).type.name === "task_list_item") return { label: "To-do list", key: "todo_list" };
        return { label: "Bulleted list", key: "bullet_list" };
      }
      if (node.type.name === "task_list_item") return { label: "To-do list", key: "todo_list" };
      if (node.type.name === "list_item") {
        const parent = $from.node(d - 1);
        if (parent?.type.name === "ordered_list") return { label: "Numbered list", key: "ordered_list" };
        return { label: "Bulleted list", key: "bullet_list" };
      }
      if (node.type.name === "blockquote") return { label: "Quote", key: "blockquote" };
      if (node.type.name === "code_block") return { label: "Code", key: "code_block" };
      if (node.type.name === "callout") return { label: "Callout", key: "callout" };
      if (node.type.name === "toggle_list") return { label: "Toggle list", key: "toggle_list" };
      if (node.type.name === "paragraph") return { label: "Text", key: "paragraph" };
    }
    return { label: "Text", key: "paragraph" };
  };

  // Inline mark toggle
  const handleToggleMark = (kind: "bold" | "italic" | "underline" | "strike" | "code") => {
    if (from === to) return;
    const mt = getMarkType(schema, kind);
    if (!mt) return;
    const isActive = isMarkActive(kind);
    let tr = state.tr;
    tr = isActive ? tr.removeMark(from, to, mt) : tr.addMark(from, to, mt.create());
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    dispatch(tr);
    editorView.focus();
  };

  // Block type
  const handleSetBlockType = (type: string) => {
    const { $from, $to, from, to } = state.selection;
    const activeBlock = getCurrentBlockInfo();

    if (type === "paragraph") {
      // 1. If inside list item, lift it out of the list
      if (schema.nodes.list_item) {
        let inList = false;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type === schema.nodes.list_item) {
            inList = true;
            break;
          }
        }
        if (inList) {
          liftListItem(schema.nodes.list_item)(state, dispatch);
          if (schema.nodes.paragraph) {
            setBlockType(schema.nodes.paragraph)(editorView.state, editorView.dispatch);
          }
          editorView.focus();
          return;
        }
      }

      // 2. If inside blockquote, lift it out
      if (schema.nodes.blockquote) {
        let inQuote = false;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type === schema.nodes.blockquote) {
            inQuote = true;
            break;
          }
        }
        if (inQuote) {
          const range = $from.blockRange($to);
          if (range) {
            lift(state, dispatch);
            if (schema.nodes.paragraph) {
              setBlockType(schema.nodes.paragraph)(editorView.state, editorView.dispatch);
            }
            editorView.focus();
            return;
          }
        }
      }

      if (schema.nodes.paragraph) {
        setBlockType(schema.nodes.paragraph)(state, dispatch);
      }
    } else if (type === "h1" && schema.nodes.heading) {
      const command = activeBlock.key === "h1" ? setBlockType(schema.nodes.paragraph) : setBlockType(schema.nodes.heading, { level: 1 });
      command(state, dispatch);
    } else if (type === "h2" && schema.nodes.heading) {
      const command = activeBlock.key === "h2" ? setBlockType(schema.nodes.paragraph) : setBlockType(schema.nodes.heading, { level: 2 });
      command(state, dispatch);
    } else if (type === "h3" && schema.nodes.heading) {
      const command = activeBlock.key === "h3" ? setBlockType(schema.nodes.paragraph) : setBlockType(schema.nodes.heading, { level: 3 });
      command(state, dispatch);
    } else if (type === "bullet_list" || type === "ordered_list" || type === "todo_list") {
      const targetListType = type === "ordered_list" ? schema.nodes.ordered_list : schema.nodes.bullet_list;
      if (!targetListType) return;

      // List items contain paragraphs, so normalize headings before wrapping.
      const normalizeTr = state.tr;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type === schema.nodes.heading && schema.nodes.paragraph) {
          normalizeTr.setNodeMarkup(pos, schema.nodes.paragraph, undefined, node.marks);
        }
      });
      if (normalizeTr.docChanged) {
        dispatch(normalizeTr);
      }
      const listState = editorView.state;

      let currentListItemPos: number | null = null;
      let currentListParentPos: number | null = null;
      for (let d = $from.depth; d > 0; d--) {
        if (listState.selection.$from.node(d).type === schema.nodes.list_item) {
          currentListItemPos = listState.selection.$from.before(d);
          currentListParentPos = listState.selection.$from.before(d - 1);
          break;
        }
      }

      // If already in a list
      if (currentListItemPos !== null && currentListParentPos !== null) {
        const parentNode = listState.doc.nodeAt(currentListParentPos);
        if (type === "todo_list") {
          const tr = listState.tr;
          listState.doc.nodesBetween(listState.selection.from, listState.selection.to, (n, p) => {
            if (n.type === schema.nodes.list_item) {
              tr.setNodeMarkup(p, undefined, {
                ...n.attrs,
                checked: n.attrs.checked != null ? null : false,
              });
            }
          });
          if (parentNode && parentNode.type !== schema.nodes.bullet_list && schema.nodes.bullet_list) {
            tr.setNodeMarkup(currentListParentPos, schema.nodes.bullet_list);
          }
          joinAdjacentLists(tr, schema.nodes.bullet_list);
          dispatch(tr);
          editorView.focus();
          return;
        }

        if (parentNode && parentNode.type !== targetListType) {
          const tr = listState.tr.setNodeMarkup(currentListParentPos, targetListType);
          listState.doc.nodesBetween(listState.selection.from, listState.selection.to, (n, p) => {
            if (n.type === schema.nodes.list_item && n.attrs.checked != null) {
              tr.setNodeMarkup(p, undefined, { ...n.attrs, checked: null });
            }
          });
          joinAdjacentLists(tr, targetListType);
          dispatch(tr);
          editorView.focus();
          return;
        }

        if (parentNode && parentNode.type === targetListType && activeBlock.key !== "todo_list") {
          liftListItem(schema.nodes.list_item)(listState, dispatch);
          editorView.focus();
          return;
        }

        if (parentNode && parentNode.type === targetListType) {
          const tr = listState.tr;
          let hasChecked = false;
          listState.doc.nodesBetween(listState.selection.from, listState.selection.to, (n, p) => {
            if (n.type === schema.nodes.list_item && n.attrs.checked != null) {
              tr.setNodeMarkup(p, undefined, { ...n.attrs, checked: null });
              hasChecked = true;
            }
          });
          if (hasChecked) {
            dispatch(tr);
            editorView.focus();
            return;
          }
        }
      }

      // Not in a list: wrap selected paragraph(s) into list & join adjacent
      wrapInList(targetListType)(listState, (tr) => {
        if (type === "todo_list") {
          tr.doc.nodesBetween(tr.mapping.map($from.pos), tr.mapping.map($to.pos), (n, p) => {
            if (n.type === schema.nodes.list_item) {
              tr.setNodeMarkup(p, undefined, { ...n.attrs, checked: false });
            }
          });
        }
        joinAdjacentLists(tr, targetListType);
        dispatch(tr);
        editorView.focus();
      });
    } else if (type === "code_block" && schema.nodes.code_block) {
      if (activeBlock.key === "code_block") {
        setBlockType(schema.nodes.paragraph)(state, dispatch);
        editorView.focus();
        return;
      }
      const selectedText = state.doc.textBetween(from, to, "\n");
      if (from !== to && selectedText) {
        const detected = detectLanguage(selectedText);
        const codeNode = schema.nodes.code_block.create({ language: detected }, schema.text(selectedText));
        const tr = state.tr.replaceWith(from, to, codeNode);
        dispatch(tr);
      } else {
        setBlockType(schema.nodes.code_block, { language: "javascript" })(state, dispatch);
      }
    } else if (type === "blockquote" && schema.nodes.blockquote) {
      if (activeBlock.key === "blockquote") {
        lift(state, dispatch);
      } else {
        wrapIn(schema.nodes.blockquote)(state, dispatch);
      }
      editorView.focus();
    } else if (type === "callout") {
      let inQuote = false;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type === schema.nodes.blockquote) {
          inQuote = true;
          break;
        }
      }
      if (!inQuote && schema.nodes.blockquote) {
        wrapIn(schema.nodes.blockquote)(state, (tr) => {
          dispatch(tr);
          setTimeout(() => {
            const curState = editorView.state;
            const startPos = curState.selection.$from.start();
            const textAtStart = curState.doc.textBetween(startPos, Math.min(startPos + 4, curState.doc.content.size));
            if (!textAtStart.includes("💡") && !textAtStart.includes("[!")) {
              editorView.dispatch(curState.tr.insertText("💡 ", startPos));
            }
            editorView.focus();
          }, 10);
        });
      } else {
        const startPos = $from.start();
        const textAtStart = state.doc.textBetween(startPos, Math.min(startPos + 4, state.doc.content.size));
        if (!textAtStart.includes("💡") && !textAtStart.includes("[!")) {
          dispatch(state.tr.insertText("💡 ", startPos));
        }
      }
    }
    editorView.focus();
  };

  // Link
  const handleOpenLink = () => {
    if (activeDropdown === "link") { setActiveDropdown(null); return; }
    setLinkInput(activeLinkHref ?? "");
    setActiveDropdown("link");
  };

  const handleApplyLink = () => {
    if (from === to) return;
    const lt = getMarkType(schema, "link");
    if (!lt) return;
    let tr = state.tr.removeMark(from, to, lt);
    if (linkInput.trim()) {
      let href = linkInput.trim();
      if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) href = `https://${href}`;
      tr = tr.addMark(from, to, lt.create({ href, title: null, target: "_blank" }));
    }
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    dispatch(tr);
    setActiveDropdown(null);
    setLinkInput("");
    editorView.focus();
  };

  // Text color & background
  const handleSetColor = (color: string | null, name: string, displayColor: string) => {
    if (from === to) return;
    const ts = getMarkType(schema, "textStyle");
    if (!ts) return;
    let currentBg: string | null = null;
    state.doc.nodesBetween(from, to, (n) => { const m = n.marks.find((mk) => mk.type === ts); if (m?.attrs.backgroundColor) currentBg = m.attrs.backgroundColor; });
    let tr = state.tr.removeMark(from, to, ts);
    if (color || currentBg) tr = tr.addMark(from, to, ts.create({ color, backgroundColor: currentBg }));
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    dispatch(tr);
    addRecentColor({ type: "text", color, name, displayColor });
    hideToolbar(true);
    editorView.focus();
  };

  const handleSetBackgroundColor = (backgroundColor: string | null, name: string, displayColor: string) => {
    if (from === to) return;
    const ts = getMarkType(schema, "textStyle");
    if (!ts) return;
    let currentColor: string | null = null;
    state.doc.nodesBetween(from, to, (n) => { const m = n.marks.find((mk) => mk.type === ts); if (m?.attrs.color) currentColor = m.attrs.color; });
    let tr = state.tr.removeMark(from, to, ts);
    if (currentColor || backgroundColor) tr = tr.addMark(from, to, ts.create({ color: currentColor, backgroundColor }));
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    dispatch(tr);
    addRecentColor({ type: "bg", color: backgroundColor, name, displayColor });
    hideToolbar(true);
    editorView.focus();
  };

  const handleClearFormatting = () => {
    if (from === to) return;
    let tr = state.tr.removeMark(from, to);
    const ts = getMarkType(schema, "textStyle"); if (ts) tr = tr.removeMark(from, to, ts);
    const ul = getMarkType(schema, "underline"); if (ul) tr = tr.removeMark(from, to, ul);
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    dispatch(tr); setActiveDropdown(null); editorView.focus();
  };

  // Search Web
  const handleSearchWeb = () => {
    if (from === to) return;
    const selectedText = state.doc.textBetween(from, to, " ").trim();
    if (!selectedText) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setActiveDropdown(null);
    editorView.focus();
  };

  // Listen (TTS)
  const handleListen = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveDropdown(null);
      return;
    }
    if (from === to) return;
    const selectedText = state.doc.textBetween(from, to, " ").trim();
    if (!selectedText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setActiveDropdown(null);
    editorView.focus();
  };

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  const isBold = isMarkActive("bold");
  const isItalic = isMarkActive("italic");
  const isUnderline = isMarkActive("underline");
  const isStrike = isMarkActive("strike");
  const isCode = isMarkActive("code");
  const isLink = isMarkActive("link");
  const currentBlock = getCurrentBlockInfo();

  // Theme-aware style helpers
  const pillClasses = isLight
    ? "selection-toolbar-pill bg-[#FCFBF7]/98 border-[#E5E1D8] text-zinc-800 shadow-xl shadow-zinc-900/10"
    : "selection-toolbar-pill bg-zinc-900/95 border-zinc-700/60 text-zinc-100 shadow-2xl shadow-black/60";

  const dropdownClasses = isLight
    ? "selection-toolbar-dropdown bg-[#FCFBF7] border-[#E5E1D8] text-zinc-800 shadow-2xl shadow-zinc-900/15"
    : "selection-toolbar-dropdown bg-zinc-900/95 border-zinc-700/60 text-zinc-100 shadow-2xl shadow-black/80";

  const dividerClasses = isLight ? "selection-toolbar-divider bg-[#E5E1D8]" : "selection-toolbar-divider bg-zinc-700/50";

  const normalBtnClasses = isLight
    ? "hover:bg-zinc-100/90 text-zinc-700 hover:text-zinc-900"
    : "hover:bg-white/10 text-zinc-300 hover:text-white";

  const activeBtnClasses = isLight
    ? "btn-active bg-blue-50 text-blue-600 border border-blue-200"
    : "btn-active bg-blue-600/30 text-blue-400 border border-blue-500/40";

  const inlineBtn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-xl text-sm transition ${active ? activeBtnClasses : normalBtnClasses}`;

  const iconBadge = isLight
    ? "selection-toolbar-badge flex h-6 w-6 items-center justify-center rounded border border-[#E5E1D8] bg-[#F0EEE6] text-zinc-700 shrink-0"
    : "selection-toolbar-badge flex h-6 w-6 items-center justify-center rounded border border-zinc-700/80 bg-zinc-800 text-zinc-300 shrink-0";

  const mkBtn = (active: boolean) =>
    `flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition ${
      active
        ? isLight ? "bg-blue-50/80 text-blue-600 font-medium" : "bg-white/10 text-white font-medium"
        : isLight ? "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
    }`;

  const isDropdownUp = position.top > window.innerHeight - 340;
  const dropdownPosClass = isDropdownUp ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div
      ref={toolbarRef}
      style={{ position: "fixed", top: `${position.top}px`, left: `${position.left}px`, transform: "translateX(-50%)", zIndex: 9999 }}
      className={`selection-toolbar transition-all duration-200 ease-out ${isExiting || !animating ? "opacity-0 translate-y-2 scale-95 pointer-events-none" : "opacity-100 translate-y-0 scale-100"}`}
    >
      {/* Visual pill container */}
      <div className={`flex items-center gap-1 rounded-2xl border p-1.5 backdrop-blur-xl max-w-[calc(100vw-24px)] overflow-visible ${pillClasses}`}>

        {/* ── 1. Text Style Dropdown ── */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => setActiveDropdown(activeDropdown === "style" ? null : "style")}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition border ${
              activeDropdown === "style"
                ? isLight ? "bg-zinc-200/80 border-zinc-300 text-zinc-900" : "bg-white/15 border-white/20 text-white"
                : isLight ? "bg-zinc-100/80 hover:bg-zinc-200/60 border-zinc-200/80 text-zinc-700" : "bg-white/5 hover:bg-white/10 border-white/5 text-zinc-200"
            }`}
          >
            <span className="font-semibold whitespace-nowrap">{currentBlock.label}</span>
            <svg className={`h-3 w-3 transition-transform duration-200 ${isLight ? "text-zinc-500" : "text-zinc-400"} ${activeDropdown === "style" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeDropdown === "style" && (
            <div
              onMouseDown={preventBlur}
              className={`absolute left-0 ${dropdownPosClass} w-56 rounded-2xl border p-1.5 space-y-0.5 z-50 text-xs backdrop-blur-xl max-h-[420px] overflow-y-auto scrollbar-none ${dropdownClasses}`}
            >
              {/* Text */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("paragraph")} className={mkBtn(currentBlock.key === "paragraph")}>
                <div className="flex items-center gap-2.5"><span className={`${iconBadge} font-serif text-[11px] font-bold`}>T</span><span>Text</span></div>
                {currentBlock.key === "paragraph" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* H1 */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("h1")} className={mkBtn(currentBlock.key === "h1")}>
                <div className="flex items-center gap-2.5"><span className={`${iconBadge} font-serif text-[11px] font-bold`}>H1</span><span className="font-bold">Heading 1</span></div>
                {currentBlock.key === "h1" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* H2 */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("h2")} className={mkBtn(currentBlock.key === "h2")}>
                <div className="flex items-center gap-2.5"><span className={`${iconBadge} font-serif text-[11px] font-bold`}>H2</span><span className="font-semibold">Heading 2</span></div>
                {currentBlock.key === "h2" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* H3 */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("h3")} className={mkBtn(currentBlock.key === "h3")}>
                <div className="flex items-center gap-2.5"><span className={`${iconBadge} font-serif text-[11px] font-bold`}>H3</span><span className="font-medium">Heading 3</span></div>
                {currentBlock.key === "h3" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              <div className={`h-px mx-1 my-0.5 ${dividerClasses}`} />
              {/* Bulleted list */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("bullet_list")} className={mkBtn(currentBlock.key === "bullet_list")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
                      <circle cx="3" cy="5" r="1.3" fill="currentColor" stroke="none"/><circle cx="3" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="3" cy="15" r="1.3" fill="currentColor" stroke="none"/>
                      <path strokeLinecap="round" d="M6.5 5h11M6.5 10h11M6.5 15h11"/>
                    </svg>
                  </span>
                  <span>Bulleted list</span>
                </div>
                {currentBlock.key === "bullet_list" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* Numbered list */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("ordered_list")} className={mkBtn(currentBlock.key === "ordered_list")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" d="M7 5h11M7 10h11M7 15h11"/>
                      <text x="1" y="6.5" fontSize="5.5" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                      <text x="1" y="11.5" fontSize="5.5" fill="currentColor" stroke="none" fontWeight="bold">2</text>
                      <text x="1" y="16.5" fontSize="5.5" fill="currentColor" stroke="none" fontWeight="bold">3</text>
                    </svg>
                  </span>
                  <span>Numbered list</span>
                </div>
                {currentBlock.key === "ordered_list" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* To-do list */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("todo_list")} className={mkBtn(currentBlock.key === "todo_list")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="2" y="4" width="10" height="10" rx="1.5"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9l2 2 3-3"/>
                    </svg>
                  </span>
                  <span>To-do list</span>
                </div>
                {currentBlock.key === "todo_list" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              <div className={`h-px mx-1 my-0.5 ${dividerClasses}`} />
              {/* Code */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("code_block")} className={mkBtn(currentBlock.key === "code_block")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 8l-3 3 3 3M14 8l3 3-3 3M11 5l-2 10"/></svg>
                  </span>
                  <span>Code</span>
                </div>
                {currentBlock.key === "code_block" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* Quote */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("blockquote")} className={mkBtn(currentBlock.key === "blockquote")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 4a3 3 0 00-3 3v1.5c0 1.2.7 2.2 1.8 2.7.1.6-.1 1.2-.5 1.6A.75.75 0 004.9 14H6a3 3 0 003-3V7a3 3 0 00-3-3zm8 0a3 3 0 00-3 3v1.5c0 1.2.7 2.2 1.8 2.7.1.6-.1 1.2-.5 1.6a.75.75 0 00.6 1.2H14a3 3 0 003-3V7a3 3 0 00-3-3z"/>
                    </svg>
                  </span>
                  <span>Quote</span>
                </div>
                {currentBlock.key === "blockquote" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
              {/* Callout */}
              <button type="button" onMouseDown={preventBlur} onClick={() => handleSetBlockType("callout")} className={mkBtn(currentBlock.key === "callout")}>
                <div className="flex items-center gap-2.5">
                  <span className={iconBadge}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="2" width="16" height="16" rx="2"/><path strokeLinecap="round" d="M10 7v4M10 13.5h.01"/></svg>
                  </span>
                  <span>Callout</span>
                </div>
                {currentBlock.key === "callout" && <span className="text-blue-500 font-bold">&#10003;</span>}
              </button>
            </div>
          )}
        </div>

        <div className={`h-5 w-px mx-0.5 ${dividerClasses}`} />

        {/* ── 2. Color Dropdown Button [ A ] (Left side of B, matching reference image) ── */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => setActiveDropdown(activeDropdown === "color" ? null : "color")}
            title="Text Color & Highlight"
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm transition ${
              activeDropdown === "color"
                ? isLight ? "bg-zinc-200/90 text-zinc-900 border border-zinc-300" : "bg-white/15 text-white border border-white/20"
                : (activeTextColor || activeBgColor)
                  ? isLight ? "bg-blue-50/80 text-blue-600 border border-blue-200" : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : normalBtnClasses
            }`}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded border font-serif text-xs font-bold transition-colors"
              style={{
                color: activeTextColor || (isLight ? "#27272a" : "#f4f4f5"),
                backgroundColor: activeBgColor || "transparent",
                borderColor: activeTextColor || (isLight ? "#d4d4d8" : "#52525b"),
              }}
            >
              A
            </span>
          </button>

          {/* Color Popover Grid (matches reference image media_1789327927547.png) */}
          {activeDropdown === "color" && (
            <div
              onMouseDown={preventBlur}
              className={`absolute left-0 ${dropdownPosClass} w-56 rounded-2xl border p-3 shadow-2xl z-50 text-xs backdrop-blur-xl space-y-3 ${dropdownClasses}`}
            >
              {/* Recently used */}
              {recentColors.length > 0 && (
                <div>
                  <div className={`text-[11px] font-semibold tracking-wider uppercase mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                    Recently used
                  </div>
                  <div className="flex items-center gap-1.5">
                    {recentColors.slice(0, 5).map((item, idx) => {
                      const isText = item.type === "text";
                      const isCurrentActive = isText ? activeTextColor === item.color : activeBgColor === item.color;
                      return (
                        <button
                          key={`${item.type}-${item.name}-${idx}`}
                          type="button"
                          onMouseDown={preventBlur}
                          onClick={() => isText ? handleSetColor(item.color, item.name, item.displayColor) : handleSetBackgroundColor(item.color, item.name, item.displayColor)}
                          title={item.name}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:scale-105 ${
                            isCurrentActive ? (isLight ? "ring-2 ring-blue-500 shadow-xs" : "ring-2 ring-blue-400 shadow-xs") : ""
                          } ${isLight ? "border border-zinc-200/80 bg-zinc-100/70" : "border border-zinc-700/80 bg-zinc-800/80"}`}
                        >
                          {isText ? (
                            <span className="font-serif text-xs font-bold" style={{ color: item.displayColor }}>
                              A
                            </span>
                          ) : (
                            <span className="h-6 w-6 rounded-md" style={{ backgroundColor: item.displayColor }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text color (5x2 grid) */}
              <div>
                <div className={`text-[11px] font-semibold tracking-wider uppercase mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  Text color
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((item) => {
                    const isSelected = activeTextColor === item.color;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onMouseDown={preventBlur}
                        onClick={() => handleSetColor(item.color, item.name, item.displayColor)}
                        title={item.name}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:scale-105 ${
                          isSelected
                            ? isLight
                              ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/80"
                              : "ring-2 ring-blue-400 border-blue-400 bg-white/10"
                            : isLight
                              ? "border border-zinc-200/80 hover:bg-zinc-100"
                              : "border border-zinc-700/80 hover:bg-white/10"
                        }`}
                        style={{ borderColor: item.color ? item.displayColor : undefined }}
                      >
                        <span className="font-serif text-xs font-bold" style={{ color: item.color ? item.displayColor : (isLight ? "#27272a" : "#d4d4d8") }}>
                          A
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background color (5x2 grid) */}
              <div>
                <div className={`text-[11px] font-semibold tracking-wider uppercase mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  Background color
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {BACKGROUND_COLORS.map((item) => {
                    const isSelected = activeBgColor === item.color;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onMouseDown={preventBlur}
                        onClick={() => handleSetBackgroundColor(item.color, item.name, item.displayBg)}
                        title={item.name}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:scale-105 ${
                          isSelected
                            ? isLight
                              ? "ring-2 ring-blue-500 border-2 border-white shadow-xs"
                              : "ring-2 ring-blue-400 border-2 border-white shadow-xs"
                            : isLight
                              ? "border border-zinc-200/80"
                              : "border border-zinc-700/80"
                        }`}
                        style={{ backgroundColor: item.displayBg }}
                      >
                        {!item.color && (
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Bold ── */}
        <button type="button" onMouseDown={preventBlur} onClick={() => handleToggleMark("bold")} title="Bold (Ctrl+B)" className={`${inlineBtn(isBold)} font-bold`}>B</button>

        {/* ── 4. Italic ── */}
        <button type="button" onMouseDown={preventBlur} onClick={() => handleToggleMark("italic")} title="Italic (Ctrl+I)" className={`${inlineBtn(isItalic)} italic font-serif`}>I</button>

        {/* ── 5. Underline ── */}
        <button type="button" onMouseDown={preventBlur} onClick={() => handleToggleMark("underline")} title="Underline (Ctrl+U)" className={`${inlineBtn(isUnderline)} underline`}>U</button>

        {/* ── 6. Strikethrough ── */}
        <button type="button" onMouseDown={preventBlur} onClick={() => handleToggleMark("strike")} title="Strikethrough" className={`${inlineBtn(isStrike)} line-through`}>S</button>

        {/* ── 7. Inline Code ── */}
        <button type="button" onMouseDown={preventBlur} onClick={() => handleToggleMark("code")} title="Inline Code" className={`${inlineBtn(isCode)} font-mono text-xs`}>&lt;/&gt;</button>

        <div className={`h-5 w-px mx-0.5 ${dividerClasses}`} />

        {/* ── 8. Link ── */}
        <div className="relative">
          <button type="button" onMouseDown={preventBlur} onClick={handleOpenLink} title="Link" className={inlineBtn(isLink)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
            </svg>
          </button>

          {activeDropdown === "link" && (
            <div
              onMouseDown={preventBlur}
              className={`absolute left-1/2 ${dropdownPosClass} -translate-x-1/2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-2xl z-50 text-xs w-80 backdrop-blur-xl ${dropdownClasses}`}
            >
              <svg className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-zinc-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757"/>
              </svg>
              <input
                type="text" autoFocus value={linkInput}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleApplyLink(); if (e.key === "Escape") { setActiveDropdown(null); setLinkInput(""); } }}
                placeholder="Paste link..."
                className={`flex-1 bg-transparent px-1 py-1 text-xs outline-none ${isLight ? "text-zinc-800 placeholder:text-zinc-400" : "text-zinc-100 placeholder:text-zinc-500"}`}
              />
              {linkInput && (
                <button
                  type="button" onMouseDown={preventBlur} onClick={handleApplyLink}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shrink-0"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
              {isLink && (
                <button
                  type="button" onMouseDown={preventBlur}
                  onClick={() => { const lt = getMarkType(schema, "link"); if (lt) { const tr = state.tr.removeMark(from, to, lt).setSelection(TextSelection.create(state.tr.removeMark(from, to, lt).doc, from, to)); dispatch(tr); } setActiveDropdown(null); setLinkInput(""); editorView.focus(); }}
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition shrink-0 ${
                    isLight ? "bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600" : "bg-zinc-800 text-zinc-400 hover:bg-red-600/30 hover:text-red-400"
                  }`}
                  title="Remove link"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`h-5 w-px mx-0.5 ${dividerClasses}`} />

        {/* ── 9. More (...) ── */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => setActiveDropdown(activeDropdown === "more" ? null : "more")}
            title="More Options"
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm transition ${
              activeDropdown === "more"
                ? isLight ? "bg-zinc-200/90 text-zinc-900 border border-zinc-300" : "bg-white/15 text-white border border-white/20"
                : normalBtnClasses
            }`}
          >
            &bull;&bull;&bull;
          </button>

          {activeDropdown === "more" && (
            <div
              onMouseDown={preventBlur}
              className={`absolute right-0 ${dropdownPosClass} w-52 rounded-2xl border p-1.5 shadow-2xl z-50 text-xs space-y-1 backdrop-blur-xl ${dropdownClasses}`}
            >
              {/* Search Web */}
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={handleSearchWeb}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  isLight ? "text-zinc-700 hover:bg-zinc-100/90 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={iconBadge}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                </span>
                <span className="font-medium">Search Web</span>
              </button>

              {/* Listen / TTS */}
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={handleListen}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  isSpeaking
                    ? "text-blue-500 bg-blue-500/10 font-medium"
                    : isLight ? "text-zinc-700 hover:bg-zinc-100/90 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={iconBadge}>
                  {isSpeaking ? (
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
                  )}
                </span>
                <span className="font-medium">{isSpeaking ? "Stop Speaking" : "Listen"}</span>
              </button>

              <div className={`h-px mx-1 my-0.5 ${dividerClasses}`} />

              {/* Clear Formatting */}
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={handleClearFormatting}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition ${
                  isLight ? "text-zinc-700 hover:bg-zinc-100/90 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="font-medium">Clear Formatting</span>
                <span className={isLight ? "text-zinc-400" : "text-zinc-500"}>&#x2715;</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SelectionToolbar;
