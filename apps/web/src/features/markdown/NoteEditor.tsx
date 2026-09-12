import type { Note } from "../notes/types";

type NoteEditorProps = {
  note: Note | undefined;
  onUpdateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => void;
};

const NoteEditor = ({
  note,
  onUpdateNote,
}: NoteEditorProps) => {
  if (!note) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Select a note to start writing.
      </div>
    );
  }

  return (
    <article className="min-h-full outline-none">
      <input
        type="text"
        value={note.title}
        onChange={(event) =>
          onUpdateNote(note.id, {
            title: event.target.value,
          })
        }
        className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-slate-600"
        placeholder="Untitled Note"
      />

      <textarea
        value={note.content}
        onChange={(event) =>
          onUpdateNote(note.id, {
            content: event.target.value,
          })
        }
        className="mt-8 min-h-[500px] w-full resize-none bg-transparent text-[16px] leading-8 text-slate-300 outline-none placeholder:text-slate-600"
        placeholder="Start writing or paste something here..."
      />
    </article>
  );
};

export default NoteEditor;