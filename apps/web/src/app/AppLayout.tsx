import { useState } from "react";
import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useFocusMode from "../features/focus/useFocusMode";
import useNotes from "../features/notes/useNotes";
import SearchDialog from "../features/search/SearchDialog";

const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isFocusMode, toggleFocusMode } = useFocusMode(isSearchOpen);

  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    addNote,
    updateNote,
    deleteNote,
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