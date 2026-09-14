import type { Note } from "../features/notes/types";

type NoteTabBarProps = {
  notes: Note[];
  openTabIds: string[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e?: React.MouseEvent) => void;
  onAddNote: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
};

const NoteTabBar = ({
  notes,
  openTabIds,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddNote,
  onToggleSidebar,
  isSidebarOpen = true,
}: NoteTabBarProps) => {
  const notesMap = new Map(notes.map((n) => [n.id, n]));

  return (
    <div className="flex h-full min-w-0 flex-1 items-center gap-0">
      {/* Sidebar Toggle Button '<' / '>' */}
      <button
        type="button"
        onClick={onToggleSidebar}
        title={isSidebarOpen ? "Close sidebar Â· Ctrl+B" : "Open sidebar Â· Ctrl+B"}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-black/5 hover:text-zinc-800 dark:hover:bg-white/10 dark:hover:text-zinc-100 focus:outline-none"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={isSidebarOpen ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"}
          />
        </svg>
      </button>

      {/* Tabs Container */}
      <div className="flex h-full min-w-0 flex-1 items-end gap-0 overflow-x-auto scrollbar-none select-none">
        {openTabIds.map((id) => {
          const note = notesMap.get(id);
          const isActive = id === activeTabId;
          const title = note?.title?.trim() || "Untitled Note";

          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTab(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTab(id);
                }
              }}
              title={title}
              className={`group relative flex h-8 shrink-0 max-w-[210px] cursor-pointer items-center justify-between gap-2.5 rounded-t-lg px-3.5 text-xs font-medium transition-all ${
                isActive
                  ? "tab-active bg-[#EBF5FF] text-zinc-900 border-b-2 border-blue-600 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 dark:border-blue-500 font-semibold"
                  : "tab-inactive bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
              }`}
            >
              {/* Title Text */}
              <span className="truncate">{title}</span>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => onCloseTab(id, e)}
                title="Close tab"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition ${
                  isActive
                    ? "text-zinc-400 hover:bg-black/10 hover:text-zinc-800 dark:hover:bg-white/15 dark:hover:text-zinc-100"
                    : "opacity-40 group-hover:opacity-100 text-zinc-400 hover:bg-black/10 hover:text-zinc-800 dark:hover:bg-white/15 dark:hover:text-zinc-100"
                }`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Plus Button */}
        <button
          type="button"
          onClick={onAddNote}
          title="New note"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-black/5 hover:text-zinc-800 dark:hover:bg-white/10 dark:hover:text-zinc-100 focus:outline-none"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NoteTabBar;





