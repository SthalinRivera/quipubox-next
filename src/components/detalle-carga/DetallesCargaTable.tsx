"use client";

import React, { useEffect, useState } from "react";
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
import { Pencil, Trash2, Plus, Layers, FileText, Truck } from "lucide-react";
import { DetalleCargaModal } from "./DetalleCargaModal";
import { CalidadesTable } from "./CalidadesTable";
import { EntregaManualModal } from "./EntregaManualModal";
import type { DetalleCarga } from "@/types/detalleCarga";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api-client";

interface DetallesCargaTableProps {
    operacionId: number;
}

export default function DetallesCargaTable({ operacionId }: DetallesCargaTableProps) {
    const { detalles, loading, fetchDetalles, deleteDetalle } = useDetallesCarga(operacionId);
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDetalle, setSelectedDetalle] = useState<DetalleCarga | null>(null);
    const [expandedDetalleId, setExpandedDetalleId] = useState<number | null>(null);
    const [generating, setGenerating] = useState(false);
    const [entregaModalOpen, setEntregaModalOpen] = useState(false);
    const [selectedDetalleForEntrega, setSelectedDetalleForEntrega] = useState<DetalleCarga | null>(null);

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

    const handleOpenEntrega = (detalle: DetalleCarga) => {
        setSelectedDetalleForEntrega(detalle);
        setEntregaModalOpen(true);
    };

    const handleGenerarGuias = async () => {
        setGenerating(true);
        try {
            await fetchWithAuth(`operaciones-carga/${operacionId}/generar-guias`, { method: 'POST' });
            toast.success("Guías generadas correctamente");
            await fetchDetalles();
        } catch (err: any) {
            toast.error(err.message || "Error al generar guías");
        } finally {
            setGenerating(false);
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
            <div className="flex justify-end gap-3">
                <Button
                    onClick={handleGenerarGuias}
                    disabled={generating}
                    startIcon={<FileText className="h-4 w-4" />}
                    className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                    {generating ? "Generando..." : "Generar guías pendientes"}
                </Button>
                <Button
                    onClick={handleCreate}
                    startIcon={<Plus className="h-4 w-4" />}
                    className="dark:bg-brand-600 dark:hover:bg-brand-700 dark:text-white"
                >
                    Agregar Detalle
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Cliente Emisor
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Cliente Receptor
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Fruta/Variedad
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Tipo Jaba
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Cantidad
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Reparto
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Guía
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {detalles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay detalles de carga.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    detalles.map((det) => {
                                        const itemReparto = (det as any).items_reparto?.[0];
                                        const guia = itemReparto?.guias_operativas?.[0];
                                        const numeroGuia = guia?.numero_guia;
                                        const idGuia = guia?.id_guia;
                                        const clienteReceptor = itemReparto?.clientes?.nombres;

                                        return (
                                            <React.Fragment key={det.id_detalle_carga}>
                                                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">
                                                        {det.id_detalle_carga}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                                                        {det.clientes?.nombres} {det.clientes?.apellidos || ""}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">
                                                        {det.es_reparto ? (clienteReceptor || "—") : "—"}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">
                                                        {det.frutas?.nombre} {det.variedades?.nombre ? `(${det.variedades.nombre})` : ""}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">
                                                        {det.tipos_jaba?.nombre}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">
                                                        {det.cantidad_jabas}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        <Badge
                                                            size="sm"
                                                            color={det.es_reparto ? "success" : "error"}

                                                        >
                                                            {det.es_reparto ? "Sí" : "No"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        {det.es_reparto ? (
                                                            numeroGuia ? (
                                                                <Link
                                                                    href={`/dashboard/guias-operativas/${idGuia}`}
                                                                    className="text-brand-600 hover:underline dark:text-brand-400"
                                                                >
                                                                    {numeroGuia}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500">Pendiente</span>
                                                            )
                                                        ) : (
                                                            "—"
                                                        )}
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
                                                                className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-red-400"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>

                                                            {det.es_reparto ? (
                                                                <button
                                                                    onClick={() =>
                                                                        setExpandedDetalleId(
                                                                            expandedDetalleId === det.id_detalle_carga ? null : det.id_detalle_carga
                                                                        )
                                                                    }
                                                                    className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                                    title="Ver calidades"
                                                                >
                                                                    <Layers className="h-5 w-5" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpenEntrega(det)}
                                                                    className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                                    title="Entregar manualmente"
                                                                >
                                                                    <Truck className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {det.es_reparto && expandedDetalleId === det.id_detalle_carga && (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="bg-gray-50 p-0 dark:bg-gray-800/50">
                                                            <div className="p-4">
                                                                <CalidadesTable
                                                                    detalleId={det.id_detalle_carga}
                                                                    maxCantidad={det.cantidad_jabas}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
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
            <EntregaManualModal
                isOpen={entregaModalOpen}
                onClose={() => setEntregaModalOpen(false)}
                detalleId={selectedDetalleForEntrega?.id_detalle_carga!}
                onSuccess={fetchDetalles}
            />
        </div>
    );
}