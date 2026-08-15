"use client";

import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  FileX,
  TrendingDown,
  Users,
} from "lucide-react";

const problems = [
  {
    icon: ClipboardList,
    title: "Control manual de entregas",
    description:
      "Seguimiento en hojas de cálculo o cuadernos que genera errores, pérdidas de información y retrasos en la toma de decisiones.",
  },
  {
    icon: FileX,
    title: "Pérdida de jabas sin control",
    description:
      "No sabes cuántas jabas tienes, cuántas están por cobrar o devolver. Cada mes pierdes dinero sin datos claros.",
  },
  {
    icon: Users,
    title: "Clientes y sedes desorganizadas",
    description:
      "La información de tus clientes y puntos de distribución está dispersa, dificultando la planificación de rutas y cargas.",
  },
  {
    icon: DollarSign,
    title: "Cobros y pagos sin trazabilidad",
    description:
      "No tienes visibilidad sobre cuánto te deben tus clientes o cuánto debes por jabas, generando conflictos y pérdidas.",
  },
  {
    icon: AlertTriangle,
    title: "Incidencias sin seguimiento",
    description:
      "Los problemas en entregas no se registran ni resuelven de forma sistemática, afectando la satisfacción del cliente.",
  },
  {
    icon: TrendingDown,
    title: "Sin reportes ni métricas",
    description:
      "Tomas decisiones al azar porque no tienes datos consolidados sobre el rendimiento de tu operación logística.",
  },
];

export default function LandingProblems() {
  return (
    <section id="problemas" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            El problema
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            ¿Te suena familiar?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Si tu operación de distribución de frutas se maneja con herramientas
            básicas, estás perdiendo tiempo, dinero y clientes.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-error-200 hover:shadow-lg hover:shadow-error-50 dark:border-white/5 dark:bg-gray-900 dark:hover:border-error-500/30 dark:hover:shadow-error-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error-50 text-error-500 transition group-hover:bg-error-100 dark:bg-error-500/10 dark:group-hover:bg-error-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
