"use client";

import { OperationTableRows } from '@/components/ui/skeleton/OperationSkeleton';
import { cargaEditable } from '@/types/flujoOperacion';
import { ESTADOS_OPERACION } from '@/types/enums';


import { formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { useOperacionesCarga } from "@/hooks/useOperacionesCarga";
import { useToast } from "@/hooks/useToast";
import { ArrowRight, Eye, Search } from "lucide-react";
import Link from "next/link"; // para navegación
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Plus } from "lucide-react";
import { OperacionCargaModal } from "./OperacionCargaModal";
import type { OperacionCarga } from "@/types/operacionCarga";
import Label from "@/components/form/Label";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import { useRouter } from "next/navigation";

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    pendiente: "warning",
    en_curso: "info",
    repartiendo: "info",
    en_transito: "info",
    completado: "success",
};

export default function OperacionesCargaTable() {
    const { operaciones, total, error, loading, fetchAll } = useOperacionesCarga();
    const router = useRouter();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOperacion, setSelectedOperacion] = useState<OperacionCarga | null>(null);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    const [aplicados, setAplicados] = useState({ estado: '', fecha: '', page: 1 });

    useEffect(() => {
        void fetchAll({ estado: aplicados.estado || undefined, fecha: aplicados.fecha || undefined, page: aplicados.page });
    }, [aplicados, fetchAll]);

    const limpiarFiltros = () => {
        setFiltroFecha('');
        setFiltroEstado('');
        setAplicados({ estado: '', fecha: '', page: 1 });
    };
    const cambiosPendientes = filtroFecha !== aplicados.fecha || filtroEstado !== aplicados.estado;

    const handleEdit = (op: OperacionCarga) => {
        setSelectedOperacion(op);
        setModalOpen(true);
    };

    const hayFiltros = Boolean(aplicados.fecha || aplicados.estado);

    return (
        <div className="space-y-4">
            {/* Filtros y botón nueva operación */}
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); if (!loading) setAplicados({ fecha: filtroFecha, estado: filtroEstado, page: 1 }); }}>
                    {/* Filtro estado */}
                    <div className="w-48">
                        <Label htmlFor="estado-carga-filtro" className="text-gray-700 dark:text-gray-300">Estado</Label>
                        <select
                            id="estado-carga-filtro"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="">Todos</option>
                            {ESTADOS_OPERACION.map((estado) => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-48">
                        <DatePicker
                            label="Fecha"
                            value={filtroFecha}
                            onChange={setFiltroFecha}
                        />
                    </div>
                    <Button type="submit" disabled={loading} startIcon={<Search className="h-4 w-4" />}>
                        {loading ? 'Buscando…' : 'Buscar'}
                    </Button>
                    {(hayFiltros || filtroFecha || filtroEstado) && <Button type="button" variant="outline" disabled={loading} onClick={limpiarFiltros}>Limpiar</Button>}
                    {cambiosPendientes && <p className="w-full text-xs text-gray-500">Cambios sin aplicar</p>}
                </form>
                <Button
                    onClick={() => router.push("/dashboard/operaciones-carga/nueva")}
                    startIcon={<Plus className="h-4 w-4" />}
                >
                    Nueva carga
                </Button>
            </div>

            <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {aplicados.fecha && <button type="button" disabled={loading} onClick={() => { setFiltroFecha(''); setAplicados({ ...aplicados, fecha: '', page: 1 }); }} aria-label="Quitar filtro de fecha" className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{aplicados.fecha.split('-').reverse().join('/')} <span aria-hidden="true">×</span></button>}
                    {aplicados.estado && <button type="button" disabled={loading} onClick={() => { setFiltroEstado(''); setAplicados({ ...aplicados, estado: '', page: 1 }); }} aria-label="Quitar filtro de estado" className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{aplicados.estado} <span aria-hidden="true">×</span></button>}

                </div>
                <p role="status" className="text-gray-500">{loading ? 'Buscando…' : `${total} ${total === 1 ? 'carga' : 'cargas'}`}</p>
            </div>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {/* Tabla de resultados; los filtros permanecen montados durante la consulta. */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Origen</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Destino</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Camión</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fecha</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? <OperationTableRows columns={7} /> : operaciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            {hayFiltros ? "Sin resultados." : "Sin cargas."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    operaciones.map((op) => {
                                        const requiereCarga = cargaEditable(op.estado);
                                        return (
                                            <TableRow key={op.id_operacion}>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{op.id_operacion}</TableCell>
                                                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                    {op.sedes_operaciones_carga_id_sede_origenTosedes?.nombre ?? op.id_sede_origen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {op.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre ?? (op.id_sede_destino || "—")}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {op.camiones?.placa ?? op.id_camion}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                    {formatDate(op.fecha_carga)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="space-y-1">
                                                        <Badge size="sm" color={ESTADO_COLOR[op.estado] || "light"}>
                                                            {op.estado}
                                                        </Badge>

                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            href={`/dashboard/operaciones-carga/${op.id_operacion}`}
                                                            aria-label={requiereCarga ? "Continuar" : "Ver"}
                                                            className={`inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${requiereCarga ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"}`}
                                                        >
                                                            {requiereCarga ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                                                            {requiereCarga ? "Continuar" : "Ver"}
                                                        </Link>
                                                        <button
                                                            disabled={!cargaEditable(op.estado)}
                                                            onClick={() => handleEdit(op)}
                                                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                            title="Editar"
                                                            aria-label={`Editar carga ${op.id_operacion}`}
                                                        >
                                                            <Pencil className="h-5 w-5" />
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

            <div className="flex items-center justify-end gap-3 text-sm text-gray-500">
                <Button variant="outline" disabled={loading || aplicados.page <= 1} onClick={() => setAplicados({ ...aplicados, page: aplicados.page - 1 })}>Anterior</Button>
                <span>{aplicados.page} / {Math.max(1, Math.ceil(total / 20))}</span>
                <Button variant="outline" disabled={loading || aplicados.page * 20 >= total} onClick={() => setAplicados({ ...aplicados, page: aplicados.page + 1 })}>Siguiente</Button>
            </div>
            <OperacionCargaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingOperacion={selectedOperacion}
                onSaved={() => fetchAll({ estado: aplicados.estado || undefined, fecha: aplicados.fecha || undefined, page: aplicados.page })}
            />
        </div>
    );
}