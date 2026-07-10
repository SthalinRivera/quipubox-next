'use client';

import { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { useJabasPorCobrar } from '@/hooks/useJabasPorCobrar';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';
import type { JabaPorCobrar } from '@/types/jaba';
import { RefreshCw } from 'lucide-react';

interface Props {
    onRegisterRecuperacion: (jaba: JabaPorCobrar) => void;
    isReadOnly?: boolean;
}

export default function JabasPorCobrarTable({ onRegisterRecuperacion, isReadOnly = false }: Props) {
    const { jabas, loading, error, fetchAll } = useJabasPorCobrar();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    if (loading) {
        return <TableSkeleton columns={isReadOnly ? 6 : 7} rows={5} />;
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
                Error al cargar los datos: {error.message || 'Error desconocido'}
            </div>
        );
    }

    const items = Array.isArray(jabas) ? jabas : [];

    return (
        <div className="space-y-4">
            {/* Encabezado */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isReadOnly
                        ? 'Vista de solo lectura - Solo puede consultar sus registros'
                        : 'Gestión de jabas por recuperar del receptor'}
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo Jaba</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha Origen</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Debida</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Recuperada</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Saldo</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                {!isReadOnly && (
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isReadOnly ? 7 : 8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No hay jabas por cobrar
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((jaba) => (
                                    <TableRow key={jaba.id_jaba_cobrar}>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                            {(jaba as any).entregas?.items_reparto?.clientes?.nombres || ''}{' '}
                                            {(jaba as any).entregas?.items_reparto?.clientes?.apellidos || ''}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                            {jaba.tipos_jaba?.nombre}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(jaba.fecha_origen).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                            {jaba.cantidad_original}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                            {jaba.cantidad_recuperada}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {jaba.saldo_pendiente}
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <Badge
                                                size="sm"
                                                color={
                                                    jaba.estado === 'completado'
                                                        ? 'success'
                                                        : jaba.estado === 'parcial'
                                                            ? 'warning'
                                                            : 'light'
                                                }
                                            >
                                                {jaba.estado}
                                            </Badge>
                                        </TableCell>
                                        {!isReadOnly && (
                                            <TableCell className="px-5 py-4">
                                                {jaba.saldo_pendiente > 0 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onRegisterRecuperacion(jaba)}
                                                    >
                                                        Recuperar
                                                    </Button>
                                                )}
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
    );
}
