import { MilkdownProvider } from "@milkdown/react";
import type { Note } from "../notes/types";
import MilkdownEditor from "./MilkdownEditor";

type NoteEditorProps = {
  note: Note | undefined;
  onUpdateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => void;
};

const NoteEditor = ({ note, onUpdateNote }: NoteEditorProps) => {
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

      <MilkdownProvider key={note.id}>
        <MilkdownEditor
          content={note.content}
          onChange={(newContent) =>
            onUpdateNote(note.id, { content: newContent })
          }
        />
      </MilkdownProvider>
    </article>
  );
};

export default NoteEditor;