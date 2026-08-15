"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import Link from "next/link";

type BillingCycle = "monthly" | "quarterly";

const plans = [
  {
    name: "Esencial",
    description: "Lo esencial para comenzar a digitalizar tu operación",
    monthlyPrice: 149,
    quarterlyPrice: 129,
    features: [
      "Gestión de clientes y sedes",
      "Catálogo de frutas, variedades y calidades",
      "Control básico de jabas",
      "Registro de cargas",
      "Registro de entregas",
      "Dashboard general",
      "Hasta 3 usuarios",
      "Soporte por correo",
    ],
    cta: "Comenzar ahora",
    popular: false,
  },
  {
    name: "Profesional",
    description: "Para empresas que necesitan control total de su distribución",
    monthlyPrice: 299,
    quarterlyPrice: 259,
    features: [
      "Todo lo del plan Esencial",
      "Repartos avanzados con rutas",
      "Guías operativas automáticas",
      "Gestión de camiones y flota",
      "Incidencias con seguimiento",
      "Evidencias fotográficas",
      "Recuperación y devolución de jabas",
      "Roles y permisos de usuario",
      "Reportes avanzados exportables",
      "Hasta 10 usuarios",
      "Soporte prioritario",
    ],
    cta: "Solicitar demo",
    popular: true,
  },
  {
    name: "Empresa",
    description: "Solución completa para grandes operaciones multisede",
    monthlyPrice: 499,
    quarterlyPrice: 439,
    features: [
      "Todo lo del plan Profesional",
      "Múltiples sedes y almacenes",
      "Mayor capacidad de datos",
      "Personalización de reportes",
      "Integraciones API",
      "Capacitación para tu equipo",
      "Soporte prioritario 24/7",
      "Gerente de cuenta dedicado",
      "Usuarios ilimitados",
      "Acuerdos de nivel de servicio",
    ],
    cta: "Contactar ventas",
    popular: false,
  },
];

export default function LandingPricing() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section id="planes" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Planes y precios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Elige el plan perfecto para tu empresa
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Sin contratos a largo plazo. Cancela cuando quieras. Prueba gratis
            por 14 días.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "monthly"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling("quarterly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "quarterly"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Trimestral
              <span className="ml-1.5 inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                -13%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.quarterlyPrice;
            const savings =
              (plan.monthlyPrice - plan.quarterlyPrice) * 3;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-2 p-8 transition ${
                  plan.popular
                    ? "border-brand-500 shadow-xl shadow-brand-500/10 dark:shadow-brand-500/5"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <Star className="h-3.5 w-3.5" />
                      Más elegido
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-400">S/</span>
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {price}
                    </span>
                    <span className="text-sm text-gray-400">/mes</span>
                  </div>
                  {billing === "quarterly" && (
                    <p className="mt-1 text-sm text-success-600 dark:text-success-400">
                      Ahorras S/{savings} por trimestre
                    </p>
                  )}
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          plan.popular ? "text-brand-500" : "text-success-500"
                        }`}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === "Esencial" ? "/signin" : "#contacto"}
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
