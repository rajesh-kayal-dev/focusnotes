import { useMemo } from "react";
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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <h1 className="text-lg font-semibold tracking-tight">
          FocusNotes
        </h1>

        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Collapse Sidebar (Ctrl+B)"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
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
          className="flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <span>Search</span>
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            {shortcutHint}
          </kbd>
        </button>

        <button
          type="button"
          onClick={onAddNote}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-left text-sm text-white transition hover:bg-white/15"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
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
    </aside>
  );
};

export default Sidebar;