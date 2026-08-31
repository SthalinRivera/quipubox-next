"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "¿Necesito conocimientos técnicos para usar QuipuBox?",
    a: "No. QuipuBox está diseñado para ser intuitivo. Tu equipo puede empezar a usarlo el mismo día de la implementación. Además, ofrecemos capacitación incluida.",
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
    a: "El plan Empresa incluye acceso a nuestra API REST para integrar QuipuBox con tu ERP, sistema de facturación u otras herramientas.",
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
          {/* Etiqueta en turquesa */}
          <p className="text-sm font-semibold uppercase tracking-wider text-[#17BEC0]">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            ¿Tienes dudas?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Resolvemos las preguntas más comunes de nuestros clientes.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${isOpen
                  ? "border-[#17BEC0]/40 bg-[#17BEC0]/5 shadow-sm shadow-[#17BEC0]/5 dark:border-[#17BEC0]/30 dark:bg-[#17BEC0]/5"
                  : "border-gray-200 bg-white hover:border-[#17BEC0]/30 dark:border-white/10 dark:bg-gray-900 dark:hover:border-[#17BEC0]/20"
                  }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span
                    className={`text-base font-medium transition-colors ${isOpen
                      ? "text-[#17BEC0]"
                      : "text-gray-900 dark:text-white"
                      }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 flex-shrink-0 transition-all duration-300 ${isOpen
                      ? "rotate-180 text-[#17BEC0]"
                      : "text-gray-400"
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6">
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enlace de soporte adicional */}
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-white/10 dark:bg-white/5">
          <MessageCircle className="h-5 w-5 text-[#17BEC0]" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿No encuentras tu respuesta?{" "}
            <a
              href="#contacto"
              className="font-semibold text-[#17BEC0] transition hover:text-[#13a3a5]"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}