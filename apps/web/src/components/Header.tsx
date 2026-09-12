import type { Note } from "../features/notes/types";

type HeaderProps = {
  note: Note | undefined;
  onToggleFocus?: () => void;
};

const Header = ({ note, onToggleFocus }: HeaderProps) => {
  const handleDownload = () => {
    if (!note) {
      return;
    }

    const sanitizedTitle = note.title
      .trim()
      .replace(/[/\\?%*:|"<>]/g, "-")
      .trim();

    const fileName = `${sanitizedTitle || "Untitled Note"}.md`;

    const blob = new Blob([note.content], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
      <h2 className="truncate text-sm font-medium text-slate-300">
        {note?.title || "Untitled Note"}
      </h2>

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
          onClick={handleDownload}
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