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
            className="group -ml-2 flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none"
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

        <h2 className="truncate text-sm font-medium text-slate-300">
          {note?.title || "Untitled Note"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFocus}
          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Focus
        </button>

        <button
          type="button"
          onClick={() => downloadNote(note)}
          disabled={!note}
          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          Download
        </button>
      </div>
    </header>
  );
};

export default Header;