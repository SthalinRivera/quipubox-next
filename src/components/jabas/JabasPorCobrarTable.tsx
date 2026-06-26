'use client';

import { useEffect } from 'react';
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
import { useJabasPorCobrar } from '@/hooks/useJabasPorCobrar';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';
import type { JabaPorCobrar } from '@/types/jaba';

interface Props {
    onRegisterRecuperacion: (jaba: JabaPorCobrar) => void;
}

export default function JabasPorCobrarTable({ onRegisterRecuperacion }: Props) {
    const { jabas, loading, error, fetchAll } = useJabasPorCobrar();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    if (loading) {
        return <TableSkeleton columns={7} rows={5} />;
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
                Error al cargar los datos: {error.message || 'Error desconocido'}
            </div>
        );
    }

    // Asegurar que jabas sea un array (por si el store devuelve null/undefined)
    const items = Array.isArray(jabas) ? jabas : [];

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400" >Cliente</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo Jaba</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Debida</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Recuperada</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Saldo</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay jabas por cobrar
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((jaba) => (
                                <TableRow key={jaba.id_jaba_cobrar}>
                                    <TableCell className="text-gray-800 dark:text-white/90">
                                        {jaba.clientes?.nombres} {jaba.clientes?.apellidos}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-white/90">
                                        {jaba.tipos_jaba?.nombre}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-white/90">
                                        {jaba.cantidad_debida}
                                    </TableCell>
                                    <TableCell className="text-gray-800 dark:text-white/90">
                                        {jaba.cantidad_recuperada}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-800 dark:text-white/90">
                                        {jaba.saldo_pendiente}
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell>
                                        {jaba.saldo_pendiente > 0 && (
                                            <Button
                                                size="sm"
                                                onClick={() => onRegisterRecuperacion(jaba)}
                                            >
                                                Recuperar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}