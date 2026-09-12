import { useEffect, useState } from "react";
import HowToUseDialog from "../components/HowToUseDialog";
import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useFocusMode from "../features/focus/useFocusMode";
import useNotes from "../features/notes/useNotes";
import SearchDialog from "../features/search/SearchDialog";

const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const { isFocusMode, toggleFocusMode } = useFocusMode(isSearchOpen);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
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
        />
      )}

      <MainContent
        note={activeNote}
        onUpdateNote={updateNote}
        isFocusMode={isFocusMode}
        onToggleFocus={toggleFocusMode}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        isSidebarOpen={isSidebarOpen}
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
    </div>
  );
};

export default AppLayout;