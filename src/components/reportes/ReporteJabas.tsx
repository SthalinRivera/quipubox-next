'use client';

import { useState } from 'react';
import { useReportes } from '@/hooks/useReportes';
import ReportFilter from '@/components/reportes/ReportFilter';
import ReportCard from '@/components/reportes/ReportCard';
import ExportButtons from '@/components/reportes/ExportButtons';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { Package, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react';
import type {
  ReportFilters,
  ReporteJabasPorPagar,
  ReporteJabasPorCobrar,
  ReporteRecuperaciones,
  ReporteDevoluciones,
} from '@/types/reportes';

type SubTab = 'por-pagar' | 'por-cobrar' | 'recuperaciones' | 'devoluciones';

export default function ReporteJabas() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('por-pagar');
  const [jabasPagar, setJabasPagar] = useState<ReporteJabasPorPagar | null>(null);
  const [jabasCobrar, setJabasCobrar] = useState<ReporteJabasPorCobrar | null>(null);
  const [recuperaciones, setRecuperaciones] = useState<ReporteRecuperaciones | null>(null);
  const [devoluciones, setDevoluciones] = useState<ReporteDevoluciones | null>(null);

  const {
    loading,
    fetchJabasPorPagar,
    fetchJabasPorCobrar,
    fetchRecuperaciones,
    fetchDevoluciones,
  } = useReportes();

  const handleFilter = async (f: ReportFilters) => {
    if (activeSubTab === 'por-pagar') {
      const data = await fetchJabasPorPagar(f);
      setJabasPagar(data);
    } else if (activeSubTab === 'por-cobrar') {
      const data = await fetchJabasPorCobrar(f);
      setJabasCobrar(data);
    } else if (activeSubTab === 'recuperaciones') {
      const data = await fetchRecuperaciones(f);
      setRecuperaciones(data);
    } else if (activeSubTab === 'devoluciones') {
      const data = await fetchDevoluciones(f);
      setDevoluciones(data);
    }
  };

  const handleClear = () => {
    setJabasPagar(null);
    setJabasCobrar(null);
    setRecuperaciones(null);
    setDevoluciones(null);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'por-pagar', label: 'Jabas por Pagar' },
    { id: 'por-cobrar', label: 'Jabas por Cobrar' },
    { id: 'recuperaciones', label: 'Recuperaciones' },
    { id: 'devoluciones', label: 'Devoluciones' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeSubTab === tab.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <ReportFilter
        onFilter={handleFilter}
        onClear={handleClear}
        loading={loading}
        showEstado={
          activeSubTab === 'por-pagar' || activeSubTab === 'por-cobrar'
        }
        estados={
          activeSubTab === 'por-pagar'
            ? ['pendiente', 'parcial', 'completado', 'observado', 'anulado']
            : activeSubTab === 'por-cobrar'
              ? ['pendiente', 'parcial', 'completado', 'observado', 'anulado']
              : []
        }
      />

      {/* Jabas por Pagar */}
      {activeSubTab === 'por-pagar' && jabasPagar && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Jabas por Pagar
            </h3>
            <ExportButtons
              data={jabasPagar.jabas.map((j) => ({
                id: j.id_jaba_pagar,
                emisor: `${j.cliente_emisor.nombres} ${j.cliente_emisor.apellidos || ''}`,
                tipo_jaba: j.tipo_jaba.nombre,
                fecha_origen: j.fecha_origen,
                cantidad_original: j.cantidad_original,
                cantidad_pagada: j.cantidad_pagada,
                saldo_pendiente: j.saldo_pendiente,
                estado: j.estado,
              }))}
              filename="reporte-jabas-por-pagar"
              title="Reporte de Jabas por Pagar"
              excelSheetName="Jabas por Pagar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ReportCard title="Total Registros" value={jabasPagar.resumen.total_registros} color="blue" />
            <ReportCard title="Total Original" value={jabasPagar.resumen.total_original} icon={<Package className="h-6 w-6" />} color="green" />
            <ReportCard title="Total Pagado" value={jabasPagar.resumen.total_pagado} icon={<ArrowDownCircle className="h-6 w-6" />} color="yellow" />
            <ReportCard title="Total Pendiente" value={jabasPagar.resumen.total_pendiente} icon={<ArrowUpCircle className="h-6 w-6" />} color="red" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Emisor</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo Jaba</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha Origen</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Original</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Pagada</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Saldo</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {jabasPagar.jabas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay registros de jabas por pagar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jabasPagar.jabas.map((j) => (
                        <TableRow key={j.id_jaba_pagar}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.id_jaba_pagar}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {j.cliente_emisor.nombres} {j.cliente_emisor.apellidos || ''}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.tipo_jaba.nombre}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(j.fecha_origen).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.cantidad_original}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.cantidad_pagada}</TableCell>
                          <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{j.saldo_pendiente}</TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge
                              size="sm"
                              color={
                                j.estado === 'completado'
                                  ? 'success'
                                  : j.estado === 'parcial'
                                    ? 'warning'
                                    : j.estado === 'anulado' || j.estado === 'observado'
                                      ? 'error'
                                      : 'light'
                              }
                            >
                              {j.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jabas por Cobrar */}
      {activeSubTab === 'por-cobrar' && jabasCobrar && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Jabas por Cobrar
            </h3>
            <ExportButtons
              data={jabasCobrar.jabas.map((j) => ({
                id: j.id_jaba_cobrar,
                tipo_jaba: j.tipo_jaba.nombre,
                fecha_origen: j.fecha_origen,
                cantidad_original: j.cantidad_original,
                cantidad_recuperada: j.cantidad_recuperada,
                saldo_pendiente: j.saldo_pendiente,
                estado: j.estado,
                fecha_entrega: j.entrega.fecha_entrega,
              }))}
              filename="reporte-jabas-por-cobrar"
              title="Reporte de Jabas por Cobrar"
              excelSheetName="Jabas por Cobrar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ReportCard title="Total Registros" value={jabasCobrar.resumen.total_registros} color="blue" />
            <ReportCard title="Total Original" value={jabasCobrar.resumen.total_original} icon={<Package className="h-6 w-6" />} color="green" />
            <ReportCard title="Total Recuperada" value={jabasCobrar.resumen.total_recuperada} icon={<RotateCcw className="h-6 w-6" />} color="yellow" />
            <ReportCard title="Total Pendiente" value={jabasCobrar.resumen.total_pendiente} icon={<ArrowUpCircle className="h-6 w-6" />} color="red" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo Jaba</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha Origen</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Original</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Recuperada</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Saldo</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {jabasCobrar.jabas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay registros de jabas por cobrar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jabasCobrar.jabas.map((j) => (
                        <TableRow key={j.id_jaba_cobrar}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.id_jaba_cobrar}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.tipo_jaba.nombre}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(j.fecha_origen).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.cantidad_original}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{j.cantidad_recuperada}</TableCell>
                          <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{j.saldo_pendiente}</TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge
                              size="sm"
                              color={
                                j.estado === 'completado'
                                  ? 'success'
                                  : j.estado === 'parcial'
                                    ? 'warning'
                                    : 'light'
                              }
                            >
                              {j.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recuperaciones */}
      {activeSubTab === 'recuperaciones' && recuperaciones && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recuperaciones de Jabas
            </h3>
            <ExportButtons
              data={recuperaciones.recuperaciones.map((r) => ({
                id: r.id_recuperacion,
                fecha: r.fecha_recuperacion,
                tipo: r.tipo_recuperacion,
                cantidad: r.cantidad,
                responsable: r.usuario_responsable
                  ? `${r.usuario_responsable.nombres} ${r.usuario_responsable.apellidos || ''}`
                  : 'N/A',
              }))}
              filename="reporte-recuperaciones"
              title="Reporte de Recuperaciones"
              excelSheetName="Recuperaciones"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ReportCard title="Total Recuperaciones" value={recuperaciones.resumen.total_recuperaciones} color="blue" />
            <ReportCard title="Cantidad Total" value={recuperaciones.resumen.cantidad_total} icon={<RotateCcw className="h-6 w-6" />} color="green" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cantidad</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Responsable</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {recuperaciones.recuperaciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay recuperaciones en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recuperaciones.recuperaciones.map((r) => (
                        <TableRow key={r.id_recuperacion}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{r.id_recuperacion}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(r.fecha_recuperacion).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{r.tipo_recuperacion}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{r.cantidad}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {r.usuario_responsable
                              ? `${r.usuario_responsable.nombres} ${r.usuario_responsable.apellidos || ''}`
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Devoluciones */}
      {activeSubTab === 'devoluciones' && devoluciones && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Devoluciones de Jabas
            </h3>
            <ExportButtons
              data={devoluciones.devoluciones.map((d) => ({
                id: d.id_devolucion,
                fecha: d.fecha_devolucion,
                tipo: d.tipo_devolucion,
                cantidad: d.cantidad,
                responsable: d.usuario_responsable
                  ? `${d.usuario_responsable.nombres} ${d.usuario_responsable.apellidos || ''}`
                  : 'N/A',
              }))}
              filename="reporte-devoluciones"
              title="Reporte de Devoluciones"
              excelSheetName="Devoluciones"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ReportCard title="Total Devoluciones" value={devoluciones.resumen.total_devoluciones} color="blue" />
            <ReportCard title="Cantidad Total" value={devoluciones.resumen.cantidad_total} icon={<ArrowDownCircle className="h-6 w-6" />} color="green" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cantidad</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Responsable</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {devoluciones.devoluciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay devoluciones en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      devoluciones.devoluciones.map((d) => (
                        <TableRow key={d.id_devolucion}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{d.id_devolucion}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(d.fecha_devolucion).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{d.tipo_devolucion}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{d.cantidad}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {d.usuario_responsable
                              ? `${d.usuario_responsable.nombres} ${d.usuario_responsable.apellidos || ''}`
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty states */}
      {activeSubTab === 'por-pagar' && !jabasPagar && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de jabas por pagar.
        </div>
      )}
      {activeSubTab === 'por-cobrar' && !jabasCobrar && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de jabas por cobrar.
        </div>
      )}
      {activeSubTab === 'recuperaciones' && !recuperaciones && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de recuperaciones.
        </div>
      )}
      {activeSubTab === 'devoluciones' && !devoluciones && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de devoluciones.
        </div>
      )}
    </div>
  );
}
