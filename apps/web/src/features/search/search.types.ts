import type { Note } from "../notes/types";

export type SearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
};
