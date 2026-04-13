"use client";

import { useState } from "react";

export function AccountKnop() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        Account
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border-2 border-navy/5 bg-white shadow-2xl animate-slide-in-bottom dark:border-white/10 dark:bg-navy">
            <div className="p-4 text-center">
              <p className="text-sm font-extrabold text-navy dark:text-white">
                Binnenkort beschikbaar
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Inloggen wordt binnenkort toegevoegd
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
