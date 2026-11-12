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
import { Truck, Package, FileText, AlertTriangle } from 'lucide-react';
import type { ReportFilters, ReporteCargaPorFecha, ReporteGuias, ReporteEntregas } from '@/types/reportes';

type SubTab = 'cargas' | 'guias' | 'entregas' | 'incidencias';

export default function ReporteOperativo() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cargas');
  const [cargas, setCargas] = useState<ReporteCargaPorFecha[]>([]);
  const [guias, setGuias] = useState<ReporteGuias | null>(null);
  const [entregas, setEntregas] = useState<ReporteEntregas | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});

  const {
    loading,
    fetchCargasPorFecha,
    fetchGuias,
    fetchEntregas,
  } = useReportes();

  const handleFilter = async (f: ReportFilters) => {
    setFilters(f);
    if (activeSubTab === 'cargas') {
      const data = await fetchCargasPorFecha(f);
      setCargas(data);
    } else if (activeSubTab === 'guias') {
      const data = await fetchGuias(f);
      setGuias(data);
    } else if (activeSubTab === 'entregas') {
      const data = await fetchEntregas(f);
      setEntregas(data);
    }
  };

  const handleClear = () => {
    setFilters({});
    setCargas([]);
    setGuias(null);
    setEntregas(null);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'cargas', label: 'Cargas por Fecha' },
    { id: 'guias', label: 'GuÃ­as Operativas' },
    { id: 'entregas', label: 'Entregas' },
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
        showEstado
        estados={
          activeSubTab === 'guias'
            ? ['emitida', 'firmada', 'anulada', 'reemplazada', 'observada']
            : activeSubTab === 'entregas'
              ? ['pendiente', 'entregado_parcial', 'entregado_total', 'rechazado', 'observado']
              : ['pendiente', 'en_curso', 'en_transito', 'repartiendo', 'completado']
        }
      />

      {/* Content */}
      {activeSubTab === 'cargas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Cargas por Fecha
            </h3>
            <ExportButtons
              data={cargas.map((c) => ({
                fecha: c.fecha,
                total_operaciones: c.total_operaciones,
                total_jabas: c.total_jabas,
                total_detalles: c.total_detalles,
              }))}
              filename="reporte-cargas-por-fecha"
              title="Reporte de Cargas por Fecha"
              excelSheetName="Cargas"
            />
          </div>

          {/* Summary Cards */}
          {cargas.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ReportCard
                title="Total Operaciones"
                value={cargas.reduce((sum, c) => sum + c.total_operaciones, 0)}
                icon={<Truck className="h-6 w-6" />}
                color="blue"
              />
              <ReportCard
                title="Total Jabas"
                value={cargas.reduce((sum, c) => sum + c.total_jabas, 0)}
                icon={<Package className="h-6 w-6" />}
                color="green"
              />
              <ReportCard
                title="Total Detalles"
                value={cargas.reduce((sum, c) => sum + c.total_detalles, 0)}
                icon={<FileText className="h-6 w-6" />}
                color="purple"
              />
              <ReportCard
                title="DÃ­as con Cargas"
                value={cargas.length}
                subtitle="En el rango seleccionado"
                icon={<AlertTriangle className="h-6 w-6" />}
                color="yellow"
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Fecha
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Operaciones
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Jabas
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Detalles
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {cargas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay datos. Use los filtros para generar el reporte.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cargas.map((c) => (
                        <TableRow key={c.fecha}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {new Date(c.fecha).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {c.total_operaciones}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {c.total_jabas}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {c.total_detalles}
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

      {activeSubTab === 'guias' && guias && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              GuÃ­as Operativas
            </h3>
            <ExportButtons
              data={guias.guias.map((g) => ({
                numero_guia: g.numero_guia,
                fecha_emision: g.fecha_emision,
                estado: g.estado,
                repartidor: g.repartidor
                  ? `${g.repartidor.nombres} ${g.repartidor.apellidos || ''}`
                  : 'N/A',
                puesto: g.puesto?.codigo_puesto || 'N/A',
                cantidad_items: g.cantidad_items,
                entregas_realizadas: g.entregas_realizadas,
              }))}
              filename="reporte-guias"
              title="Reporte de GuÃ­as Operativas"
              excelSheetName="GuÃ­as"
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <ReportCard title="Emitidas" value={guias.resumen.total_emitidas} color="blue" />
            <ReportCard title="Firmadas" value={guias.resumen.total_firmadas} color="green" />
            <ReportCard title="Anuladas" value={guias.resumen.total_anuladas} color="red" />
            <ReportCard title="Reemplazadas" value={guias.resumen.total_reemplazadas} color="yellow" />
            <ReportCard title="Observadas" value={guias.resumen.total_observadas} color="purple" />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        NÂ° GuÃ­a
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Fecha
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Estado
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Repartidor
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Puesto
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Items
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Entregas
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {guias.guias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay guÃ­as en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      guias.guias.map((g) => (
                        <TableRow key={g.id_guia}>
                          <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                            {g.numero_guia}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {new Date(g.fecha_emision).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge
                              size="sm"
                              color={
                                g.estado === 'firmada'
                                  ? 'success'
                                  : g.estado === 'anulada'
                                    ? 'error'
                                    : g.estado === 'observada'
                                      ? 'warning'
                                      : 'light'
                              }
                            >
                              {g.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {g.repartidor
                              ? `${g.repartidor.nombres} ${g.repartidor.apellidos || ''}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {g.puesto?.codigo_puesto || 'N/A'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {g.cantidad_items}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {g.entregas_realizadas}
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

      {activeSubTab === 'entregas' && entregas && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Entregas Realizadas
            </h3>
            <ExportButtons
              data={entregas.entregas.map((e) => ({
                id_entrega: e.id_entrega,
                fecha_entrega: e.fecha_entrega,
                estado: e.estado_entrega,
                cantidad_entregada: e.cantidad_entregada,
                cantidad_rechazada: e.cantidad_rechazada,
                firma_recibido: e.firma_recibido ? 'SÃ­' : 'No',
                nombre_recibe: e.nombre_recibe || 'N/A',
                numero_guia: e.guia.numero_guia,
                entregador: e.entregador
                  ? `${e.entregador.nombres} ${e.entregador.apellidos || ''}`
                  : 'N/A',
              }))}
              filename="reporte-entregas"
              title="Reporte de Entregas"
              excelSheetName="Entregas"
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <ReportCard title="Total Entregas" value={entregas.resumen.total_entregas} color="blue" />
            <ReportCard title="Entregadas" value={entregas.resumen.entregadas_total} color="green" />
            <ReportCard title="Parciales" value={entregas.resumen.entregadas_parcial} color="yellow" />
            <ReportCard title="Rechazadas" value={entregas.resumen.rechazadas} color="red" />
            <ReportCard
              title="Cant. Entregada"
              value={entregas.resumen.cantidad_total_entregada}
              color="purple"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        ID
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Fecha
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        GuÃ­a
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Estado
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Cant. Entregada
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Cant. Rechazada
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Firma
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                        Entregador
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {entregas.entregas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay entregas en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregas.entregas.map((e) => (
                        <TableRow key={e.id_entrega}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {e.id_entrega}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {new Date(e.fecha_entrega).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {e.guia.numero_guia}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge
                              size="sm"
                              color={
                                e.estado_entrega === 'entregado_total'
                                  ? 'success'
                                  : e.estado_entrega === 'entregado_parcial'
                                    ? 'warning'
                                    : e.estado_entrega === 'rechazado'
                                      ? 'error'
                                      : 'light'
                              }
                            >
                              {e.estado_entrega}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {e.cantidad_entregada}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {e.cantidad_rechazada}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge size="sm" color={e.firma_recibido ? 'success' : 'light'}>
                              {e.firma_recibido ? 'Firmada' : 'Pendiente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {e.entregador
                              ? `${e.entregador.nombres} ${e.entregador.apellidos || ''}`
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

      {activeSubTab === 'cargas' && cargas.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Seleccione un rango de fechas y haga clic en "Filtrar" para generar el reporte.
        </div>
      )}

      {activeSubTab === 'guias' && !guias && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Seleccione un rango de fechas y haga clic en "Filtrar" para generar el reporte.
        </div>
      )}

      {activeSubTab === 'entregas' && !entregas && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Seleccione un rango de fechas y haga clic en "Filtrar" para generar el reporte.
        </div>
      )}
    </div>
  );
}
