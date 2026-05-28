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
import { MercadoModal } from './MercadoModal';
import { useMercados } from '@/hooks/useMercados';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon, SearchIcon } from '@/icons';
import type { Mercado } from '@/types/mercado';

// Cache simple en memoria
let cachedMercados: Mercado[] | null = null;
let activePromise: Promise<Mercado[]> | null = null;

export default function MercadosTable() {
    const [mercados, setMercados] = useState<Mercado[]>(() => cachedMercados || []);
    const [loading, setLoading] = useState(!cachedMercados);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMercado, setSelectedMercado] = useState<Mercado | null>(null);

    const { remove } = useMercados();
    const toast = useToast();

    const cargarMercados = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) cachedMercados = null;
        if (cachedMercados && !forceRefresh) {
            setMercados(cachedMercados);
            setLoading(false);
            return;
        }
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedMercados) cachedMercados = data;
                setMercados(data);
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
                const data = await fetchWithAuth<Mercado[]>('mercados', { signal: controller.signal });
                cachedMercados = data;
                setMercados(data);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') return cachedMercados || [];
                setError(err.message || 'Error al cargar mercados');
                throw err;
            } finally {
                setLoading(false);
                activePromise = null;
                abortRef.current = null;
            }
        })();
        activePromise = promise;
        return promise;
    }, []);

    useEffect(() => {
        cargarMercados();
        return () => abortRef.current?.abort();
    }, [cargarMercados]);

    const filteredMercados = (mercados || []).filter((m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleCreate = () => {
        setSelectedMercado(null);
        setIsModalOpen(true);
    };

    const handleEdit = (mercado: Mercado) => {
        setSelectedMercado(mercado);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Desactivar el mercado "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success('Mercado desactivado');
                cargarMercados(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar');
            }
        }
    };

    const handleSaved = () => cargarMercados(true);

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Cargando mercados...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="mb-4 text-red-500 dark:text-red-400">Error: {error}</p>
                <Button size="sm" onClick={() => cargarMercados(true)}>
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<PlusIcon className="h-4 w-4 fill-current" />}
                >
                    Nuevo Mercado
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
                                        Sede
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
                                        Dirección/Referencia
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
                                {filteredMercados.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay mercados registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMercados.map((mercado) => (
                                        <TableRow key={mercado.id_lugar}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {mercado.id_lugar}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {mercado.empresas?.razon_social || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {mercado.sedes?.nombre || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {mercado.nombre}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {mercado.direccion_referencia || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={mercado.estado ? 'success' : 'error'}>
                                                    {mercado.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(mercado)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mercado.id_lugar, mercado.nombre)}
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

            <MercadoModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingMercado={selectedMercado}
                onSaved={handleSaved}
            />
        </div>
    );
}