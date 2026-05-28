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
import { CamionModal } from './CamionModal';
import { useCamiones } from '@/hooks/useCamiones';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon, SearchIcon } from '@/icons';
import type { Camion } from '@/types/camion';

// Cache simple en memoria
let cachedCamiones: Camion[] | null = null;
let activePromise: Promise<Camion[]> | null = null;

export default function CamionesTable() {
    const [camiones, setCamiones] = useState<Camion[]>(() => cachedCamiones || []);
    const [loading, setLoading] = useState(!cachedCamiones);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCamion, setSelectedCamion] = useState<Camion | null>(null);

    const { remove } = useCamiones();
    const toast = useToast();

    const cargarCamiones = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) cachedCamiones = null;
        if (cachedCamiones && !forceRefresh) {
            setCamiones(cachedCamiones);
            setLoading(false);
            return;
        }
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedCamiones) cachedCamiones = data;
                setCamiones(data);
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
                const data = await fetchWithAuth<Camion[]>('camiones', { signal: controller.signal });
                cachedCamiones = data;
                setCamiones(data);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') return cachedCamiones || [];
                setError(err.message || 'Error al cargar camiones');
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
        cargarCamiones();
        return () => abortRef.current?.abort();
    }, [cargarCamiones]);

    const filteredCamiones = camiones.filter(c =>
        c.placa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCamion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (camion: Camion) => {
        setSelectedCamion(camion);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, placa: string) => {
        if (window.confirm(`¿Desactivar el camión con placa "${placa}"?`)) {
            try {
                await remove(id);
                toast.success('Camión desactivado');
                cargarCamiones(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar');
            }
        }
    };

    const handleSaved = () => cargarCamiones(true);

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-2">Cargando camiones...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button size="sm" onClick={() => cargarCamiones(true)}>Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="w-4 h-4 fill-current" />}>
                    Nuevo Camión
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
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Placa</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredCamiones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No hay camiones registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCamiones.map((camion) => (
                                        <TableRow key={camion.id_camion}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{camion.id_camion}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{camion.empresas?.razon_social || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 font-medium">{camion.placa}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{camion.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={camion.estado ? 'success' : 'error'}>
                                                    {camion.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(camion)} className="text-gray-500 hover:text-brand-500">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(camion.id_camion, camion.placa)} className="text-gray-500 hover:text-error-500">
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

            <CamionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingCamion={selectedCamion}
                onSaved={handleSaved}
            />
        </div>
    );
}