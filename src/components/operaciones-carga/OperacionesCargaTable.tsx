"use client";

import { OperationTableRows } from '@/components/ui/skeleton/OperationSkeleton';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { estadoOperacion, cargaEditable } from '@/types/flujoOperacion';
import { ESTADOS_OPERACION } from '@/types/enums';


import { formatDate } from "@/utils/date";
import { useCallback, useEffect, useState } from "react";
import { useOperacionesCarga } from "@/hooks/useOperacionesCarga";
import { ArrowRight, Eye, Search, Clock, Package, Truck, CheckSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { fetchAllWithAuth } from "@/lib/api-client";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import { useRouter } from "next/navigation";

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    pendiente: "warning",
    en_curso: "info",
    repartiendo: "info",
    en_transito: "info",
    completado: "success",
};

const ESTADO_ICON: Record<string, LucideIcon> = {
    pendiente: Clock,
    en_curso: Package,
    en_transito: Truck,
    repartiendo: Package,
    completado: CheckSquare,
};

export default function OperacionesCargaTable() {
    const { operaciones, total, error, loading, fetchAll } = useOperacionesCarga();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOperacion, setSelectedOperacion] = useState<OperacionCarga | null>(null);
    const [filtroFecha, setFiltroFecha] = useState("");
    const [aplicados, setAplicados] = useState({ estado: 'pendiente', fecha: '', page: 1 });
    const [conteosEstado, setConteosEstado] = useState<Record<string, number>>({});
    const [loadingConteos, setLoadingConteos] = useState(true);
    const [errorConteos, setErrorConteos] = useState("");

    const cargarConteos = useCallback(async () => {
        setLoadingConteos(true);
        try {
            const todasLasOperaciones = await fetchAllWithAuth<OperacionCarga>("operaciones-carga");
            const conteos: Record<string, number> = {};
            ESTADOS_OPERACION.forEach((estado) => {
                conteos[estado] = 0;
            });
            todasLasOperaciones.forEach((operacion) => {
                if (conteos[operacion.estado] !== undefined)
                    conteos[operacion.estado]++;
            });
            setConteosEstado(conteos);
            setErrorConteos("");
        } catch (error) {
            console.error("Error cargando conteos de operaciones:", error);
            setErrorConteos(
                error instanceof Error
                    ? error.message
                    : "No se pudieron cargar los conteos de operaciones.",
            );
        } finally {
            setLoadingConteos(false);
        }
    }, []);

    useEffect(() => {
        void fetchAll({ estado: aplicados.estado || undefined, fecha: aplicados.fecha || undefined, page: aplicados.page });
    }, [aplicados, fetchAll]);

    useEffect(() => {
        void cargarConteos();
    }, [cargarConteos]);

    const limpiarFiltros = () => {
        setFiltroFecha('');
        setAplicados({ estado: 'pendiente', fecha: '', page: 1 });
    };
    const cambiosPendientes = filtroFecha !== aplicados.fecha;
    const seleccionarEstado = (estado: string) => {
        setAplicados((actual) => ({
            ...actual,
            estado: actual.estado === estado ? '' : estado,
            page: 1,
        }));
    };

    const handleEdit = (op: OperacionCarga) => {
        setSelectedOperacion(op);
        setModalOpen(true);
    };

    const hayFiltros = Boolean(aplicados.fecha || aplicados.estado);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {ESTADOS_OPERACION.map((estado) => {
                    const Icon = ESTADO_ICON[estado] || Package;
                    const isActive = aplicados.estado === estado;
                    return (
                        <button
                            key={estado}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => seleccionarEstado(estado)}
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
                                    {loadingConteos
                                        ? <Skeleton className="my-1 h-5 w-8" aria-label="Cargando cantidad" />
                                        : conteosEstado[estado] ?? 0}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {estadoOperacion[estado] || estado}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filtros y botón nueva operación */}
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); if (!loading) setAplicados((actual) => ({ ...actual, fecha: filtroFecha, page: 1 })); }}>
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
                    {(aplicados.estado !== 'pendiente' || aplicados.fecha || filtroFecha) && <Button type="button" variant="outline" disabled={loading} onClick={limpiarFiltros}>Limpiar</Button>}
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
                    {aplicados.estado && <button type="button" disabled={loading} onClick={() => { setAplicados({ ...aplicados, estado: '', page: 1 }); }} aria-label="Quitar filtro de estado" className="inline-flex min-h-8 items-center gap-2 rounded-lg bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{estadoOperacion[aplicados.estado] || aplicados.estado} <span aria-hidden="true">×</span></button>}

                </div>
                <p role="status" className="text-gray-500">{loading ? 'Buscando…' : `${total} ${total === 1 ? 'carga' : 'cargas'}`}</p>
            </div>

            {(error || errorConteos) && <p role="alert" className="text-sm text-red-600">{error || errorConteos}</p>}
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
                                                    {op.distritos_operaciones_carga_id_ubigeo_origenTodistritos?.nombre ?? op.id_ubigeo_origen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {op.distritos_operaciones_carga_id_ubigeo_destinoTodistritos?.nombre ?? (op.id_ubigeo_destino || "—")}
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
                                                            {estadoOperacion[op.estado] || op.estado}
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
                <span>{aplicados.page} / {Math.max(1, Math.ceil(total / 10))}</span>
                <Button variant="outline" disabled={loading || aplicados.page * 10 >= total} onClick={() => setAplicados({ ...aplicados, page: aplicados.page + 1 })}>Siguiente</Button>
            </div>
            <OperacionCargaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingOperacion={selectedOperacion}
                onSaved={() => {
                    void fetchAll({ estado: aplicados.estado || undefined, fecha: aplicados.fecha || undefined, page: aplicados.page });
                    void cargarConteos();
                }}
            />
        </div>
    );
}