export type MilkdownEditorProps = {
  content: string;
  onChange: (markdown: string) => void;
  onOpenFile?: () => void;
};
