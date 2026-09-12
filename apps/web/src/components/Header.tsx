const Header = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
      <span className="text-sm text-slate-400">
        Untitled Note
      </span>

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