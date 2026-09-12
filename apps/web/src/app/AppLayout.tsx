import MainContent from "../components/MainContent";
import Sidebar from "../components/Sidebar";
import useNotes from "../features/notes/useNotes";

const AppLayout = () => {
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
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
      />

      <MainContent
        note={activeNote}
        onUpdateNote={updateNote}
      />
    </div>
  );
};

export default AppLayout;