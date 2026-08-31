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
    title: "Cargas sin planificación",
    description:
      "Planificar cargas manualmente entre mercados, almacenes y clientes toma horas y genera errores de asignación y rutas ineficientes.",
  },
  {
    icon: FileX,
    title: "Guías y documentos desorganizados",
    description:
      "Las guías de transporte, tickets y boletas se manejan en papel o Excel, causando pérdidas de información y falta de trazabilidad.",
  },
  {
    icon: Users,
    title: "Sin seguimiento a camiones en ruta",
    description:
      "No sabes dónde están tus camiones durante el transporte. Los conductores reportan avances por WhatsApp o llamadas, sin datos centralizados.",
  },
  {
    icon: DollarSign,
    title: "Jabas y envases sin control",
    description:
      "No tienes visibilidad sobre cuántas jabas están en tránsito, cuántas debes cobrar o devolver. Cada mes pierdes dinero sin datos claros.",
  },
  {
    icon: AlertTriangle,
    title: "Incidencias sin resolución",
    description:
      "Los problemas durante el transporte o la entrega no se registran ni resuelven de forma sistemática, afectando tu operación y clientes.",
  },
  {
    icon: TrendingDown,
    title: "Sin reportes ni métricas",
    description:
      "Tomas decisiones al azar porque no tienes datos consolidados sobre entregas, rendimiento de rutas, costos de transporte y más.",
  },
];

export default function LandingProblems() {
  return (
    <section id="problemas" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Etiqueta en turquesa */}
          <p className="text-sm font-semibold uppercase tracking-wider text-[#17BEC0]">
            El problema
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            ¿Te suena familiar?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Si tu operación de transporte y distribución de frutas se maneja con
            herramientas básicas, estás perdiendo tiempo, dinero y control.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#17BEC0]/30 hover:shadow-xl hover:shadow-[#17BEC0]/10 dark:border-white/5 dark:bg-gray-900 dark:hover:border-[#17BEC0]/30 dark:hover:shadow-[#17BEC0]/5"
              >
                {/* Línea decorativa superior en turquesa al hacer hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#17BEC0] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icono en turquesa */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#17BEC0]/10 text-[#17BEC0] transition-colors group-hover:bg-[#17BEC0] group-hover:text-white dark:bg-[#17BEC0]/10 dark:text-[#17BEC0] dark:group-hover:bg-[#17BEC0] dark:group-hover:text-white">
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