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

interface Cliente {
  id_cliente: number;
  nombres: string;
  apellidos?: string | null;
  telefono?: string | null;
  estado: boolean;
}

// Cache simple en memoria (fuera del componente)
let cachedClientes: Cliente[] | null = null;
let isLoading = false;
let activePromise: Promise<Cliente[]> | null = null;

export default function ClientesTable() {
  const [clientes, setClientes] = useState<Cliente[]>(() => cachedClientes || []);
  const [loading, setLoading] = useState(!cachedClientes);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cargarClientes = useCallback(async () => {
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
          console.log('Petición cancelada');
          return;
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

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
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
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}