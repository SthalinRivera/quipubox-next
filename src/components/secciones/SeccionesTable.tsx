'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { SeccionModal } from './SeccionModal';
import { useSecciones } from '@/hooks/useSecciones';
import { usePuestos } from '@/hooks/usePuestos';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, SearchIcon, PlusIcon } from '@/icons';
import type { Seccion } from '@/types/seccion';

// Cache de todas las secciones (opcional)
let cachedSecciones: Seccion[] | null = null;

export default function SeccionesTable() {
  const [secciones, setSecciones] = useState<Seccion[]>(cachedSecciones || []);
  const [filteredSecciones, setFilteredSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(!cachedSecciones);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPuestoId, setFilterPuestoId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null);

  const { fetchAll, remove } = useSecciones();
  const { puestos, fetchAll: fetchPuestos } = usePuestos();
  const toast = useToast();
  const abortRef = useRef<AbortController | null>(null);
  let cachedPromise: Promise<Seccion[]> | null = null;

  // Cargar puestos para el filtro
  useEffect(() => {
    fetchPuestos();
  }, []);

  // Cargar todas las secciones al montar
  useEffect(() => {
    const load = async () => {
      if (cachedSecciones) {
        setSecciones(cachedSecciones);
        setLoading(false);
        return;
      }
      if (cachedPromise) {
        try {
          const data = await cachedPromise;
          setSecciones(data);
          setLoading(false);
        } catch {}
        return;
      }
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      const promise = fetchAll()
        .then((data) => {
          cachedSecciones = data;
          setSecciones(data);
          return data;
        })
        .catch((err) => {
          if (err.name !== 'AbortError')
            setError(err.message || 'Error al cargar secciones');
          throw err;
        })
        .finally(() => {
          setLoading(false);
          abortRef.current = null;
          cachedPromise = null;
        });
      cachedPromise = promise;
      await promise;
    };
    load();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  // Filtrar localmente por puesto y texto
  useEffect(() => {
    let filtered = [...secciones];
    if (filterPuestoId) {
      filtered = filtered.filter((s) => s.id_puesto === Number(filterPuestoId));
    }
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredSecciones(filtered);
  }, [secciones, filterPuestoId, searchTerm]);

  const handleCreate = () => {
    setSelectedSeccion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (seccion: Seccion) => {
    setSelectedSeccion(seccion);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Desactivar la sección "${nombre}"?`)) {
      try {
        await remove(id);
        toast.success('Sección desactivada');
        // Recargar todas las secciones
        cachedSecciones = null;
        const data = await fetchAll();
        setSecciones(data);
        setFilteredSecciones(data);
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar');
      }
    }
  };

  const handleSaved = async () => {
    cachedSecciones = null;
    const data = await fetchAll();
    setSecciones(data);
    setFilteredSecciones(data);
    setIsModalOpen(false);
  };

  const puestosOptions = [
    { value: '', label: 'Todos los puestos' },
    ...puestos.map((p) => ({
      value: p.id_puesto.toString(),
      label: `${p.numero_puesto}${p.referencia ? ` - ${p.referencia}` : ''}`,
    })),
  ];

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          Cargando secciones...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-red-500 dark:text-red-400">Error: {error}</p>
        <Button
          size="sm"
          onClick={() => {
            cachedSecciones = null;
            window.location.reload();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <select
            value={filterPuestoId}
            onChange={(e) => setFilterPuestoId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            {puestosOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          startIcon={<PlusIcon className="h-4 w-4 fill-current" />}
        >
          Nueva Sección
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
                    Nombre
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Descripción
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                  >
                    Observaciones
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
                {filteredSecciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No hay secciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSecciones.map((seccion) => (
                    <TableRow key={seccion.id_seccion}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {seccion.id_seccion}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                        {seccion.nombre_seccion}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {seccion.descripcion || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {seccion.observaciones || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={seccion.estado ? 'success' : 'error'}
                        >
                          {seccion.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(seccion)}
                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(seccion.id_seccion, seccion.nombre_seccion)
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

      <SeccionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingSeccion={selectedSeccion}
        onSaved={handleSaved}
      />
    </div>
  );
}