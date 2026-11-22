"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CENTRO_FLORIANOPOLIS, type Coordenadas } from "@/lib/pontos";

export type Marcador = Coordenadas & { id: string; titulo: string; conteudo?: ReactNode };

export type PropsMapa = {
  marcadores?: Marcador[];
  /** Pino arrastável usado no formulário de sugestão (toque no mapa também move o pino). */
  pino?: { posicao: Coordenadas | null; aoMudar: (c: Coordenadas) => void };
  /** Centraliza o mapa nesta posição quando ela muda. */
  foco?: Coordenadas | null;
  /** Posição do usuário (só exibida no mapa, nunca enviada). */
  voce?: Coordenadas | null;
  /** Recebe o mapa pronto, para ações como "marcar no centro do mapa". */
  aoPronto?: (mapa: L.Map) => void;
  altura?: string;
  rotulo: string;
};

// O ícone padrão do Leaflet quebra com bundlers; usamos um ícone em HTML.
const iconePonto = L.divIcon({
  className: "",
  html: '<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2f7a4b;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font-size:18px">♻</span></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

const iconePino = L.divIcon({
  className: "",
  html: '<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#b42318;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const iconeVoce = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#1d6fd8;border:3px solid #fff;box-shadow:0 0 0 4px rgba(29,111,216,.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Pronto({ aoPronto }: { aoPronto?: (mapa: L.Map) => void }) {
  const mapa = useMap();
  useEffect(() => {
    aoPronto?.(mapa);
  }, [mapa, aoPronto]);
  return null;
}

function CliqueNoMapa({ aoClicar }: { aoClicar: (c: Coordenadas) => void }) {
  useMapEvents({ click: (e) => aoClicar({ latitude: e.latlng.lat, longitude: e.latlng.lng }) });
  return null;
}

function Centralizar({ foco }: { foco: Coordenadas | null | undefined }) {
  const mapa = useMap();
  useEffect(() => {
    if (foco) mapa.flyTo([foco.latitude, foco.longitude], Math.max(mapa.getZoom(), 15), { duration: 0.6 });
  }, [foco, mapa]);
  return null;
}

/** Ajusta o enquadramento para mostrar todos os marcadores sempre que o conjunto muda. */
function Enquadrar({ marcadores }: { marcadores: Marcador[] }) {
  const mapa = useMap();
  const chave = marcadores.map((m) => m.id).join(",");
  useEffect(() => {
    if (marcadores.length > 1) {
      mapa.fitBounds(L.latLngBounds(marcadores.map((m) => [m.latitude, m.longitude])), { padding: [40, 40] });
    } else if (marcadores.length === 1) {
      mapa.setView([marcadores[0].latitude, marcadores[0].longitude], 14);
    }
    // Reenquadra só quando o conjunto de pontos muda (não a cada renderização).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, mapa]);
  return null;
}

export default function MapaLeaflet({ marcadores = [], pino, foco, voce, aoPronto, altura = "28rem", rotulo }: PropsMapa) {
  const centro = pino?.posicao ?? CENTRO_FLORIANOPOLIS;
  return (
    <div role="region" aria-label={rotulo} className="isolate overflow-hidden rounded-[var(--radius-card)] border border-border">
      <MapContainer
        center={[centro.latitude, centro.longitude]}
        zoom={pino?.posicao ? 16 : 11}
        scrollWheelZoom={false}
        style={{ height: altura, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {marcadores.length > 0 && !pino && <Enquadrar marcadores={marcadores} />}
        <Centralizar foco={foco} />
        <Pronto aoPronto={aoPronto} />
        {voce && <Marker position={[voce.latitude, voce.longitude]} icon={iconeVoce} title="Você está aqui" alt="Você está aqui" />}
        {marcadores.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={iconePonto} title={m.titulo} alt={m.titulo}>
            <Popup>
              <strong>{m.titulo}</strong>
              {m.conteudo}
            </Popup>
          </Marker>
        ))}
        {pino && (
          <>
            <CliqueNoMapa aoClicar={pino.aoMudar} />
            {pino.posicao && (
              <Marker
                position={[pino.posicao.latitude, pino.posicao.longitude]}
                icon={iconePino}
                draggable
                title="Local do ponto (arraste para ajustar)"
                alt="Local do ponto"
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = (e.target as L.Marker).getLatLng();
                    pino.aoMudar({ latitude: lat, longitude: lng });
                  },
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
