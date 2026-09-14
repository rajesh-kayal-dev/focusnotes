import { useEffect, useRef, useState } from "react";
import HowToUseDialog from "../components/HowToUseDialog";
import SettingsDialog from "../components/SettingsDialog";
import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useFocusMode from "../features/focus/useFocusMode";
import useNotes from "../features/notes/useNotes";
import usePWAInstall from "../features/pwa/usePWAInstall";
import SearchDialog from "../features/search/SearchDialog";

import { useNoteTabs } from "../features/tabs/useNoteTabs";
import useTheme from "../features/theme/useTheme";
import usePageZoom from "../features/zoom/usePageZoom";
import PageZoomControl from "../components/PageZoomControl";
import type { Note } from "../features/notes/types";

const AppLayout = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDND, setIsDND] = useState(() => {
    try {
      return localStorage.getItem("focusnotes_dnd") === "true";
    } catch {
      return false;
    }
  });

  const [isSmallText, setIsSmallText] = useState(() => {
    try {
      return localStorage.getItem("focusnotes-small-text") === "true";
    } catch {
      return false;
    }
  });

  const [isFullWidth, setIsFullWidth] = useState(() => {
    try {
      return localStorage.getItem("focusnotes-full-width") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSmallText = () => {
    setIsSmallText((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("small-text", next);
      try {
        localStorage.setItem("focusnotes-small-text", String(next));
      } catch {
        // Ignore localStorage access errors
      }
      return next;
    });
  };

  const handleToggleFullWidth = () => {
    setIsFullWidth((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("focusnotes-full-width", String(next));
      } catch {
        // Ignore localStorage access errors
      }
      return next;
    });
  };

  // Apply small-text class on initial mount from persisted state
  useEffect(() => {
    document.documentElement.classList.toggle("small-text", isSmallText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleDND = (enabled?: boolean) => {
    setIsDND((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      try {
        localStorage.setItem("focusnotes_dnd", String(next));
      } catch {
        // Ignore localStorage access errors
      }
      return next;
    });
  };

  const { isFocusMode, isFullscreen, toggleFocusMode, toggleFullscreen } =
    useFocusMode(isSearchOpen);
  const { canInstall: canInstallPWA, installPWA: onInstallPWA } =
    usePWAInstall();
  const {
    themeMode,
    setThemeMode,
    cycleTheme,
    brightness,
    setBrightness,
    isEyeCare,
    toggleEyeCare,
  } = useTheme();
  const {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    minZoom,
    maxZoom,
  } = usePageZoom();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsSearchOpen(true);
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "b"
      ) {
        event.preventDefault();
        setIsSidebarOpen((open) => !open);
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key === ","
      ) {
        event.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    addNote,
    openFile,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePinNote,
    isLoading,
  } = useNotes();

  const openSelectedFile = async (file: File) => {
    const shouldReuseBlankNote = Boolean(activeNote && !activeNote.fileName && !activeNote.content && activeNote.title === "Untitled Note");
    try { await openFile(file, shouldReuseBlankNote ? activeNote?.id : undefined); } catch (error) {
      if (error instanceof Error && error.message === "UNSUPPORTED_FILE_TYPE") window.alert("Sorry, this file cannot be opened. Use .txt or .md only.");
      else window.alert("Sorry, this file could not be opened.");
    }
  };

  const handleOpenFile = () => fileInputRef.current?.click();
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void openSelectedFile(file);
  };

  const saveActiveFile = async (note: Note): Promise<boolean> => {
    const canSave = Boolean(note.content.trim() || (!note.fileName && note.title.trim() !== "Untitled Note"));
    if (!canSave) return false;
    if (!window.confirm("Do you want to save this file?")) return false;
    const suggestedName = note.fileName || (note.title.trim() || "Untitled Note") + ".md";
    const picker = (window as Window & { showSaveFilePicker?: (options?: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<{ createWritable: () => Promise<{ write: (content: string) => Promise<void>; close: () => Promise<void> }> }> }).showSaveFilePicker;
    if (!picker) {
      window.alert("Your browser does not support the save explorer. Please use Chrome or Edge.");
      return false;
    }
    try {
      const handle = await picker({ suggestedName, types: [{ description: "Text or Markdown file", accept: { "text/plain": [".txt"], "text/markdown": [".md"] } }] });
      const writable = await handle.createWritable();
      await writable.write(note.content);
      await writable.close();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
      window.alert("Sorry, this file could not be saved.");
      return false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") { event.preventDefault(); handleOpenFile(); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (activeNote && (activeNote.content.trim() || (!activeNote.fileName && activeNote.title.trim() !== "Untitled Note"))) {
          void saveActiveFile(activeNote);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeNote]);

  const {
    openTabIds,
    selectTab,
    closeTab,
  } = useNoteTabs(notes, activeNoteId, setActiveNoteId, isLoading);

  useEffect(() => {
    const title = activeNote?.title.trim();
    document.title = title || "focus";
  }, [activeNote?.title]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <input ref={fileInputRef} type="file" accept=".md,.txt,text/markdown,text/plain" className="hidden" onChange={handleFileInputChange} />
      {!isFocusMode && isSidebarOpen && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={selectTab}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRenameNote={(id, title) => updateNote(id, { title })}
          onDuplicateNote={duplicateNote}
          onTogglePinNote={togglePinNote}
          onDownloadNote={saveActiveFile}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          onOpenHowToUse={() => setIsHowToUseOpen(true)}
          canInstallPWA={canInstallPWA}
          onInstallPWA={onInstallPWA}
          themeMode={themeMode}
          onCycleTheme={cycleTheme}
          onSetTheme={setThemeMode}
          brightness={brightness}
          onBrightnessChange={setBrightness}
          isEyeCare={isEyeCare}
          onToggleEyeCare={toggleEyeCare}
        />
      )}

      <MainContent
        note={activeNote}
        onUpdateNote={updateNote}
        isFocusMode={isFocusMode}
        onToggleFocus={toggleFocusMode}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        isSidebarOpen={isSidebarOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        zoom={zoom}
        notes={notes}
        openTabIds={openTabIds}
        onSelectTab={selectTab}
        onCloseTab={closeTab}
        onAddNote={addNote}
        onOpenFile={handleOpenFile}
        onOpenFileData={openSelectedFile}
        onSaveFile={saveActiveFile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDND={isDND}
        onToggleDND={handleToggleDND}
        isFullWidth={isFullWidth}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={notes}
        onSelectNote={selectTab}
      />

      <HowToUseDialog
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeMode={themeMode}
        onSetTheme={setThemeMode}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        isEyeCare={isEyeCare}
        onToggleEyeCare={toggleEyeCare}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        isDND={isDND}
        onToggleDND={handleToggleDND}
        canInstallPWA={canInstallPWA}
        onInstallPWA={onInstallPWA}
        isSmallText={isSmallText}
        onToggleSmallText={handleToggleSmallText}
        isFullWidth={isFullWidth}
        onToggleFullWidth={handleToggleFullWidth}
      />

      <PageZoomControl
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />
    </div>
  );
};

export default AppLayout;

