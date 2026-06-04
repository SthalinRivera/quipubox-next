'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
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
import { usePuestos } from '@/hooks/usePuestos';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon, SearchIcon } from '@/icons';
import type { Puesto } from '@/types/puesto';
import type { Cliente } from '@/types/cliente';

// Cache simple en memoria
let cachedPuestos: Puesto[] | null = null;
let activePromise: Promise<Puesto[]> | null = null;

export default function PuestosTable() {
  const [puestos, setPuestos] = useState<Puesto[]>(() => cachedPuestos || []);
  const [loading, setLoading] = useState(!cachedPuestos);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMercadoId, setFilterMercadoId] = useState<string>('');
  const [filterClienteId, setFilterClienteId] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState<Puesto | null>(null);

  const { remove, fetchAll, fetchByMercado, fetchByCliente } = usePuestos();
  const { lugarOpertivo, fetchAll: fetchMercados } = useLugarOperativo();
  const { clientes, fetchAll: fetchClientes } = useClientes();
  const toast = useToast();

  // Cargar listas de filtro
  useEffect(() => {
    fetchMercados();
    fetchClientes();
  }, [fetchMercados, fetchClientes]);

  // ✅ clientes ya es un array (Cliente[])
  const clientesList = Array.isArray(clientes) ? clientes : [];
  const clientesOptions = [
    { value: '', label: 'Todos los clientes' },
    ...clientesList.map((c: Cliente) => ({
      value: c.id_cliente.toString(),
      label: `${c.nombres} ${c.apellidos || ''}`.trim(),
    })),
  ];

  const cargarPuestos = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) cachedPuestos = null;

      let dataPromise: Promise<Puesto[]> | null = null;
      if (filterMercadoId) {
        dataPromise = fetchByMercado(Number(filterMercadoId));
      } else if (filterClienteId) {
        dataPromise = fetchByCliente(Number(filterClienteId));
      } else {
        if (cachedPuestos && !forceRefresh) {
          setPuestos(cachedPuestos);
          setLoading(false);
          return;
        }
        dataPromise = fetchAll();
      }

      if (!dataPromise) return;

      if (activePromise && activePromise === dataPromise) {
        try {
          const data = await activePromise;
          if (!filterMercadoId && !filterClienteId && !cachedPuestos)
            cachedPuestos = data;
          setPuestos(data);
          setLoading(false);
        } catch { }
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      const promise = (async () => {
        try {
          const data = await dataPromise;
          if (!filterMercadoId && !filterClienteId && !cachedPuestos)
            cachedPuestos = data;
          setPuestos(data);
          return data;
        } catch (err: any) {
          if (err.name === 'AbortError') return [];
          setError(err.message || 'Error al cargar puestos');
          throw err;
        } finally {
          setLoading(false);
          activePromise = null;
          abortRef.current = null;
        }
      })();
      activePromise = promise;
      return promise;
    },
    [filterMercadoId, filterClienteId, fetchAll, fetchByMercado, fetchByCliente],
  );

  useEffect(() => {
    cargarPuestos(true);
    return () => abortRef.current?.abort();
  }, [filterMercadoId, filterClienteId, cargarPuestos]);

  const filteredPuestos = (puestos || []).filter((p) =>
    p.numero_puesto.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        cargarPuestos(true);
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar');
      }
    }
  };

  const handleSaved = () => cargarPuestos(true);

  const mercadosOptions = [
    { value: '', label: 'Todos los mercados' },
    ...lugarOpertivo.map((m) => ({
      value: m.id_lugar.toString(),
      label: m.nombre,
    })),
  ];

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          Cargando puestos...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-red-500 dark:text-red-400">Error: {error}</p>
        <Button size="sm" onClick={() => cargarPuestos(true)}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={filterMercadoId}
            onChange={(e) => {
              setFilterMercadoId(e.target.value);
              setFilterClienteId('');
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            {mercadosOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filterClienteId}
            onChange={(e) => {
              setFilterClienteId(e.target.value);
              setFilterMercadoId('');
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            {clientesOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          startIcon={<PlusIcon className="h-4 w-4 fill-current" />}
        >
          Nuevo Puesto
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Empresa
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Mercado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Número
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Referencia
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredPuestos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No hay puestos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPuestos.map((puesto) => (
                    <TableRow key={puesto.id_puesto}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {puesto.id_puesto}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {puesto.empresas?.razon_social || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {puesto.lugares_operativos?.nombre || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {puesto.numero_puesto}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {puesto.referencia || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={puesto.estado ? 'success' : 'error'}
                        >
                          {puesto.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(puesto)}
                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(puesto.id_puesto, puesto.numero_puesto)
                            }
                            className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                            title="Eliminar"
                          >
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