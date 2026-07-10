// components/tipos-jaba/TiposJabaTable.tsx
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
import { TipoJabaModal } from './TipoJabaModal';
import { useTiposJaba } from '@/hooks/useTiposJaba';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon, SearchIcon } from '@/icons';
import { Power, Play } from 'lucide-react';
import type { TipoJaba } from '@/types/tipoJaba';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function TiposJabaTable() {
    const { tiposJaba, loading, fetchAll, toggleEstado } = useTiposJaba();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState<TipoJaba | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ tipo: TipoJaba; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredTipos = tiposJaba.filter(t =>
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

    const handleToggle = (tipo: TipoJaba) => {
        const nuevoEstado = !tipo.estado;
        setPendingAction({ tipo, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { tipo, nuevoEstado } = pendingAction;
        await toggleEstado(tipo.id_tipo_jaba, nuevoEstado);
        toast.success(`Tipo de jaba ${nuevoEstado ? 'activado' : 'desactivado'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        // Solo cerrar modal (el estado local ya se actualiza en el hook)
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                <TableSkeleton columns={7} rows={5} showActionButton={true} />;
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
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="w-4 h-4" />}>
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
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No hay tipos de jaba registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTipos.map((tipo) => (
                                        <TableRow key={tipo.id_tipo_jaba}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{tipo.id_tipo_jaba}</TableCell>
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
                                                    <button
                                                        onClick={() => handleEdit(tipo)}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(tipo)}
                                                        className="text-gray-500 hover:text-blue-500 transition-colors"
                                                        title={tipo.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {tipo.estado ? <Power className="w-5 h-5" /> : <Play className="w-5 h-5" />}
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

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar tipo de jaba' : 'Desactivar tipo de jaba'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} el tipo de jaba "${pendingAction?.tipo.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="w-5 h-5" /> : <Power className="w-5 h-5" />}
            />
        </div>
    );
}