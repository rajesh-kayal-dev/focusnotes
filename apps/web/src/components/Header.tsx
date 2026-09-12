import type { Note } from "../features/notes/types";

type HeaderProps = {
  note: Note | undefined;
};

const Header = ({ note }: HeaderProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
      <h2 className="truncate text-sm font-medium text-slate-300">
        {note?.title || "Untitled Note"}
      </h2>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Focus
        </button>

        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Download
        </button>
      </div>
    </header>
  );
};

export default Header;