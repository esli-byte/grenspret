"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth, GOOGLE_CLIENT_ID } from "@/lib/AuthContext";

export function AccountKnop() {
  const { user, loading, loginError, googleReady, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Render Google's official sign-in button when ready
  useEffect(() => {
    if (!googleReady || user || loading) return;
    if (!googleBtnRef.current) return;
    if (!window.google) return;

    // Clear previous renders
    googleBtnRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "medium",
      shape: "pill",
      text: "signin",
      logo_alignment: "left",
    });
  }, [googleReady, user, loading]);

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
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                Uitloggen
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Niet ingelogd: toon Google's eigen Sign-In button
  return (
    <div className="relative">
      <div ref={googleBtnRef} className="google-signin-btn" />
      {loginError && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-xl bg-red-500/90 p-3 text-xs font-bold text-white shadow-lg">
          {loginError}
        </div>
      )}
    </div>
  );
}
