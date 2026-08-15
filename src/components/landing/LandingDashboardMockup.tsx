"use client";

import {
  Truck,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function LandingDashboardMockup() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Plataforma completa
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Un dashboard que cuenta la historia de tu operación
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Visualiza KPIs críticos, tendencias y alertas en tiempo real.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl shadow-gray-200/40 sm:p-6">
            <div className="rounded-xl bg-gray-50 p-2 sm:p-4">
              <div className="rounded-lg bg-white p-4 sm:p-8">
                {/* Top bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Panel de Control
                    </h3>
                    <p className="text-xs text-gray-400">
                      Actualizado hace 2 minutos · 10 Agosto 2026
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700">
                      Sistema operativo
                    </span>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                      12 camiones activos
                    </span>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { icon: Package, label: "Entregas hoy", value: "342", color: "text-brand-500", bg: "bg-brand-50" },
                    { icon: Truck, label: "Cargas activas", value: "18", color: "text-blue-light-500", bg: "bg-blue-light-50" },
                    { icon: Users, label: "Clientes activos", value: "89", color: "text-success-500", bg: "bg-success-50" },
                    { icon: Clock, label: "Pendientes", value: "24", color: "text-warning-500", bg: "bg-warning-50" },
                    { icon: AlertTriangle, label: "Incidencias", value: "3", color: "text-error-500", bg: "bg-error-50" },
                    { icon: TrendingUp, label: "Eficiencia", value: "98%", color: "text-success-500", bg: "bg-success-50" },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-gray-100 p-3 sm:p-4"
                    >
                      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
                        <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                      </div>
                      <p className="text-xs text-gray-400">{kpi.label}</p>
                      <p className="mt-0.5 text-xl font-bold text-gray-900">
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="mt-6 grid gap-4 lg:grid-cols-5">
                  {/* Chart */}
                  <div className="rounded-xl border border-gray-100 p-4 lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">
                        Entregas — Últimos 7 días
                      </p>
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-brand-500" />
                          Entregadas
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-brand-200" />
                          Pendientes
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-1.5" style={{ height: 140 }}>
                      {[
                        { delivered: 280, pending: 32 },
                        { delivered: 310, pending: 28 },
                        { delivered: 265, pending: 40 },
                        { delivered: 320, pending: 22 },
                        { delivered: 295, pending: 35 },
                        { delivered: 340, pending: 18 },
                        { delivered: 342, pending: 24 },
                      ].map((day, i) => (
                        <div key={i} className="flex flex-1 flex-col gap-0.5 justify-end">
                          <div
                            className="rounded-t bg-brand-200"
                            style={{ height: `${(day.pending / 360) * 100}%` }}
                          />
                          <div
                            className="rounded-t bg-brand-500"
                            style={{ height: `${(day.delivered / 360) * 100}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                        (d) => (
                          <span key={d}>{d}</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Sidebar widgets */}
                  <div className="space-y-4 lg:col-span-2">
                    {/* Jabas widget */}
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Estado de jabas
                      </p>
                      <div className="mt-3 space-y-3">
                        {[
                          { label: "En tránsito", count: "420", pct: 35, color: "bg-brand-500" },
                          { label: "Por cobrar", count: "1,240", pct: 60, color: "bg-warning-500" },
                          { label: "Devueltas", count: "340", pct: 28, color: "bg-success-500" },
                        ].map((j) => (
                          <div key={j.label}>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">{j.label}</span>
                              <span className="font-medium text-gray-900">
                                {j.count}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${j.color}`}
                                style={{ width: `${j.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top clients */}
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Top clientes
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {[
                          { name: "Frutas del Sur", deliveries: 48 },
                          { name: "Distribuidora Lima", deliveries: 35 },
                          { name: "Comercial Andina", deliveries: 28 },
                        ].map((c, i) => (
                          <div
                            key={c.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                                {i + 1}
                              </span>
                              <span className="text-xs text-gray-700">
                                {c.name}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {c.deliveries}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
