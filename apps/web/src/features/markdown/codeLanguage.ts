export const LANGUAGES: { label: string; value: string }[] = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "PHP", value: "php" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "SQL", value: "sql" },
  { label: "Bash", value: "bash" },
  { label: "Markdown", value: "markdown" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Plain Text", value: "text" },
];

export const detectLanguage = (code: string): string => {
  const trimmed = code.trim();
  if (!trimmed) return "javascript";
  if (trimmed.startsWith("<?php") || trimmed.includes("echo $")) return "php";
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.includes("</div>") || /<[a-z][\s\S]*>/i.test(trimmed)) return "html";
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(trimmed)) return "sql";
  if (/^(\{|\[)[\s\S]*(\}|\])$/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not json
    }
  }
  if (/^\s*(import|export)\s.*from\s|const\s|let\s|function\s|console\.log|=>/m.test(trimmed)) {
    if (/:\s*(string|number|boolean|any|void)\b|<[A-Z]>|interface\s|type\s/m.test(trimmed)) return "typescript";
    return "javascript";
  }
  if (/^\s*(def\s|class\s.*:|import\s.*|from\s.*import|print\(|if\s.*:)/m.test(trimmed)) return "python";
  if (/^\s*(public\s|private\s|protected\s)?(class|interface)\s|System\.out\.println/m.test(trimmed)) return "java";
  if (/^\s*(#!\/bin\/bash|npm\s|pnpm\s|yarn\s|git\s|cd\s|ls\s|curl\s)/m.test(trimmed)) return "bash";
  if (/^\s*(#\s|##\s|```|- \[[ x]\])/m.test(trimmed)) return "markdown";
  if (/[.#][a-z0-9_-]+\s*\{[\s\S]*\}/i.test(trimmed)) return "css";
  return "javascript";
};
