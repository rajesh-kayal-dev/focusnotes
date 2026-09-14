import { useEffect, useState } from "react";
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

const AppLayout = () => {
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
    updateNote,
    deleteNote,
    duplicateNote,
    togglePinNote,
    isLoading,
  } = useNotes();

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

