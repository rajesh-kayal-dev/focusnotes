import { useEffect } from "react";

type HowToUseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HowToUseDialog = ({ isOpen, onClose }: HowToUseDialogProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              How to use FocusNotes
            </h2>
            <p className="text-xs text-zinc-400">
              Turn messy information into focused reading.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-1 text-xs text-zinc-400 transition hover:text-zinc-100"
          >
            Esc
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-6 text-sm">
          <div>
            <h3 className="font-medium text-zinc-200">1. Create a note</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Click &quot;+ New Note&quot; and start writing.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">2. Search</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">
                Ctrl + K
              </kbd>{" "}
              /{" "}
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">
                Cmd + K
              </kbd>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Quickly search your notes.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">3. Focus Mode</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Use Focus Mode for distraction-free reading and writing.
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Optional: Full Screen for complete immersion.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">4. Sidebar</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">
                Ctrl + B
              </kbd>{" "}
              /{" "}
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">
                Cmd + B
              </kbd>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Show or hide the sidebar.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">5. Themes</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Use the theme control to switch between:
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-zinc-400">
              <li>Dark</li>
              <li>Light</li>
              <li>Auto (System)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">6. Display</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Double-click the theme button to open Display controls:
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-zinc-400">
              <li>Brightness</li>
              <li>Eye Care</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">7. PWA</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Install Focus to use FocusNotes as an app.
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              When installed, &quot;Open in app&quot; can be used where supported.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">8. Note actions</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Use the &quot;...&quot; menu to:
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-zinc-400">
              <li>Rename</li>
              <li>Pin / Unpin</li>
              <li>Share</li>
              <li>Duplicate</li>
              <li>Download Markdown</li>
              <li>Delete</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-zinc-200">9. Your notes</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Notes are stored locally on your device in the current MVP. No account is required.
            </p>
          </div>

          {/* Community Section */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="font-medium text-zinc-200">Enjoying FocusNotes?</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <a
                href="https://github.com/rajesh-kayal-dev/focusnotes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Star on GitHub</span>
              </a>

              <a
                href="https://github.com/rajesh-kayal-dev/focusnotes/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span>Suggest an improvement</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 text-xs text-zinc-500">
          <span>FocusNotes · Simple notes. Focused reading.</span>

          <a
            href="https://github.com/rajesh-kayal-dev/focusnotes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 transition hover:text-zinc-100"
          >
            <svg
              className="h-4 w-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowToUseDialog;
