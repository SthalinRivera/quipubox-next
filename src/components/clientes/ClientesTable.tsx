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
import { ClienteModal } from '@/components/clientes/ClienteModal';
import { ClienteSedesModal } from '@/components/clientes/ClientePuestosModal';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon, ListIcon } from '@/icons';
import type { Cliente } from '@/types/cliente';

// Cache simple en memoria (fuera del componente)
let cachedClientes: Cliente[] | null = null;
let isLoading = false;
let activePromise: Promise<Cliente[]> | null = null;

export default function ClientesTable() {
  const [clientes, setClientes] = useState<Cliente[]>(() => cachedClientes || []);
  const [loading, setLoading] = useState(!cachedClientes);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSedesOpen, setIsSedesOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const { remove } = useClientes();
  const toast = useToast();

  const cargarClientes = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      cachedClientes = null;
    }

    // Si ya tenemos datos en caché, no hacemos nada
    if (cachedClientes) {
      setClientes(cachedClientes);
      setLoading(false);
      return;
    }

    // Si ya se está cargando, esperar la misma promesa
    if (activePromise) {
      try {
        const data = await activePromise;
        if (!cachedClientes) cachedClientes = data;
        setClientes(data);
        setLoading(false);
      } catch (err) {
        // El error ya se manejará en el bloque catch original
      }
      return;
    }

    // Cancelar petición anterior si existe
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const data = await fetchWithAuth<Cliente[]>('clientes', { signal: controller.signal });
        cachedClientes = data;
        setClientes(data);
        setLoading(false);
        return data;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // No hacer nada, solo retornar
          return cachedClientes || [];
        }
        setError(err.message || 'Error al cargar clientes');
        setLoading(false);
        throw err;
      } finally {
        activePromise = null;
        abortRef.current = null;
      }
    })();

    activePromise = promise;
    return promise;
  }, []);

  useEffect(() => {
    cargarClientes();
    // Cleanup: abortar petición si el componente se desmonta
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [cargarClientes]);

  const handleCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleSedes = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsSedesOpen(true);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await remove(id);
        toast.success('Cliente eliminado');
        // Invalidar caché y recargar
        cargarClientes(true);
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar cliente');
      }
    }
  };

  const handleSaved = () => {
    cargarClientes(true);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button size="sm" onClick={() => cargarClientes(true)}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón de acción superior */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleCreate}
          startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
        >
          Nuevo Cliente
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Nombres
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Apellidos
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Teléfono
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Estado
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No hay clientes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => (
                    <TableRow key={cliente.id_cliente}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {cliente.id_cliente}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {cliente.nombres}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {cliente.apellidos || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {cliente.telefono || '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={cliente.estado ? 'success' : 'error'}>
                          {cliente.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="text-gray-500 hover:text-brand-500 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleSedes(cliente)}
                            className="text-gray-500 hover:text-brand-500 transition-colors"
                            title="Sedes"
                          >
                            <ListIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEliminar(cliente.id_cliente)}
                            className="text-gray-500 hover:text-error-500 transition-colors"
                            title="Eliminar"
                          >
                            <TrashBinIcon className="w-5 h-5" />
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

      {/* Modales */}
      <ClienteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingCliente={selectedCliente}
        onSaved={handleSaved}
      />

      <ClienteSedesModal
        open={isSedesOpen}
        onOpenChange={setIsSedesOpen}
        cliente={selectedCliente}
      />
    </div>
  );
}