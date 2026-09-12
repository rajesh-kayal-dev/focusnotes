import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "auto";

const THEME_STORAGE_KEY = "focusnotes-theme";
const BRIGHTNESS_STORAGE_KEY = "focusnotes-brightness";
const EYECARE_STORAGE_KEY = "focusnotes-eyecare";

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light" || saved === "auto") {
      return saved as ThemeMode;
    }
    return "dark";
  });

  const [brightness, setBrightness] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 40 && parsed <= 100) {
        return parsed;
      }
    }
    return 100;
  });

  const [isEyeCare, setIsEyeCare] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(EYECARE_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);

    const applyTheme = () => {
      let resolved: "dark" | "light";
      if (themeMode === "light") {
        resolved = "light";
      } else if (themeMode === "dark") {
        resolved = "dark";
      } else {
        const isSystemDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        resolved = isSystemDark ? "dark" : "light";
      }

      const root = document.documentElement;
      if (resolved === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
        root.classList.remove("light");
      }
    };

    applyTheme();

    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(BRIGHTNESS_STORAGE_KEY, brightness.toString());
    const root = document.documentElement;
    if (brightness === 100) {
      root.style.filter = "";
    } else {
      root.style.filter = `brightness(${brightness}%)`;
    }
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem(EYECARE_STORAGE_KEY, isEyeCare.toString());
    const root = document.documentElement;
    if (isEyeCare) {
      root.classList.add("eyecare");
    } else {
      root.classList.remove("eyecare");
    }
  }, [isEyeCare]);

  const cycleTheme = () => {
    setThemeMode((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "auto";
      return "dark";
    });
  };

  const toggleEyeCare = () => setIsEyeCare((prev) => !prev);

  return {
    themeMode,
    setThemeMode,
    cycleTheme,
    brightness,
    setBrightness,
    isEyeCare,
    toggleEyeCare,
  };
};

export default useTheme;
