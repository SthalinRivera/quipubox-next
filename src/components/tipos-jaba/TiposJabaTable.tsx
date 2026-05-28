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
import { TipoJabaModal } from './TipoJabaModal';
import { useTiposJaba } from '@/hooks/useTiposJaba';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon, SearchIcon } from '@/icons';
import type { TipoJaba } from '@/types/tipoJaba';

// Cache simple en memoria
let cachedTipos: TipoJaba[] | null = null;
let activePromise: Promise<TipoJaba[]> | null = null;

export default function TiposJabaTable() {
    const [tipos, setTipos] = useState<TipoJaba[]>(() => cachedTipos || []);
    const [loading, setLoading] = useState(!cachedTipos);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState<TipoJaba | null>(null);

    const { remove } = useTiposJaba();
    const toast = useToast();

    const cargarTipos = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) cachedTipos = null;
        if (cachedTipos && !forceRefresh) {
            setTipos(cachedTipos);
            setLoading(false);
            return;
        }
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedTipos) cachedTipos = data;
                setTipos(data);
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
                const data = await fetchWithAuth<TipoJaba[]>('tipos-jaba', { signal: controller.signal });
                cachedTipos = data;
                setTipos(data);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') return cachedTipos || [];
                setError(err.message || 'Error al cargar tipos de jaba');
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
        cargarTipos();
        return () => abortRef.current?.abort();
    }, [cargarTipos]);

    const filteredTipos = tipos.filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedTipo(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tipo: TipoJaba) => {
        setSelectedTipo(tipo);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Desactivar el tipo de jaba "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success('Tipo de jaba desactivado');
                cargarTipos(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar');
            }
        }
    };

    const handleSaved = () => cargarTipos(true);

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2">Cargando tipos de jaba...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button size="sm" onClick={() => cargarTipos(true)}>Reintentar</Button>
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
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="w-4 h-4 fill-current" />}>
                    Nuevo Tipo de Jaba
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
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Material</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredTipos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No hay tipos de jaba registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTipos.map((tipo) => (
                                        <TableRow key={tipo.id_tipo_jaba}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{tipo.id_tipo_jaba}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{tipo.empresas?.razon_social || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{tipo.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{tipo.tipo_material || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{tipo.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={tipo.estado ? 'success' : 'error'}>
                                                    {tipo.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(tipo)} className="text-gray-500 hover:text-brand-500">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(tipo.id_tipo_jaba, tipo.nombre)} className="text-gray-500 hover:text-error-500">
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

            <TipoJabaModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingTipo={selectedTipo}
                onSaved={handleSaved}
            />
        </div>
    );
}