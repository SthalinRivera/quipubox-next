"use client";

import { ArrowRight } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black py-20 sm:py-28 dark:from-black dark:via-gray-950 dark:to-black">

      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 -z-10">
        {/* Brillo turquesa principal */}
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#17BEC0]/15 blur-3xl" />
        {/* Brillo turquesa secundario */}
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#17BEC0]/10 blur-3xl" />

        {/* Patrón de cuadrícula sutil empresarial */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Pequeña etiqueta superior */}
        <p className="mb-4 inline-block rounded-full border border-[#17BEC0]/30 bg-[#17BEC0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#17BEC0]">
          Empieza hoy
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Digitaliza tu operación logística hoy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          Únete a las empresas comercializadoras, distribuidoras y
          transportistas de frutas que ya confían en QuipuBox.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Botón principal en turquesa */}
          <a
            href="#contacto"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#17BEC0] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#17BEC0]/30 transition-all duration-300 hover:bg-[#13a3a5] hover:shadow-[#17BEC0]/50"
          >
            Solicitar demostración
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Botón secundario con hover turquesa */}
          <a
            href="mailto:hola@QuipuBox.com"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-base font-semibold text-gray-300 transition-all duration-300 hover:border-[#17BEC0] hover:text-white"
          >
            Hablar con ventas
          </a>
        </div>

        {/* Nota final con checks sutiles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17BEC0]" />
            Prueba gratis por 14 días
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17BEC0]" />
            Sin tarjeta de crédito
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17BEC0]" />
            Cancela cuando quieras
          </span>
        </div>
      </div>
    </section>
  );
}