"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Gerente de Operaciones",
    company: "Distribuidora del Sur",
    content:
      "Desde que usamos QuiPuBox, redujimos las pérdidas de jabas en un 40%. El control que tenemos ahora sobre entregas y cobros es impresionante.",
    rating: 5,
  },
  {
    name: "María García",
    role: "Directora Comercial",
    company: "Frutas Frescas SAC",
    content:
      "La plataforma nos permitió escalar de 50 a 200 entregas diarias sin contratar más personal administrativo. El ROI fue inmediato.",
    rating: 5,
  },
  {
    name: "Roberto Sánchez",
    role: "Jefe de Logística",
    company: "Comercializadora Andina",
    content:
      "Antes todo estaba en Excel. Ahora nuestro equipo tiene acceso en tiempo real desde sus celulares. Las incidencias se resuelven el mismo día.",
    rating: 5,
  },
];

export default function LandingTestimonials() {
  return (
    <section className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Testimonios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Empresas que ya transformaron su operación
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition hover:bg-white hover:shadow-lg dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-brand-100 dark:text-brand-500/20" />
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning-400 text-warning-400"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t.name}
                </p>
                <p className="text-xs text-gray-400">
                  {t.role} — {t.company}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Logos */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400">
            Empresas que confían en QuiPuBox
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Distribuidora del Sur", "Frutas Frescas SAC", "Comercializadora Andina", "Frutopampa", "Frutas Premium"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-bold tracking-wider text-gray-900 dark:text-white"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
