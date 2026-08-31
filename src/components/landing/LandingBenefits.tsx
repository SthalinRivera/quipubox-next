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
      "Automatiza la planificación de cargas, generación de guías, registro de entregas y control de jabas.",
    stat: "15+",
    statLabel: "horas/semana",
  },
  {
    icon: TrendingUp,
    title: "Reduce costos operativos",
    description:
      "Minimiza pérdidas por jabas sin control, rutas ineficientes e incidencias no resueltas a tiempo.",
    stat: "23%",
    statLabel: "menos costos",
  },
  {
    icon: Shield,
    title: "Trazabilidad completa",
    description:
      "Sabe dónde está cada camión, cada carga y cada jaba. Del origen al destino, todo bajo control.",
    stat: "100%",
    statLabel: "trazabilidad",
  },
  {
    icon: Zap,
    title: "Implementación rápida",
    description:
      "Configura tu empresa, clientes, camiones y rutas en menos de 24 horas. Sin complicaciones.",
    stat: "24h",
    statLabel: "setup completo",
  },
  {
    icon: Smartphone,
    title: "Web + App móvil",
    description:
      "Tu equipo administrativo usa la web. Conductores y repartidores usan la app. Todo sincronizado.",
    stat: "24/7",
    statLabel: "disponibilidad",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte especializado",
    description:
      "Equipo de soporte que entiende la logística de frutas y te acompaña en la implementación.",
    stat: "<2h",
    statLabel: "respuesta",
  },
];

export default function LandingBenefits() {
  return (
    <section id="beneficios" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Etiqueta superior en turquesa */}
          <p className="text-sm font-semibold uppercase tracking-wider text-[#17BEC0]">
            Beneficios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Impacto real en tu operación
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Resultados medibles que transforman la forma en que administras el
            transporte y distribución de frutas.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#17BEC0]/30 hover:bg-white hover:shadow-xl hover:shadow-[#17BEC0]/10 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-[#17BEC0]/30 dark:hover:bg-white/[0.04]"
              >
                {/* Línea decorativa superior en turquesa */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#17BEC0] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between">
                  {/* Ícono en turquesa */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#17BEC0]/10 text-[#17BEC0] transition-colors group-hover:bg-[#17BEC0] group-hover:text-white dark:bg-[#17BEC0]/10 dark:text-[#17BEC0] dark:group-hover:bg-[#17BEC0] dark:group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Número estadístico en turquesa */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#17BEC0]">
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