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

const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return "just now";
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);

  if (diff < 60_000) {
    return "just now";
  }
  if (diff < 3_600_000) {
    const mins = Math.floor(diff / 60_000);
    return mins <= 1 ? "1 minute ago" : `${mins} minutes ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return hours <= 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (diff < 172_800_000) {
    return "yesterday";
  }
  if (diff < 604_800_000) {
    const days = Math.floor(diff / 86_400_000);
    return `${days} days ago`;
  }
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getWordCount = (content: string): number => {
  if (!content || !content.trim()) return 0;
  const clean = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_~`>[\]()]/g, " ")
    .trim();
  if (!clean) return 0;
  const words = clean.split(/\s+/).filter(Boolean);
  return words.length;
};

const NoteEditor = ({ note, onUpdateNote }: NoteEditorProps) => {
  if (!note) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Select a note to start writing.
      </div>
    );
  }

  const wordCount = getWordCount(note.content);
  const isUntitled = !note.title || note.title.trim() === "Untitled Note";

  return (
    <article className="min-h-full outline-none">
      {/* Small metadata row above the title */}
      <div
        style={{
          fontSize: `calc(13.5px * var(--note-zoom, 1))`,
          marginBottom: `calc(0.75rem * var(--note-zoom, 1))`,
        }}
        className="flex items-center gap-1.5 text-zinc-500 select-none"
      >
        <svg
          style={{
            width: `calc(14px * var(--note-zoom, 1))`,
            height: `calc(14px * var(--note-zoom, 1))`,
          }}
          className="shrink-0 opacity-80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Last edited {formatRelativeTime(note.updatedAt)}</span>
        <span className="text-zinc-600 mx-1">•</span>
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      {/* Large note title */}
      <div
        style={{
          marginBottom: `calc(1.75rem * var(--note-zoom, 1))`,
        }}
      >
        <input
          type="text"
          value={note.title}
          onChange={(event) =>
            onUpdateNote(note.id, {
              title: event.target.value,
            })
          }
          style={{
            fontSize: `clamp(32px, calc(54px * var(--note-zoom, 1)), 76px)`,
          }}
          className={`w-full bg-transparent font-bold tracking-tight leading-[1.1] outline-none transition-colors p-0 m-0 ${
            isUntitled
              ? "text-zinc-500 placeholder:text-zinc-600 focus:text-zinc-100"
              : "text-zinc-100 placeholder:text-zinc-600"
          }`}
          placeholder="Untitled Note"
        />
      </div>

      {/* Body content below the title */}
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