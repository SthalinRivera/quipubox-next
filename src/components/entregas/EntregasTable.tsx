"use client";

import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { OperationTableRows } from '@/components/ui/skeleton/OperationSkeleton';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from "react";
import { useEntregas } from "@/hooks/useEntregas";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Plus, CheckCircle, Filter, X, Package, Truck, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { EntregaModal } from "./EntregaModal";
import type { Entrega } from "@/types/entrega";
import DatePicker from "@/components/ui/date-picker/DatePicker";

const ESTADOS = [
    { value: "", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "entregado_parcial", label: "Entregado Parcial" },
    { value: "entregado_total", label: "Entregado Total" },
    { value: "rechazado", label: "Rechazado" },
    { value: "observado", label: "Observado" },
];

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info" | "light"> = {
    pendiente: "warning",
    entregado_parcial: "info",
    entregado_total: "success",
    rechazado: "error",
    observado: "info",
};

const ESTADO_ICON: Record<string, any> = {
    pendiente: Clock,
    entregado_parcial: Package,
    entregado_total: CheckSquare,
    rechazado: AlertTriangle,
    observado: AlertTriangle,
};

export default function EntregasTable() {
    const router = useRouter();
    const { entregas, loading, fetchEntregas, firmarEntrega } = useEntregas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);

    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchEntregas({
            fecha_entrega: filtroFecha || undefined,
            estado_entrega: filtroEstado || undefined,
        });
    }, [filtroFecha, filtroEstado, fetchEntregas]);

    // Resumen por estado
    const resumen = useMemo(() => {
        const counts: Record<string, number> = {
            pendiente: 0,
            entregado_parcial: 0,
            entregado_total: 0,
            rechazado: 0,
            observado: 0,
        };
        entregas.forEach(e => {
            if (counts[e.estado_entrega] !== undefined) {
                counts[e.estado_entrega]++;
            }
        });
        return counts;
    }, [entregas]);

    const hasFilters = filtroEstado || filtroFecha;

    const clearFilters = () => {
        setFiltroEstado("");
        setFiltroFecha("");
    };

    const handleEdit = (entrega: Entrega) => {
        setSelectedEntrega(entrega);
        setModalOpen(true);
    };

    const handleCreate = () => {
        router.push('/dashboard/operaciones-carga');
    };

    const handleFirmar = async (id: number) => {
        const nombreRecibe = prompt("Nombre de quien recibe:");
        if (nombreRecibe !== null) {
            try {
                await firmarEntrega(id, nombreRecibe);
                toast.success("Entrega firmada");
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {ESTADOS.slice(1).map(({ value, label }) => {
                    const Icon = ESTADO_ICON[value] || Package;
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
                                <div className="text-lg font-bold text-gray-800 dark:text-white/90">{loading ? <Skeleton className="my-1 h-5 w-8" aria-label="Cargando cantidad" /> : resumen[value]}</div>
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

                    <Button size="sm" onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                        Nueva Entrega
                    </Button>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Guía</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha / Hora</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center">Cant.</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center">Rechaz.</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entregador</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <OperationTableRows columns={8} />
                                ) : entregas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            No hay entregas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entregas.map((entrega) => (
                                        <TableRow key={entrega.id_entrega} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="px-5 py-3">
                                                <span className="font-medium text-gray-800 dark:text-white/90">
                                                    #{entrega.guias_operativas?.numero_guia || entrega.id_guia}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {(entrega as any).items_reparto?.clientes?.nombres || '—'}
                                                {(entrega as any).items_reparto?.clientes?.apellidos ? ` ${(entrega as any).items_reparto.clientes.apellidos}` : ''}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                <div>{new Date(entrega.fecha_entrega).toLocaleDateString('es-PE')}</div>
                                                {entrega.hora_entrega && (
                                                    <div className="text-xs text-gray-400">{entrega.hora_entrega.slice(0, 5)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                                                {entrega.cantidad_entregada}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-center">
                                                {entrega.cantidad_rechazada && entrega.cantidad_rechazada > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400 font-medium">{entrega.cantidad_rechazada}</span>
                                                ) : (
                                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {entrega.usuarios?.nombres || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-3">
                                                <Badge size="sm" color={ESTADO_COLOR[entrega.estado_entrega] || "light"}>
                                                    {entrega.estado_entrega.replace('_', ' ')}
                                                </Badge>
                                                {entrega.firma_recibido && (
                                                    <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓ firmado</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(entrega)}
                                                        className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" /> Editar datos
                                                    </button>

                                                    {!entrega.firma_recibido && entrega.cantidad_entregada > 0 && (
                                                        <button
                                                            onClick={() => handleFirmar(entrega.id_entrega)}
                                                            className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                                                            title="Firmar recibido"
                                                        >
                                                            <CheckCircle className="h-4 w-4" /> Registrar firma
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Footer */}
                {entregas.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-white/[0.05]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {entregas.length} entrega{entregas.length !== 1 ? 's' : ''}
                            {hasFilters ? ' (filtrado)' : ''}
                        </p>
                    </div>
                )}
            </div>

            <EntregaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingEntrega={selectedEntrega}
                onSaved={() => fetchEntregas()}
            />
        </div>
    );
}
