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
import { SedeModal } from '@/components/sedes/SedeModal';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon } from '@/icons';
import type { Sede } from '@/types/sede';

// Cache simple en memoria (fuera del componente)
let cachedSedes: Sede[] | null = null;
let activePromise: Promise<Sede[]> | null = null;

export default function SedesTable() {
    const [sedes, setSedes] = useState<Sede[]>(() => cachedSedes || []);
    const [loading, setLoading] = useState(!cachedSedes);
    const [error, setError] = useState<string | null>(null);
    const [tipoFilter, setTipoFilter] = useState<string>('');
    const abortRef = useRef<AbortController | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSede, setSelectedSede] = useState<Sede | null>(null);

    const { remove } = useSedes();
    const toast = useToast();

    const cargarSedes = useCallback(async (forceRefresh = false, tipo?: string) => {
        if (forceRefresh) {
            cachedSedes = null;
        }

        // Si ya tenemos datos en caché y no hay filtro, usamos caché
        if (cachedSedes && !tipo && !forceRefresh) {
            setSedes(cachedSedes);
            setLoading(false);
            return;
        }

        // Si ya se está cargando, esperar la misma promesa
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!tipo && !cachedSedes) cachedSedes = data;
                setSedes(data);
                setLoading(false);
            } catch {
                // Error ya manejado
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

        const url = tipo ? `sedes?tipo=${tipo}` : 'sedes';
        const promise = (async () => {
            try {
                const data = await fetchWithAuth<Sede[]>(url, { signal: controller.signal });
                if (!tipo && !cachedSedes) cachedSedes = data;
                setSedes(data);
                setLoading(false);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    return cachedSedes || [];
                }
                setError(err.message || 'Error al cargar sedes');
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

    // Cargar al montar y cuando cambia el filtro
    useEffect(() => {
        cargarSedes(false, tipoFilter);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [tipoFilter, cargarSedes]);

    const handleCreate = () => {
        setSelectedSede(null);
        setIsModalOpen(true);
    };

    const handleEdit = (sede: Sede) => {
        setSelectedSede(sede);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Desactivar la sede "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success('Sede desactivada');
                // Invalidar caché y recargar
                cargarSedes(true, tipoFilter);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar sede');
            }
        }
    };

    const handleSaved = () => {
        cargarSedes(true, tipoFilter);
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2">Cargando sedes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button size="sm" onClick={() => cargarSedes(true, tipoFilter)}>
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Barra de herramientas */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={tipoFilter === '' ? 'primary' : 'outline'}
                        onClick={() => setTipoFilter('')}
                    >
                        Todas
                    </Button>
                    <Button
                        size="sm"
                        variant={tipoFilter === 'origen' ? 'primary' : 'outline'}
                        onClick={() => setTipoFilter('origen')}
                    >
                        Origen
                    </Button>
                    <Button
                        size="sm"
                        variant={tipoFilter === 'destino' ? 'primary' : 'outline'}
                        onClick={() => setTipoFilter('destino')}
                    >
                        Destino
                    </Button>
                </div>
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
                >
                    Nueva Sede
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Empresa
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Nombre
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Tipo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Ciudad
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Estado
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {sedes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No hay sedes registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sedes.map((sede) => (
                                        <TableRow key={sede.id_sede}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {sede.id_sede}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {sede.empresas?.razon_social || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {sede.nombre}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {sede.tipo_sede === 'origen' ? 'Origen' : sede.tipo_sede === 'destino' ? 'Destino' : sede.tipo_sede === 'ambos' ? 'Ambos' : '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {sede.ciudad || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={sede.estado ? 'success' : 'error'}>
                                                    {sede.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(sede)}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sede.id_sede, sede.nombre)}
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

            {/* Modal de creación/edición */}
            <SedeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingSede={selectedSede}
                onSaved={handleSaved}
            />
        </div>
    );
}