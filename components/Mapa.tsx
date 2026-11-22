"use client";

import dynamic from "next/dynamic";
import type { PropsMapa } from "@/components/MapaLeaflet";

/** O Leaflet usa `window`, então o mapa só é carregado no navegador. */
export const Mapa = dynamic<PropsMapa>(() => import("@/components/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-[var(--radius-card)] border border-border bg-card">
      Carregando mapa…
    </div>
  ),
});
