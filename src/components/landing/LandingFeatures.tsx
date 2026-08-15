"use client";

import {
  Building2,
  Apple,
  Truck,
  PackageCheck,
  MapPin,
  AlertCircle,
  FileText,
  CreditCard,
  RotateCcw,
  Users,
  Camera,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Clientes y sedes",
    description:
      "Registro completo de clientes, puntos de distribución y sedes con datos de contacto, dirección y condiciones comerciales.",
  },
  {
    icon: Apple,
    title: "Frutas, variedades y calidades",
    description:
      "Catálogo de productos con variedades, calidades, precios y unidades de medida. Control total de tu inventario.",
  },
  {
    icon: Truck,
    title: "Gestión de camiones",
    description:
      "Registro de flota con placas, capacidades, conductor asignado y estado. Seguimiento en tiempo real de cada unidad.",
  },
  {
    icon: PackageCheck,
    title: "Cargas y repartos",
    description:
      "Planifica cargas por cliente, ruta y producto. Asigna repartos a camiones y conductores con un clic.",
  },
  {
    icon: MapPin,
    title: "Entregas e incidencias",
    description:
      "Registro de entregas con evidencia fotográfica. Gestión de incidencias con estados, responsable y resolución.",
  },
  {
    icon: FileText,
    title: "Guías operativas",
    description:
      "Genera guías de despacho y operativas automáticamente con toda la información de la carga y el cliente.",
  },
  {
    icon: CreditCard,
    title: "Jabas por cobrar y pagar",
    description:
      "Control detallado de jabas en tránsito, por cobrar y por pagar. Nunca pierdas el rastro de tus jabas.",
  },
  {
    icon: RotateCcw,
    title: "Recuperación y devolución",
    description:
      "Registro de jabas devueltas, recuperadas y pendientes. Histórico completo por cliente y período.",
  },
  {
    icon: Users,
    title: "Usuarios, roles y permisos",
    description:
      "Control de acceso granular. Define qué puede ver y hacer cada usuario según su rol en la empresa.",
  },
  {
    icon: Camera,
    title: "Evidencias fotográficas",
    description:
      "Captura fotos de entregas, incidencias y condiciones de jabas directamente desde la app móvil.",
  },
  {
    icon: BarChart3,
    title: "Reportes y dashboards",
    description:
      "Dashboards en tiempo real y reportes exportables de entregas, jabas, incidencias, clientes y más.",
  },
  {
    icon: AlertCircle,
    title: "Alertas inteligentes",
    description:
      "Notificaciones automáticas por entregas pendientes, jabas vencidas, incidencias críticas y metas alcanzadas.",
  },
];

export default function LandingFeatures() {
  return (
    <section
      id="funcionalidades"
      className="bg-gray-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Funcionalidades
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Todo lo que necesitas para tu distribución
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Una plataforma completa diseñada específicamente para empresas de
            distribución y comercialización de frutas.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200/80 bg-white p-6 transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition group-hover:bg-brand-100">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
