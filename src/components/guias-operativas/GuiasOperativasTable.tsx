"use client";

import { OperationTableRows } from '@/components/ui/skeleton/OperationSkeleton';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useGuiasOperativas } from "@/hooks/useGuiasOperativas";
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
import { Pencil, Trash2, Plus, CheckCircle, Eye, FileText, Ban, RefreshCw, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GuiaOperativaModal } from "./GuiaOperativaModal";
import type { GuiaOperativa } from "@/types/guiaOperativa";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Link from "next/link";

const ESTADOS = [
    { value: "emitida", label: "Emitidas" },
    { value: "firmada", label: "Firmadas" },
    { value: "anulada", label: "Anuladas" },
    { value: "reemplazada", label: "Reemplazadas" },
    { value: "observada", label: "Observadas" },
];

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    emitida: "warning",
    firmada: "success",
    anulada: "error",
    reemplazada: "info",
    observada: "info",
};

const ESTADO_ICON: Record<string, LucideIcon> = {
    emitida: FileText,
    firmada: CheckCircle,
    anulada: Ban,
    reemplazada: RefreshCw,
    observada: AlertTriangle,
};

export default function GuiasOperativasTable() {
    const router = useRouter();
    const { guias, total, page, limit, resumen, error, loading, fetchGuias, deleteGuia, firmarGuia } =
        useGuiasOperativas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGuia, setSelectedGuia] = useState<GuiaOperativa | null>(null);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        void fetchGuias({ estado: filtroEstado || undefined, fecha_emision: filtroFecha || undefined, page: 1 });
    }, [filtroEstado, filtroFecha, fetchGuias]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const cambiarPagina = (next: number) => {
        if (loading || next < 1 || next > totalPages) return;
        void fetchGuias({ estado: filtroEstado || undefined, fecha_emision: filtroFecha || undefined, page: next, limit });
    };
    const recargar = () => fetchGuias(undefined, true);
    const limpiarFiltros = () => {
        setFiltroEstado("");
        setFiltroFecha("");
    };

    const handleEdit = (guia: GuiaOperativa) => {
        setSelectedGuia(guia);
        setModalOpen(true);
    };

    const handleCreate = () => {
        router.push('/dashboard/operaciones-carga');
    };

    const handleDelete = async (id: number, numero: string) => {
        if (window.confirm(`¿Anular la guía "${numero}"?`)) {
            try {
                await deleteGuia(id);
                await recargar();
                toast.success("Guía anulada");
            } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Error al anular");
            }
        }
    };

    const handleFirmar = async (id: number) => {
        try {
            await firmarGuia(id);
            await recargar();
            toast.success("Guía firmada");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Error al firmar");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {ESTADOS.map(({ value, label }) => {
                    const Icon = ESTADO_ICON[value];
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
                                <div className="text-lg font-bold text-gray-800 dark:text-white/90">
                                    {loading
                                        ? <Skeleton className="my-1 h-5 w-8" aria-label="Cargando cantidad" />
                                        : (resumen[value] ?? 0)}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-48">
                        <DatePicker
                            label="Fecha de emisión"
                            value={filtroFecha}
                            onChange={setFiltroFecha}
                        />
                    </div>
                    {(filtroEstado || filtroFecha) && (
                        <Button type="button" variant="outline" onClick={limpiarFiltros}>
                            Limpiar
                        </Button>
                    )}
                </div>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Guía
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
                            {filtroFecha.split("-").reverse().join("/")} <span aria-hidden="true">×</span>
                        </button>
                    )}
                    {filtroEstado && (
                        <button
                            type="button"
                            onClick={() => setFiltroEstado("")}
                            aria-label="Quitar filtro de estado"
                            className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        >
                            {ESTADOS.find(({ value }) => value === filtroEstado)?.label}
                            <span aria-hidden="true">×</span>
                        </button>
                    )}
                </div>
                <p role="status" className="text-gray-500">
                    {loading ? "Buscando…" : `${total} ${total === 1 ? "guía" : "guías"}`}
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Número Guía
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Fecha Emisión
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Repartidor
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Estado
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <OperationTableRows columns={6} />
                                ) : guias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            {filtroEstado || filtroFecha ? "Sin resultados." : "No hay guías operativas."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    guias.map((guia) => (
                                        <TableRow key={guia.id_guia}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {guia.id_guia}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {guia.numero_guia}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {new Date(guia.fecha_emision).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {guia.usuarios?.nombres || guia.id_repartidor || "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={ESTADO_COLOR[guia.estado] || "secondary"}>
                                                    {guia.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Botón Ver */}
                                                    <Link href={`/dashboard/guias-operativas/${guia.id_guia}`}>
                                                        <button
                                                            className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(guia)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(guia.id_guia, guia.numero_guia)}
                                                        className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                        title="Anular"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                    {guia.estado !== "firmada" && guia.estado !== "anulada" && (
                                                        <button
                                                            onClick={() => handleFirmar(guia.id_guia)}
                                                            className="text-gray-500 transition-colors hover:text-success-500 dark:text-gray-400 dark:hover:text-success-400"
                                                            title="Firmar"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
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
            </div>

            {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                <span>{error}</span><Button size="sm" variant="outline" onClick={recargar}>Reintentar</Button>
            </div>}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <p>{total ? `Mostrando ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} de ${total} guías` : '0 guías'}</p>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2">Por página
                        <select aria-label="Guías por página" value={limit} disabled={loading}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900"
                            onChange={event => { void fetchGuias({ estado: filtroEstado || undefined, fecha_emision: filtroFecha || undefined, page: 1, limit: Number(event.target.value) }); }}>
                            {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </label>
                    <Button size="sm" variant="outline" disabled={loading || page <= 1} onClick={() => cambiarPagina(page - 1)}>Anterior</Button>
                    <span aria-live="polite">Página {page} de {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={loading || page >= totalPages} onClick={() => cambiarPagina(page + 1)}>Siguiente</Button>
                </div>
            </div>
            <GuiaOperativaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingGuia={selectedGuia}
                onSaved={recargar}
            />
        </div>
    );
}