/* ═══════════════════════════════════════════
   Utilidades de geolocalización y silueta
   ═══════════════════════════════════════════ */
import type { GpsPoint } from "@/lib/data";

/** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
export function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000; // radio de la Tierra en metros
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Distancia total recorrida (suma de tramos) en metros. */
export function totalDistanceM(track: GpsPoint[]): number {
  let d = 0;
  for (let i = 1; i < track.length; i++) d += haversineM(track[i - 1], track[i]);
  return d;
}

/** Formatea metros → "1.24 km" o "840 m". */
export function fmtDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

/** Formatea segundos → "MM:SS" o "H:MM:SS". */
export function fmtDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Velocidad promedio en km/h dado metros y segundos. */
export function avgSpeedKmh(distanceM: number, durationS: number): number {
  if (durationS <= 0) return 0;
  return Math.round((distanceM / durationS) * 3.6 * 10) / 10;
}

/** Ritmo en min/km → "5:30 /km". */
export function fmtPace(distanceM: number, durationS: number): string {
  if (distanceM < 1) return "—";
  const paceSecPerKm = durationS / (distanceM / 1000);
  const m = Math.floor(paceSecPerKm / 60);
  const s = Math.floor(paceSecPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/**
 * Proyecta los puntos GPS a coordenadas de pantalla para dibujar la SILUETA
 * del recorrido (estilo Strava, sin mapa). Normaliza a un lienzo width×height
 * manteniendo la proporción y centrando.
 */
export function projectTrack(
  track: GpsPoint[],
  width: number,
  height: number,
  padding = 16
): { x: number; y: number }[] {
  if (track.length === 0) return [];
  const lats = track.map((p) => p.lat);
  const lngs = track.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  // Corrige la distorsión de longitud según la latitud media.
  const meanLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = (maxLng - minLng) * Math.cos(meanLat) || 1e-6;

  const w = width - padding * 2;
  const h = height - padding * 2;
  const scale = Math.min(w / spanLng, h / spanLat);

  // Centrado
  const offsetX = padding + (w - spanLng * scale) / 2;
  const offsetY = padding + (h - spanLat * scale) / 2;

  return track.map((p) => {
    const x = offsetX + ((p.lng - minLng) * Math.cos(meanLat)) * scale;
    // y invertida: latitud mayor = arriba
    const y = offsetY + (maxLat - p.lat) * scale;
    return { x, y };
  });
}
