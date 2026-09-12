import { useEffect, useState } from "react";
import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useFocusMode from "../features/focus/useFocusMode";
import useNotes from "../features/notes/useNotes";
import SearchDialog from "../features/search/SearchDialog";

const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isFocusMode, toggleFocusMode } = useFocusMode(isSearchOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsSearchOpen(true);
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
    isLoading,
  } = useNotes();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {!isFocusMode && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRenameNote={(id, title) => updateNote(id, { title })}
          onDuplicateNote={duplicateNote}
        />
      )}

      <MainContent
        note={activeNote}
        onUpdateNote={updateNote}
        isFocusMode={isFocusMode}
        onToggleFocus={toggleFocusMode}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={notes}
        onSelectNote={setActiveNoteId}
      />
    </div>
  );
};

export default AppLayout;