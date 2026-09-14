export type Note = {
  id: string;
  title: string;
  fileName?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
};