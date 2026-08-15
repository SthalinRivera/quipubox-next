"use client";

import { Smartphone, CheckCircle2, Apple, Download } from "lucide-react";

const features = [
  "Registro de entregas con foto en campo",
  "Control de jabas en tiempo real",
  "Evidencias fotográficas automáticas",
  "Consulta de cargas y rutas del día",
  "Incidencias desde el punto de entrega",
  "Funciona sin conexión y sincroniza después",
];

export default function LandingMobileApp() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-20 sm:py-28 dark:bg-gray-900">
      {/* Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left - Phone mockup */}
          <div className="relative mx-auto max-w-sm lg:mx-0">
            {/* Phone frame */}
            <div className="relative mx-auto w-[280px] sm:w-[320px]">
              {/* Glow */}
              <div className="absolute -inset-4 rounded-[3rem] bg-brand-500/20 blur-2xl dark:bg-brand-500/10" />

              {/* Phone body */}
              <div className="relative rounded-[2.5rem] border-4 border-gray-800 bg-gray-900 p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-10 h-7 w-28 -translate-x-1/2 -translate-y-px rounded-b-2xl bg-gray-800 dark:bg-gray-700">
                  <div className="mx-auto mt-2 h-2 w-14 rounded-full bg-gray-700 dark:bg-gray-600" />
                </div>

                {/* Screen */}
                <div className="overflow-hidden rounded-[2rem] bg-white dark:bg-gray-950">
                  {/* Status bar */}
                  <div className="flex items-center justify-between bg-brand-500 px-6 pt-3 pb-2 text-[10px] font-medium text-white">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-4 rounded-sm border border-white/50" />
                      <div className="h-2.5 w-4 rounded-sm border border-white/50" />
                      <div className="h-2.5 w-4 rounded-sm border border-white/50" />
                    </div>
                  </div>

                  {/* App content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="mb-4">
                      <p className="text-[10px] text-gray-400">Buenos días</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Hoy tienes 12 entregas
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Entregas", value: "12", color: "bg-brand-50" },
                        { label: "Pendientes", value: "4", color: "bg-warning-50" },
                        { label: "Jabas", value: "86", color: "bg-success-50" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`${s.color} dark:bg-white/5 rounded-lg p-2 text-center`}
                        >
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {s.value}
                          </p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery card */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-success-50 px-2 py-0.5 text-[9px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                          En ruta
                        </span>
                        <span className="text-[9px] text-gray-400">08:30</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        Frutas del Sur - Sede Central
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Av. Industrial 1234, Ate
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          3 cajas
                        </span>
                        <span>Plátano, Mango</span>
                      </div>
                    </div>

                    {/* Bottom nav */}
                    <div className="mt-4 flex items-center justify-around border-t border-gray-100 pt-3 dark:border-white/10">
                      {[
                        { icon: "📦", active: true },
                        { icon: "🚛", active: false },
                        { icon: "📸", active: false },
                        { icon: "👤", active: false },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                            item.active
                              ? "bg-brand-50 dark:bg-brand-500/10"
                              : ""
                          }`}
                        >
                          {item.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gray-700 dark:bg-gray-600" />
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <Smartphone className="h-4 w-4" />
              App móvil incluida
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Tu operación
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                en el bolsillo
              </span>
            </h2>

            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Los conductores y repartidores registran entregas, capturan
              evidencias y controlan jabas directo desde el celular. Todo
              sincroniza en tiempo real con la plataforma.
            </p>

            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Download buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] leading-tight text-gray-300 dark:text-gray-500">
                    Disponible en
                  </p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Download className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] leading-tight text-gray-300 dark:text-gray-500">
                    Consíguelo en
                  </p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
