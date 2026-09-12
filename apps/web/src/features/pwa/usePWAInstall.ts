import { useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWA_INSTALLED_KEY = "focusnotes_pwa_installed";

const checkIsStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

const checkIsInstalledStorage = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PWA_INSTALLED_KEY) === "true";
  } catch {
    return false;
  }
};

const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => checkIsStandalone() || checkIsInstalledStorage()
  );

  useEffect(() => {
    if (checkIsStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, "true");
      } catch {
        // Ignore localStorage errors
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem(PWA_INSTALLED_KEY, "true");
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch {
      // In case prompt was invalid or already consumed
    }
  };

  const openPWA = () => {
    try {
      window.open(window.location.origin, "_blank");
    } catch {
      // Fail gracefully if unsupported
    }
  };

  const isStandaloneMode = checkIsStandalone();
  const canInstall =
    Boolean(deferredPrompt) && !isInstalled && !isStandaloneMode;
  const canOpenApp = !isStandaloneMode;

  return {
    canInstall,
    canOpenApp,
    installPWA,
    openPWA,
  };
};

export default usePWAInstall;
