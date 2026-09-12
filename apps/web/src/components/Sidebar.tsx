import { useMemo } from "react";
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
  onOpenHowToUse?: () => void;
  canInstallPWA?: boolean;
  onInstallPWA?: () => void;
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
}: SidebarProps) => {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || "");
  const shortcutHint = isMac ? "⌘K" : "Ctrl+K";

  const sortedNotes = useMemo(() => {
    const pinned = notes.filter((note) => Boolean(note.isPinned));
    const unpinned = notes.filter((note) => !note.isPinned);
    return [...pinned, ...unpinned];
  }, [notes]);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-900">
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

      {(onOpenHowToUse || (canInstallPWA && onInstallPWA)) && (
        <div className="border-t border-white/10 p-3 space-y-1">
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
      )}
    </aside>
  );
};

export default Sidebar;