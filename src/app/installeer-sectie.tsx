"use client";

import { useEffect, useState } from "react";

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstalleerSectie() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installed, setInstalled] = useState(false); // just installed feedback

  useEffect(() => {
    // Check if already installed as PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    }
  }

  // Al geïnstalleerd — toon niets
  if (isInstalled) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Succesvol geïnstalleerd
  if (installed) {
    return (
      <div className="card-bold overflow-hidden">
        <div className="flex items-center gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg text-white">
            ✓
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Grenspret is geïnstalleerd!
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              Je vindt de app op je beginscherm
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-bold overflow-hidden">
      <div className="flex items-center gap-3.5 p-4">
        {/* App icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-accent/20">
          <img
            src="/icons/icon-192x192.png"
            alt="Grenspret"
            className="h-10 w-10 rounded-xl"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-navy dark:text-white">
            Voeg toe aan beginscherm
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Gebruik Grenspret als app — snel, gratis en altijd bij de hand
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        {isIOS ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Tik op</span>
            <span className="inline-flex items-center justify-center rounded-lg bg-accent/10 px-2 py-1">
              <svg
                className="h-4 w-4 text-accent"
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
            </span>
            <span className="font-medium">
              en kies <strong className="text-navy dark:text-white">&ldquo;Zet op beginscherm&rdquo;</strong>
            </span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-emerald-500 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/25 transition-all hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Installeer app
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span className="font-medium">
              Open Grenspret in Chrome of Safari om te installeren
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
