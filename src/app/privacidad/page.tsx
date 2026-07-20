import type { Metadata } from "next";
import { LegalShell, LegalHero, LegalCard, LegalSectionTitle, MONO } from "../_legal-chrome";

// Fuerza renderizado dinámico en cada request — evita que Vercel sirva un
// HTML estático cacheado en el edge que ignore el bypass público del proxy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Política de Privacidad — MyCouch",
  description:
    "Cómo MyCouch recopila, usa y protege tus datos personales, métricas físicas, fotos de progreso y registros de entrenamiento y nutrición.",
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

export default function PrivacidadPage() {
  return (
    <LegalShell>
      <LegalHero
        eyebrow="Documento legal"
        title="Política de Privacidad"
        subtitle="Este documento explica qué datos recopila MyCouch, para qué los usamos y cómo puedes controlarlos o eliminarlos."
        meta={`Última actualización: ${LAST_UPDATED}`}
      />

      <div className="max-w-3xl mx-auto px-5 pb-20 flex flex-col gap-6">
        <LegalCard>
          <LegalSectionTitle>1. Quiénes somos</LegalSectionTitle>
          <P>
            MyCouch es una plataforma de coaching y acompañamiento fitness que conecta a entrenadores
            (&quot;Coaches&quot;) con sus alumnos (&quot;Clientes&quot;) a través de una app móvil y un panel web. Esta
            política aplica a toda persona que use la app o el sitio de MyCouch, ya sea como Cliente, Coach
            o administrador.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>2. Datos que recopilamos</LegalSectionTitle>
          <P>Para poder ofrecerte un plan de entrenamiento y nutrición personalizado, recopilamos:</P>
          <ul className="list-disc pl-5 mb-4">
            <Li><strong className="text-white">Datos de cuenta:</strong> nombre, correo electrónico y contraseña (almacenada de forma cifrada).</Li>
            <Li><strong className="text-white">Métricas físicas:</strong> peso, altura, porcentaje de grasa corporal y medidas corporales (brazo, cintura, pecho, pierna) que tú o tu Coach registran periódicamente.</Li>
            <Li><strong className="text-white">Fotos de progreso:</strong> imágenes que subes voluntariamente para documentar tu evolución física. Solo son visibles para ti y tu Coach, nunca de forma pública.</Li>
            <Li><strong className="text-white">Registros de entrenamiento:</strong> rutinas asignadas, series, repeticiones, pesos usados, sesiones completadas y récords personales (PRs).</Li>
            <Li><strong className="text-white">Registros de nutrición:</strong> plan de dieta asignado, comidas marcadas como consumidas e ingesta de agua diaria.</Li>
            <Li><strong className="text-white">Contenido de Salas:</strong> mensajes, retos e imágenes que compartes dentro de las Salas grupales (comunidad) de la app.</Li>
            <Li><strong className="text-white">Datos de pago:</strong> tu estado de suscripción y facturación; el número de tarjeta nunca lo almacenamos nosotros — lo procesa directamente Stripe o el sistema de compras de Apple/Google.</Li>
            <Li><strong className="text-white">Datos técnicos:</strong> información básica de uso de la app con fines de estabilidad y soporte técnico.</Li>
          </ul>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>3. Cómo usamos tus datos</LegalSectionTitle>
          <P>Tu información se utiliza exclusivamente para:</P>
          <ul className="list-disc pl-5 mb-4">
            <Li>Personalizar tus rutinas, planes de dieta y objetivos dentro de MyCouch.</Li>
            <Li>Mostrarte a ti y a tu Coach tu progreso histórico (peso, medidas, fotos, PRs).</Li>
            <Li>Permitir la interacción dentro de las Salas y retos entre compañeros.</Li>
            <Li>Gestionar tu suscripción, facturación y estado de acceso a la plataforma.</Li>
            <Li>Brindarte soporte técnico cuando lo solicitas.</Li>
          </ul>
          <div
            className="rounded-xl px-4 py-3.5 mt-2"
            style={{ background: "rgba(204,255,0,0.06)", border: "1px solid rgba(204,255,0,0.2)" }}
          >
            <p className="text-[13px] leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              Tu información biométrica y de salud <strong>nunca se vende, renta ni comparte con terceros con fines
              publicitarios</strong>. Se usa única y exclusivamente para la personalización de tu experiencia dentro
              de MyCouch.
            </p>
          </div>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>4. Con quién compartimos información</LegalSectionTitle>
          <P>
            Tus métricas, rutinas y fotos de progreso son visibles para tu Coach asignado, ya que es quien diseña
            y ajusta tu plan. Dentro de las Salas, únicamente el nombre, avatar y actividad que tú decidas
            compartir son visibles para el resto de los miembros de esa Sala. Usamos proveedores externos
            estrictamente como procesadores técnicos de infraestructura — por ejemplo, Stripe para pagos y
            nuestro proveedor de base de datos y hosting — quienes están contractualmente obligados a proteger
            tu información y no pueden usarla con fines propios.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>5. Derechos ARCO y eliminación de cuenta</LegalSectionTitle>
          <P>
            Tienes derecho a Acceder, Rectificar, Cancelar y Oponerte (ARCO) al tratamiento de tus datos
            personales en cualquier momento. Puedes eliminar tu cuenta de dos formas:
          </P>
          <P>
            <strong className="text-white">Al instante, desde la app</strong> — entra a{" "}
            <strong className="text-white">Perfil → Configuración de Cuenta → Zona Peligrosa → &quot;Eliminar mi
            cuenta&quot;</strong>. Tras confirmar la acción, tu perfil, historial de peso y medidas, rutinas,
            dietas, fotos de progreso y mensajes de Salas se eliminan de forma permanente de nuestros servidores
            de inmediato, sin necesidad de esperar respuesta de soporte.
          </P>
          <P>Por correo, si prefieres que lo gestionemos nosotros:</P>
          <ol className="list-decimal pl-5 mb-4">
            <Li>Escribe a <strong className="text-white">{SUPPORT_EMAIL}</strong> desde el correo asociado a tu cuenta, indicando qué deseas hacer (acceder a tus datos, corregirlos, o eliminar tu cuenta por completo).</Li>
            <Li>Verificamos tu identidad para proteger tu cuenta de solicitudes fraudulentas.</Li>
            <Li>Si solicitas la eliminación de tu cuenta, borramos permanentemente tu perfil, historial de peso y medidas, rutinas, dietas, fotos de progreso y mensajes de Salas de nuestros servidores en un plazo máximo de 30 días naturales.</Li>
            <Li>Te confirmamos por correo electrónico una vez completado el borrado.</Li>
          </ol>
          <P>
            En ambos casos, cualquier suscripción activa se cancela como parte del proceso de eliminación.
            Algunos registros de facturación pueden conservarse por un periodo adicional cuando la ley fiscal
            aplicable así lo exige, aun después de eliminar tu cuenta.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>6. Seguridad</LegalSectionTitle>
          <P>
            Aplicamos cifrado en tránsito y en reposo, contraseñas con hash y controles de acceso por rol
            (Cliente, Coach, Administrador) para que cada usuario solo pueda ver la información que le
            corresponde. Ningún sistema es 100% infalible, por lo que te recomendamos usar una contraseña única
            y no compartir tus credenciales de acceso.
          </P>
        </LegalCard>

        <LegalCard>
          <LegalSectionTitle>7. Cambios a esta política</LegalSectionTitle>
          <P>
            Podemos actualizar esta Política de Privacidad para reflejar cambios en la app o en la normativa
            aplicable. Publicaremos siempre la fecha de la última actualización en la parte superior de esta
            página. El uso continuado de MyCouch tras una actualización implica la aceptación de los cambios.
          </P>
        </LegalCard>

        <p className="text-center text-[11px] pt-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
          ¿Dudas sobre tu privacidad? Escríbenos a {SUPPORT_EMAIL}
        </p>
      </div>
    </LegalShell>
  );
}
