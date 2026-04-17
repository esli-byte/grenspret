import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "nl.grenspret.app",
  appName: "Grenspret",
  webDir: "out",
  server: {
    // Laadt de live Vercel URL zodat updates direct zichtbaar zijn
    // zonder nieuwe App Store review
    url: "https://grenspret.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0F172A",
    preferredContentMode: "mobile",
    scheme: "Grenspret",
  },
  android: {
    backgroundColor: "#0F172A",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0F172A",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0F172A",
    },
  },
};

export default config;
