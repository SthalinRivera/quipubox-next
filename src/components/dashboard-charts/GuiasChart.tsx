"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface GuiasChartProps {
  porEstado: { estado: string; cantidad: number }[];
  porFecha: { fecha: string; emitidas: number; firmadas: number; anuladas: number }[];
  loading?: boolean;
}

const estadoColores: Record<string, string> = {
  emitida: "#F59E0B",
  firmada: "#22C55E",
  anulada: "#EF4444",
  reemplazada: "#8B5CF6",
  observada: "#06B6D4",
  sin_estado: "#9CA3AF",
};

export default function GuiasChart({ porEstado, porFecha, loading }: GuiasChartProps) {
  const donutOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: porEstado.map((e) => e.estado.charAt(0).toUpperCase() + e.estado.slice(1)),
    colors: porEstado.map((e) => estadoColores[e.estado] || "#6B7280"),
    legend: { position: "bottom", fontSize: "13px" },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
    plotOptions: {
      pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total" } } } },
    },
  };

  const donutSeries = porEstado.map((e) => e.cantidad);

  const lineOptions: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#F59E0B", "#22C55E", "#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", height: 250, type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth", width: [2, 2, 2] },
    markers: { size: 0, hover: { size: 5 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    xaxis: {
      type: "category",
      categories: porFecha.map((d) => d.fecha),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: ["#6B7280"] }, rotate: -45 },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
  };

  const lineSeries = [
    { name: "Emitidas", data: porFecha.map((d) => d.emitidas) },
    { name: "Firmadas", data: porFecha.map((d) => d.firmadas) },
    { name: "Anuladas", data: porFecha.map((d) => d.anuladas) },
  ];

  return (
    <ComponentCard title="Guías Operativas">
      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Por Estado</p>
            {donutSeries.length > 0 ? (
              <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={250} />
            ) : (
              <p className="text-center text-gray-400 py-10">Sin datos</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Evolución Temporal</p>
            {porFecha.length > 0 ? (
              <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={250} />
            ) : (
              <p className="text-center text-gray-400 py-10">Sin datos</p>
            )}
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
