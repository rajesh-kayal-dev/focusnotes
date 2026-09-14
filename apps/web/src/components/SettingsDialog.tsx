import { useEffect, useState } from "react";

type SettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: "dark" | "light" | "auto";
  onSetTheme?: (mode: "dark" | "light" | "auto") => void;
  brightness?: number;
  onBrightnessChange?: (b: number) => void;
  isEyeCare?: boolean;
  onToggleEyeCare?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  isDND?: boolean;
  onToggleDND?: () => void;
  canInstallPWA?: boolean;
  onInstallPWA?: () => void;
  isSmallText?: boolean;
  onToggleSmallText?: () => void;
  isFullWidth?: boolean;
  onToggleFullWidth?: () => void;
};

const SettingsDialog = ({
  isOpen,
  onClose,
  themeMode = "dark",
  onSetTheme,
  brightness = 100,
  onBrightnessChange,
  isEyeCare = false,
  onToggleEyeCare,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canInstallPWA,
  onInstallPWA,
  isSmallText = false,
  onToggleSmallText,
  isFullWidth = false,
  onToggleFullWidth,
}: SettingsDialogProps) => {
  const [isLight, setIsLight] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

  const dialogClasses = isLight
    ? "border-[#E5E1D8] bg-[#FCFBF7] text-zinc-800 shadow-2xl shadow-zinc-900/15"
    : "border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl shadow-black/80";

  const headerBorder = isLight ? "border-[#E5E1D8]" : "border-zinc-800/80";
  const cardClasses = isLight
    ? "border border-[#E5E1D8] bg-[#F0EEE6]/70"
    : "border border-zinc-800 bg-zinc-950/40";
  const textMuted = isLight ? "text-zinc-500" : "text-zinc-400";
  const kbdClasses = isLight
    ? "border border-[#E5E1D8] bg-white/80 text-zinc-700"
    : "border border-zinc-700 bg-zinc-800 text-zinc-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border ${dialogClasses}`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 ${headerBorder}`}>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                isLight ? "border-[#E5E1D8] bg-[#EAE7DC] text-zinc-700" : "border-zinc-700/60 bg-zinc-800 text-zinc-200"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold">Settings</h2>
              <p className={`text-xs ${textMuted}`}>App preferences & workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition text-xs ${
              isLight
                ? "border-[#E5E1D8] bg-[#EAE7DC] text-zinc-600 hover:bg-[#DDD9CD] hover:text-zinc-900"
                : "border-zinc-700/60 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            }`}
          >
            Esc
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 overflow-y-auto p-6 text-sm">
          {/* Section 1: Appearance */}
          <div className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Appearance
            </h3>

            {/* Theme picker */}
            <div className={`rounded-xl p-3 space-y-2 ${cardClasses}`}>
              <div className="text-xs font-medium">Theme Mode</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSetTheme?.("dark")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition ${
                    themeMode === "dark"
                      ? "border-blue-500/80 bg-blue-500/15 text-blue-500 font-medium"
                      : isLight
                        ? "border-[#E5E1D8] bg-white/60 text-zinc-600 hover:text-zinc-900"
                        : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSetTheme?.("light")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition ${
                    themeMode === "light"
                      ? "border-blue-500/80 bg-blue-500/15 text-blue-500 font-medium"
                      : isLight
                        ? "border-[#E5E1D8] bg-white/60 text-zinc-600 hover:text-zinc-900"
                        : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25M4.284 12h-2.25m15.342-6.364l-1.591 1.591M6.759 17.241l-1.591 1.591m12.728 0l-1.591-1.591M6.759 6.759L5.168 5.168M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                  </svg>
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSetTheme?.("auto")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition ${
                    themeMode === "auto"
                      ? "border-blue-500/80 bg-blue-500/15 text-blue-500 font-medium"
                      : isLight
                        ? "border-[#E5E1D8] bg-white/60 text-zinc-600 hover:text-zinc-900"
                        : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs">A</span>
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Brightness */}
            {onBrightnessChange && (
              <div className={`rounded-xl p-3 space-y-2 ${cardClasses}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Display Brightness</span>
                  <span className={`font-mono ${textMuted}`}>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={brightness}
                  onChange={(e) => onBrightnessChange(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-zinc-700 accent-blue-500"
                />
              </div>
            )}

            {/* Eye Care */}
            {onToggleEyeCare && (
              <div className={`flex items-center justify-between rounded-xl p-3 ${cardClasses}`}>
                <div>
                  <div className="text-xs font-medium">Eye Care Warm Filter</div>
                  <div className={`text-[11px] ${textMuted}`}>Soft amber tint for comfortable night reading</div>
                </div>
                <button
                  type="button"
                  onClick={onToggleEyeCare}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isEyeCare ? "bg-amber-500" : isLight ? "bg-zinc-300" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      isEyeCare ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Page Zoom */}
          {onZoomIn && onZoomOut && onResetZoom && (
            <div className="space-y-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                Page Zoom
              </h3>
              <div className={`flex items-center justify-between rounded-xl p-3 ${cardClasses}`}>
                <div>
                  <div className="text-xs font-medium">Note Content Zoom</div>
                  <div className={`text-[11px] ${textMuted}`}>Current scale: {zoom}%</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onZoomOut}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${kbdClasses}`}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={onResetZoom}
                    className={`rounded-lg border px-2.5 py-1 text-xs ${kbdClasses}`}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={onZoomIn}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${kbdClasses}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Keyboard Shortcuts */}
          <div className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Shortcuts
            </h3>
            <div className={`grid grid-cols-2 gap-2 rounded-xl p-3 text-xs ${cardClasses}`}>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Open File</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + O
                </kbd>
              </div>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Save File</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + S
                </kbd>
              </div>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Download Note</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + D
                </kbd>
              </div>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Settings</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + ,
                </kbd>
              </div>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Search</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between pr-2">
                <span className={textMuted}>Sidebar</span>
                <kbd className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${kbdClasses}`}>
                  Ctrl + B
                </kbd>
              </div>
            </div>
          </div>

          {/* Section 5: Editor Display Options */}
          <div className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Editor
            </h3>

            <div className={`rounded-xl overflow-hidden ${cardClasses}`}>
              {/* Small text toggle */}
              <div className={`flex items-center justify-between p-3 ${isLight ? "border-b border-[#E5E1D8]" : "border-b border-zinc-800"}`}>
                <div className="flex items-center gap-2.5">
                  {/* A↓ icon */}
                  <svg className={`h-4 w-4 shrink-0 ${textMuted}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <text x="2" y="17" fontSize="13" fontFamily="system-ui" strokeWidth="0" fill="currentColor">A</text>
                    <text x="11" y="20" fontSize="10" fontFamily="system-ui" strokeWidth="0" fill="currentColor">↓</text>
                  </svg>
                  <div className="text-xs font-medium">Small text</div>
                </div>
                <button
                  type="button"
                  onClick={onToggleSmallText}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isSmallText ? "bg-blue-600" : isLight ? "bg-zinc-300" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle small text"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      isSmallText ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Full width toggle */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                  {/* ↔ icon */}
                  <svg className={`h-4 w-4 shrink-0 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12l3-3m-3 3l3 3M20 12l-3-3m3 3l-3 3" />
                  </svg>
                  <div className="text-xs font-medium">Full width</div>
                </div>
                <button
                  type="button"
                  onClick={onToggleFullWidth}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isFullWidth ? "bg-blue-600" : isLight ? "bg-zinc-300" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle full width"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      isFullWidth ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: PWA Install if applicable */}
          {canInstallPWA && onInstallPWA && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onInstallPWA}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-medium text-blue-500 hover:bg-blue-500/20 transition"
              >
                <span>Install FocusNotes Desktop App</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t px-6 py-3 text-xs ${headerBorder} ${textMuted}`}>
          <span>FocusNotes · Simple notes. Focused reading.</span>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              isLight
                ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
                : "bg-white/10 text-zinc-200 hover:bg-white/15"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
