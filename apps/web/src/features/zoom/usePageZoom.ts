import { useState } from "react";

const STORAGE_KEY = "focusnotes_page_zoom";
const MIN_ZOOM = 70;
const MAX_ZOOM = 140;
const DEFAULT_ZOOM = 100;
const STEP = 10;

export const usePageZoom = () => {
  const [zoom, setZoomState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed >= MIN_ZOOM && parsed <= MAX_ZOOM) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ZOOM;
  });

  const setZoom = (value: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
    setZoomState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  };

  const zoomIn = () => {
    setZoom(zoom + STEP);
  };

  const zoomOut = () => {
    setZoom(zoom - STEP);
  };

  const resetZoom = () => {
    setZoom(DEFAULT_ZOOM);
  };

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
  };
};

export default usePageZoom;
