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
import { Pencil, Trash2, Plus, Layers, FileText } from "lucide-react";
import { DetalleCargaModal } from "./DetalleCargaModal";
import { CalidadesTable } from "./CalidadesTable";
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
    // Map de detalleId -> guia (si existe)
    const [guiasPorDetalle, setGuiasPorDetalle] = useState<Record<number, { id_guia: number; numero_guia: string } | null>>({});

    // Cargar todas las guías de la operación de una sola vez
    const loadGuias = async () => {
        try {
            // Asumiendo que tienes un endpoint que devuelve las guías de una operación
            // Si no existe, puedes obtener todas las guías y filtrar por item_reparto.
            // Por simplicidad, usamos el endpoint de guías y filtramos por operación (si el backend lo permite)
            const guias = await fetchWithAuth<any[]>(`guias-operativas?operacionId=${operacionId}`);
            const map: Record<number, any> = {};
            for (const guia of guias) {
                // Necesitas saber el detalle asociado a partir del item_reparto
                // Para ello, primero obtenemos los items_reparto de la operación
                // Pero podemos optimizar: ya tenemos los detalles con su item_reparto
            }
        } catch (error) {
            console.error("Error loading guías", error);
        }
    };

    // Alternativa: obtener guías después de cargar detalles
    useEffect(() => {
        const fetchGuias = async () => {
            if (!detalles.length) return;
            // Obtener todos los items_reparto de la operación
            const itemsReparto = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/items-reparto`);
            const guias = await fetchWithAuth<any[]>(`guias-operativas`);
            const map: Record<number, { id_guia: number; numero_guia: string } | null> = {};
            for (const det of detalles) {
                const item = itemsReparto.find(i => i.id_detalle_carga === det.id_detalle_carga);
                if (item) {
                    const guia = guias.find(g => g.id_item_reparto === item.id_item_reparto);
                    map[det.id_detalle_carga] = guia ? { id_guia: guia.id_guia, numero_guia: guia.numero_guia } : null;
                } else {
                    map[det.id_detalle_carga] = null;
                }
            }
            setGuiasPorDetalle(map);
        };
        fetchGuias();
    }, [detalles, operacionId]);

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

    const handleGenerarGuias = async () => {
        setGenerating(true);
        try {
            await fetchWithAuth(`operaciones-carga/${operacionId}/generar-guias`, { method: 'POST' });
            toast.success("Guías generadas correctamente");
            await fetchDetalles(); // refrescar detalles (y con ellos las guías)

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
                >
                    {generating ? "Generando..." : "Generar guías pendientes"}
                </Button>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Agregar Detalle
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente Emisor</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente Receptor</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fruta/Variedad</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Tipo Jaba</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cantidad</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Reparto</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Guía</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {detalles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay detalles de carga.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    detalles.map((det) => {
                                        const itemReparto = (det as any).items_reparto?.[0]; // primer elemento del array
                                        const guia = itemReparto?.guias_operativas?.[0];     // primer elemento del array
                                        const numeroGuia = guia?.numero_guia;
                                        const idGuia = guia?.id_guia;
                                        const clienteReceptor = itemReparto?.clientes?.nombres;
                                        return (
                                            <React.Fragment key={det.id_detalle_carga}>
                                                <TableRow>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.id_detalle_carga}</TableCell>
                                                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{det.clientes?.nombres} {det.clientes?.apellidos || ""}</TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                        {det.es_reparto ? (clienteReceptor || "—") : "—"}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.frutas?.nombre} {det.variedades?.nombre ? `(${det.variedades.nombre})` : ""}</TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.tipos_jaba?.nombre}</TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.cantidad_jabas}</TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        <Badge size="sm" color={det.es_reparto ? "success" : "error"}>
                                                            {det.es_reparto ? "Sí" : "No"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {det.es_reparto && numeroGuia ? (
                                                            <Link href={`/dashboard/guias-operativas/${idGuia}`} className="text-brand-500 hover:underline">
                                                                {numeroGuia}
                                                            </Link>
                                                        ) : det.es_reparto ? (
                                                            <span className="text-gray-400">Pendiente</span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => handleEdit(det)} className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400" title="Editar">
                                                                <Pencil className="h-5 w-5" />
                                                            </button>
                                                            <button onClick={() => handleDelete(det.id_detalle_carga)} className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400" title="Eliminar">
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setExpandedDetalleId(expandedDetalleId === det.id_detalle_carga ? null : det.id_detalle_carga)}
                                                                className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                                title="Ver calidades"
                                                            >
                                                                <Layers className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedDetalleId === det.id_detalle_carga && (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="p-4">
                                                                <CalidadesTable detalleId={det.id_detalle_carga} />
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
        </div>
    );
}