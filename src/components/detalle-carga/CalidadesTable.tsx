"use client";

import { useState, useEffect } from "react";
import { useDetallesCarga } from "@/hooks/useDetallesCarga";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { CalidadModal } from "./CalidadModal";
import type { DetalleCalidad } from "@/types/detalleCarga";

interface CalidadesTableProps {
    detalleId: number;
    maxCantidad: number;
}

export function CalidadesTable({ detalleId, maxCantidad }: CalidadesTableProps) {
    const { fetchCalidades, addCalidad, updateCalidad, deleteCalidad } = useDetallesCarga(0);
    const toast = useToast();
    const [calidades, setCalidades] = useState<DetalleCalidad[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCalidad, setSelectedCalidad] = useState<DetalleCalidad | null>(null);
    const [totalCantidad, setTotalCantidad] = useState(0);

    const loadCalidades = async () => {
        setLoading(true);
        try {
            const data = await fetchCalidades(detalleId);
            setCalidades(data);
            const total = data.reduce((sum, c) => sum + c.cantidad, 0);
            setTotalCantidad(total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCalidades();
    }, [detalleId]);

    const handleCreate = () => {
        setSelectedCalidad(null);
        setModalOpen(true);
    };

    const handleEdit = (cal: DetalleCalidad) => {
        setSelectedCalidad(cal);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Eliminar esta calidad?")) {
            try {
                await deleteCalidad(id);
                toast.success("Calidad eliminada");
                loadCalidades();
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    const handleSave = async (data: any) => {
        if (selectedCalidad) {
            await updateCalidad(selectedCalidad.id_detalle_carga_calidad, data);
            toast.success("Calidad actualizada");
        } else {
            await addCalidad(detalleId, data);
            toast.success("Calidad agregada");
        }
        loadCalidades();
        setModalOpen(false);
    };

    const porcentaje = (totalCantidad / maxCantidad) * 100;
    const excede = totalCantidad > maxCantidad;

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Cargando calidades...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Total calidades: {totalCantidad} / {maxCantidad} jabas</span>
                    {excede && <span className="text-red-500 dark:text-red-400">¡Excede el límite!</span>}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-2 rounded-full ${excede ? "bg-red-500" : "bg-brand-500"}`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Calidades</h4>
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<Plus className="h-4 w-4" />}
                    disabled={totalCantidad >= maxCantidad}
                    className="dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                    Agregar
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-gray-700">
                            <TableRow>
                                <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Calidad
                                </TableCell>
                                <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Cantidad
                                </TableCell>
                                <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Precio Unit.
                                </TableCell>
                                <TableCell isHeader className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {calidades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Sin calidades registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                calidades.map((c) => (
                                    <TableRow key={c.id_detalle_carga_calidad}>
                                        <TableCell className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {c.calidades?.nombre || c.id_calidad}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {c.cantidad}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {c.precio_unitario ? `S/ ${c.precio_unitario.toFixed(2)}` : "—"}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(c)}
                                                    className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id_detalle_carga_calidad)}
                                                    className="text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <CalidadModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingCalidad={selectedCalidad}
                onSave={handleSave}
                maxCantidad={maxCantidad}
                currentTotal={totalCantidad}
            />
        </div>
    );
}