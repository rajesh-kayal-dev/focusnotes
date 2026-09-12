import focusNotesLogo from "../assets/FocusNotes-logo.png";
import type { Note } from "../features/notes/types";
import { downloadNote } from "../lib/downloadNote";

type HeaderProps = {
  note: Note | undefined;
  onToggleFocus?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
};

const Header = ({
  note,
  onToggleFocus,
  onToggleSidebar,
  isSidebarOpen = true,
}: HeaderProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
      <div className="flex min-w-0 items-center gap-3">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Open sidebar · Ctrl+B"
            className="group -ml-2 flex shrink-0 items-center justify-center rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100 focus:outline-none"
          >
            <img
              src={focusNotesLogo}
              alt="FocusNotes Logo"
              className="block h-5 w-auto object-contain group-hover:hidden"
            />
            <svg
              className="hidden h-5 w-5 group-hover:block"
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

        <h2 className="truncate text-sm font-medium text-zinc-200">
          {note?.title || "Untitled Note"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFocus}
          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
        >
          Focus
        </button>

        <button
          type="button"
          onClick={() => downloadNote(note)}
          disabled={!note}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-50"
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </header>
  );
};

export default Header;