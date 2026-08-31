"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface JabasChartProps {
  data: { fecha: string; total_jabas: number; jabas_por_tipo: { tipo: string; cantidad: number }[] }[];
  loading?: boolean;
}

export default function JabasChart({ data, loading }: JabasChartProps) {
  const categories = data.map((d) => d.fecha);

  const tiposSet = new Set<string>();
  data.forEach((d) => d.jabas_por_tipo.forEach((t) => tiposSet.add(t.tipo)));
  const tipos = Array.from(tiposSet);

  const colores = ["#465FFF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  const opciones: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: colores.slice(0, tipos.length || 1),
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
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
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
      title: { text: "Jabas", style: { fontSize: "12px" } },
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val} jabas` } },
  };

  const series = tipos.length > 0
    ? tipos.map((tipo) => ({
        name: tipo,
        data: data.map((d) => {
          const found = d.jabas_por_tipo.find((t) => t.tipo === tipo);
          return found ? found.cantidad : 0;
        }),
      }))
    : [{ name: "Jabas", data: data.map((d) => d.total_jabas) }];

  return (
    <ComponentCard title="Jabas Cargadas por Día">
      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px]">
            <ReactApexChart options={opciones} series={series} type="bar" height={310} />
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
