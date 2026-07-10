// components/lugares-operativos/LugarOperativoTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { LugarOperativoModal } from './LugarOperativoModal';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon, SearchIcon } from '@/icons';
import { Power, Play } from "lucide-react";
import type { LugarOperativo } from '@/types/lugarOperativo';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function LugarOperativoTable() {
    const { lugares, loading, fetchAll, toggleEstado } = useLugarOperativo();
    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMercado, setSelectedMercado] = useState<LugarOperativo | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ item: LugarOperativo; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredItems = (lugares || []).filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedMercado(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: LugarOperativo) => {
        setSelectedMercado(item);
        setIsModalOpen(true);
    };

    const handleToggle = (item: LugarOperativo) => {
        const nuevoEstado = !item.estado;
        setPendingAction({ item, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { item, nuevoEstado } = pendingAction;
        await toggleEstado(item.id_lugar, nuevoEstado);
        toast.success(`Lugar operativo ${nuevoEstado ? 'activado' : 'desactivado'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                <TableSkeleton columns={7} rows={10} showActionButton={true} />;
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
                        className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                </div>
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<PlusIcon className="h-4 w-4" />}
                >
                    Nuevo Lugar Operativo
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Sede</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Dirección</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay lugares operativos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item.id_lugar}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{item.id_lugar}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{item.sedes?.nombre || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{item.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {item.tipo_lugar ? item.tipo_lugar.charAt(0).toUpperCase() + item.tipo_lugar.slice(1) : '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{item.direccion_referencia || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={item.estado ? 'success' : 'error'}>
                                                    {item.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(item)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={item.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {item.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            <LugarOperativoModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingMercado={selectedMercado}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar lugar operativo' : 'Desactivar lugar operativo'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} el lugar operativo "${pendingAction?.item.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}