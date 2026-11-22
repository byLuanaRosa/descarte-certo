import type { MetadataRoute } from "next";

/** Torna o site instalável no celular e no computador (RNF05). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Descarte Certo",
    short_name: "Descarte Certo",
    description: "Saiba como e onde descartar cada resíduo na Grande Florianópolis.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfdfa",
    theme_color: "#2f7a4b",
    categories: ["education", "utilities"],
    icons: [
      { src: "/icones/normal-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/normal-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icones/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
