import { useEffect, useMemo, useRef, useState } from "react";
import focusNotesLogo from "../assets/FocousNotes.png";
import focusNotesIcon from "../assets/FocusNotes-logo.png";
import type { Note } from "../features/notes/types";
import NoteItem from "../features/notes/NoteItem";

type SidebarProps = {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onOpenSearch: () => void;
  onRenameNote?: (id: string, title: string) => void;
  onDuplicateNote?: (id: string) => void;
  onTogglePinNote?: (id: string) => void;
  onDownloadNote?: (note: Note) => void;
  onToggleSidebar?: () => void;
  isOpen?: boolean;
  onOpenHowToUse?: () => void;
  canInstallPWA?: boolean;
  onInstallPWA?: () => void;
  themeMode?: "dark" | "light" | "auto";
  onCycleTheme?: () => void;
  onSetTheme?: (mode: "dark" | "light" | "auto") => void;
  brightness?: number;
  onBrightnessChange?: (brightness: number) => void;
  isEyeCare?: boolean;
  onToggleEyeCare?: () => void;
};

const Sidebar = ({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onOpenSearch,
  onRenameNote,
  onDuplicateNote,
  onTogglePinNote,
  onDownloadNote,
  onToggleSidebar,
  onOpenHowToUse,
  canInstallPWA,
  onInstallPWA,
  themeMode = "dark",
  onCycleTheme,
  onSetTheme,
  brightness = 100,
  onBrightnessChange,
  isEyeCare = false,
  onToggleEyeCare,
}: SidebarProps) => {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || "");
  const shortcutHint = isMac ? "âŒ˜K" : "Ctrl+K";

  const [isBrightnessOpen, setIsBrightnessOpen] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeContainerRef = useRef<HTMLDivElement | null>(null);

  const sortedNotes = useMemo(() => {
    const pinned = notes.filter((note) => Boolean(note.isPinned));
    const unpinned = notes.filter((note) => !note.isPinned);
    return [...pinned, ...unpinned];
  }, [notes]);

  const handleThemeClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    clickTimerRef.current = setTimeout(() => {
      onCycleTheme?.();
      clickTimerRef.current = null;
    }, 220);
  };

  const handleThemeDoubleClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    setIsBrightnessOpen((open) => !open);
  };

  useEffect(() => {
    if (!isBrightnessOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBrightnessOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeContainerRef.current &&
        !themeContainerRef.current.contains(event.target as Node)
      ) {
        setIsBrightnessOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBrightnessOpen]);

  return (
    <aside className="relative z-50 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-900 max-md:fixed max-md:inset-y-0 max-md:left-0">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center">
          <img
            src={focusNotesLogo}
            alt="FocusNotes Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Collapse Sidebar (Ctrl+B)"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5zM9 3.75v16.5"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2 p-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
        >
          <span>Search</span>
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            {shortcutHint}
          </kbd>
        </button>

        <button
          type="button"
          onClick={onAddNote}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-left text-sm text-zinc-100 transition hover:bg-white/15"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Today
        </p>

        <div className="space-y-1">
          {sortedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onSelect={onSelectNote}
              onDelete={onDeleteNote}
              onRename={onRenameNote}
              onDuplicate={onDuplicateNote}
              onTogglePin={onTogglePinNote}
              onDownload={onDownloadNote}
            />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/10 p-3 gap-2">
        <div className="flex-1 min-w-0 space-y-1">
          {canInstallPWA && onInstallPWA && (
            <button
              type="button"
              onClick={onInstallPWA}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
            >
              <img
                src={focusNotesIcon}
                alt=""
                className="h-4 w-4 shrink-0 object-contain"
              />
              <span>Install Focus</span>
            </button>
          )}

          {onOpenHowToUse && (
            <button
              type="button"
              onClick={onOpenHowToUse}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>How to use</span>
            </button>
          )}
        </div>

        {onCycleTheme && (
          <div ref={themeContainerRef} className="relative shrink-0">
            {isBrightnessOpen && (
              <div className="absolute bottom-10 right-0 z-50 w-56 rounded-xl border border-white/10 bg-zinc-900 p-3 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">Display</span>
                  <span className="font-mono text-zinc-200">{brightness}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onBrightnessChange?.(Math.max(40, brightness - 5))
                    }
                    disabled={brightness <= 40}
                    title="Decrease brightness"
                    aria-label="Decrease brightness"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 12h-15"
                      />
                    </svg>
                  </button>

                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={1}
                    value={brightness}
                    onChange={(e) =>
                      onBrightnessChange?.(Number(e.target.value))
                    }
                    className="h-1.5 flex-1 cursor-pointer rounded-lg bg-zinc-700 accent-blue-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onBrightnessChange?.(Math.min(100, brightness + 5))
                    }
                    disabled={brightness >= 100}
                    title="Increase brightness"
                    aria-label="Increase brightness"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </div>

                <div className="border-t border-white/10 my-1" />

                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-zinc-400">Theme</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSetTheme?.("dark")}
                      title="Dark Mode (Moon)"
                      aria-label="Dark Mode"
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs transition focus:outline-none ${
                        themeMode === "dark"
                          ? "border-blue-500 bg-blue-500/15 text-blue-400 font-medium shadow-xs"
                          : "border-white/15 bg-white/5 text-zinc-400 hover:border-white/30 hover:bg-white/10 hover:text-zinc-200"
                      }`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                        />
                      </svg>
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSetTheme?.("light")}
                      title="Light Mode (Sun)"
                      aria-label="Light Mode"
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs transition focus:outline-none ${
                        themeMode === "light"
                          ? "border-blue-500 bg-blue-500/15 text-blue-400 font-medium shadow-xs"
                          : "border-white/15 bg-white/5 text-zinc-400 hover:border-white/30 hover:bg-white/10 hover:text-zinc-200"
                      }`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25M4.284 12h-2.25m15.342-6.364l-1.591 1.591M6.759 17.241l-1.591 1.591m12.728 0l-1.591-1.591M6.759 6.759L5.168 5.168M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
                        />
                      </svg>
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSetTheme?.("auto")}
                      title="Auto / System Mode"
                      aria-label="Auto Mode"
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs transition focus:outline-none ${
                        themeMode === "auto"
                          ? "border-blue-500 bg-blue-500/15 text-blue-400 font-medium shadow-xs"
                          : "border-white/15 bg-white/5 text-zinc-400 hover:border-white/30 hover:bg-white/10 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">A</span>
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 my-1" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                    <svg
                      className={`h-4 w-4 ${
                        isEyeCare ? "text-amber-400" : "text-zinc-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Eye Care</span>
                  </div>

                  {onToggleEyeCare && (
                    <button
                      type="button"
                      onClick={onToggleEyeCare}
                      role="switch"
                      aria-checked={isEyeCare}
                      title={isEyeCare ? "Eye Care: Enabled" : "Eye Care: Disabled"}
                      aria-label="Toggle Eye Care"
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-white/20 ${
                        isEyeCare ? "bg-amber-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEyeCare ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleThemeClick}
              onDoubleClick={handleThemeDoubleClick}
              title={`Theme: ${
                themeMode === "dark"
                  ? "Dark"
                  : themeMode === "light"
                    ? "Light"
                    : "Auto (System)"
              }`}
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 focus:outline-none shadow-xs"
            >
              {themeMode === "dark" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              )}
              {themeMode === "light" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25M4.284 12h-2.25m15.342-6.364l-1.591 1.591M6.759 17.241l-1.591 1.591m12.728 0l-1.591-1.591M6.759 6.759L5.168 5.168M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
                  />
                </svg>
              )}
              {themeMode === "auto" && (
                <span className="flex h-4 w-4 select-none items-center justify-center text-xs font-bold leading-none">
                  A
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
