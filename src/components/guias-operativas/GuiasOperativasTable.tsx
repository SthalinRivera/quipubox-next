"use client";

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
import { Pencil, Trash2, Plus, CheckCircle, Eye } from "lucide-react";
import { GuiaOperativaModal } from "./GuiaOperativaModal";
import type { GuiaOperativa } from "@/types/guiaOperativa";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import Link from "next/link";

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    emitida: "warning",
    firmada: "success",
    anulada: "error",
    reemplazada: "info",
    observada: "info",
};

export default function GuiasOperativasTable() {
    const { guias, loading, fetchGuias, deleteGuia, firmarGuia, changeGuiaState } =
        useGuiasOperativas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGuia, setSelectedGuia] = useState<GuiaOperativa | null>(null);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchGuias({ estado: filtroEstado || undefined, fecha_emision: filtroFecha || undefined });
    }, [filtroEstado, filtroFecha, fetchGuias]);

    const handleEdit = (guia: GuiaOperativa) => {
        setSelectedGuia(guia);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedGuia(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number, numero: string) => {
        if (window.confirm(`¿Anular la guía "${numero}"?`)) {
            try {
                await deleteGuia(id);
                toast.success("Guía anulada");
            } catch (err: any) {
                toast.error(err.message || "Error al anular");
            }
        }
    };

    const handleFirmar = async (id: number) => {
        try {
            await firmarGuia(id);
            toast.success("Guía firmada");
        } catch (err: any) {
            toast.error(err.message || "Error al firmar");
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando guías...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros y botón nueva guía */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                    <div className="w-48">
                        <Label className="text-gray-700 dark:text-gray-300">Estado</Label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="">Todos</option>
                            <option value="emitida">Emitida</option>
                            <option value="firmada">Firmada</option>
                            <option value="anulada">Anulada</option>
                            <option value="reemplazada">Reemplazada</option>
                            <option value="observada">Observada</option>
                        </select>
                    </div>
                    <div className="w-48">
                        <Label className="text-gray-700 dark:text-gray-300">Fecha Emisión</Label>
                        <DatePicker
                            id="fecha-filtro"
                            placeholder="dd/mm/aaaa"
                            onChange={(_, dateString) => setFiltroFecha(dateString || "")}
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Guía
                </Button>
            </div>

            {/* Tabla con estilos consistentes */}
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
                                {guias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay guías operativas.
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

            <GuiaOperativaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingGuia={selectedGuia}
                onSaved={() => fetchGuias({ estado: filtroEstado || undefined, fecha_emision: filtroFecha || undefined })}
            />
        </div>
    );
}