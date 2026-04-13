import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6CdueibWzSg2dJgfqx10-iV5KMqgdE1w",
  authDomain: "grenspret-6126d.firebaseapp.com",
  projectId: "grenspret-6126d",
  storageBucket: "grenspret-6126d.firebasestorage.app",
  messagingSenderId: "320368521945",
  appId: "1:320368521945:web:ae9c6ec05678b51f7ec4c8",
  measurementId: "G-RC6RL7E6TB",
};

// Voorkom dubbele initialisatie (Next.js hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
