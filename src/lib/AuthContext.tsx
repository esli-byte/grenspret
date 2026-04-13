"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  googleReady: boolean;
  handleCredentialResponse: (response: { credential: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginError: null,
  googleReady: false,
  handleCredentialResponse: async () => {},
  signOut: async () => {},
});

// Google client ID (from Firebase Google provider config)
export const GOOGLE_CLIENT_ID =
  "320368521945-47fap5b92v7i4hvn0q6oa2n8uu8cetpb.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>
          ) => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script laden mislukt"));
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  // Handle Google credential response → sign in to Firebase
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setLoginError(null);
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
      } catch (error: unknown) {
        const fbError = error as { code?: string; message?: string };
        console.error("Firebase login mislukt:", fbError);
        setLoginError(
          "Login mislukt: " +
            (fbError.code || fbError.message || "onbekende fout")
        );
      }
    },
    []
  );

  // Load Google Identity Services script
  useEffect(() => {
    loadGoogleScript()
      .then(() => {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleReady(true);
      })
      .catch((err) => {
        console.error("Google Identity Services laden mislukt:", err);
        setLoginError("Google login kon niet geladen worden.");
      });
  }, [handleCredentialResponse]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      if (user?.email && window.google) {
        window.google.accounts.id.revoke(user.email);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Uitloggen mislukt:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginError,
        googleReady,
        handleCredentialResponse,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
