import React from 'react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-wider text-white">
            My<span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Couch</span>
          </span>
          <a href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Volver al inicio
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 flex-grow w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Centro de <span className="text-emerald-400">Soporte</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Estamos aquí para ayudarte a optimizar la gestión de tus asesorías y resolver cualquier duda con MyCouch.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-2">Contacto Directo</h3>
            <p className="text-neutral-400 text-sm mb-4">
              ¿Tienes algún problema técnico o duda comercial? Escríbenos directamente por correo.
            </p>
            <a 
              href="mailto:support@mycouch.app" 
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1 transition-colors"
            >
              support@mycouch.app →
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-2">Reportar un Error</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Si encontraste un bug en la app o en la plataforma web, nuestro equipo de QA lo revisará de inmediato.
            </p>
            <a 
              href="mailto:support@mycouch.app" 
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1 transition-colors"
            >
              Reportar Bug →
            </a>
          </div>
        </div>

        {/* FAQs breves */}
        <div className="border-t border-neutral-900 pt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-medium mb-1">¿Cómo recupero mi contraseña de Coach?</h4>
              <p className="text-neutral-400 text-sm">
                En la pantalla de inicio de sesión de la app móvil, presiona en "¿Olvidaste tu contraseña?" y recibirás un código de verificación por correo electrónico.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">¿Mis alumnos necesitan pagar por la app?</h4>
              <p className="text-neutral-400 text-sm">
                No, tus alumnos pueden descargar la app y acceder a sus rutinas y planes completamente gratis utilizando las credenciales de acceso que tú les generes desde tu catálogo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-6 text-center text-xs text-neutral-600">
        <p>&copy; {new Date().getFullYear()} MyCouch. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}