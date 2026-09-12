import { useEffect, useRef, useState } from "react";
import type { Note } from "./types";
import { downloadNote } from "../../lib/downloadNote";

type NoteItemProps = {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onDownload?: (note: Note) => void;
};

const NoteItem = ({
  note,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
  onTogglePin,
  onDownload,
}: NoteItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prevTitle, setPrevTitle] = useState(note.title);
  const [titleInput, setTitleInput] = useState(note.title);
  const inputRef = useRef<HTMLInputElement>(null);

  if (note.title !== prevTitle) {
    setPrevTitle(note.title);
    setTitleInput(note.title);
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = titleInput.trim();
    const finalTitle = trimmed || note.title;
    setTitleInput(finalTitle);

    if (finalTitle !== note.title && onRename) {
      onRename(note.id, finalTitle);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setTitleInput(note.title);
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    setIsMenuOpen(false);
    const shareContent = `${note.title}\n\n${note.content}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: shareContent,
        });
      } catch (error) {
        if ((error as DOMException)?.name !== "AbortError") {
          try {
            await navigator.clipboard?.writeText(shareContent);
          } catch {
            // Ignore clipboard errors
          }
        }
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareContent);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleDownload = () => {
    setIsMenuOpen(false);
    if (onDownload) {
      onDownload(note);
    } else {
      downloadNote(note);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded bg-slate-800 px-2 py-0.5 text-sm text-white outline-none ring-1 ring-white/20"
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelect(note.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left"
        >
          {note.isPinned && (
            <svg
              aria-label="Pinned note"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.75H7.5m1.5 0v5.25L7 11.25v2.25h10v-2.25l-2-2.25V3.75M12 13.5v6.75"
              />
            </svg>
          )}
          <span className="truncate">{note.title}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="rounded-md px-2 py-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
      >
        ...
      </button>

      {isMenuOpen && (
        <div className="absolute right-2 top-10 z-10 w-48 rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
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
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.828a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0 10.64a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
              />
            </svg>
            <span>Share</span>
          </button>

          {/* Rename */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditing(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            <span>Rename</span>
          </button>

          <hr className="my-1 border-white/10" />

          {/* Pin / Unpin */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onTogglePin) {
                onTogglePin(note.id);
              }
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
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
                d="M16.5 3.75H7.5m1.5 0v5.25L7 11.25v2.25h10v-2.25l-2-2.25V3.75M12 13.5v6.75"
              />
            </svg>
            <span>{note.isPinned ? "Unpin note" : "Pin note"}</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onDuplicate) {
                onDuplicate(note.id);
              }
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
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
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 20.625V9.375c0-.621.504-1.125 1.125-1.125H6.75m9 9H10.125A1.125 1.125 0 019 16.125V4.875c0-.621.504-1.125 1.125-1.125H16.5l4.875 4.875v7.5c0 .621-.504 1.125-1.125 1.125z"
              />
            </svg>
            <span>Duplicate</span>
          </button>

          {/* Download Markdown */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span>Download Markdown</span>
          </button>

          <hr className="my-1 border-white/10" />

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onDelete(note.id);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteItem;