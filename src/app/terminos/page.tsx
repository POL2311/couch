import type { Metadata } from "next";
import { LegalShell, LegalHero, LegalCard, LegalSectionTitle, MONO } from "../_legal-chrome";

export const metadata: Metadata = {
  title: "Términos y Condiciones — MyCouch",
  description:
    "Términos y condiciones de uso de MyCouch: descargo médico, normas de comunidad en Salas, y política de pagos, suscripciones y cancelación.",
};

const LAST_UPDATED = "20 de julio de 2026";
const SUPPORT_EMAIL = "support@mycouch.app";

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] leading-relaxed mb-4 last:mb-0" style={{ color: "rgba(255,255,255,0.6)" }}>
      {children}
    </p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-[14px] leading-relaxed mb-2 pl-1" style={{ color: "rgba(255,255,255,0.6)" }}>
      {children}
    </li>
  );
}

export default function TerminosPage() {
  return (
    <LegalShell>
      <LegalHero
        eyebrow="Documento legal"
        title="Términos y Condiciones"
        subtitle="Al crear una cuenta o usar MyCouch, aceptas los siguientes términos de servicio."
        meta={`Última actualización: ${LAST_UPDATED}`}
      />

      <div className="max-w-3xl mx-auto px-5 pb-20 flex flex-col gap-6">
        {/* ── Medical disclaimer — highlighted, first section ── */}
        <LegalCard accent>
          <LegalSectionTitle>1. Descargo de responsabilidad médica</LegalSectionTitle>
          <P>
            MyCouch es una herramienta de organización y seguimiento de entrenamiento y nutrición. <strong
            className="text-white">No es un servicio médico, no sustituye el diagnóstico, tratamiento ni
            asesoramiento de un profesional de la salud</strong>, y no debe usarse como tal. Las rutinas, planes
            de dieta y recomendaciones que ves en la app son elaboradas por tu Coach y deben interpretarse como
            orientación general de acondicionamiento físico.
          </P>
          <P>
            Consulta a tu médico antes de iniciar cualquier programa de ejercicio o cambio nutricional,
            especialmente si tienes una condición preexistente, estás embarazada o tomas medicamentos. El uso de
            la app y de cualquier plan proporcionado por tu Coach es bajo tu propio riesgo. MyCouch y sus Coaches
            no son responsables por lesiones, complicaciones de salud o resultados derivados del uso de la
            plataforma.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>2. Tu cuenta</LegalSectionTitle>
          <P>
            Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad
            que ocurra en tu cuenta. Debes proporcionar información veraz al registrarte. Nos reservamos el
            derecho de suspender cuentas con información falsa o actividad fraudulenta.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>3. Uso de la comunidad y Salas</LegalSectionTitle>
          <P>
            Las Salas permiten a los usuarios interactuar, compartir progreso y participar en retos con otros
            miembros. Al usar esta función, aceptas:
          </P>
          <ul className="list-disc pl-5 mb-4">
            <Li>Tratar a los demás miembros con respeto — no se permite acoso, discurso de odio, contenido sexual, violento u ofensivo de ningún tipo.</Li>
            <Li>No compartir contenido que infrinja derechos de autor, datos personales de terceros, ni spam o publicidad no solicitada.</Li>
            <Li>No usar las Salas para promover productos, servicios o programas de entrenamiento ajenos a MyCouch sin autorización.</Li>
            <Li>No suplantar la identidad de otro usuario, Coach o del equipo de MyCouch.</Li>
          </ul>
          <P>
            Nos reservamos el derecho de eliminar contenido y de <strong className="text-white">suspender o
            cancelar de forma permanente cualquier cuenta</strong> que incumpla estas normas, sin previo aviso y a
            nuestra entera discreción, cuando exista uso indebido de la plataforma o de las Salas.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>4. Pagos y suscripciones</LegalSectionTitle>
          <P>
            El acceso a MyCouch puede requerir una suscripción activa, ya sea contratada directamente con tu
            Coach o a través de la app. Dependiendo de cómo te suscribas, el cobro se procesa por uno de estos
            medios:
          </P>
          <ul className="list-disc pl-5 mb-4">
            <Li><strong className="text-white">Stripe:</strong> para suscripciones gestionadas desde el panel web de tu Coach, procesadas de forma segura por Stripe. Nunca almacenamos los datos completos de tu tarjeta.</Li>
            <Li><strong className="text-white">Compras dentro de la app (In-App Purchase):</strong> cuando corresponda, las suscripciones contratadas desde la app de iOS o Android se procesan a través del sistema de facturación de Apple (App Store) o Google (Google Play), y se rigen adicionalmente por los términos de esas plataformas.</Li>
          </ul>
          <P>
            <strong className="text-white">Renovación automática:</strong> las suscripciones se renuevan
            automáticamente al final de cada periodo (mensual o el que corresponda), salvo que se cancelen antes
            de la fecha de renovación. El cobro se realiza sobre el método de pago registrado en Stripe, o
            mediante tu cuenta de Apple/Google, según el canal de suscripción.
          </P>
          <P>
            <strong className="text-white">Cancelación:</strong> puedes cancelar en cualquier momento. Si te
            suscribiste vía Apple o Google, la cancelación se gestiona desde la configuración de suscripciones de
            tu cuenta de Apple/Google. Si te suscribiste vía Stripe, puedes cancelarla desde tu portal de cuenta
            o escribiendo a {SUPPORT_EMAIL}. En ambos casos conservas el acceso hasta el final del periodo ya
            pagado; no se realizan reembolsos parciales por periodos ya iniciados, salvo que la ley aplicable
            indique lo contrario.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>5. Propiedad intelectual</LegalSectionTitle>
          <P>
            El software, diseño, marca y contenido propio de MyCouch son propiedad de sus creadores. Las
            rutinas, planes de dieta y contenido subido por tu Coach son propiedad de dicho Coach; el contenido
            que tú subas (fotos de progreso, mensajes) sigue siendo tuyo, pero nos otorgas una licencia limitada
            para almacenarlo y mostrarlo dentro de la app con el único fin de prestarte el servicio.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>6. Cambios a estos términos</LegalSectionTitle>
          <P>
            Podemos actualizar estos Términos y Condiciones periódicamente. Publicaremos la fecha de la última
            actualización en la parte superior de esta página. Continuar usando MyCouch después de un cambio
            implica que lo aceptas.
          </P>
        </LegalCard>

        <p className="text-center text-[11px] pt-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
          ¿Dudas sobre estos términos? Escríbenos a {SUPPORT_EMAIL}
        </p>
      </div>
    </LegalShell>
  );
}
