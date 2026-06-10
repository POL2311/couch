/* ═══════════════════════════════════════════
   Cliente HTTP + manejo de sesión (token)
   El token se guarda cifrado con expo-secure-store.
   Centraliza fetch a la API de Next.js.
   ═══════════════════════════════════════════ */
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

const TOKEN_KEY = "mycoach_token";

let memoryToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

export async function setToken(token: string | null): Promise<void> {
  memoryToken = token;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Fetch tipado contra la API de Next.js, adjuntando el token si existe. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Evita la página de advertencia de ngrok: fuerza respuestas JSON directas.
    // Inofensivo cuando la API no está detrás de ngrok.
    "ngrok-skip-browser-warning": "true",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.error || body?.message || msg;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
