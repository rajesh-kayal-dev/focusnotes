const NoteItem = () => {
  return (
    <div className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
      <span className="truncate">
        Untitled Note
      </span>

      <button
        type="button"
        className="rounded-md px-2 py-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
      >
        ...
      </button>
    </div>
  );
};

export default NoteItem;