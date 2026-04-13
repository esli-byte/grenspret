"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export function AccountKnop() {
  const { user, loading, loginError, signInWithGoogle, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/50">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  // Ingelogd: toon avatar + menu
  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-7 w-7 rounded-full border-2 border-white/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-white">
              {user.displayName?.[0] || user.email?.[0] || "?"}
            </div>
          )}
          <span className="max-w-[100px] truncate text-xs">
            {user.displayName?.split(" ")[0] || "Account"}
          </span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border-2 border-navy/5 bg-white shadow-2xl animate-slide-in-bottom dark:border-white/10 dark:bg-navy">
              <div className="border-b border-gray-100 p-4 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-10 w-10 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-black text-white">
                      {user.displayName?.[0] || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-navy dark:text-white">
                      {user.displayName || "Gebruiker"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Uitloggen
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Niet ingelogd: toon login knop
  return (
    <div className="relative">
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Inloggen
      </button>
      {loginError && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-xl bg-red-500/90 p-3 text-xs font-bold text-white shadow-lg">
          {loginError}
        </div>
      )}
    </div>
  );
}
