import { type Student } from "./mock-data";

/* Feed de actividad derivado de la MISMA fuente (alumnos fetchados).
   Sin nuevas llamadas API: deriva ítems de campos reales (pesajes, altas). */

export type FeedItem = {
  key: string;
  type: "weigh" | "join";
  title: string;
  desc: string;
  date: string;
  delta?: number;
};

export function buildFeedItems(students: Student[]): FeedItem[] {
  const items: FeedItem[] = [];
  for (const s of students) {
    items.push({
      key: `w-${s.id}`,
      type: "weigh",
      title: "Pesaje reportado",
      desc: `${s.name} reportó ${s.currentWeight} kg.`,
      date: s.lastWeighIn,
      delta: Math.round((s.currentWeight - s.previousWeight) * 10) / 10,
    });
    items.push({
      key: `j-${s.id}`,
      type: "join",
      title: "Nuevo alumno",
      desc: `${s.name} se unió en etapa de ${s.stage}.`,
      date: s.joinedDate,
    });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
