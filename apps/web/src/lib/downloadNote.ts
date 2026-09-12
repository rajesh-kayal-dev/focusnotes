import type { Note } from "../features/notes/types";

export const downloadNote = (note: Note | undefined): void => {
  if (!note) {
    return;
  }

  const sanitizedTitle = note.title
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\.+$/, "")
    .trim();

  const baseName = sanitizedTitle || "Untitled Note";
  const fileName = baseName.endsWith(".md") ? baseName : `${baseName}.md`;

  const blob = new Blob([note.content], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
