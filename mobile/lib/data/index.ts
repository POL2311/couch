/* ═══════════════════════════════════════════
   ⭐ CAPA DE DATOS CENTRALIZADA ⭐
   Único punto de acceso a datos de toda la app.

   Si en el futuro cambiamos de backend (Supabase
   directo, otra API, etc.), SOLO se toca esta carpeta
   (lib/data). Las pantallas nunca llaman fetch directo:
   siempre usan estas funciones.

   Hoy soporta 2 modos (config.ts → EXPO_PUBLIC_DATA_SOURCE):
     · "mock" → datos locales de ejemplo (sin backend)
     · "api"  → API REST de Next.js (token Bearer)
   ═══════════════════════════════════════════ */
import { IS_MOCK, API_URL } from "./config";
import { apiFetch, setToken, getToken } from "./client";
import { MOCK_USERS, MOCK_STUDENTS, mockDetailFor, MOCK_TEMPLATES } from "./mock";
import type { AuthUser, Student, StudentDetail, Template, FeedItem, CoachRow, AdminOverview, Carrera, Stage, Ejercicio, SetEntry, ExerciseLog } from "./types";

export * from "./types";
export { DATA_SOURCE, IS_MOCK, API_URL } from "./config";
export { getToken } from "./client";
export {
  getCarreras,
  getCarrera,
  saveCarrera,
  uploadCarreraFoto,
  deleteCarrera,
  CARRERAS_SON_LOCALES,
} from "./carreras";

/* ── Autenticación ── */
export async function login(email: string, password: string): Promise<AuthUser> {
  if (IS_MOCK) {
    const found = MOCK_USERS[email.trim().toLowerCase()];
    if (!found || found.password !== password) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    await setToken(`mock-token-${found.user.id}`);
    return found.user;
  }
  // API real: endpoint móvil de Next.js que devuelve { token, user }
  // (se añade en la web durante la Fase 2 de auth).
  const res = await apiFetch<{ token: string; user: AuthUser }>("/api/mobile/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(res.token);
  return res.user;
}

export async function logout(): Promise<void> {
  await setToken(null);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (IS_MOCK) return null; // en mock el estado lo lleva el store en memoria
  try {
    return await apiFetch<AuthUser>("/api/me");
  } catch {
    return null;
  }
}

/* ── Alumnos (vista Coach) ── */
export async function getStudents(): Promise<Student[]> {
  if (IS_MOCK) return MOCK_STUDENTS;
  return apiFetch<Student[]>("/api/students");
}

export async function getStudentDetail(id: string): Promise<StudentDetail | null> {
  if (IS_MOCK) return mockDetailFor(id);
  // El endpoint devuelve { student, detail } → extraemos el detail.
  const res = await apiFetch<{ student: Student; detail: StudentDetail }>(`/api/students/${id}`);
  return res?.detail ?? null;
}

/** Ficha completa de un alumno (base + detalle) — usada por coach y admin. */
export async function getStudentFull(id: string): Promise<{ student: Student; detail: StudentDetail } | null> {
  if (IS_MOCK) {
    const student = MOCK_STUDENTS.find((s) => s.id === id) ?? null;
    const detail = mockDetailFor(id);
    if (!student || !detail) return null;
    return { student, detail };
  }
  return apiFetch<{ student: Student; detail: StudentDetail }>(`/api/students/${id}`);
}

/** MD-Route: carreras de un alumno concreto (para coach/admin). */
export async function getStudentCarreras(studentId: string): Promise<Carrera[]> {
  if (IS_MOCK) return [];
  return apiFetch<Carrera[]>(`/api/students/${studentId}/carreras`);
}

/* ── Plantillas (vista Coach) ── */
export async function getTemplates(): Promise<Template[]> {
  if (IS_MOCK) return MOCK_TEMPLATES;
  return apiFetch<Template[]>("/api/templates");
}

/* ── Feed de actividad — derivado de los alumnos (igual que la web) ── */
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

/* ── Portal del alumno: ficha + detalle del alumno autenticado ──
   En la web el cliente obtiene sus datos por /api/me (no por /api/students). */
export async function getMe(studentId: string): Promise<{ student: Student; detail: StudentDetail } | null> {
  if (IS_MOCK) {
    const student = MOCK_STUDENTS.find((s) => s.id === studentId) ?? null;
    const detail = mockDetailFor(studentId);
    if (!student || !detail) return null;
    return { student, detail };
  }
  return apiFetch<{ student: Student; detail: StudentDetail }>("/api/me");
}

/* ── Alumno: registrar progreso (peso + foto opcional) → POST /api/me ── */
export async function registrarProgreso(input: { weight?: number; photoUri?: string }): Promise<void> {
  if (IS_MOCK) {
    // En mock mutamos el alumno en memoria para ver el cambio durante la sesión.
    const s = MOCK_STUDENTS.find((x) => x.id === "s1");
    if (s && input.weight != null) {
      s.previousWeight = s.currentWeight;
      s.currentWeight = input.weight;
      s.lastWeighIn = new Date().toISOString().split("T")[0];
    }
    return;
  }
  const token = await getToken();
  const form = new FormData();
  if (input.weight != null) form.append("weight", String(input.weight));
  if (input.photoUri) {
    form.append("photo", { uri: input.photoUri, name: "progress.jpg", type: "image/jpeg" } as any);
  }
  const res = await fetch(`${API_URL}/api/me`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "ngrok-skip-browser-warning": "true",
      // Sin Content-Type: fetch añade el boundary multipart automáticamente.
    },
    body: form,
  });
  if (!res.ok) {
    let msg = "No se pudo guardar el progreso";
    try {
      const b = await res.json();
      msg = b?.error || msg;
    } catch {}
    throw new Error(msg);
  }
}

/* ═══════════════════════════════════════════
   Gestión del Coach (escrituras)
   ═══════════════════════════════════════════ */

export interface NewStudentInput {
  name: string;
  email: string;
  stage: Stage;
  stageNumber: number;
  startingWeight: number;
  height?: number;
  bodyFat?: number;
}

/** Crear alumno → POST /api/students. */
export async function addStudent(input: NewStudentInput): Promise<void> {
  if (IS_MOCK) {
    MOCK_STUDENTS.unshift({
      id: `s-${Date.now()}`,
      name: input.name,
      email: input.email,
      avatarInitials: input.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
      avatarColor: "#3b82f6",
      currentWeight: input.startingWeight,
      previousWeight: input.startingWeight,
      lastWeighIn: new Date().toISOString().split("T")[0],
      stage: input.stage,
      stageNumber: input.stageNumber,
      paymentStatus: "inactive",
      joinedDate: new Date().toISOString().split("T")[0],
      streak: 0,
      completionRate: 100,
    });
    return;
  }
  await apiFetch<unknown>("/api/students", { method: "POST", body: JSON.stringify(input) });
}

/** Editar alumno (campos base y/o detalle) → PUT /api/students/[id]. */
export async function updateStudentData(
  id: string,
  studentUpdates: Partial<Student>,
  detailUpdates: Partial<StudentDetail> = {}
): Promise<void> {
  if (IS_MOCK) {
    const s = MOCK_STUDENTS.find((x) => x.id === id);
    if (s) Object.assign(s, studentUpdates);
    return;
  }
  await apiFetch<unknown>(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify({ studentUpdates, detailUpdates }),
  });
}

/** Cambio de etapa / asignar dieta-rutina desde plantilla → POST /api/students/change-stage. */
export async function applyStageChange(input: {
  studentIds: string[];
  stage: Stage;
  stageNumber: number;
  dietTemplateId?: string;
  routineTemplateId?: string;
  executionDate?: string;
}): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<unknown>("/api/students/change-stage", { method: "POST", body: JSON.stringify(input) });
}

/* ── Registro de ejecución del alumno (Etapa 4) ── */
export async function registrarSesion(data: {
  date?: string; ejercicioId?: string | null; exerciseName: string; muscleGroup?: string | null;
  bodyweight?: boolean; prescribedSets?: number; prescribedReps?: string; prescribedWeight?: string | null;
  sets: SetEntry[]; completed?: boolean;
}): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<unknown>("/api/me/logs", { method: "POST", body: JSON.stringify(data) });
}

/** Historial de entrenamiento de un alumno (coach/admin/dueño). */
export async function getStudentLogs(studentId: string): Promise<ExerciseLog[]> {
  if (IS_MOCK) return [];
  return apiFetch<ExerciseLog[]>(`/api/students/${studentId}/logs`);
}

/** Cumplimiento (checks de dieta/entreno) de un alumno (coach/admin/dueño). */
export async function getStudentChecks(studentId: string): Promise<{ date: string; kind: string; itemKey: string }[]> {
  if (IS_MOCK) return [];
  return apiFetch<{ date: string; kind: string; itemKey: string }[]>(`/api/students/${studentId}/checks`);
}

/* ── Catálogo de ejercicios recurrentes (CRUD) ── */
export async function getEjercicios(): Promise<Ejercicio[]> {
  if (IS_MOCK) return [];
  return apiFetch<Ejercicio[]>("/api/ejercicios");
}
export async function createEjercicio(data: { name: string; muscleGroup: string; equipment: string; bodyweight: boolean }): Promise<Ejercicio> {
  return apiFetch<Ejercicio>("/api/ejercicios", { method: "POST", body: JSON.stringify(data) });
}
export async function updateEjercicioData(id: string, data: { name: string; muscleGroup: string; equipment: string; bodyweight: boolean }): Promise<void> {
  await apiFetch<unknown>(`/api/ejercicios/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteEjercicio(id: string): Promise<void> {
  await apiFetch<unknown>(`/api/ejercicios/${id}`, { method: "DELETE" });
}

/* ── Plantillas (CRUD) ── */
export async function createTemplate(type: "diet" | "routine", name: string, data: any): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<unknown>("/api/templates", { method: "POST", body: JSON.stringify({ type, name, ...data }) });
}
export async function updateTemplateData(id: string, name: string, data: any): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<unknown>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify({ name, ...data }) });
}
export async function deleteTemplate(id: string): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<unknown>(`/api/templates/${id}`, { method: "DELETE" });
}

/* ── Cumplimiento diario (checks de dieta/rutina del alumno) ── */
export async function getChecks(date: string): Promise<string[]> {
  if (IS_MOCK) return [];
  const res = await apiFetch<{ date: string; checks: string[] }>(`/api/me/checks?date=${date}`);
  return res.checks;
}

export async function toggleCheck(
  date: string,
  kind: "meal" | "exercise",
  itemKey: string,
  done: boolean
): Promise<void> {
  if (IS_MOCK) return;
  await apiFetch<void>("/api/me/checks", {
    method: "POST",
    body: JSON.stringify({ date, kind, itemKey, done }),
  });
}

/* ── Admin (panel global): coaches → alumnos de cada coach ── */
export async function getCoaches(): Promise<CoachRow[]> {
  if (IS_MOCK) {
    const active = MOCK_STUDENTS.filter((s) => s.paymentStatus === "active").length;
    return [
      { id: "c1", name: "Coach Demo", email: "coach@mycoach.app", studentCount: MOCK_STUDENTS.length, activeCount: active, mrr: active * 1200 },
    ];
  }
  const data = await apiFetch<AdminOverview>("/api/admin/overview");
  return data.coaches;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (IS_MOCK) {
    const coaches = await getCoaches();
    const active = MOCK_STUDENTS.filter((s) => s.paymentStatus === "active").length;
    return {
      metrics: { totalCoaches: coaches.length, totalStudents: MOCK_STUDENTS.length, totalClients: 1, activeStudents: active, mrr: active * 1200 },
      coaches,
    };
  }
  return apiFetch<AdminOverview>("/api/admin/overview");
}

export async function getCoachStudents(
  coachId: string
): Promise<{ coach: { id: string; name: string; email: string }; students: Student[] }> {
  if (IS_MOCK) {
    return { coach: { id: coachId, name: "Coach Demo", email: "coach@mycoach.app" }, students: MOCK_STUDENTS };
  }
  return apiFetch<{ coach: { id: string; name: string; email: string }; students: Student[] }>(
    `/api/admin/coaches/${coachId}/students`
  );
}

/* El admin crea una nueva cuenta de coach (paridad con la web). */
export async function addCoach(input: { name: string; email: string; password: string }): Promise<{ id: string; name: string; email: string }> {
  if (IS_MOCK) {
    return { id: `c${Date.now()}`, name: input.name, email: input.email };
  }
  return apiFetch<{ id: string; name: string; email: string }>("/api/admin/coaches", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
