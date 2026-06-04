"use client";

import { useEffect, useState } from "react";
import { useDetallesCarga } from "@/hooks/useDetallesCarga";
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
import { Pencil, Trash2, Plus, Layers } from "lucide-react";
import { DetalleCargaModal } from "./DetalleCargaModal";
import { CalidadesTable } from "./CalidadesTable";
import type { DetalleCarga } from "@/types/detalleCarga";

interface DetallesCargaTableProps {
    operacionId: number;
}

export default function DetallesCargaTable({ operacionId }: DetallesCargaTableProps) {
    const { detalles, loading, fetchDetalles, deleteDetalle } = useDetallesCarga(operacionId);
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDetalle, setSelectedDetalle] = useState<DetalleCarga | null>(null);
    const [expandedDetalleId, setExpandedDetalleId] = useState<number | null>(null);

    useEffect(() => {
        if (operacionId && !isNaN(operacionId)) {
            fetchDetalles();
        }
    }, [fetchDetalles, operacionId]);

    const handleEdit = (detalle: DetalleCarga) => {
        setSelectedDetalle(detalle);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDetalle(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Eliminar este detalle de carga?")) {
            try {
                await deleteDetalle(id);
                toast.success("Detalle eliminado");
            } catch (err: any) {
                toast.error(err.message || "Error al eliminar");
            }
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando detalles...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={handleCreate}
                    startIcon={<Plus className="h-4 w-4" />}
                >
                    Agregar Detalle
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        ID
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Cliente Emisor
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Fruta/Variedad
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Tipo Jaba
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Cantidad
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Reparto
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {detalles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay detalles de carga.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    detalles.map((det) => (
                                        <>
                                            <TableRow key={det.id_detalle_carga}>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.id_detalle_carga}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                    {det.clientes?.nombres} {det.clientes?.apellidos || ""}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.frutas?.nombre} {det.variedades?.nombre ? `(${det.variedades.nombre})` : ""}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.tipos_jaba?.nombre}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.cantidad_jabas}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge size="sm" color={det.es_reparto ? "success" : "error"}>
                                                        {det.es_reparto ? "Sí" : "No"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleEdit(det)}
                                                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(det.id_detalle_carga)}
                                                            className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedDetalleId(expandedDetalleId === det.id_detalle_carga ? null : det.id_detalle_carga)}
                                                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                            title="Ver calidades"
                                                        >
                                                            <Layers className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedDetalleId === det.id_detalle_carga && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="bg-gray-50 dark:bg-gray-800/50"
                                                    >
                                                        <div className="p-4">
                                                            <CalidadesTable detalleId={det.id_detalle_carga} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <DetalleCargaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                operacionId={operacionId}
                editingDetalle={selectedDetalle}
                onSaved={fetchDetalles}
            />
        </div>
    );
}