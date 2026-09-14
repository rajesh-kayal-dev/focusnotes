import { useEffect, useRef, useState, type FC } from "react";

type PageZoomControlProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  minZoom?: number;
  maxZoom?: number;
};

const PageZoomControl: FC<PageZoomControlProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom = 70,
  maxZoom = 140,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const revealTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScrollActivity = () => {
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);

      revealTimerRef.current = window.setTimeout(() => {
        setIsRevealed(true);
        hideTimerRef.current = window.setTimeout(() => setIsRevealed(false), 3000);
      }, 500);
    };

    const activityEvents = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"] as const;
    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleScrollActivity, true));
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleScrollActivity, true));
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, []);  return (
    <aside
      aria-label="Page Zoom"
      className={`fixed bottom-2 right-2 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/90 px-2 py-1.5 text-xs md:bottom-5 md:right-5 md:gap-1.5 md:px-3 text-zinc-300 shadow-lg backdrop-blur select-none ${isRevealed ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-2 scale-95 pointer-events-none"} transition-[opacity,transform] duration-300 ease-out`}
    >
      {/* Magnifying Glass Icon */}
      <svg
        className="h-3.5 w-3.5 text-zinc-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>

      {/* Minus Button */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        title="Zoom out (âˆ’)"
        aria-label="Zoom out"
        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10 hover:text-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>

      {/* Zoom Percentage */}
      <span className="min-w-[38px] text-center font-medium tabular-nums text-zinc-200">
        {zoom}%
      </span>

      {/* Plus Button */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        title="Zoom in (+)"
        aria-label="Zoom in"
        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10 hover:text-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      <span className="h-3 w-px bg-white/15 mx-0.5" aria-hidden="true" />

      {/* Reset Button */}
      <button
        type="button"
        onClick={onResetZoom}
        title="Reset zoom (100%)"
        aria-label="Reset zoom to 100%"
        className="rounded px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
      >
        Reset
      </button>
    </aside>
  );
};

export default PageZoomControl;








