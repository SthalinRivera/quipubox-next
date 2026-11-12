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
import { Users, MapPin } from 'lucide-react';
import type {
  ReportFilters,
  ReporteClientesPorUbicacion,
  ReporteClientesPorPuesto,
  ReporteHistorialAsignacionPuestos,
} from '@/types/reportes';

type SubTab = 'por-ubicacion' | 'por-puesto' | 'historial';

export default function ReporteClientesPuestos() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('por-ubicacion');
  const [clientesPorUbicacion, setClientesPorUbicacion] = useState<ReporteClientesPorUbicacion[]>([]);
  const [clientesPorPuesto, setClientesPorPuesto] = useState<ReporteClientesPorPuesto[]>([]);
  const [historial, setHistorial] = useState<ReporteHistorialAsignacionPuestos | null>(null);

  const {
    loading,
    fetchClientesPorUbicacion,
    fetchClientesPorPuesto,
    fetchHistorialAsignacionPuestos,
  } = useReportes();

  const handleFilter = async (f: ReportFilters) => {
    if (activeSubTab === 'por-ubicacion') {
      const data = await fetchClientesPorUbicacion(f);
      setClientesPorUbicacion(data);
    } else if (activeSubTab === 'por-puesto') {
      const data = await fetchClientesPorPuesto(f);
      setClientesPorPuesto(data);
    } else if (activeSubTab === 'historial') {
      const data = await fetchHistorialAsignacionPuestos(f);
      setHistorial(data);
    }
  };

  const handleClear = () => {
    setClientesPorUbicacion([]);
    setClientesPorPuesto([]);
    setHistorial(null);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'por-ubicacion', label: 'Clientes por Ubicación' },
    { id: 'por-puesto', label: 'Clientes por Puesto' },
    { id: 'historial', label: 'Historial Asignación' },
  ];

  return (
    <div className="space-y-6">
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

      <ReportFilter onFilter={handleFilter} onClear={handleClear} loading={loading} />

      {/* Clientes por Ubicación */}
      {activeSubTab === 'por-ubicacion' && clientesPorUbicacion.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Clientes por Ubicación</h3>
            <ExportButtons
              data={clientesPorUbicacion.flatMap((s) =>
                s.clientes.map((c) => ({
                  ubicacion: s.ubicacion.nombre,
                  cliente: `${c.nombres} ${c.apellidos || ''}`,
                  tipo_relacion: c.tipo_relacion,
                  puestos: c.puestos_asignados.map((p) => p.codigo_puesto).join(', ') || 'N/A',
                })),
              )}
              filename="reporte-clientes-por-ubicacion"
              title="Reporte de Clientes por Ubicación"
              excelSheetName="Clientes por Ubicación"
            />
          </div>

          {clientesPorUbicacion.map((sede) => (
            <div key={sede.ubicacion.id_ubigeo} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {sede.ubicacion.nombre}
                  {sede.ubicacion.ciudad && <span className="text-gray-400 ml-2">({sede.ubicacion.ciudad})</span>}
                </h4>
                <Badge size="sm" color="primary">{sede.total_clientes} clientes</Badge>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-white/5">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Cliente</TableCell>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Tipo</TableCell>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Puestos</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {sede.clientes.map((c) => (
                      <TableRow key={c.id_cliente}>
                        <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                          {c.nombres} {c.apellidos || ''}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge size="sm" color={c.tipo_relacion === 'emisor' ? 'primary' : 'success'}>
                            {c.tipo_relacion}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {c.puestos_asignados.length > 0
                            ? c.puestos_asignados.map((p) => `${p.codigo_puesto} (${p.lugar})`).join(', ')
                            : 'Sin puesto'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clientes por Puesto */}
      {activeSubTab === 'por-puesto' && clientesPorPuesto.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Clientes por Puesto</h3>
            <ExportButtons
              data={clientesPorPuesto.flatMap((p) =>
                p.clientes.map((c) => ({
                  ubicacion: p.puesto.ubicacion,
                  lugar: p.puesto.lugar,
                  puesto: p.puesto.codigo_puesto,
                  cliente: `${c.nombres} ${c.apellidos || ''}`,
                  fecha_inicio: c.fecha_inicio,
                  seccion: c.seccion || 'N/A',
                  estado: c.estado ? 'Activo' : 'Inactivo',
                })),
              )}
              filename="reporte-clientes-por-puesto"
              title="Reporte de Clientes por Puesto"
              excelSheetName="Clientes por Puesto"
            />
          </div>

          {clientesPorPuesto.map((puesto) => (
            <div key={puesto.puesto.id_puesto} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Puesto {puesto.puesto.codigo_puesto}
                  <span className="text-gray-400 ml-2">({puesto.puesto.lugar} - {puesto.puesto.ubicacion})</span>
                </h4>
                <Badge size="sm" color="primary">{puesto.total_clientes} clientes</Badge>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-white/5">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Cliente</TableCell>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Fecha Inicio</TableCell>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Sección</TableCell>
                      <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {puesto.clientes.map((c) => (
                      <TableRow key={c.id_cliente}>
                        <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                          {c.nombres} {c.apellidos || ''}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {c.seccion || 'N/A'}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge size="sm" color={c.estado ? 'success' : 'error'}>
                            {c.estado ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      {activeSubTab === 'historial' && historial && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Historial de Asignación de Puestos</h3>
            <ExportButtons
              data={historial.asignaciones.map((a) => ({
                cliente: `${a.cliente.nombres} ${a.cliente.apellidos || ''}`,
                puesto: `${a.puesto.codigo_puesto} (${a.puesto.lugar})`,
                fecha_inicio: a.fecha_inicio,
                fecha_fin: a.fecha_fin || 'Actual',
                seccion: a.seccion || 'N/A',
                estado: a.estado ? 'Activo' : 'Inactivo',
              }))}
              filename="reporte-historial-asignacion"
              title="Historial de Asignación de Puestos"
              excelSheetName="Historial"
            />
          </div>

          <ReportCard title="Total Asignaciones" value={historial.total_asignaciones} color="blue" />

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Puesto</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Lugar</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha Inicio</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha Fin</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Sección</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {historial.asignaciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay asignaciones en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historial.asignaciones.map((a) => (
                        <TableRow key={a.id_cliente_puesto}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {a.cliente.nombres} {a.cliente.apellidos || ''}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {a.puesto.codigo_puesto}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {a.puesto.lugar}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {a.fecha_inicio ? new Date(a.fecha_inicio).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {a.fecha_fin ? new Date(a.fecha_fin).toLocaleDateString() : 'Actual'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                            {a.seccion || 'N/A'}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge size="sm" color={a.estado ? 'success' : 'error'}>
                              {a.estado ? 'Activo' : 'Inactivo'}
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

      {/* Empty states */}
      {activeSubTab === 'por-ubicacion' && clientesPorUbicacion.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de clientes por ubicación.
        </div>
      )}
      {activeSubTab === 'por-puesto' && clientesPorPuesto.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de clientes por puesto.
        </div>
      )}
      {activeSubTab === 'historial' && !historial && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de historial de asignación.
        </div>
      )}
    </div>
  );
}
