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
  signInWithRedirect,
  getRedirectResult,
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
    // Na terugkeer van Google redirect login
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect resultaat fout:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoginError(null);
    try {
      // Popup werkt het beste bij echte gebruikersklik
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const fbError = error as { code?: string };
      console.error("Login poging 1 (popup) mislukt:", fbError.code);

      if (
        fbError.code === "auth/popup-blocked" ||
        fbError.code === "auth/cancelled-popup-request"
      ) {
        // Popup geblokkeerd? Probeer redirect
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error("Login poging 2 (redirect) mislukt:", redirectError);
          setLoginError("Login mislukt. Probeer het opnieuw.");
        }
      } else if (fbError.code === "auth/popup-closed-by-user") {
        // Gebruiker sloot popup, geen error tonen
      } else {
        setLoginError("Login mislukt: " + (fbError.code || "onbekende fout"));
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
