/* ═══════════════════════════════════════════
   Hook: datos del alumno autenticado (portal).
   Usa getMe() de la capa de datos centralizada:
   en mock devuelve datos de ejemplo; en api llama /api/me.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useCallback } from "react";
import { getMe, type Student, type StudentDetail } from "@/lib/data";
import { useSession } from "@/lib/session";

export function useMe() {
  const { user } = useSession();
  const studentId = user?.studentId ?? "s1"; // fallback demo (cliente = s1)
  const [student, setStudent] = useState<Student | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe(studentId);
      setStudent(res?.student ?? null);
      setDetail(res?.detail ?? null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    let alive = true;
    getMe(studentId)
      .then((res) => {
        if (!alive) return;
        setStudent(res?.student ?? null);
        setDetail(res?.detail ?? null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [studentId]);

  return { student, detail, loading, studentId, reload: load };
}
