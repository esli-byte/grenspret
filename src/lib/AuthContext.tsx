"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginError: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const fbError = error as { code?: string; message?: string };
      console.error("Login mislukt:", fbError);

      // Geen error tonen als gebruiker zelf de popup sloot
      if (
        fbError.code === "auth/popup-closed-by-user" ||
        fbError.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      if (fbError.code === "auth/popup-blocked") {
        setLoginError("Popup geblokkeerd — sta pop-ups toe voor deze site.");
      } else {
        setLoginError(
          "Login mislukt: " + (fbError.code || fbError.message || "onbekende fout")
        );
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Uitloggen mislukt:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginError, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
