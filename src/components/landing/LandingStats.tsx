"use client";

const stats = [
  { value: "500+", label: "Empresas activas" },
  { value: "2M+", label: "Entregas registradas" },
  { value: "50M+", label: "Jabas controladas" },
  { value: "99.9%", label: "Uptime garantizado" },
];

export default function LandingStats() {
  return (
    <section className="bg-brand-500 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-brand-100">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
