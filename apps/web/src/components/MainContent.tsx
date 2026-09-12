import Header from "./Header";
import NoteEditor from "../features/markdown/NoteEditor";

const MainContent = () => {
  return (
    <main className="flex h-screen flex-1 flex-col">
      <Header />

      <section className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-12">
          <NoteEditor />
        </div>
      </section>
    </main>
  );
};

export default MainContent;