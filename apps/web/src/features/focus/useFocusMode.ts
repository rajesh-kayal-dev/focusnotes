import { useEffect, useState } from "react";

const useFocusMode = (isSearchOpen = false) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFocusMode && !isSearchOpen) {
        setIsFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, isSearchOpen]);

  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);
  const enterFocusMode = () => setIsFocusMode(true);
  const exitFocusMode = () => setIsFocusMode(false);

  return {
    isFocusMode,
    toggleFocusMode,
    enterFocusMode,
    exitFocusMode,
  };
};

export default useFocusMode;
