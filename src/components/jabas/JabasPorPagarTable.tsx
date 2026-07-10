'use client';

import { useEffect, useState } from 'react';
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
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import { DevolucionJabaModal } from './DevolucionJabaModal';
import { useJabasPorPagar } from '@/hooks/useJabasPorPagar';
import { useToast } from '@/hooks/useToast';
import type { JabaPorPagar } from '@/types/jaba';
import { CheckCircle, RefreshCw, Undo2, XCircle } from 'lucide-react';

interface JabasPorPagarTableProps {
    isReadOnly?: boolean;
    canAnularCompletar?: boolean;
}

export default function JabasPorPagarTable({ isReadOnly = false, canAnularCompletar = false }: JabasPorPagarTableProps) {
    const { jabas, loading, fetchAll, registrarDevolucion, cambiarEstado } =
        useJabasPorPagar();
    const toast = useToast();

    // Estados para modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJaba, setSelectedJaba] = useState<JabaPorPagar | null>(null);

    // Estados para confirmación (anular, etc.)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        jaba: JabaPorPagar;
        tipo: 'anular' | 'completar';
    } | null>(null);

    // Carga inicial
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Abrir modal de devolución
    const handleDevolver = (jaba: JabaPorPagar) => {
        setSelectedJaba(jaba);
        setIsModalOpen(true);
    };

    // Confirmar acción (anular / completar manualmente)
    const handleConfirmAction = (jaba: JabaPorPagar, tipo: 'anular' | 'completar') => {
        setPendingAction({ jaba, tipo });
        setConfirmOpen(true);
    };

    // Ejecutar acción confirmada
    const executeAction = async () => {
        if (!pendingAction) return;
        const { jaba, tipo } = pendingAction;
        try {
            if (tipo === 'anular') {
                await cambiarEstado(jaba.id_jaba_pagar, 'anulado');
                toast.success('Registro anulado');
            } else if (tipo === 'completar') {
                await cambiarEstado(jaba.id_jaba_pagar, 'completado');
                toast.success('Marcado como completado');
            }
            await fetchAll();
        } catch (error) {
            toast.error('Error al actualizar');
        } finally {
            setConfirmOpen(false);
            setPendingAction(null);
        }
    };

    // Guardar después de devolución
    const handleSaved = () => {
        setIsModalOpen(false);
        fetchAll();
    };

    // Renderizado condicional
    if (loading) {
        return (
            <div className="p-4">
                <TableSkeleton columns={isReadOnly ? 7 : 9} rows={5} showActionButton={!isReadOnly} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Encabezado con botón de recargar */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isReadOnly
                        ? 'Vista de solo lectura - Solo puede consultar sus registros'
                        : 'Gestión de jabas por devolver al emisor'}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAll}
                    startIcon={<RefreshCw className="h-4 w-4" />}
                >
                    Recargar
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/5">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Emisor
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Tipo Jaba
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Fecha Origen
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Debida
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Pagada
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Saldo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Estado
                                    </TableCell>
                                    {!isReadOnly && (
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                            Acciones
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {jabas.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isReadOnly ? 8 : 9}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay registros de jabas por pagar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jabas.map((jaba) => (
                                        <TableRow key={jaba.id_jaba_pagar}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {jaba.id_jaba_pagar}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {jaba.clientes?.nombres || 'N/A'}
                                                {jaba.clientes?.apellidos && ` ${jaba.clientes.apellidos}`}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {jaba.tipos_jaba?.nombre || 'N/A'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {new Date(jaba.fecha_origen).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {jaba.cantidad_original}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {jaba.cantidad_pagada}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {jaba.saldo_pendiente}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        jaba.estado === 'completado' ? 'success'
                                                            : jaba.estado === 'parcial' ? 'warning'
                                                                : jaba.estado === 'anulado' ? 'error'
                                                                    : jaba.estado === 'observado' ? 'error'
                                                                        : 'light'
                                                    }
                                                >
                                                    {jaba.estado}
                                                </Badge>
                                            </TableCell>
                                            {!isReadOnly && (
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {/* Botón Devolver (solo si hay saldo pendiente) */}
                                                        {jaba.saldo_pendiente > 0 &&
                                                            jaba.estado !== 'anulado' &&
                                                            jaba.estado !== 'completado' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleDevolver(jaba)}
                                                                    startIcon={<Undo2 className="h-4 w-4" />}
                                                                >
                                                                    Devolver
                                                                </Button>
                                                            )}

                                                        {/* Botón Anular (solo admin) */}
                                                        {canAnularCompletar &&
                                                            jaba.estado !== 'anulado' &&
                                                            jaba.estado !== 'completado' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleConfirmAction(jaba, 'anular')
                                                                    }
                                                                    className="text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                                                    title="Anular"
                                                                >
                                                                    <XCircle className="h-5 w-5" />
                                                                </button>
                                                            )}

                                                        {/* Botón Completar forzado (solo admin) */}
                                                        {canAnularCompletar &&
                                                            jaba.estado !== 'completado' &&
                                                            jaba.estado !== 'anulado' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleConfirmAction(jaba, 'completar')
                                                                    }
                                                                    className="text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                                                                    title="Marcar como completado"
                                                                >
                                                                    <CheckCircle className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal para registrar devolución */}
            <DevolucionJabaModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                jaba={selectedJaba}
                onSaved={handleSaved}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeAction}
                title={
                    pendingAction?.tipo === 'anular'
                        ? 'Anular registro'
                        : 'Completar registro'
                }
                message={`¿Está seguro de ${pendingAction?.tipo === 'anular' ? 'anular' : 'marcar como completado'
                    } el registro de jabas del cliente "${pendingAction?.jaba.clientes?.nombres || ''
                    }"?`}
                confirmText={pendingAction?.tipo === 'anular' ? 'Anular' : 'Completar'}
                variant={pendingAction?.tipo === 'anular' ? 'danger' : 'info'}
            />
        </div>
    );
}
