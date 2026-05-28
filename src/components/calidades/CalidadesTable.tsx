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
import { CalidadModal } from '@/components/calidades/CalidadModal';
import { useCalidades } from '@/hooks/useCalidades';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon } from '@/icons';
import type { Calidad } from '@/types/calidad';

// Cache simple en memoria (fuera del componente)
let cachedCalidades: Calidad[] | null = null;
let activePromise: Promise<Calidad[]> | null = null;

export default function CalidadesTable() {
    const [calidades, setCalidades] = useState<Calidad[]>(() => cachedCalidades || []);
    const [loading, setLoading] = useState(!cachedCalidades);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCalidad, setSelectedCalidad] = useState<Calidad | null>(null);

    const { remove } = useCalidades();
    const toast = useToast();

    const cargarCalidades = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) {
            cachedCalidades = null;
        }

        // Si ya tenemos datos en caché, usamos caché
        if (cachedCalidades && !forceRefresh) {
            setCalidades(cachedCalidades);
            setLoading(false);
            return;
        }

        // Si ya se está cargando, esperar la misma promesa
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedCalidades) cachedCalidades = data;
                setCalidades(data);
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

        const promise = (async () => {
            try {
                const data = await fetchWithAuth<Calidad[]>('calidades', { signal: controller.signal });
                cachedCalidades = data;
                setCalidades(data);
                setLoading(false);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    return cachedCalidades || [];
                }
                setError(err.message || 'Error al cargar calidades');
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

    // Cargar al montar
    useEffect(() => {
        cargarCalidades();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [cargarCalidades]);

    // Filtrado local por nombre
    const filteredCalidades = calidades.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCalidad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (calidad: Calidad) => {
        setSelectedCalidad(calidad);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Desactivar la calidad "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success('Calidad desactivada');
                // Invalidar caché y recargar
                cargarCalidades(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar calidad');
            }
        }
    };

    const handleSaved = () => {
        cargarCalidades(true);
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2">Cargando calidades...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button size="sm" onClick={() => cargarCalidades(true)}>
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Barra de herramientas */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                    />
                    Searh
                </div>
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
                >
                    Nueva Calidad
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[700px]">
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
                                        Descripción
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
                                {filteredCalidades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No hay calidades registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCalidades.map((calidad) => (
                                        <TableRow key={calidad.id_calidad}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {calidad.id_calidad}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {calidad.empresas?.razon_social || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {calidad.nombre}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {calidad.descripcion || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={calidad.estado ? 'success' : 'error'}>
                                                    {calidad.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(calidad)}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(calidad.id_calidad, calidad.nombre)}
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
            <CalidadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingCalidad={selectedCalidad}
                onSaved={handleSaved}
            />
        </div>
    );
}