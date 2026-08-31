"use client";

import { UserPlus, Settings, Rocket, ArrowRight, FileText, BarChart3, Ticket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Registra tu empresa",
    description:
      "Crea tu cuenta y registra tu empresa con datos básicos. En minutos tienes acceso a la plataforma.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configura tu operación",
    description:
      "Carga clientes, sedes, frutas, camiones y define roles. Nuestro equipo te acompaña en el proceso.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Comienza a facturar y operar",
    description:
      "Genera facturas, boletas, guías y tickets. Controla entregas y obtén reportes en tiempo real, web y app móvil.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-28 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Etiqueta superior en turquesa */}
          <p className="text-sm font-semibold uppercase tracking-wider text-[#17BEC0]">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            En 3 pasos, transforma tu operación
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Implementar QuiPuBox es simple. Factura, controla y reporta todo desde un solo lugar.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+60px)] top-10 hidden w-[calc(100%-120px)] lg:block">
                    <ArrowRight className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                {/* Ícono principal en turquesa #17BEC0 */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#17BEC0] text-white shadow-lg shadow-[#17BEC0]/25">
                  <Icon className="h-8 w-8" />
                </div>

                {/* Texto "Paso" en turquesa */}
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#17BEC0]">
                  Paso {step.number}
                </p>

                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>

                {/* Mini badges para reforzar las funcionalidades finales */}
                {index === 2 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#17BEC0]/10 px-3 py-1 text-xs font-medium text-[#0e8e90] dark:text-[#17BEC0]">
                      <FileText className="h-3 w-3" /> Facturas y Boletas
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#17BEC0]/10 px-3 py-1 text-xs font-medium text-[#0e8e90] dark:text-[#17BEC0]">
                      <Ticket className="h-3 w-3" /> Guías y Tickets
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#17BEC0]/10 px-3 py-1 text-xs font-medium text-[#0e8e90] dark:text-[#17BEC0]">
                      <BarChart3 className="h-3 w-3" /> Reportes
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}