"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white pt-24 pb-16 sm:pt-32 sm:pb-24 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10">
        {/* Cambiado a tu turquesa (#17BEC0) */}
        <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#17BEC0]/20 blur-3xl dark:bg-[#17BEC0]/10" />
        {/* Eliminado el color ámbar */}
        <div className="absolute top-32 right-0 h-[300px] w-[300px] rounded-full bg-[#17BEC0]/10 blur-3xl dark:bg-[#17BEC0]/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#17BEC0]/40 bg-[#17BEC0]/10 px-3 py-1 text-xs font-medium text-[#17BEC0] dark:border-[#17BEC0]/30 dark:bg-[#17BEC0]/10 dark:text-[#17BEC0] sm:px-4 sm:py-1.5 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#17BEC0] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#17BEC0]" />
            </span>
            🇵🇪 Hecho para tu equipo, pensado para tu negocio
          </div>

          {/* Frase principal */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl dark:text-white">
            Facturación y Trazabilidad
            <br />
            {/* Eliminado el degradado a ámbar, ahora todo es turquesa */}
            <span className="bg-gradient-to-r from-[#17BEC0] to-[#17BEC0] bg-clip-text text-transparent">
              de tus cargas en un solo lugar
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg">
            Genera facturas, boletas y guías automáticas. Controla cargas, entregas y retornos con fotos.
            <br className="hidden sm:block" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Web para ti, app móvil para tu equipo. Todo conectado.
            </span>
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#contacto"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17BEC0] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#17BEC0]/25 transition hover:bg-[#13a3a5] hover:shadow-[#17BEC0]/40 sm:w-auto"
            >
              Quiero más control y ganancias
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/signin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 sm:w-auto"
            >
              <Play className="h-4 w-4" />
              Ver demo en 2 minutos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}