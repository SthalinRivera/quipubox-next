'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, X } from 'lucide-react'; 
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import type { Incidencia, Evidencia } from '@/types/incidencia';
import NextImage from 'next/image'; 

interface IncidenciasTableProps {
    data: Incidencia[];
    loading: boolean;
    onEdit: (incidencia: Incidencia) => void;
    onDelete: (id: number) => void;
}

export default function IncidenciasTable({
    data,
    loading,
    onEdit,
    onDelete,
}: IncidenciasTableProps) {
    const [selectedEvidencias, setSelectedEvidencias] = useState<Evidencia[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    if (loading) {
        return <TableSkeleton columns={7} rows={5} showActionButton />;
    }

    const openEvidenciasModal = (evidencias: Evidencia[]) => {
        setSelectedEvidencias(evidencias);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvidencias([]);
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Fecha
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Tipo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Descripción
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Estado
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Evidencias
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay incidencias registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((inc) => {
                                        const evidencias = inc.evidencias || [];
                                        const tieneEvidencias = evidencias.length > 0;

                                        return (
                                            <TableRow key={inc.id_incidencia}>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {inc.id_incidencia}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {format(new Date(inc.fecha_incidencia), 'dd/MM/yyyy')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge size="sm" color="warning">
                                                        {inc.tipo_incidencia.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {inc.descripcion}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge
                                                        size="sm"
                                                        color={inc.estado === 'abierta' ? 'warning' : 'success'}
                                                    >
                                                        {inc.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    {tieneEvidencias ? (
                                                        <div className="flex items-center gap-2">
                                                            {/* Miniaturas */}
                                                            <div className="flex -space-x-2">
                                                                {evidencias.slice(0, 3).map((ev, index) => (
                                                                    <div
                                                                        key={ev.id_evidencia}
                                                                        className="relative h-10 w-10 rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 overflow-hidden"
                                                                    >
                                                                        <NextImage
                                                                            src={ev.url_archivo}
                                                                            alt={`Evidencia ${index + 1}`}
                                                                            fill
                                                                            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                            onClick={() => openEvidenciasModal(evidencias)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/* Botón ver todas */}
                                                            {evidencias.length > 3 && (
                                                                <button
                                                                    onClick={() => openEvidenciasModal(evidencias)}
                                                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                >
                                                                    +{evidencias.length - 3}
                                                                </button>
                                                            )}
                                                            {evidencias.length <= 3 && evidencias.length > 0 && (
                                                                <button
                                                                    onClick={() => openEvidenciasModal(evidencias)}
                                                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                >
                                                                    Ver todas
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(inc)}
                                                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(inc.id_incidencia)}
                                                            className="text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal de evidencias */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm z-99999"
                    onClick={closeModal}
                >
                    <div
                        className="relative bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] p-6 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Evidencias de la incidencia
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedEvidencias.map((ev) => (
                                <div
                                    key={ev.id_evidencia}
                                    className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
                                >
                                    <NextImage
                                        src={ev.url_archivo}
                                        alt="Evidencia"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                    <a
                                        href={ev.url_archivo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Abrir original
                                    </a>
                                </div>
                            ))}
                        </div>

                        {selectedEvidencias.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No hay evidencias para mostrar
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}