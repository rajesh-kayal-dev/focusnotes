import { useEffect, useState } from "react";
import HowToUseDialog from "../components/HowToUseDialog";
import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useFocusMode from "../features/focus/useFocusMode";
import useNotes from "../features/notes/useNotes";
import usePWAInstall from "../features/pwa/usePWAInstall";
import SearchDialog from "../features/search/SearchDialog";

import useTheme from "../features/theme/useTheme";
import usePageZoom from "../features/zoom/usePageZoom";
import PageZoomControl from "../components/PageZoomControl";

const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const { isFocusMode, isFullscreen, toggleFocusMode, toggleFullscreen } =
    useFocusMode(isSearchOpen);
  const { canInstall: canInstallPWA, installPWA: onInstallPWA } =
    usePWAInstall();
  const {
    themeMode,
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
    updateNote,
    deleteNote,
    duplicateNote,
    togglePinNote,
    isLoading,
  } = useNotes();

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
      {!isFocusMode && isSidebarOpen && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRenameNote={(id, title) => updateNote(id, { title })}
          onDuplicateNote={duplicateNote}
          onTogglePinNote={togglePinNote}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          onOpenHowToUse={() => setIsHowToUseOpen(true)}
          canInstallPWA={canInstallPWA}
          onInstallPWA={onInstallPWA}
          themeMode={themeMode}
          onCycleTheme={cycleTheme}
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
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={notes}
        onSelectNote={setActiveNoteId}
      />

      <HowToUseDialog
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
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