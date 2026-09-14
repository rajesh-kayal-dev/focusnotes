import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import NoteEditor from "../features/markdown/NoteEditor";
import DocumentOutline from "./DocumentOutline";
import type { Note } from "../features/notes/types";

type MainContentProps = {
  note: Note | undefined;
  onUpdateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => void;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  zoom?: number;
  notes?: Note[];
  openTabIds?: string[];
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string, e?: React.MouseEvent) => void;
  onAddNote?: () => void;
  onOpenFile?: () => void;
  onOpenFileData?: (file: File) => Promise<void>;
  onSaveFile?: (note: Note) => Promise<boolean>;
  onOpenSettings?: () => void;
  isDND?: boolean;
  onToggleDND?: (enabled: boolean) => void;
  isFullWidth?: boolean;
};

const MainContent = ({
  note,
  onUpdateNote,
  isFocusMode = false,
  onToggleFocus,
  onToggleSidebar,
  isSidebarOpen = true,
  isFullscreen = false,
  onToggleFullscreen,
  zoom = 100,
  notes = [],
  openTabIds = [],
  onSelectTab,
  onCloseTab,
  onAddNote,
  onOpenFile,
  onOpenFileData,
  onSaveFile,
  onOpenSettings,
  isDND,
  onToggleDND,
  isFullWidth = false,
}: MainContentProps) => {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [areFocusControlsVisible, setAreFocusControlsVisible] = useState(false);
  const focusControlsRevealTimerRef = useRef<number | null>(null);
  const focusControlsHideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isFocusMode) return;

    const handleFocusActivity = () => {
      if (focusControlsRevealTimerRef.current !== null) {
        window.clearTimeout(focusControlsRevealTimerRef.current);
      }
      if (focusControlsHideTimerRef.current !== null) {
        window.clearTimeout(focusControlsHideTimerRef.current);
      }

      focusControlsRevealTimerRef.current = window.setTimeout(() => {
        setAreFocusControlsVisible(true);
        focusControlsHideTimerRef.current = window.setTimeout(() => {
          setAreFocusControlsVisible(false);
        }, 3000);
      }, 500);
    };

    const activityEvents = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"] as const;
    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleFocusActivity, true));

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleFocusActivity, true));
      if (focusControlsRevealTimerRef.current !== null) {
        window.clearTimeout(focusControlsRevealTimerRef.current);
      }
      if (focusControlsHideTimerRef.current !== null) {
        window.clearTimeout(focusControlsHideTimerRef.current);
      }
    };
  }, [isFocusMode]);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files[0];
    if (file && onOpenFileData) void onOpenFileData(file);
  };

  return (
    <main className={`relative flex h-screen min-w-0 flex-1 flex-col max-md:overflow-hidden ${isSidebarOpen ? "max-md:ml-64 max-md:w-[calc(100%-16rem)] max-md:flex-none" : ""}`}>
      {isFocusMode ? (
        <div className={`absolute top-4 right-6 z-20 flex items-center gap-2.5 transition-[opacity,transform] duration-300 ease-out ${areFocusControlsVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-2 scale-95 pointer-events-none"}`}>
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="focus-floating-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs text-zinc-400 shadow-sm transition hover:bg-white/10 hover:text-zinc-100"
            >
              {isFullscreen ? (
                <>
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
                      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                    />
                  </svg>
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
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
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                  <span>Full Screen</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleFocus}
            className="focus-floating-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs text-zinc-400 shadow-sm transition hover:bg-white/10 hover:text-zinc-100"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Exit Â· Esc</span>
          </button>
        </div>
      ) : (
        <Header
          note={note}
          onOpenFile={onOpenFile}
          onSaveFile={onSaveFile}
          onToggleFocus={onToggleFocus}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          notes={notes}
          openTabIds={openTabIds}
          activeTabId={note?.id ?? null}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onAddNote={onAddNote}
          onOpenSettings={onOpenSettings}
          isDND={isDND}
          onToggleDND={onToggleDND}
        />
      )}

      <section
        ref={scrollContainerRef}
        onDragOver={(event) => { event.preventDefault(); setIsDraggingFile(true); }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleDrop}
        className={`relative min-w-0 flex-1 overflow-y-auto ${isDraggingFile ? "ring-2 ring-inset ring-blue-500/70" : ""}`}
      >
        <div
          className={`mx-auto w-full pt-10 pb-24 md:pt-12 md:pb-32 ${isFullWidth ? "px-4 md:px-6" : "px-6 md:px-12"}`}
          style={
            isFullWidth
              ? { "--note-zoom": (zoom ?? 100) / 100 } as React.CSSProperties
              : {
                  maxWidth: `calc(1040px * var(--note-zoom, 1))`,
                  "--note-zoom": (zoom ?? 100) / 100,
                } as React.CSSProperties
          }
        >
          {isDraggingFile && (
            <div className="pointer-events-none absolute inset-x-6 top-4 z-10 rounded-xl border border-dashed border-blue-400 bg-blue-500/10 px-4 py-3 text-center text-sm text-blue-200">Drop a .md or .txt file to open it</div>
          )}
          <NoteEditor note={note} onUpdateNote={onUpdateNote} onOpenFile={onOpenFile} onSaveFile={onSaveFile} />
        </div>
      </section>

      <DocumentOutline
        scrollContainerRef={scrollContainerRef}
        content={note?.content}
      />
    </main>
  );
};

export default MainContent;

