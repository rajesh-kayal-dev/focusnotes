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
};

const Sidebar = ({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onOpenSearch,
  onRenameNote,
}: SidebarProps) => {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <h1 className="text-lg font-semibold tracking-tight">
          FocusNotes
        </h1>
      </div>

      <div className="space-y-2 p-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full rounded-lg border border-white/10 px-4 py-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Search
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
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onSelect={onSelectNote}
              onDelete={onDeleteNote}
              onRename={onRenameNote}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;