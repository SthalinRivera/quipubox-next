"use client";

import { Check, Minus } from "lucide-react";

type Feature = {
  name: string;
  esencial: boolean | string;
  profesional: boolean | string;
  empresa: boolean | string;
};

const categories: { label: string; features: Feature[] }[] = [
  {
    label: "Gestión básica",
    features: [
      { name: "Clientes y sedes", esencial: true, profesional: true, empresa: true },
      { name: "Frutas, variedades y calidades", esencial: true, profesional: true, empresa: true },
      { name: "Control de jabas", esencial: true, profesional: true, empresa: true },
      { name: "Registro de cargas", esencial: true, profesional: true, empresa: true },
      { name: "Registro de entregas", esencial: true, profesional: true, empresa: true },
      { name: "Dashboard general", esencial: true, profesional: true, empresa: true },
    ],
  },
  {
    label: "Operación avanzada",
    features: [
      { name: "Repartos con rutas", esencial: false, profesional: true, empresa: true },
      { name: "Guías operativas", esencial: false, profesional: true, empresa: true },
      { name: "Gestión de camiones", esencial: false, profesional: true, empresa: true },
      { name: "Incidencias con seguimiento", esencial: false, profesional: true, empresa: true },
      { name: "Evidencias fotográficas", esencial: false, profesional: true, empresa: true },
      { name: "Recuperación de jabas", esencial: false, profesional: true, empresa: true },
    ],
  },
  {
    label: "Control y reportes",
    features: [
      { name: "Roles y permisos", esencial: false, profesional: true, empresa: true },
      { name: "Reportes avanzados", esencial: false, profesional: true, empresa: true },
      { name: "Múltiples sedes", esencial: false, profesional: false, empresa: true },
      { name: "Integraciones API", esencial: false, profesional: false, empresa: true },
      { name: "Personalización", esencial: false, profesional: false, empresa: true },
      { name: "Capacitación dedicada", esencial: false, profesional: false, empresa: true },
    ],
  },
  {
    label: "Soporte",
    features: [
      { name: "Soporte por correo", esencial: true, profesional: true, empresa: true },
      { name: "Soporte prioritario", esencial: false, profesional: true, empresa: true },
      { name: "Soporte 24/7", esencial: false, profesional: false, empresa: true },
      { name: "Gerente de cuenta", esencial: false, profesional: false, empresa: true },
      { name: "Usuarios", esencial: "3", profesional: "10", empresa: "Ilimitados" },
    ],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-success-500" />
    ) : (
      <Minus className="h-5 w-5 text-gray-300" />
    );
  }
  return <span className="text-sm font-medium text-gray-900">{value}</span>;
}

export default function LandingComparison() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Comparativa
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Compara los planes en detalle
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
            <div className="p-4 sm:p-6" />
            {["Esencial", "Profesional", "Empresa"].map((name) => (
              <div
                key={name}
                className={`p-4 text-center sm:p-6 ${
                  name === "Profesional" ? "bg-brand-50/50" : ""
                }`}
              >
                <p className="text-sm font-bold text-gray-900">{name}</p>
              </div>
            ))}
          </div>

          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {cat.label}
                </p>
              </div>
              {cat.features.map((feature, i) => (
                <div
                  key={feature.name}
                  className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <div className="flex items-center px-6 py-3.5">
                    <span className="text-sm text-gray-600">{feature.name}</span>
                  </div>
                  <div className="flex items-center justify-center px-4 py-3.5">
                    <CellValue value={feature.esencial} />
                  </div>
                  <div className="flex items-center justify-center bg-brand-50/30 px-4 py-3.5">
                    <CellValue value={feature.profesional} />
                  </div>
                  <div className="flex items-center justify-center px-4 py-3.5">
                    <CellValue value={feature.empresa} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
