/* ═══════════════════════════════════════════
   Hook de grabación de carrera con GPS (expo-location).
   Acumula puntos, calcula distancia/duración/velocidad
   en vivo. Foreground (funciona en Expo Go); el modo
   en segundo plano requiere development build.
   ═══════════════════════════════════════════ */
import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import type { GpsPoint } from "@/lib/data";
import { haversineM, avgSpeedKmh } from "@/lib/geo";

export type RunStatus = "idle" | "requesting" | "denied" | "running" | "paused" | "finished";

export function useRunTracker() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [track, setTrack] = useState<GpsPoint[]>([]);
  const [distanceM, setDistanceM] = useState(0);
  const [durationS, setDurationS] = useState(0);

  const subRef = useRef<Location.LocationSubscription | null>(null);
  const startedAtRef = useRef<number>(0);
  const elapsedBaseRef = useRef<number>(0); // segundos acumulados antes de pausas
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef = useRef<GpsPoint | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    stopTimer();
    timerRef.current = setInterval(() => {
      const liveS = (Date.now() - startedAtRef.current) / 1000;
      setDurationS(elapsedBaseRef.current + liveS);
    }, 1000);
  }, []);

  const start = useCallback(async () => {
    setStatus("requesting");
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") {
      setStatus("denied");
      return;
    }
    // Reset
    setTrack([]);
    setDistanceM(0);
    setDurationS(0);
    elapsedBaseRef.current = 0;
    lastPointRef.current = null;

    startTimer();
    setStatus("running");

    subRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 4 },
      (loc) => {
        const p: GpsPoint = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          t: Date.now(),
        };
        const prev = lastPointRef.current;
        if (prev) {
          const step = haversineM(prev, p);
          // Filtra saltos absurdos del GPS (>50 m en 1 lectura)
          if (step < 50) setDistanceM((d) => d + step);
        }
        lastPointRef.current = p;
        setTrack((t) => [...t, p]);
      }
    );
  }, [startTimer]);

  const pause = useCallback(() => {
    if (subRef.current) {
      subRef.current.remove();
      subRef.current = null;
    }
    const liveS = (Date.now() - startedAtRef.current) / 1000;
    elapsedBaseRef.current += liveS;
    stopTimer();
    setStatus("paused");
  }, []);

  const resume = useCallback(async () => {
    startTimer();
    setStatus("running");
    subRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 4 },
      (loc) => {
        const p: GpsPoint = { lat: loc.coords.latitude, lng: loc.coords.longitude, t: Date.now() };
        const prev = lastPointRef.current;
        if (prev) {
          const step = haversineM(prev, p);
          if (step < 50) setDistanceM((d) => d + step);
        }
        lastPointRef.current = p;
        setTrack((t) => [...t, p]);
      }
    );
  }, [startTimer]);

  const finish = useCallback(() => {
    if (subRef.current) {
      subRef.current.remove();
      subRef.current = null;
    }
    stopTimer();
    setStatus("finished");
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (subRef.current) subRef.current.remove();
      stopTimer();
    };
  }, []);

  const speed = avgSpeedKmh(distanceM, durationS);

  return { status, track, distanceM, durationS, speed, start, pause, resume, finish };
}
