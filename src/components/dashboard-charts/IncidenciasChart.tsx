"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface IncidenciasChartProps {
  porTipo: { tipo: string; cantidad: number }[];
  porFecha: { fecha: string; total: number; abiertas: number; en_proceso: number; cerradas: number }[];
  loading?: boolean;
}

export default function IncidenciasChart({ porTipo, porFecha, loading }: IncidenciasChartProps) {
  const barOptions: ApexOptions = {
    legend: { show: false },
    colors: ["#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", height: 250, type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, columnWidth: "60%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: porTipo.map((i) => i.tipo),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] } },
    },
    yaxis: { labels: { style: { fontSize: "11px", colors: ["#6B7280"] } } },
    grid: { xaxis: { lines: { show: false } } },
  };

  const barSeries = [{ name: "Incidencias", data: porTipo.map((i) => i.cantidad) }];

  const lineOptions: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#EF4444", "#F59E0B", "#22C55E"],
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
    { name: "Abiertas", data: porFecha.map((d) => d.abiertas) },
    { name: "En Proceso", data: porFecha.map((d) => d.en_proceso) },
    { name: "Cerradas", data: porFecha.map((d) => d.cerradas) },
  ];

  return (
    <ComponentCard title="Incidencias">
      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Por Tipo</p>
            {porTipo.length > 0 ? (
              <ReactApexChart options={barOptions} series={barSeries} type="bar" height={250} />
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
