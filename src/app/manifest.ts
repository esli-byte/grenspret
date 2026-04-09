import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grensbesparing",
    short_name: "Grensbesparing",
    description:
      "Bereken of het loont om in Duitsland of België te tanken en boodschappen te doen",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1B4332",
    theme_color: "#1B4332",
    categories: ["finance", "shopping"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
