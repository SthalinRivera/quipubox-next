'use client';

import { useEffect } from 'react';
import { useClientesPuestos } from '@/hooks/useClientesPuestos';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';

export default function ClientesPuestosTable() {
    const { asignaciones, loading, fetchAll } = useClientesPuestos();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando asignaciones...
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                ID
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Cliente
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Puesto
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Mercado
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Sede
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Sección
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Desde
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                Estado
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {asignaciones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay asignaciones cliente-puesto.
                                </TableCell>
                            </TableRow>
                        ) : (
                            asignaciones.map((asig) => (
                                <TableRow key={asig.id_cliente_puesto}>
                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                        {asig.id_cliente_puesto}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                        {asig.clientes.nombres} {asig.clientes.apellidos || ''}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                        {asig.puestos.numero_puesto}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                        {asig.puestos.lugares_operativos?.nombre || '—'}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                        {asig.puestos.lugares_operativos?.sedes?.nombre || '—'}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                        {asig.seccion || '—'}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(asig.fecha_inicio).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <Badge size="sm" color={asig.estado ? 'success' : 'error'}>
                                            {asig.estado ? 'Activa' : 'Inactiva'}
                                        </Badge>
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