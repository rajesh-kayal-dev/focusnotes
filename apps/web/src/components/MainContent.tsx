import Header from "./Header";
import NoteEditor from "../features/markdown/NoteEditor";
import type { Note } from "../features/notes/types";

type MainContentProps = {
  note: Note | undefined;
  onUpdateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => void;
};

const MainContent = ({
  note,
  onUpdateNote,
}: MainContentProps) => {
  return (
    <main className="flex h-screen flex-1 flex-col">
      <Header note={note} />

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