/* ═══════════════════════════════════════════
   Carreras (módulo Strava) — capa de datos
   MODELO NUEVO. Hoy se guardan LOCALMENTE en el
   teléfono (AsyncStorage) porque seguimos en modo
   demo sin Supabase.

   ⭐ Cuando hagamos la Fase 0 (Supabase), SOLO se
   cambia este archivo: el bloque "api" usará la tabla
   "carreras" vía la API de Next.js. Las pantallas no
   cambian.
   ═══════════════════════════════════════════ */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IS_MOCK, API_URL } from "./config";
import { apiFetch, getToken } from "./client";
import type { Carrera, GpsPoint } from "./types";

const KEY = "mycoach_carreras";

/** Indica si las carreras se están guardando solo localmente (sin sincronizar). */
export const CARRERAS_SON_LOCALES = IS_MOCK;

async function readLocal(): Promise<Carrera[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Carrera[];
  } catch {
    return [];
  }
}

async function writeLocal(list: Carrera[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function getCarreras(): Promise<Carrera[]> {
  if (IS_MOCK) {
    const list = await readLocal();
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }
  // Fase 0: tabla "carreras" en Supabase vía API de Next.js
  return apiFetch<Carrera[]>("/api/carreras");
}

export async function getCarrera(id: string): Promise<Carrera | null> {
  if (IS_MOCK) {
    const list = await readLocal();
    return list.find((c) => c.id === id) ?? null;
  }
  return apiFetch<Carrera>(`/api/carreras/${id}`);
}

export async function saveCarrera(input: {
  userId: string;
  date: string;
  distanceM: number;
  durationS: number;
  avgSpeedKmh: number;
  track: GpsPoint[];
}): Promise<Carrera> {
  const carrera: Carrera = { id: `run-${Date.now()}`, ...input };
  if (IS_MOCK) {
    const list = await readLocal();
    list.push(carrera);
    await writeLocal(list);
    return carrera;
  }
  return apiFetch<Carrera>("/api/carreras", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Sube y guarda la foto de fondo de una carrera. Devuelve la URL pública. */
export async function uploadCarreraFoto(id: string, photoUri: string): Promise<string | null> {
  if (IS_MOCK) return photoUri; // en mock, usa el uri local
  const token = await getToken();
  const form = new FormData();
  form.append("photo", { uri: photoUri, name: "run.jpg", type: "image/jpeg" } as any);
  const res = await fetch(`${API_URL}/api/carreras/${id}`, {
    method: "PATCH",
    headers: { Authorization: token ? `Bearer ${token}` : "", "ngrok-skip-browser-warning": "true" },
    body: form,
  });
  if (!res.ok) throw new Error("No se pudo guardar la foto");
  const data = await res.json();
  return data?.photoUrl ?? null;
}

export async function deleteCarrera(id: string): Promise<void> {
  if (IS_MOCK) {
    const list = await readLocal();
    await writeLocal(list.filter((c) => c.id !== id));
    return;
  }
  await apiFetch<void>(`/api/carreras/${id}`, { method: "DELETE" });
}
