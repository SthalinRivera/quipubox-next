"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EntregasChartProps {
  porFecha: { fecha: string; total: number; entregadas: number; parciales: number; rechazadas: number; jabas_entregadas: number }[];
  jabasEntregadas: { fecha: string; cantidad_entregada: number; cantidad_rechazada: number }[];
  loading?: boolean;
}

export default function EntregasChart({ porFecha, jabasEntregadas, loading }: EntregasChartProps) {
  const categories = porFecha.map((d) => d.fecha);

  const barOptions: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#22C55E", "#F59E0B", "#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", height: 310, type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] }, rotate: -45 },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val} entregas` } },
  };

  const barSeries = [
    { name: "Entregadas", data: porFecha.map((d) => d.entregadas) },
    { name: "Parciales", data: porFecha.map((d) => d.parciales) },
    { name: "Rechazadas", data: porFecha.map((d) => d.rechazadas) },
  ];

  const areaOptions: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#22C55E", "#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", height: 250, type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    markers: { size: 0, hover: { size: 5 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    xaxis: {
      type: "category",
      categories: jabasEntregadas.map((d) => d.fecha),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: ["#6B7280"] }, rotate: -45 },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
  };

  const areaSeries = [
    { name: "Jabas Entregadas", data: jabasEntregadas.map((d) => d.cantidad_entregada) },
    { name: "Jabas Rechazadas", data: jabasEntregadas.map((d) => d.cantidad_rechazada) },
  ];

  return (
    <ComponentCard title="Entregas y Jabas Entregadas">
      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Entregas por Estado</p>
            {categories.length > 0 ? (
              <ReactApexChart options={barOptions} series={barSeries} type="bar" height={310} />
            ) : (
              <p className="text-center text-gray-400 py-10">Sin datos</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Jabas Entregadas vs Rechazadas</p>
            {jabasEntregadas.length > 0 ? (
              <ReactApexChart options={areaOptions} series={areaSeries} type="area" height={310} />
            ) : (
              <p className="text-center text-gray-400 py-10">Sin datos</p>
            )}
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
