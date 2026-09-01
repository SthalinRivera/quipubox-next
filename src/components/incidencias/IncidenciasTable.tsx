'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import type { Incidencia, Evidencia } from '@/types/incidencia';
import NextImage from 'next/image';
import { useIncidencias } from '@/hooks/useIncidencias';
import { useToast } from '@/hooks/useToast';
import DatePicker from '@/components/ui/date-picker/DatePicker';

const ESTADOS = [
    { value: "", label: "Todas" },
    { value: "abierta", label: "Abiertas" },
    { value: "cerrada", label: "Cerradas" },
];

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info" | "light"> = {
    abierta: "warning",
    cerrada: "success",
};

const ESTADO_ICON: Record<string, any> = {
    abierta: AlertTriangle,
    cerrada: CheckCircle,
};

export default function IncidenciasTable() {
    const { incidencias, loading, fetchAll, remove, toggleEstado } = useIncidencias();
    const toast = useToast();
    const [selectedEvidencias, setSelectedEvidencias] = useState<Evidencia[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchAll({
            estado: filtroEstado || undefined,
            fecha_desde: filtroFecha || undefined,
            fecha_hasta: filtroFecha || undefined,
        });
    }, [filtroEstado, filtroFecha, fetchAll]);

    const resumen = useMemo(() => {
        const counts: Record<string, number> = { abierta: 0, cerrada: 0 };
        incidencias.forEach(inc => {
            if (counts[inc.estado] !== undefined) counts[inc.estado]++;
        });
        return counts;
    }, [incidencias]);

    const hasFilters = filtroEstado || filtroFecha;

    const clearFilters = () => {
        setFiltroEstado("");
        setFiltroFecha("");
    };

    const openEvidenciasModal = (evidencias: Evidencia[]) => {
        setSelectedEvidencias(evidencias);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvidencias([]);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta incidencia?')) return;
        try {
            await remove(id);
            toast.success('Incidencia eliminada');
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
        }
    };

    const handleToggleEstado = async (id: number, estadoActual: string) => {
        const nuevoEstado = estadoActual === 'abierta' ? 'cerrada' : 'abierta';
        try {
            await toggleEstado(id, nuevoEstado);
            toast.success(`Incidencia ${nuevoEstado === 'cerrada' ? 'cerrada' : 'abierta'}`);
        } catch (err: any) {
            toast.error(err.message || 'Error al cambiar estado');
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-2 gap-3">
                    {ESTADOS.slice(1).map(({ value, label }) => {
                        const Icon = ESTADO_ICON[value] || AlertTriangle;
                        const isActive = filtroEstado === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setFiltroEstado(isActive ? "" : value)}
                                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                                    isActive
                                        ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/[0.05] dark:bg-white/[0.03] dark:hover:border-white/[0.1]"
                                }`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    isActive ? "bg-blue-100 dark:bg-blue-800/30" : "bg-gray-100 dark:bg-white/5"
                                }`}>
                                    <Icon className={`h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                                </div>
                                <div className="text-left">
                                    <p className="text-lg font-bold text-gray-800 dark:text-white/90">{resumen[value]}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Filtros */}
                <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Filter className="h-4 w-4" />
                                <span className="text-sm font-medium">Filtros</span>
                            </div>

                            <div className="w-48">
                                <DatePicker
                                    label="Fecha"
                                    value={filtroFecha}
                                    onChange={(v) => setFiltroFecha(v)}
                                />
                            </div>

                            {hasFilters && (
                                <Button size="sm" variant="outline" onClick={clearFilters}>
                                    <X className="h-3 w-3 mr-1" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden">
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
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <TableSkeleton columns={7} rows={5} showActionButton />
                                                </TableCell>
                                            </TableRow>
                                        ) : incidencias.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                    No hay incidencias registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            incidencias.map((inc) => {
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
                                                                color={ESTADO_COLOR[inc.estado] || "light"}
                                                            >
                                                                {inc.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4">
                                                            {tieneEvidencias ? (
                                                                <div className="flex items-center gap-2">
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
                                                                    {evidencias.length > 3 && (
                                                                        <button
                                                                            onClick={() => openEvidenciasModal(evidencias)}
                                                                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                        >
                                                                            +{evidencias.length - 3}
                                                                        </button>
                                                                    )}
                                                                    {evidencias.length <= 3 && (
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
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleEstado(inc.id_incidencia, inc.estado)}
                                                                    className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                                    title={inc.estado === 'abierta' ? 'Cerrar' : 'Abrir'}
                                                                >
                                                                    <Clock className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(inc.id_incidencia)}
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

                    {incidencias.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-white/[0.05]">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {incidencias.length} incidencia{incidencias.length !== 1 ? 's' : ''}
                                {hasFilters ? ' (filtrado)' : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de evidencias */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] p-6 overflow-y-auto"
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

                        <div className="w-full">
                            {selectedEvidencias.map((ev) => (
                                <div
                                    key={ev.id_evidencia}
                                    className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group mb-4"
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
