"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface OperacionesChartProps {
  data: { fecha: string; total_operaciones: number; total_jabas: number }[];
  loading?: boolean;
}

export default function OperacionesChart({ data, loading }: OperacionesChartProps) {
  const categories = data.map((d) => d.fecha);
  const opciones: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#22C55E"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, x: { format: "dd MMM yyyy" } },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] }, rotate: -45 },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  const series = [
    { name: "Operaciones", data: data.map((d) => d.total_operaciones) },
    { name: "Jabas", data: data.map((d) => d.total_jabas) },
  ];

  return (
    <ComponentCard title="Operaciones por Día">
      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px]">
            <ReactApexChart options={opciones} series={series} type="line" height={310} />
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
