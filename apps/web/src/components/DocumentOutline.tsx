import { useState, useEffect, useCallback, useRef, type RefObject } from "react";

type HeadingItem = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
  element: HTMLElement;
};

type NumberedHeadingItem = HeadingItem & {
  displayTitle: string;
};

type DocumentOutlineProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  content?: string;
};

// Pure helper function to compute hierarchical numbering (1. Arrays, 1. Find largest element)
function computeNumberedHeadings(items: HeadingItem[]): NumberedHeadingItem[] {
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;

  return items.map((item) => {
    let prefix = "";
    if (item.level === 1) {
      h1 += 1;
      h2 = 0;
      h3 = 0;
      prefix = `${h1}. `;
    } else if (item.level === 2) {
      h2 += 1;
      h3 = 0;
      prefix = `${h2}. `;
    } else if (item.level === 3) {
      h3 += 1;
      prefix = `${h3}. `;
    }

    const alreadyNumbered = /^\d+(\.\d+)*\s*/.test(item.text);
    const displayTitle = alreadyNumbered ? item.text : `${prefix}${item.text}`;

    return {
      ...item,
      displayTitle,
    };
  });
}

const DocumentOutline = ({
  scrollContainerRef,
  content,
}: DocumentOutlineProps) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Theme listener (dark/light)
  const [isLight, setIsLight] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Scan strictly for real H1, H2, H3 headings inside the editor
  const updateHeadings = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const editorEl = container.querySelector(".milkdown .editor");
    if (!editorEl) {
      setHeadings([]);
      return;
    }

    // STRICT: Only genuine h1, h2, h3 elements (never inside lists, quotes, or code)
    const headingEls = Array.from(
      editorEl.querySelectorAll<HTMLElement>("h1, h2, h3")
    ).filter((el) => {
      if (el.closest("pre, code, blockquote, li")) return false;
      const text = el.textContent?.trim() || "";
      return text.length > 0;
    });

    const items: HeadingItem[] = [];
    headingEls.forEach((el, idx) => {
      const text = el.textContent?.trim() || "";
      const tag = el.tagName.toLowerCase();
      const level = (tag === "h1" ? 1 : tag === "h2" ? 2 : 3) as 1 | 2 | 3;
      const id = el.id || `doc-heading-${idx}`;
      if (!el.id) el.id = id;
      items.push({ id, text, level, element: el });
    });

    setHeadings(items);
  }, [scrollContainerRef]);

  useEffect(() => {
    updateHeadings();
    const timer = setTimeout(updateHeadings, 100);

    const container = scrollContainerRef.current;
    if (!container) return () => clearTimeout(timer);

    const observer = new MutationObserver(() => {
      updateHeadings();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [content, scrollContainerRef, updateHeadings]);

  // Track active heading on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || headings.length === 0) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const scrollOffset = 100;

      let currentActive = 0;
      for (let i = 0; i < headings.length; i++) {
        const el = headings[i].element;
        if (!el || !el.isConnected) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= scrollOffset) {
          currentActive = i;
        } else {
          break;
        }
      }
      setActiveIndex(currentActive);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [headings, scrollContainerRef]);

  // Smooth scroll to heading
  const handleScrollToHeading = (item: HeadingItem, index: number) => {
    setActiveIndex(index);
    const container = scrollContainerRef.current;
    if (!container || !item.element || !item.element.isConnected) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = item.element.getBoundingClientRect();
    const targetScrollTop =
      container.scrollTop + (elementRect.top - containerRect.top) - 24;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  };

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  // Hide completely if there are no H1, H2, or H3 headings
  if (headings.length === 0) {
    return null;
  }

  // Hierarchy widths matching reference design (H1 widest, H3 subtle)
  const getMarkerWidth = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1:
        return "w-5"; // 20px (H1)
      case 2:
        return "w-3.5"; // 14px (H2)
      case 3:
        return "w-2.5"; // 10px (H3)
    }
  };

  const numberedHeadings = computeNumberedHeadings(headings);

  return (
    <div
      className="fixed right-2 top-1/2 z-30 flex -translate-y-1/2 select-none pointer-events-auto md:right-3.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Full Table of Contents Popover Card on Hover (matching reference image) */}
      {isHovered && (
        <div
          className={`absolute right-7 top-1/2 -translate-y-1/2 max-h-[65vh] w-[min(280px,calc(100vw-3rem))] md:right-8 md:w-[310px] overflow-y-auto rounded-2xl border p-3 backdrop-blur-xl shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95 z-40 ${
            isLight
              ? "border-[#E5E1D8] bg-[#FCFBF7]/98 text-zinc-700 shadow-zinc-900/15"
              : "border-zinc-800 bg-[#161618]/98 text-zinc-300 shadow-black/90"
          }`}
        >
          <div className="space-y-0.5">
            {numberedHeadings.map((item, index) => {
              const isActive = index === activeIndex;

              // Visual grouping & indentation matching reference image
              const indentClass =
                item.level === 1
                  ? "pl-1.5 font-medium text-[13.5px]"
                  : item.level === 2
                  ? "pl-5 text-[13px]"
                  : "pl-8 text-[12.5px]";

              return (
                <button
                  key={item.id || index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScrollToHeading(item, index);
                  }}
                  className={`flex w-full items-start text-left py-1.5 px-2 rounded-lg transition-colors cursor-pointer leading-snug ${indentClass} ${
                    isActive
                      ? "text-blue-500 font-semibold bg-blue-500/10"
                      : isLight
                      ? "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/50"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="truncate">{item.displayTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Standard Clean Vertical Dash Markers Rail (matching black reference image) */}
      <nav
        aria-label="Document Outline"
        className="flex max-h-[60vh] flex-col items-end gap-2 p-1 cursor-pointer overflow-y-auto no-scrollbar md:max-h-[70vh] md:gap-2.5"
      >
        {headings.map((item, index) => {
          const isActive = index === activeIndex;
          const widthClass = getMarkerWidth(item.level);

          return (
            <div
              key={item.id || index}
              className="relative flex items-center justify-end py-1 px-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleScrollToHeading(item, index);
              }}
            >
              {/* Standard line marker dash matching reference image */}
              <div
                className={`rounded-full transition-all duration-200 ${widthClass} ${
                  isActive
                    ? isLight
                      ? "h-[3px] bg-zinc-900 shadow-[0_0_6px_rgba(0,0,0,0.35)] scale-x-110"
                      : "h-[3px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-x-110"
                    : isLight
                    ? "h-[2px] bg-zinc-400/70 hover:bg-zinc-800 hover:h-[2.5px]"
                    : "h-[2px] bg-zinc-600/70 hover:bg-zinc-300 hover:h-[2.5px]"
                }`}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default DocumentOutline;


