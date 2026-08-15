"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Necesito conocimientos técnicos para usar QuiPuBox?",
    a: "No. QuiPuBox está diseñado para ser intuitivo. Tu equipo puede empezar a usarlo el mismo día de la implementación. Además, ofrecemos capacitación incluida.",
  },
  {
    q: "¿Puedo probar la plataforma antes de contratar?",
    a: "Sí. Ofrecemos una prueba gratuita de 14 días sin compromiso. También puedes solicitar una demostración personalizada con nuestro equipo.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Absolutamente. Utilizamos infraestructura cloud de nivel empresarial con cifrado de datos, copias de seguridad automáticas y cumplimiento de estándares de seguridad.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes upgrade o downgrade tu plan en cualquier momento. Los cambios se aplican de inmediato con ajuste proporcional.",
  },
  {
    q: "¿Soporta múltiples sedes o almacenes?",
    a: "El plan Empresa soporta múltiples sedes y almacenes con inventario independiente y reportes consolidados. El plan Profesional permite hasta 2 sedes.",
  },
  {
    q: "¿Cómo funciona el control de jabas?",
    a: "Registramos cada jaba por cliente, con estados (en tránsito, por cobrar, por pagar, devuelta). Puedes ver el historial completo y generar reportes de cobro/devolución.",
  },
  {
    q: "¿Ofrecen integración con otros sistemas?",
    a: "El plan Empresa incluye acceso a nuestra API REST para integrar QuiPuBox con tu ERP, sistema de facturación u otras herramientas.",
  },
  {
    q: "¿Qué soporte ofrecen?",
    a: "Todos los planes incluyen soporte por correo. El plan Profesional tiene soporte prioritario. El plan Empresa incluye soporte 24/7 y gerente de cuenta dedicado.",
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            ¿Tienes dudas?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Resolvemos las preguntas más comunes de nuestros clientes.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-gray-200 dark:divide-white/10">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`mt-1 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
