import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ServiceWorkerRegistration,
  InstallBanner,
} from "@/components/ServiceWorkerRegistration";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grensbesparing — Bespaar over de grens",
  description:
    "Bereken of het loont om in Duitsland of België te tanken en boodschappen te doen",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Grensbesparing",
    startupImage: "/icons/splash.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col pb-20 pt-[env(safe-area-inset-top)]">
        <div className="animate-page flex flex-1 flex-col">{children}</div>
        <BottomNav />
        <InstallBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
