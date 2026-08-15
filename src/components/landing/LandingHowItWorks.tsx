"use client";

import { UserPlus, Settings, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Registra tu empresa",
    description:
      "Crea tu cuenta, registra tu empresa con datos básicos y acceso a la plataforma en minutos.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configura tu operación",
    description:
      "Carga tus clientes, frutas, camiones, sedes y Define los roles de tu equipo. Nosotros te ayudamos.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Comienza a operar",
    description:
      "Registra cargas, asigna repartos, controla entregas y jabas. Todo en un solo lugar, en tiempo real.",
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
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            En 3 pasos, transforma tu operación
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Implementar QuiPuBox es simple. Nuestro equipo te acompaña en cada
            paso del proceso.
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
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/25">
                  <Icon className="h-8 w-8" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-400">
                  Paso {step.number}
                </p>
                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
