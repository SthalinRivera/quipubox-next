"use client";

import { ArrowRight } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-28 dark:bg-gray-950">
      {/* Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Transforma tu distribución hoy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          Únete a las empresas de frutas que ya confían en QuiPuBox para
          gestionar su operación logística.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400"
          >
            Solicitar demostración
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="mailto:hola@quipubox.com"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-base font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            Hablar con ventas
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Prueba gratis por 14 días · Sin tarjeta de crédito · Cancela cuando
          quieras
        </p>
      </div>
    </section>
  );
}
