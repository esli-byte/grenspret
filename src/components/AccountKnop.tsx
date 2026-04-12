"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { signInWithGoogle, signOut } from "@/lib/firebase";

export function AccountKnop() {
  const { user, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={async () => {
            setError("");
            const result = await signInWithGoogle();
            if (result.error) setError(result.error);
          }}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Inloggen
        </button>
        {error && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-red-500/90 px-4 py-3 text-xs font-medium text-white backdrop-blur-sm shadow-xl animate-slide-in-bottom">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full transition-all duration-200 hover:ring-2 hover:ring-accent/40 hover:scale-105 active:scale-95"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "Profiel"}
            className="h-10 w-10 rounded-full border-2 border-accent/40 shadow-md"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white shadow-md">
            {(user.displayName || user.email || "U")[0].toUpperCase()}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border-2 border-navy/5 bg-white shadow-2xl animate-slide-in-bottom dark:border-white/10 dark:bg-navy">
            <div className="border-b border-gray-100 p-4 dark:border-white/10">
              <p className="text-sm font-extrabold text-navy dark:text-white">
                {user.displayName || "Gebruiker"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-[0.98] dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Uitloggen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
