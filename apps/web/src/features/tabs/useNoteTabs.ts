import { useCallback, useEffect, useState } from "react";
import type { Note } from "../notes/types";

const OPEN_TABS_KEY = "focusnotes_open_tabs";
const ACTIVE_TAB_KEY = "focusnotes_active_tab";
const TABS_COLLAPSED_KEY = "focusnotes_tabs_collapsed";

export const useNoteTabs = (
  notes: Note[],
  activeNoteId: string | null,
  setActiveNoteId: (id: string | null) => void,
  isLoading: boolean,
) => {
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(OPEN_TABS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to load open tabs:", e);
    }
    return [];
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TABS_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Calculate valid open tabs based on current notes
  const validNoteIds = new Set(notes.map((n) => n.id));

  // Clean up openTabIds: filter out deleted notes & ensure activeNoteId is included
  let effectiveOpenTabIds = openTabIds.filter((id) => validNoteIds.has(id));

  if (!isLoading && notes.length > 0 && effectiveOpenTabIds.length === 0) {
    const storedActive = localStorage.getItem(ACTIVE_TAB_KEY);
    const initialId =
      storedActive && validNoteIds.has(storedActive)
        ? storedActive
        : activeNoteId && validNoteIds.has(activeNoteId)
          ? activeNoteId
          : notes[0].id;
    effectiveOpenTabIds = [initialId];
  }

  if (
    activeNoteId &&
    validNoteIds.has(activeNoteId) &&
    !effectiveOpenTabIds.includes(activeNoteId)
  ) {
    effectiveOpenTabIds = [...effectiveOpenTabIds, activeNoteId];
  }

  // Adjust state during render if effectiveOpenTabIds differs from state
  if (
    effectiveOpenTabIds.length !== openTabIds.length ||
    effectiveOpenTabIds.some((id, index) => id !== openTabIds[index])
  ) {
    setOpenTabIds(effectiveOpenTabIds);
  }

  // Persist openTabIds
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(effectiveOpenTabIds));
    } catch (e) {
      console.error("Failed to save open tabs:", e);
    }
  }, [effectiveOpenTabIds, isLoading]);

  // Persist activeTabId
  useEffect(() => {
    if (isLoading) return;
    try {
      if (activeNoteId) {
        localStorage.setItem(ACTIVE_TAB_KEY, activeNoteId);
      } else {
        localStorage.removeItem(ACTIVE_TAB_KEY);
      }
    } catch (e) {
      console.error("Failed to save active tab:", e);
    }
  }, [activeNoteId, isLoading]);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(TABS_COLLAPSED_KEY, String(isCollapsed));
    } catch (e) {
      console.error("Failed to save tabs collapsed state:", e);
    }
  }, [isCollapsed]);

  const selectTab = useCallback(
    (id: string) => {
      if (!effectiveOpenTabIds.includes(id)) {
        setOpenTabIds((currentTabs) => currentTabs.includes(id) ? currentTabs : [...currentTabs, id]);
      }
      setActiveNoteId(id);
    },
    [effectiveOpenTabIds, setActiveNoteId],
  );

  const closeTab = useCallback(
    (idToClose: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      const nextTabs = effectiveOpenTabIds.filter((id) => id !== idToClose);
      setOpenTabIds(() => nextTabs);

      if (idToClose === activeNoteId) {
        if (nextTabs.length > 0) {
          const index = effectiveOpenTabIds.indexOf(idToClose);
          const nextActiveIndex = Math.min(index, nextTabs.length - 1);
          setActiveNoteId(nextTabs[nextActiveIndex]);
        } else {
          setActiveNoteId(null);
        }
      }
    },
    [effectiveOpenTabIds, activeNoteId, setActiveNoteId],
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return {
    openTabIds: effectiveOpenTabIds,
    activeTabId: activeNoteId,
    selectTab,
    closeTab,
    isCollapsed,
    toggleCollapse,
  };
};
