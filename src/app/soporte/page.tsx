import type { Metadata } from "next";
import { Mail, Clock, ShieldCheck } from "lucide-react";
import { LegalShell, LegalHero, LegalCard, LegalSectionTitle, DS, MONO, ACCENT } from "../_legal-chrome";
import { FaqAccordion, type FaqItem } from "./_faq-accordion";

// Fuerza renderizado dinámico en cada request — evita que Vercel sirva un
// HTML estático cacheado en el edge que ignore el bypass público del proxy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soporte — MyCouch",
  description:
    "Centro de ayuda de MyCouch: contacto directo, horario de atención y respuestas a las preguntas más frecuentes sobre cuentas, sincronización y suscripciones.",
};

const SUPPORT_EMAIL = "support@mycouch.app";

const FAQS: FaqItem[] = [
  {
    q: "¿Cómo vinculo mi cuenta con mi Coach?",
    a: "Tu Coach genera tus credenciales de acceso (correo y contraseña) desde su panel y te las comparte directamente. Al iniciar sesión con esos datos en la app, tu cuenta queda vinculada automáticamente a su catálogo de alumnos — no necesitas ingresar ningún código adicional. Si aún no tienes credenciales, solicítalas a tu Coach; nosotros no podemos crear el vínculo desde soporte.",
  },
  {
    q: "¿Qué hago si no se sincronizan mis entrenamientos o hidratación?",
    a: "Prueba en este orden:\n1. Verifica tu conexión a internet (Wi-Fi o datos móviles).\n2. Cierra la app por completo y vuelve a abrirla — esto fuerza una nueva sincronización con el servidor.\n3. Cierra sesión y vuelve a iniciar sesión.\n4. Confirma que tienes la última versión de la app instalada.\nSi el problema persiste después de estos pasos, escríbenos a soporte indicando tu correo de cuenta y la fecha del registro afectado; lo revisamos directamente en el servidor.",
  },
  {
    q: "¿Cómo cancelo o gestiono mi suscripción?",
    a: "Si te suscribiste desde la app de iOS o Android, la gestión y cancelación se hace desde la configuración de tu cuenta de Apple o Google (Ajustes → tu nombre → Suscripciones en iPhone; Google Play → Pagos y suscripciones en Android) — nosotros no podemos cancelarla por ti desde ahí. Si tu suscripción fue procesada vía Stripe (panel web de tu Coach), puedes cancelarla desde tu portal en la sección de cuenta, o escribiéndonos a soporte. En ambos casos conservas el acceso hasta el final del periodo ya pagado.",
  },
  {
    q: "¿Cómo elimino mi cuenta y datos personales?",
    a: "Tienes dos formas de hacerlo:\n\n• Al instante desde la app: entra a Perfil → ⚙️ Ajustes → Zona Peligrosa → \"Eliminar mi cuenta\". Confirmas la acción y tu cuenta, historial de peso, rutinas, dietas, fotos de progreso y mensajes de Salas se eliminan de nuestros servidores de inmediato — no requiere esperar respuesta de soporte.\n• Por correo: escribe a support@mycouch.app desde la dirección asociada a tu cuenta con el asunto \"Eliminar cuenta\" si prefieres que lo gestionemos nosotros; lo procesamos en un plazo máximo de 30 días y te confirmamos por correo cuando el borrado se completó.\nConsulta el detalle completo en nuestra Política de Privacidad.",
  },
];

export default function SoportePage() {
  return (
    <LegalShell>
      <LegalHero
        eyebrow="Centro de ayuda"
        title="Soporte"
        subtitle="Estamos aquí para resolver cualquier duda sobre tu cuenta, tus rutinas o tu suscripción."
      />

      <div className="max-w-3xl mx-auto px-5 pb-20 flex flex-col gap-8">
        {/* ── Contacto directo ── */}
        <LegalCard>
          <LegalSectionTitle>Contacto directo</LegalSectionTitle>
          <div className="grid sm:grid-cols-3 gap-5 mt-4">
            <div className="flex items-start gap-3">
              <Mail size={16} strokeWidth={2.5} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.4)" }}>
                  Correo oficial
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-[14px] font-bold break-all"
                  style={{ color: "#fff", fontFamily: DS, fontStyle: "normal" }}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} strokeWidth={2.5} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.4)" }}>
                  Horario de atención
                </p>
                <p className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: DS, fontStyle: "normal" }}>
                  Lun–Vie · 9:00–18:00 (GMT-6)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} strokeWidth={2.5} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.4)" }}>
                  Tiempo de respuesta
                </p>
                <p className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: DS, fontStyle: "normal" }}>
                  Menos de 24 horas
                </p>
              </div>
            </div>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Reporte MyCouch")}`}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl font-black uppercase cursor-pointer active:scale-95 transition-transform"
            style={{ fontFamily: DS, fontStyle: "italic", letterSpacing: "0.08em", fontSize: 14, background: ACCENT, color: "#000" }}
          >
            <Mail size={15} strokeWidth={2.5} /> Escribir a soporte
          </a>
        </LegalCard>

        {/* ── FAQ ── */}
        <div>
          <LegalSectionTitle>Preguntas frecuentes</LegalSectionTitle>
          <div className="mt-4">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </div>
    </LegalShell>
  );
}
