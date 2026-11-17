"use client";

import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { OperationTableRows } from '@/components/ui/skeleton/OperationSkeleton';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
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
import { Pencil, Plus, CheckCircle, Package, Truck, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
    en_transito: "info",
    entregado_parcial: "info",
    entregado_total: "success",
    rechazado: "error",
    observado: "info",
};

const ESTADO_ICON: Record<string, LucideIcon> = {
    pendiente: Clock,
    entregado_parcial: Package,
    entregado_total: CheckSquare,
    rechazado: AlertTriangle,
    observado: AlertTriangle,
};

export default function EntregasTable() {
    const router = useRouter();
    const {
        entregas,
        total,
        page,
        limit,
        resumen,
        pendientesTransito,
        loading,
        loadingResumen,
        loadingPendientes,
        errorPendientes,
        errorResumen,
        fetchEntregas,
        fetchResumenEntregas,
        fetchPendientesTransito,
        firmarEntrega,
    } = useEntregas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);

    const [filtroEstado, setFiltroEstado] = useState("pendiente");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchEntregas({
            fecha_entrega: filtroFecha || undefined,
            estado_entrega: filtroEstado || undefined,
            page: 1,
        });
    }, [filtroFecha, filtroEstado, fetchEntregas]);

    useEffect(() => {
        fetchResumenEntregas({ fecha_entrega: filtroFecha || undefined });
        fetchPendientesTransito({
            fecha_carga: filtroFecha || undefined,
        });
    }, [filtroFecha, fetchResumenEntregas, fetchPendientesTransito]);

    // Resumen por estado
    const mostrarPendientesTransito = filtroEstado === 'pendiente';
    const loadingTabla = loading || loadingPendientes;
    const filasVisibles = entregas.length + (mostrarPendientesTransito ? pendientesTransito.length : 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const filasVacias = entregas.length === 0 &&
        (!mostrarPendientesTransito || pendientesTransito.length === 0);
    const cambiarPagina = (next: number) => {
        if (loading || next < 1 || next > totalPages) return;
        void fetchEntregas({
            fecha_entrega: filtroFecha || undefined,
            estado_entrega: filtroEstado || undefined,
            page: next,
            limit,
        });
    };

    const clearFilters = () => {
        setFiltroEstado("pendiente");
        setFiltroFecha("");
    };

    const handleEdit = (entrega: Entrega) => {
        setSelectedEntrega(entrega);
        setModalOpen(true);
    };

    const handleCreate = () => {
        router.push('/dashboard/items-reparto');
    };

    const handleFirmar = async (id: number) => {
        const nombreRecibe = prompt("Nombre de quien recibe:");
        if (nombreRecibe !== null) {
            try {
                await firmarEntrega(id, nombreRecibe);
                toast.success("Entrega firmada");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "No se pudo firmar la entrega.");
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {ESTADOS.slice(1).map(({ value, label }) => {
                    const Icon = ESTADO_ICON[value] || Package;
                    const isActive = filtroEstado === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={isActive}
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
                                <div className="text-lg font-bold text-gray-800 dark:text-white/90">{loadingResumen || loadingPendientes ? <Skeleton className="my-1 h-5 w-8" aria-label="Cargando cantidad" /> : (resumen[value] || 0) + (value === 'pendiente' ? pendientesTransito.length : 0)}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-end gap-3">
                   
                    <div className="w-48">
                        <DatePicker
                            label="Fecha"
                            value={filtroFecha}
                            onChange={(v) => setFiltroFecha(v)}
                        />
                    </div>
                    {(filtroEstado !== "pendiente" || filtroFecha) && <Button type="button" variant="outline" onClick={clearFilters}>Limpiar</Button>}
                </div>

                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Entrega
                </Button>
            </div>

            <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {filtroFecha && (
                        <button
                            type="button"
                            onClick={() => setFiltroFecha("")}
                            aria-label="Quitar filtro de fecha"
                            className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        >
                            {filtroFecha.split('-').reverse().join('/')} <span aria-hidden="true">×</span>
                        </button>
                    )}
                    {filtroEstado && (
                        <button
                            type="button"
                            onClick={() => setFiltroEstado("")}
                            aria-label="Quitar filtro de estado"
                            className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        >
                            {ESTADOS.find(({ value }) => value === filtroEstado)?.label || filtroEstado}
                            <span aria-hidden="true">×</span>
                        </button>
                    )}
                </div>
                <p role="status" className="text-gray-500">
                    {loadingTabla ? 'Buscando…' : `${filasVisibles} ${filasVisibles === 1 ? 'fila' : 'filas'}`}
                </p>
            </div>

            {errorPendientes && <p role="alert" className="text-sm text-red-600">{errorPendientes}</p>}
            {errorResumen && <p role="alert" className="text-sm text-red-600">{errorResumen}</p>}

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Guía</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha / Hora</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Cant.</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Rechaz.</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Entregador</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loadingTabla ? (
                                    <OperationTableRows columns={8} />
                                ) : filasVacias ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            No hay entregas pendientes ni registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                    {mostrarPendientesTransito && pendientesTransito.map((pendiente) => (
                                        <TableRow key={`transito-${pendiente.id_operacion}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                Carga #{pendiente.id_operacion}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {pendiente.cantidad_destinos > 0
                                                    ? `${pendiente.cantidad_destinos} destino${pendiente.cantidad_destinos === 1 ? '' : 's'}`
                                                    : 'Destinos por asignar'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div>{new Date(pendiente.fecha_carga).toLocaleDateString('es-PE')}</div>
                                                <div className="text-xs text-gray-400">Fecha de carga</div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-sm font-medium text-gray-800 dark:text-white/90">
                                                {pendiente.cantidad_jabas}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-sm text-gray-300 dark:text-gray-600">—</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">—</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={ESTADO_COLOR.en_transito}>En tránsito</Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <button
                                                    onClick={() => router.push(`/dashboard/items-reparto/${pendiente.id_operacion}`)}
                                                    className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Gestionar reparto"
                                                >
                                                    <Truck className="h-4 w-4" /> Gestionar reparto
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {entregas.map((entrega) => (
                                        <TableRow key={entrega.id_entrega} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="px-5 py-4">
                                                <span className="font-medium text-gray-800 dark:text-white/90">
                                                    #{entrega.guias_operativas?.numero_guia || entrega.id_guia}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {entrega.items_reparto?.clientes?.nombres || '—'}
                                                {entrega.items_reparto?.clientes?.apellidos ? ` ${entrega.items_reparto.clientes.apellidos}` : ''}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div>{new Date(entrega.fecha_entrega).toLocaleDateString('es-PE')}</div>
                                                {entrega.hora_entrega && (
                                                    <div className="text-xs text-gray-400">{entrega.hora_entrega.slice(0, 5)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-sm font-medium text-gray-800 dark:text-white/90">
                                                {entrega.cantidad_entregada}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-sm">
                                                {entrega.cantidad_rechazada && entrega.cantidad_rechazada > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400 font-medium">{entrega.cantidad_rechazada}</span>
                                                ) : (
                                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {entrega.usuarios?.nombres || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={ESTADO_COLOR[entrega.estado_entrega] || "light"}>
                                                    {entrega.estado_entrega.replace('_', ' ')}
                                                </Badge>
                                                {entrega.firma_recibido && (
                                                    <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓ firmado</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
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
                                    ))}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <p>
                    {total
                        ? `Mostrando ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} de ${total} entregas`
                        : '0 entregas'}
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-3">
                        <Button size="sm" variant="outline" disabled={loading || page <= 1} onClick={() => cambiarPagina(page - 1)}>
                            Anterior
                        </Button>
                        <span aria-live="polite">Página {page} de {totalPages}</span>
                        <Button size="sm" variant="outline" disabled={loading || page >= totalPages} onClick={() => cambiarPagina(page + 1)}>
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>

            <EntregaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingEntrega={selectedEntrega}
                onSaved={() => {
                    void fetchEntregas({
                        fecha_entrega: filtroFecha || undefined,
                        estado_entrega: filtroEstado || undefined,
                    });
                    void fetchResumenEntregas({
                        fecha_entrega: filtroFecha || undefined,
                    });
                    void fetchPendientesTransito({
                        fecha_carga: filtroFecha || undefined,
                    });
                }}
            />
        </div>
    );
}
