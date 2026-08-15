'use client';

import { useState, useEffect } from 'react';
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
import { Apple, Tag, Star, Package } from 'lucide-react';
import type { ReportFilters, ReporteInventario } from '@/types/reportes';

type SubTab = 'frutas' | 'variedades' | 'calidades' | 'tipos-jaba';

export default function ReporteInventario() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('frutas');
  const [inventario, setInventario] = useState<ReporteInventario | null>(null);

  const { loading, fetchInventario } = useReportes();

  useEffect(() => {
    handleFilter({});
  }, []);

  const handleFilter = async (f: ReportFilters) => {
    const data = await fetchInventario(f);
    setInventario(data);
  };

  const handleClear = () => {
    fetchInventario({}).then(setInventario);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'frutas', label: 'Frutas' },
    { id: 'variedades', label: 'Variedades' },
    { id: 'calidades', label: 'Calidades' },
    { id: 'tipos-jaba', label: 'Tipos de Jaba' },
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

      {/* Frutas */}
      {activeSubTab === 'frutas' && inventario && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Frutas</h3>
            <ExportButtons
              data={inventario.frutas.map((f) => ({
                id: f.id_fruta,
                nombre: f.nombre,
                estado: f.estado ? 'Activo' : 'Inactivo',
                total_variedades: f.total_variedades,
                total_detalles_carga: f.total_detalles_carga,
                total_jabas: f.total_jabas,
              }))}
              filename="reporte-frutas"
              title="Reporte de Frutas"
              excelSheetName="Frutas"
            />
          </div>

          <ReportCard title="Total Frutas" value={inventario.frutas.length} icon={<Apple className="h-6 w-6" />} color="green" />

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Variedades</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cargas</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Jabas</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {inventario.frutas.map((f) => (
                  <TableRow key={f.id_fruta}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.id_fruta}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{f.nombre}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={f.estado ? 'success' : 'error'}>
                        {f.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.total_variedades}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.total_detalles_carga}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.total_jabas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Variedades */}
      {activeSubTab === 'variedades' && inventario && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Variedades</h3>
            <ExportButtons
              data={inventario.variedades.map((v) => ({
                id: v.id_variedad,
                nombre: v.nombre,
                fruta: v.fruta,
                estado: v.estado ? 'Activo' : 'Inactivo',
                total_detalles_carga: v.total_detalles_carga,
                total_jabas: v.total_jabas,
              }))}
              filename="reporte-variedades"
              title="Reporte de Variedades"
              excelSheetName="Variedades"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fruta</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cargas</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Jabas</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {inventario.variedades.map((v) => (
                  <TableRow key={v.id_variedad}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{v.id_variedad}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{v.nombre}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{v.fruta}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={v.estado ? 'success' : 'error'}>
                        {v.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{v.total_detalles_carga}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{v.total_jabas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Calidades */}
      {activeSubTab === 'calidades' && inventario && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Calidades</h3>
            <ExportButtons
              data={inventario.calidades.map((c) => ({
                id: c.id_calidad,
                nombre: c.nombre,
                estado: c.estado ? 'Activo' : 'Inactivo',
                total_usos: c.total_usos,
                cantidad_total: c.cantidad_total,
                monto_total: c.monto_total,
              }))}
              filename="reporte-calidades"
              title="Reporte de Calidades"
              excelSheetName="Calidades"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Usos</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cantidad Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Monto Total</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {inventario.calidades.map((c) => (
                  <TableRow key={c.id_calidad}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{c.id_calidad}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{c.nombre}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={c.estado ? 'success' : 'error'}>
                        {c.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{c.total_usos}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{c.cantidad_total}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                      S/ {c.monto_total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tipos de Jaba */}
      {activeSubTab === 'tipos-jaba' && inventario && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tipos de Jaba</h3>
            <ExportButtons
              data={inventario.tipos_jaba.map((t) => ({
                id: t.id_tipo_jaba,
                nombre: t.nombre,
                tipo_material: t.tipo_material || 'N/A',
                estado: t.estado ? 'Activo' : 'Inactivo',
                total_cargas: t.total_cargas,
                total_jabas: t.total_jabas,
                jabas_por_cobrar: t.jabas_por_cobrar,
                jabas_por_pagar: t.jabas_por_pagar,
              }))}
              filename="reporte-tipos-jaba"
              title="Reporte de Tipos de Jaba"
              excelSheetName="Tipos de Jaba"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Material</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cargas</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Jabas</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Por Cobrar</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Por Pagar</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {inventario.tipos_jaba.map((t) => (
                  <TableRow key={t.id_tipo_jaba}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.id_tipo_jaba}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{t.nombre}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.tipo_material || 'N/A'}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={t.estado ? 'success' : 'error'}>
                        {t.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.total_cargas}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.total_jabas}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.jabas_por_cobrar}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{t.jabas_por_pagar}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
