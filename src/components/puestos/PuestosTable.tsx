'use client';

import { useEffect, useState } from 'react';
import { usePuestos } from '@/hooks/usePuestos';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { useToast } from '@/hooks/useToast';
import { usePuestosUIStore } from '@/stores/puestosStore';
import { TIPOS_LUGAR } from '@/types/enums';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { PuestoModal } from './PuestoModal';
import { PencilIcon, TrashBinIcon, PlusIcon, SearchIcon } from '@/icons';
import type { Puesto } from '@/types/puesto';

export default function PuestosTable() {
  const { puestos, loading, fetchAll, remove } = usePuestos();
  const { lugarOpertivo, fetchAll: fetchMercados } = useLugarOperativo();
  const toast = useToast();

  const { search, mercadoId, tipoLugar, setSearch, setMercadoId, setTipoLugar, resetFilters } =
    usePuestosUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState<Puesto | null>(null);

  useEffect(() => {
    fetchAll();
    fetchMercados();
  }, []);

  const filteredPuestos = (puestos || []).filter((p) => {
    if (search && !p.numero_puesto.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (mercadoId && p.id_lugar !== Number(mercadoId)) return false;
    if (tipoLugar && (p.lugares_operativos as any)?.tipo_lugar !== tipoLugar) return false;
    return true;
  });

  const handleCreate = () => {
    setSelectedPuesto(null);
    setIsModalOpen(true);
  };

  const handleEdit = (puesto: Puesto) => {
    setSelectedPuesto(puesto);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, numero: string) => {
    if (window.confirm(`¿Desactivar el puesto "${numero}"?`)) {
      try {
        await remove(id);
        toast.success('Puesto desactivado');
        fetchAll();
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar');
      }
    }
  };

  const handleSaved = () => fetchAll();

  const mercadosOptions = [
    { value: '', label: 'Todos los mercados' },
    ...lugarOpertivo.map((m) => ({
      value: m.id_lugar.toString(),
      label: m.nombre,
    })),
  ];

  const tiposLugarOptions = [
    { value: '', label: 'Todos los tipos' },
    ...TIPOS_LUGAR.map((tipo) => ({
      value: tipo,
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    })),
  ];

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-700 dark:text-gray-300">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-2">Cargando puestos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 ">
        <div className='flex flex-wrap gap-4'>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar por número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <select
            value={mercadoId}
            onChange={(e) => setMercadoId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            {mercadosOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={tipoLugar}
            onChange={(e) => setTipoLugar(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            {tiposLugarOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {(search || mercadoId || tipoLugar) && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>



        <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="h-4 w-4" />}>
          Nuevo Puesto
        </Button>

      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Empresa</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Mercado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Número</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Referencia</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredPuestos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay puestos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPuestos.map((puesto) => (
                    <TableRow key={puesto.id_puesto}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{puesto.id_puesto}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{puesto.empresas?.razon_social || '—'}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{puesto.lugares_operativos?.nombre || '—'}</TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{puesto.numero_puesto}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{puesto.referencia || '—'}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={puesto.estado ? 'success' : 'error'}>
                          {puesto.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEdit(puesto)} className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400" title="Editar">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(puesto.id_puesto, puesto.numero_puesto)} className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400" title="Eliminar">
                            <TrashBinIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <PuestoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingPuesto={selectedPuesto}
        onSaved={handleSaved}
      />
    </div>
  );
}