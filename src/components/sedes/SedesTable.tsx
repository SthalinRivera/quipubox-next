// components/sedes/SedesTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { useSedesUIStore } from '@/stores/sedesStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SedeModal } from '@/components/sedes/SedeModal';
import { PencilIcon, PlusIcon, SearchIcon } from '@/icons';
import { Power, Play } from 'lucide-react';
import type { Sede } from '@/types/sede';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function SedesTable() {
    const { sedes, loading, fetchAll, toggleEstado } = useSedes();
    const toast = useToast();

    const { search, tipoSede, setSearch, setTipoSede, resetFilters } = useSedesUIStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ sede: Sede; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const filteredSedes = (sedes || []).filter((sede) => {
        if (search && !sede.nombre.toLowerCase().includes(search.toLowerCase())) return false;
        if (tipoSede && sede.tipo_sede !== tipoSede) return false;
        return true;
    });

    const handleCreate = () => {
        setSelectedSede(null);
        setIsModalOpen(true);
    };

    const handleEdit = (sede: Sede) => {
        setSelectedSede(sede);
        setIsModalOpen(true);
    };

    const handleToggle = (sede: Sede) => {
        const nuevoEstado = !sede.estado;
        setPendingAction({ sede, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { sede, nuevoEstado } = pendingAction;
        await toggleEstado(sede.id_sede, nuevoEstado);
        toast.success(`Sede ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`);
    };

    const handleSaved = () => fetchAll();

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                <TableSkeleton columns={7} rows={5} showActionButton={true} />;
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Barra de filtros (igual) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className='flex flex-wrap gap-4'>
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>

                    <select
                        value={tipoSede}
                        onChange={(e) => setTipoSede(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="origen">Origen</option>
                        <option value="destino">Destino</option>
                        <option value="ambos">Ambos</option>
                    </select>

                    {(search || tipoSede) && (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="h-4 w-4" />}>
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
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Empresa</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Ciudad</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredSedes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay sedes registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSedes.map((sede) => (
                                        <TableRow key={sede.id_sede}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{sede.id_sede}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{sede.empresas?.razon_social || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{sede.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {sede.tipo_sede === 'origen' ? 'Origen' : sede.tipo_sede === 'destino' ? 'Destino' : sede.tipo_sede === 'ambos' ? 'Ambos' : '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{sede.ciudad || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={sede.estado ? 'success' : 'error'}>
                                                    {sede.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(sede)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(sede)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={sede.estado ? "Desactivar" : "Activar"}
                                                    >
                                                        {sede.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            <SedeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingSede={selectedSede}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? "Activar sede" : "Desactivar sede"}
                message={`¿${pendingAction?.nuevoEstado ? "activar" : "desactivar"} la sede "${pendingAction?.sede.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? "Activar" : "Desactivar"}
                variant={pendingAction?.nuevoEstado ? "info" : "danger"}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}