"use client";

import { Check, Shield, Smartphone, Globe, Headphones, Wrench } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Profesional",
    price: 49.90,
    description: "Ideal para distribuidoras y comercializadoras",
    popular: true,
    features: [
      "Sistema web + app móvil",
      "Gestión de clientes, sedes y rutas",
      "Control de cargas, entregas y jabas",
      "Facturación electrónica integrada",
      "Tickets y guías de remisión automáticas",
      "Reportes en tiempo real",
      "Hasta 10 usuarios",
      "Soporte por chat y correo",
    ],
    cta: "Comenzar ahora",
    badge: "Más vendido",
  },
  {
    name: "Empresa",
    price: 69.90,
    description: "Para grandes operaciones y franquicias",
    popular: false,
    features: [
      "Todo lo del plan Profesional",
      "Múltiples sedes y almacenes",
      "Personalización del sistema",
      "Módulos a medida",
      "Integraciones API",
      "Capacitación y onboarding",
      "Usuarios ilimitados",
      "Soporte prioritario 24/7",
    ],
    cta: "Contactar ventas",
    badge: "Personalizable",
  },
];

export default function LandingPricing() {
  return (
    <section id="planes" className="bg-white py-16 sm:py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Etiqueta en turquesa */}
          <p className="text-sm font-semibold uppercase tracking-wider text-[#17BEC0]">
            Planes y precios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Simple. Sin sorpresas.
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Prueba gratis por 14 días · Sin tarjeta · Cancela cuando quieras
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-2 p-6 transition hover:shadow-xl sm:p-8 ${plan.popular
                ? "border-[#17BEC0] shadow-lg shadow-[#17BEC0]/10"
                : "border-gray-200 dark:border-white/10"
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide shadow-lg ${plan.popular
                      ? "bg-[#17BEC0] text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mt-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    S/ {plan.price}
                  </span>
                  <span className="text-sm text-gray-400">/mes</span>
                </div>
                <p className="text-xs text-gray-400">+ IGV · Sin permanencia</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    "Sistema web + app móvil": (
                      <>
                        <Globe className="h-4 w-4" />
                        <Smartphone className="h-4 w-4 -ml-1" />
                      </>
                    ),
                    "Soporte por chat y correo": <Headphones className="h-4 w-4" />,
                    "Soporte prioritario 24/7": <Shield className="h-4 w-4" />,
                    "Personalización del sistema": <Wrench className="h-4 w-4" />,
                  };

                  const icon =
                    iconMap[feature] ||
                    (feature.includes("Soporte") ? (
                      <Headphones className="h-4 w-4" />
                    ) : feature.includes("Personalización") ? (
                      <Wrench className="h-4 w-4" />
                    ) : null);

                  return (
                    <li key={feature} className="flex items-start gap-2.5">
                      {/* Check e iconos en turquesa */}
                      <span className="mt-0.5 text-[#17BEC0]">
                        {icon || <Check className="h-4 w-4" />}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={plan.name === "Profesional" ? "/signin" : "#contacto"}
                className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${plan.popular
                  ? "bg-[#17BEC0] text-white shadow-lg shadow-[#17BEC0]/25 hover:bg-[#13a3a5]"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Badges de servicio */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 dark:bg-white/5">
            <Globe className="h-3.5 w-3.5" /> Web
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 dark:bg-white/5">
            <Smartphone className="h-3.5 w-3.5" /> App móvil
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 dark:bg-white/5">
            <Headphones className="h-3.5 w-3.5" /> Soporte incluido
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 dark:bg-white/5">
            <Shield className="h-3.5 w-3.5" /> Facturación y guías
          </span>
        </div>
      </div>
    </section>
  );
}