"use client";

import {
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Smartphone,
  HeadphonesIcon,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Ahorra horas de trabajo",
    description:
      "Automatiza tareas manuales como registro de entregas, control de jabas y generación de reportes.",
    stat: "15+",
    statLabel: "horas/semana",
  },
  {
    icon: TrendingUp,
    title: "Aumenta tus ingresos",
    description:
      "Reduce pérdidas por jabas no cobradas, entregas no registradas e incidencias sin resolver.",
    stat: "23%",
    statLabel: "más ingresos",
  },
  {
    icon: Shield,
    title: "Control total",
    description:
      "Sabe exactamente dónde está cada camión, cada carga y cada jaba en tiempo real.",
    stat: "100%",
    statLabel: "trazabilidad",
  },
  {
    icon: Zap,
    title: "Implementación rápida",
    description:
      "Configura tu empresa, clientes y productos en menos de 24 horas. Sin complicaciones.",
    stat: "24h",
    statLabel: "setup completo",
  },
  {
    icon: Smartphone,
    title: "Acceso desde cualquier lugar",
    description:
      "Tu equipo accede desde celular, tablet o computadora. Ideal para conductores en ruta.",
    stat: "24/7",
    statLabel: "disponibilidad",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte dedicado",
    description:
      "Equipo de soporte especializado en logística de frutas que entiende tu negocio.",
    stat: "<2h",
    statLabel: "respuesta",
  },
];

export default function LandingBenefits() {
  return (
    <section id="beneficios" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Beneficios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Impacto real en tu operación
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Resultados medibles que transforman la forma en que administras tu
            distribución de frutas.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition hover:bg-white hover:shadow-lg dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-500">
                      {benefit.stat}
                    </p>
                    <p className="text-xs text-gray-400">{benefit.statLabel}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
