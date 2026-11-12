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
import { Users, Shield, Activity, Key } from 'lucide-react';
import type {
  ReportFilters,
  ReporteUsuariosRoles,
  ReporteActividadUsuarios,
  ReporteModulosPorRol,
} from '@/types/reportes';

type SubTab = 'usuarios-roles' | 'actividad' | 'modulos-por-rol';

export default function ReporteUsuarios() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('usuarios-roles');
  const [usuariosRoles, setUsuariosRoles] = useState<ReporteUsuariosRoles | null>(null);
  const [actividad, setActividad] = useState<ReporteActividadUsuarios | null>(null);
  const [modulosPorRol, setModulosPorRol] = useState<ReporteModulosPorRol | null>(null);

  const {
    loading,
    fetchUsuariosRoles,
    fetchActividadUsuarios,
    fetchModulosPorRol,
  } = useReportes();

  const handleFilter = async (f: ReportFilters) => {
    if (activeSubTab === 'usuarios-roles') {
      const data = await fetchUsuariosRoles(f);
      setUsuariosRoles(data);
    } else if (activeSubTab === 'actividad') {
      const data = await fetchActividadUsuarios(f);
      setActividad(data);
    } else if (activeSubTab === 'modulos-por-rol') {
      const data = await fetchModulosPorRol(f);
      setModulosPorRol(data);
    }
  };

  const handleClear = () => {
    setUsuariosRoles(null);
    setActividad(null);
    setModulosPorRol(null);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'usuarios-roles', label: 'Usuarios y Roles' },
    { id: 'actividad', label: 'Actividad (Logs)' },
    { id: 'modulos-por-rol', label: 'Módulos por Rol' },
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

      {/* Usuarios y Roles */}
      {activeSubTab === 'usuarios-roles' && usuariosRoles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Usuarios y Roles</h3>
            <ExportButtons
              data={usuariosRoles.usuarios.map((u) => ({
                id: u.id_usuario,
                nombres: u.nombres,
                apellidos: u.apellidos || '',
                email: u.email,
                estado: u.estado ? 'Activo' : 'Inactivo',
                sede: u.ubicacion,
                roles: u.roles.join(', '),
                total_operaciones: u.total_operaciones,
                total_entregas: u.total_entregas,
                total_logs: u.total_logs,
              }))}
              filename="reporte-usuarios-roles"
              title="Reporte de Usuarios y Roles"
              excelSheetName="Usuarios"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ReportCard title="Total Usuarios" value={usuariosRoles.resumen.total_usuarios} icon={<Users className="h-6 w-6" />} color="blue" />
            <ReportCard title="Activos" value={usuariosRoles.resumen.usuarios_activos} icon={<Shield className="h-6 w-6" />} color="green" />
            <ReportCard title="Inactivos" value={usuariosRoles.resumen.usuarios_inactivos} color="red" />
            <ReportCard
              title="Roles"
              value={usuariosRoles.resumen.por_rol.length}
              subtitle={usuariosRoles.resumen.por_rol.map((r) => `${r.rol}: ${r.cantidad}`).join(', ')}
              color="purple"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Email</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Sede</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Roles</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Operaciones</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Entregas</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {usuariosRoles.usuarios.map((u) => (
                      <TableRow key={u.id_usuario}>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{u.id_usuario}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                          {u.nombres} {u.apellidos || ''}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{u.ubicacion}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((rol, idx) => (
                              <Badge key={idx} size="sm" color="primary">{rol}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge size="sm" color={u.estado ? 'success' : 'error'}>
                            {u.estado ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{u.total_operaciones}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{u.total_entregas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actividad */}
      {activeSubTab === 'actividad' && actividad && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Actividad de Usuarios</h3>
            <ExportButtons
              data={actividad.logs.map((l) => ({
                id: l.id_log,
                accion: l.accion,
                tabla: l.tabla_afectada || 'N/A',
                id_registro: l.id_registro || 'N/A',
                fecha: l.created_at,
                usuario: l.usuario
                  ? `${l.usuario.nombres} ${l.usuario.apellidos || ''}`
                  : 'Sistema',
              }))}
              filename="reporte-actividad-usuarios"
              title="Reporte de Actividad de Usuarios"
              excelSheetName="Actividad"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ReportCard title="Total Logs" value={actividad.resumen.total_logs} icon={<Activity className="h-6 w-6" />} color="blue" />
            <ReportCard
              title="Top Usuarios"
              value={actividad.resumen.por_usuario.length}
              subtitle={actividad.resumen.por_usuario.slice(0, 3).map((u) => `${u.usuario}: ${u.total}`).join(', ')}
              color="green"
            />
            <ReportCard
              title="Acciones"
              value={actividad.resumen.por_accion.length}
              subtitle={actividad.resumen.por_accion.slice(0, 3).map((a) => `${a.accion}: ${a.total}`).join(', ')}
              color="purple"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acción</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tabla</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Registro</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Usuario</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {actividad.logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay logs de actividad en el rango seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      actividad.logs.map((l) => (
                        <TableRow key={l.id_log}>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{l.id_log}</TableCell>
                          <TableCell className="px-5 py-4">
                            <Badge size="sm" color={
                              l.accion.includes('CREATE') || l.accion.includes('create')
                                ? 'success'
                                : l.accion.includes('DELETE') || l.accion.includes('delete')
                                  ? 'error'
                                  : l.accion.includes('UPDATE') || l.accion.includes('update')
                                    ? 'warning'
                                    : 'light'
                            }>
                              {l.accion}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{l.tabla_afectada || 'N/A'}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{l.id_registro || 'N/A'}</TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                            {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                            {l.usuario
                              ? `${l.usuario.nombres} ${l.usuario.apellidos || ''}`
                              : 'Sistema'}
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

      {/* Módulos por Rol */}
      {activeSubTab === 'modulos-por-rol' && modulosPorRol && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Módulos por Rol</h3>
            <ExportButtons
              data={modulosPorRol.roles.flatMap((r) =>
                r.modulos.map((m) => ({
                  rol: r.nombre,
                  modulo: m.nombre,
                  ruta: m.ruta,
                  categoria: m.categoria,
                })),
              )}
              filename="reporte-modulos-por-rol"
              title="Reporte de Módulos por Rol"
              excelSheetName="Módulos por Rol"
            />
          </div>

          {modulosPorRol.roles.map((rol) => (
            <div key={rol.id_rol_usuario} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {rol.nombre}
                  {rol.descripcion && <span className="text-sm text-gray-400 ml-2">({rol.descripcion})</span>}
                </h4>
                <Badge size="sm" color="primary">{rol.total_modulos} módulos</Badge>
              </div>
              {rol.modulos.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-white/5">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Módulo</TableCell>
                        <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Ruta</TableCell>
                        <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Categoría</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {rol.modulos.map((m) => (
                        <TableRow key={m.id_modulo}>
                          <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{m.nombre}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{m.ruta}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.categoria}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin módulos asignados</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {activeSubTab === 'usuarios-roles' && !usuariosRoles && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de usuarios y roles.
        </div>
      )}
      {activeSubTab === 'actividad' && !actividad && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de actividad de usuarios.
        </div>
      )}
      {activeSubTab === 'modulos-por-rol' && !modulosPorRol && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Use los filtros para generar el reporte de módulos por rol.
        </div>
      )}
    </div>
  );
}
