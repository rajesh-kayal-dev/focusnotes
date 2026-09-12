const NoteEditor = () => {
  return (
    <article className="min-h-full outline-none">
      <h1 className="text-4xl font-semibold tracking-tight text-white">
        Untitled Note
      </h1>

      <div className="mt-8 space-y-5 text-[16px] leading-8 text-slate-300">
        <p>
          Start writing or paste something here...
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Your content
        </h2>

        <p>
          FocusNotes is designed to turn messy information into
          focused reading.
        </p>
      </div>
    </article>
  );
};

export default NoteEditor;