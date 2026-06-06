"use client";

import { formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { useOperacionesCarga } from "@/hooks/useOperacionesCarga";
import { useToast } from "@/hooks/useToast";
import { Eye } from "lucide-react";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { OperacionCargaModal } from "./OperacionCargaModal";
import type { OperacionCarga } from "@/types/operacionCarga";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker"; // Ajusta la ruta

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    pendiente: "warning",
    en_proceso: "info",
    completada: "success",
    cancelada: "error",
};

export default function OperacionesCargaTable() {
    const { operaciones, loading, fetchAll, remove, changeState } = useOperacionesCarga();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOperacion, setSelectedOperacion] = useState<OperacionCarga | null>(null);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchAll({ estado: filtroEstado || undefined, fecha: filtroFecha || undefined });
    }, [filtroEstado, filtroFecha, fetchAll]);

    const handleEdit = (op: OperacionCarga) => {
        setSelectedOperacion(op);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedOperacion(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Cancelar esta operación?")) {
            try {
                await remove(id);
                toast.success("Operación cancelada");
            } catch (err: any) {
                toast.error(err.message || "Error al cancelar");
            }
        }
    };

    const handleChangeState = async (id: number, newState: string) => {
        try {
            await changeState(id, newState);
            toast.success(`Estado cambiado a ${newState}`);
        } catch (err: any) {
            toast.error(err.message || "Error al cambiar estado");
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando operaciones...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros y botón nueva operación */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                    {/* Filtro estado */}
                    <div className="w-48">
                        <Label className="text-gray-700 dark:text-gray-300">Estado</Label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_curso">En curso</option>
                            <option value="repartiendo">Repartiendo</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    {/* Filtro fecha con DatePicker */}
                    <div className="w-48">
                        <Label className="text-gray-700 dark:text-gray-300">Fecha</Label>
                        <DatePicker
                            id="fecha-filtro"
                            placeholder="dd/mm/aaaa"
                            onChange={(dates, currentDateString) => {
                                setFiltroFecha(currentDateString || "");
                            }}
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Operación
                </Button>
            </div>

            {/* Tabla con los mismos estilos que EmpresasTable */}
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
                                {operaciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay operaciones de carga.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    operaciones.map((op) => (
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
                                                <Badge size="sm" color={ESTADO_COLOR[op.estado] || "secondary"}>
                                                    {op.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/dashboard/operaciones-carga/${op.id_operacion}`}>
                                                        <button
                                                            className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(op)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(op.id_operacion)}
                                                        className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                        title="Cancelar"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>

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

            <OperacionCargaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingOperacion={selectedOperacion}
                onSaved={() => fetchAll({ estado: filtroEstado || undefined, fecha: filtroFecha || undefined })}
            />
        </div>
    );
}