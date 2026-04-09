"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }
  }, []);

  return null;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing the banner for a smoother experience
      setTimeout(() => setVisible(true), 2000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show iOS instructions after delay
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    if (isIOS) {
      setTimeout(() => setVisible(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  if (isInstalled || !visible) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 animate-slide-up">
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-accent/20 bg-white shadow-xl dark:border-accent/10 dark:bg-[#131a16]">
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl text-white">
            💰
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Voeg toe aan beginscherm
            </h3>
            {isIOS ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tik op{" "}
                <span className="inline-flex items-center">
                  <svg
                    className="mx-0.5 inline h-4 w-4 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                    />
                  </svg>
                </span>{" "}
                en kies &ldquo;Zet op beginscherm&rdquo;
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Installeer de app voor snelle toegang en offline gebruik
              </p>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!isIOS && (
          <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            <button
              onClick={handleInstall}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
            >
              Installeren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
