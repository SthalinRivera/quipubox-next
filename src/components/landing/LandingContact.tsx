"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function LandingContact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contacto" className="bg-gray-50 py-20 sm:py-28 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
                Contacto
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Solicita una demostración
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Cuéntanos sobre tu empresa y te mostraremos cómo QuiPuBox puede
                transformar tu operación de distribución de frutas.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Demo personalizada de 30 minutos",
                  "Configuración con tus datos reales",
                  "Sin compromiso de contratación",
                  "Soporte de implementación incluido",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ¿Prefieres hablar directamente?
                </p>
                <a
                  href="mailto:hola@quipubox.com"
                  className="mt-1 text-sm font-semibold text-brand-500 hover:text-brand-600"
                >
                  hola@quipubox.com
                </a>
              </div>
            </div>

            {/* Right - Form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-950 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
                    <CheckCircle2 className="h-8 w-8 text-success-500" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                    ¡Mensaje enviado!
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Nos pondremos en contacto contigo en las próximas 24 horas.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Empresa
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                      placeholder="correo@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ¿Cuántas entregas realizas al día?
                    </label>
                    <select className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <option>Menos de 50</option>
                      <option>50 - 100</option>
                      <option>100 - 300</option>
                      <option>Más de 300</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cuéntanos sobre tu operación
                    </label>
                    <textarea
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                      placeholder="Describe brevemente tu empresa y necesidades..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
                  >
                    <Send className="h-4 w-4" />
                    Enviar solicitud
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
