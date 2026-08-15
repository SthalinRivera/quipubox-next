"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

const highlights = [
  "Gestión integral de distribución",
  "Control de jabas en tiempo real",
  "Reportes y evidencias automáticos",
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white pt-28 pb-20 sm:pt-36 sm:pb-28 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-brand-200/20 blur-3xl dark:bg-brand-500/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Plataforma #1 en distribución de frutas
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            Gestiona tu distribución
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              de frutas sin límites
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            La plataforma SaaS que centraliza clientes, sedes, frutas, camiones,
            cargas, entregas, jabas y reportes en un solo lugar. Diseñada para
            empresas de distribución y comercialización de frutas.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 hover:shadow-brand-500/40"
            >
              Solicitar demostración
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <Play className="h-4 w-4" />
              Ver demo
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            {highlights.map((h) => (
              <div
                key={h}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <CheckCircle2 className="h-4 w-4 text-success-500" />
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-white/10 dark:bg-gray-900 dark:shadow-none">
            <div className="rounded-xl bg-gray-50 p-1 dark:bg-gray-800">
              <div className="rounded-lg bg-white p-6 dark:bg-gray-900">
                {/* Mockup header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dashboard General
                    </h3>
                    <p className="text-sm text-gray-400">
                      Resumen operativo del día
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-success-50 px-3 py-1 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                      98.2% entregas
                    </span>
                    <span className="rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      12 camiones activos
                    </span>
                  </div>
                </div>
                {/* Mockup stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Entregas hoy", value: "342", change: "+12%" },
                    { label: "Cargas activas", value: "18", change: "+5" },
                    { label: "Jabas por cobrar", value: "1,240", change: "-8%" },
                    { label: "Incidencias", value: "3", change: "-2" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-gray-100 p-4 dark:border-white/5"
                    >
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <span className="text-xs font-medium text-success-600 dark:text-success-400">
                        {stat.change}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Mockup chart area */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="col-span-2 rounded-lg border border-gray-100 p-4 dark:border-white/5">
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Entregas - Últimos 7 días
                    </p>
                    <div className="flex items-end gap-2 h-32">
                      {[65, 45, 80, 55, 70, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-brand-500/20 dark:bg-brand-500/10"
                          style={{ height: `${h}%` }}
                        >
                          <div
                            className="rounded-t bg-brand-500"
                            style={{ height: `${h * 0.7}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-4 dark:border-white/5">
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Top frutas
                    </p>
                    <div className="space-y-3">
                      {[
                        { name: "Plátano", pct: 35 },
                        { name: "Mango", pct: 28 },
                        { name: "Naranja", pct: 22 },
                        { name: "Limón", pct: 15 },
                      ].map((f) => (
                        <div key={f.name}>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              {f.name}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {f.pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${f.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
