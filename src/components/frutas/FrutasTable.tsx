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
import { FrutaModal } from '@/components/frutas/FrutaModal';
import { useFrutas } from '@/hooks/useFrutas';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashBinIcon, PlusIcon } from '@/icons';
import type { Fruta } from '@/types/fruta';

let cachedFrutas: Fruta[] | null = null;
let activePromise: Promise<Fruta[]> | null = null;

export default function FrutasTable() {
    const [frutas, setFrutas] = useState<Fruta[]>(() => cachedFrutas || []);
    const [loading, setLoading] = useState(!cachedFrutas);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFruta, setSelectedFruta] = useState<Fruta | null>(null);
    const { remove } = useFrutas();
    const toast = useToast();

    const cargarFrutas = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) cachedFrutas = null;
        if (cachedFrutas) {
            setFrutas(cachedFrutas);
            setLoading(false);
            return;
        }
        if (activePromise) {
            try {
                const data = await activePromise;
                if (!cachedFrutas) cachedFrutas = data;
                setFrutas(data);
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
                const data = await fetchWithAuth<Fruta[]>('frutas', { signal: controller.signal });
                cachedFrutas = data;
                setFrutas(data);
                setLoading(false);
                return data;
            } catch (err: any) {
                if (err.name === 'AbortError') return cachedFrutas || [];
                setError(err.message || 'Error al cargar frutas');
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
        cargarFrutas();
        return () => {
            if (abortRef.current && activePromise) abortRef.current.abort();
        };
    }, [cargarFrutas]);

    const handleCreate = () => { setSelectedFruta(null); setIsModalOpen(true); };
    const handleEdit = (f: Fruta) => { setSelectedFruta(f); setIsModalOpen(true); };
    const handleEliminar = async (id: number) => {
        if (window.confirm('¿Eliminar esta fruta?')) {
            try {
                await remove(id);
                toast.success('Fruta eliminada');
                cargarFrutas(true);
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };
    const handleSaved = () => cargarFrutas(true);

    if (loading) return <div className="p-4 text-center">Cargando frutas...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error}<Button onClick={() => cargarFrutas(true)}>Reintentar</Button></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="w-4 h-4" />}>
                    Nueva Fruta
                </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {frutas.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8">No hay frutas registradas.</TableCell></TableRow>
                                ) : (
                                    frutas.map((f) => (
                                        <TableRow key={f.id_fruta}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.id_fruta}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{f.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{f.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={f.estado ? 'success' : 'error'}>
                                                    {f.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(f)} className="text-gray-500 hover:text-brand-500"><PencilIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleEliminar(f.id_fruta)} className="text-gray-500 hover:text-error-500"><TrashBinIcon className="w-5 h-5" /></button>
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
            <FrutaModal open={isModalOpen} onOpenChange={setIsModalOpen} editingFruta={selectedFruta} onSaved={handleSaved} />
        </div>
    );
}