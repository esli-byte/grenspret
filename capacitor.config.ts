import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "nl.grenspret.app",
  appName: "Grenspret",
  webDir: "out",
  server: {
    // In productie: gebruik de gehoste URL zodat updates direct live zijn
    // zonder nieuwe app store review. Verwijder dit voor een volledig offline build.
    url: "https://grenspret.nl",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    preferredContentMode: "mobile",
    scheme: "Grenspret",
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0F172A",
    },
  },
};

export default config;
