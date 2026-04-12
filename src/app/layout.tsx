import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import {
  ServiceWorkerRegistration,
  InstallBanner,
} from "@/components/ServiceWorkerRegistration";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grenspret — Bespaar over de grens",
  description:
    "Bereken of het loont om in Duitsland of België te tanken en boodschappen te doen",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Grenspret",
    startupImage: "/icons/splash.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col pb-20 pt-[env(safe-area-inset-top)]">
        <AuthProvider>
          <div className="animate-page flex flex-1 flex-col">{children}</div>
          <BottomNav />
          <InstallBanner />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
