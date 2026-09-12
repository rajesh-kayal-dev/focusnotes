import Header from "./Header";
import NoteEditor from "../features/markdown/NoteEditor";
import type { Note } from "../features/notes/types";

type MainContentProps = {
  note: Note | undefined;
  onUpdateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => void;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
};

const MainContent = ({
  note,
  onUpdateNote,
  isFocusMode = false,
  onToggleFocus,
}: MainContentProps) => {
  return (
    <main className="flex h-screen flex-1 flex-col">
      {isFocusMode ? (
        <div className="flex h-12 items-center justify-end border-b border-white/5 bg-slate-950 px-8">
          <button
            type="button"
            onClick={onToggleFocus}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Exit · Esc
          </button>
        </div>
      ) : (
        <Header note={note} onToggleFocus={onToggleFocus} />
      )}

      <section className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-12">
          <NoteEditor
            note={note}
            onUpdateNote={onUpdateNote}
          />
        </div>
      </section>
    </main>
  );
};

export default MainContent;