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
import { VariedadModal } from '@/components/variedades/VariedadModal';
import { useVariedades } from '@/hooks/useVariedades';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon } from '@/icons';
import type { Variedad } from '@/types/variedad';

// Cache simple en memoria (fuera del componente)
let cachedVariedades: Variedad[] | null = null;
let activePromise: Promise<Variedad[]> | null = null;

export default function VariedadesTable() {
    const [variedades, setVariedades] = useState<Variedad[]>(() => cachedVariedades || []);
    const [loading, setLoading] = useState(!cachedVariedades);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariedad, setSelectedVariedad] = useState<Variedad | null>(null);

    const { remove } = useVariedades();
    const toast = useToast();

    const cargarVariedades = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) {
            cachedVariedades = null;
        }

        if (cachedVariedades) {
            setVariedades(cachedVariedades);
            setLoading(false);
            return;
        }

        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedVariedades) cachedVariedades = data;
                setVariedades(data);
                setLoading(false);
            } catch (err) {
                // Error ya manejado
            }
            return;
        }

        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);

        const promise = (async () => {
            try {
                const data = await fetchWithAuth<Variedad[]>('variedades', { signal: controller.signal });
                cachedVariedades = data;
                setVariedades(data);
                setLoading(false);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    return cachedVariedades || [];
                }
                setError(err.message || 'Error al cargar variedades');
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
        cargarVariedades();
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [cargarVariedades]);

    const handleCreate = () => {
        setSelectedVariedad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (variedad: Variedad) => {
        setSelectedVariedad(variedad);
        setIsModalOpen(true);
    };

    const handleEliminar = async (id: number) => {
        if (window.confirm('¿Está seguro de eliminar esta variedad?')) {
            try {
                await remove(id);
                toast.success('Variedad eliminada');
                cargarVariedades(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar variedad');
            }
        }
    };

    const handleSaved = () => {
        cargarVariedades(true);
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="ml-2">Cargando variedades...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button size="sm" onClick={() => cargarVariedades(true)}>
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
                    Nueva Variedad
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Nombre
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Fruta ID
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
                                {variedades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No hay variedades registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    variedades.map((variedad) => (
                                        <TableRow key={variedad.id_variedad}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {variedad.id_variedad}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {variedad.nombre}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {variedad.fruta_id}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={variedad.estado ? 'success' : 'error'}>
                                                    {variedad.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(variedad)}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminar(variedad.id_variedad)}
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

            {/* Modal */}
            <VariedadModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingVariedad={selectedVariedad}
                onSaved={handleSaved}
            />
        </div>
    );
}