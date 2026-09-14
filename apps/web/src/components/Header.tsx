import { useState, useRef, useEffect, useCallback } from "react";
import focusNotesLogo from "../assets/FocusNotes-logo.png";
import type { Note } from "../features/notes/types";
import { downloadNote } from "../lib/downloadNote";
import NoteTabBar from "./NoteTabBar";

type HeaderProps = {
  note: Note | undefined;
  onToggleFocus?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  notes?: Note[];
  openTabIds?: string[];
  activeTabId?: string | null;
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string, e?: React.MouseEvent) => void;
  onAddNote?: () => void;
  onOpenSettings?: () => void;
  isDND?: boolean;
  onToggleDND?: (enabled: boolean) => void;
};

const Header = ({
  note,
  onToggleFocus,
  onToggleSidebar,
  isSidebarOpen = true,
  notes = [],
  openTabIds = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddNote,
  onOpenSettings,
  isDND: propIsDND,
  onToggleDND,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "share">("main");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Real-time theme listener
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

  // Local DND state fallback if not controlled externally
  const [localDND, setLocalDND] = useState(() => {
    try {
      return localStorage.getItem("focusnotes_dnd") === "true";
    } catch {
      return false;
    }
  });

  // Offline availability â€” default ON; toggling OFF unregisters SW + clears caches
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("focusnotes_offline");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  const isDND = propIsDND !== undefined ? propIsDND : localDND;

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Reset view to "main" when menu closes
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setMenuView("main");
  }, []);

  // Handle clicking outside & Escape key to close menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  // Global keyboard shortcuts: Ctrl+D for Download, Ctrl+, for Settings
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (note) {
          downloadNote(note);
          showToast(`Downloaded "${note.title || "note"}.md"`);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        onOpenSettings?.();
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [note, onOpenSettings, showToast]);

  const handleDownload = () => {
    if (!note) return;
    downloadNote(note);
    closeMenu();
    showToast(`Downloaded "${note.title || "note"}.md"`);
  };

  const handleCopyLink = async () => {
    if (!note) return;
    closeMenu();
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}#${note.id}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard");
      } else {
        showToast("Clipboard unavailable");
      }
    } catch {
      showToast("Failed to copy link");
    }
  };

  const handleShareFile = async () => {
    if (!note) return;
    closeMenu();
    const fileName = `${(note.title || "Untitled").replace(/[/\\?%*:|"<>]/g, "-")}.md`;
    const content = note.content || "";

    // If Web Share API supports file sharing, share physical file
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const file = new File([content], fileName, { type: "text/markdown" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: note.title || "Untitled",
          });
          showToast("Markdown file shared");
          return;
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // Fallback: save/download the physical markdown file
    downloadNote(note);
    showToast(`Saved "${fileName}" to device files`);
  };

  const handleNativeShare = async () => {
    if (!note) return;
    closeMenu();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: note.title || "Untitled",
          text: note.content || "",
        });
        showToast("Shared successfully");
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
  };

  const handleToggleDND = () => {
    const next = !isDND;
    setLocalDND(next);
    try {
      localStorage.setItem("focusnotes_dnd", String(next));
    } catch {
      // Ignore localStorage access errors
    }
    onToggleDND?.(next);
    showToast(
      next
        ? "Do Not Disturb enabled. Notifications muted."
        : "Do Not Disturb disabled."
    );
  };

  const handleToggleOffline = async () => {
    const next = !isOfflineEnabled;
    try {
      localStorage.setItem("focusnotes_offline", String(next));
    } catch {
      // Ignore localStorage access errors
    }

    if (!next) {
      // Turning OFF: unregister all service workers + clear every cache
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((r) => r.unregister()));
        } catch {
          // Ignore SW unregister errors
        }
      }
      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // Ignore cache delete errors
        }
      }
      setIsOfflineEnabled(false);
      showToast("Offline mode disabled. Cache cleared.");
    } else {
      // Turning ON: reload so the service worker registers fresh
      setIsOfflineEnabled(true);
      showToast("Offline mode enabled. Reloading to cacheâ€¦");
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  // Theme-derived style variables
  const headerBg = isLight
    ? "border-b border-[#E5E1D8] bg-[#FCFBF7] text-zinc-800"
    : "border-b border-white/10 bg-zinc-950 text-zinc-100";

  const btnClasses = isLight
    ? "border-[#E5E1D8] bg-[#F0EEE6] text-zinc-700 hover:border-zinc-300 hover:bg-zinc-200/70 hover:text-zinc-900"
    : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white";

  const moreBtnClasses = isLight
    ? isMenuOpen
      ? "border-zinc-400 bg-zinc-200 text-zinc-900"
      : "border-[#E5E1D8] bg-[#F0EEE6] text-zinc-600 hover:border-zinc-300 hover:bg-zinc-200/70 hover:text-zinc-900"
    : isMenuOpen
      ? "border-zinc-700 bg-zinc-800 text-white"
      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white";

  const popoverClasses = isLight
    ? "border-[#E5E1D8] bg-[#FCFBF7] text-zinc-800 shadow-xl shadow-zinc-900/10"
    : "border-zinc-800 bg-[#161618]/98 text-zinc-200 shadow-2xl shadow-black/90";

  const itemHoverClasses = isLight
    ? "hover:bg-zinc-100 text-zinc-800"
    : "hover:bg-zinc-800/60 text-zinc-100";

  const dividerClasses = isLight ? "border-[#E5E1D8]" : "border-zinc-800/80";
  const subtitleClasses = isLight ? "text-zinc-500" : "text-zinc-400";
  const iconClasses = isLight ? "text-zinc-600" : "text-zinc-300";

  return (
    <header className={`flex h-12 min-w-0 shrink-0 items-center justify-between gap-2 px-3 select-none md:gap-4 md:px-6 ${headerBg}`}>
      {/* Left Section: Logo (when sidebar is closed) + Tab Bar (with '<' toggle button) */}
      <div className="flex h-full min-w-0 flex-1 items-center gap-2">
        {!isSidebarOpen && (
          <img
            src={focusNotesLogo}
            alt="FocusNotes Logo"
            className="h-5 w-auto object-contain shrink-0 mr-0.5 cursor-pointer"
            onClick={onToggleSidebar}
            title="Open sidebar Â· Ctrl+B"
          />
        )}

        {onSelectTab && onCloseTab && onAddNote ? (
          <NoteTabBar
            notes={notes}
            openTabIds={openTabIds}
            activeTabId={activeTabId ?? note?.id ?? null}
            onSelectTab={onSelectTab}
            onCloseTab={onCloseTab}
            onAddNote={onAddNote}
            onToggleSidebar={onToggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Toggle sidebar Â· Ctrl+B"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
                isLight
                  ? "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <h2 className={`truncate text-sm font-medium ${isLight ? "text-zinc-800" : "text-zinc-200"}`}>
              {note?.title || "Untitled Note"}
            </h2>
          </div>
        )}
      </div>

      {/* Right Section: [ Focus ] [ ... ] */}
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        {/* 1. Focus Button */}
        <button
          type="button"
          onClick={onToggleFocus}
          className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition md:gap-1.5 md:px-3.5 ${btnClasses}`}
        >
          <svg
            className={`h-3.5 w-3.5 ${iconClasses}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 3.75s-6.75 0-11.25 4.5S4.5 19.5 4.5 19.5s11.25 0 15.75-4.5 0-11.25 0-11.25z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 12l-6 6"
            />
          </svg>
          <span>Focus</span>
        </button>

        {/* 2. More (...) Menu Button & Compact Popover */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              if (isMenuOpen) {
                closeMenu();
              } else {
                setIsMenuOpen(true);
                setMenuView("main");
              }
            }}
            title="More options"
            className={`flex h-8 w-9 items-center justify-center rounded-xl border transition ${moreBtnClasses}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>

          {/* Compact, Theme-Aware Popover Menu */}
          {isMenuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-[270px] rounded-2xl border p-1.5 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 ${popoverClasses}`}
            >
              {menuView === "main" ? (
                /* Main Menu View */
                <>
                  {/* 1. Download Option */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!note}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition disabled:opacity-40 disabled:pointer-events-none ${itemHoverClasses}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Download</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          Download as Markdown
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] shrink-0 ml-2 ${subtitleClasses}`}>
                      Ctrl + D
                    </span>
                  </button>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 2. Share option (transitions to Share submenu) */}
                  <button
                    type="button"
                    onClick={() => setMenuView("share")}
                    disabled={!note}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition disabled:opacity-40 disabled:pointer-events-none ${itemHoverClasses}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.828a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0 10.64a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                        />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Share</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          Copy link or share file
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`h-3.5 w-3.5 shrink-0 ${subtitleClasses}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 3. Available Offline Toggle */}
                  <div
                    onClick={handleToggleOffline}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition cursor-pointer ${itemHoverClasses}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v11m0 0l-3.75-3.75M12 15.5l3.75-3.75M4.5 19.5h15" />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Available offline</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          {isOfflineEnabled ? "PWA cache active â€” works offline" : "Cache cleared â€” requires internet"}
                        </div>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOfflineEnabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleToggleOffline();
                      }}
                      className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-2 ${
                        isOfflineEnabled ? "bg-blue-600" : isLight ? "bg-zinc-300" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          isOfflineEnabled ? "translate-x-3.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 4. Do Not Disturb Toggle */}
                  <div
                    onClick={handleToggleDND}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition cursor-pointer ${itemHoverClasses}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                        />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Do Not Disturb</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          Mute notifications
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDND}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDND();
                      }}
                      className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-2 ${
                        isDND ? "bg-blue-600" : isLight ? "bg-zinc-300" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          isDND ? "translate-x-3.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 4. Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onOpenSettings?.();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${itemHoverClasses}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Settings</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          App preferences
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] shrink-0 ml-2 ${subtitleClasses}`}>
                      Ctrl + ,
                    </span>
                  </button>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 5. Collaborate (Disabled / Greyed Out) */}
                  <div
                    title="Collaboration requires login & backend"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left opacity-35 cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                      <div className="truncate">
                        <div className="text-sm font-medium">Collaborate</div>
                        <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                          Requires login (coming soon)
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Compact Share Submenu View */
                <>
                  {/* Submenu Header */}
                  <div className={`flex items-center gap-2 px-1.5 py-1 mb-1 border-b ${dividerClasses}`}>
                    <button
                      type="button"
                      onClick={() => setMenuView("main")}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition ${
                        isLight
                          ? "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      }`}
                      title="Back"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <span className="text-xs font-semibold">Share Note</span>
                  </div>

                  {/* 1. Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${itemHoverClasses}`}
                  >
                    <svg
                      className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
                    <div className="truncate">
                      <div className="text-sm font-medium">Copy Link</div>
                      <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                        Copy note link to clipboard
                      </div>
                    </div>
                  </button>

                  <div className={`border-b my-1 ${dividerClasses}`} />

                  {/* 2. Share File (.md) - shares physical markdown file */}
                  <button
                    type="button"
                    onClick={handleShareFile}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${itemHoverClasses}`}
                  >
                    <svg
                      className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 9L12 10.5m0 0l1.5 1.5M12 10.5v6.75M6.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75a3 3 0 00-.879-2.121l-3.75-3.75A3 3 0 0012.75 3H6.75A2.25 2.25 0 004.5 5.25v14.25a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <div className="truncate">
                      <div className="text-sm font-medium">Share File (.md)</div>
                      <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                        Share actual Markdown file
                      </div>
                    </div>
                  </button>

                  {/* 3. Native Share / Apps (when supported by browser) */}
                  {hasNativeShare && (
                    <>
                      <div className={`border-b my-1 ${dividerClasses}`} />
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${itemHoverClasses}`}
                      >
                        <svg
                          className={`h-4.5 w-4.5 shrink-0 ${iconClasses}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.828a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0 10.64a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                          />
                        </svg>
                        <div className="truncate">
                          <div className="text-sm font-medium">Native Share / Apps</div>
                          <div className={`text-[11px] mt-0.5 ${subtitleClasses}`}>
                            Send via system apps
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 ${
            isLight
              ? "border-[#E5E1D8] bg-[#FCFBF7]/95 text-zinc-800 shadow-xl shadow-zinc-900/10"
              : "border-zinc-800 bg-zinc-900/95 text-zinc-200 shadow-2xl shadow-black/80"
          }`}
        >
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};

export default Header;




