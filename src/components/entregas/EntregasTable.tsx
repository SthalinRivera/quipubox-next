"use client";

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
import { Pencil, Plus, CheckCircle } from "lucide-react";
import { EntregaModal } from "./EntregaModal";
import type { Entrega } from "@/types/entrega";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";

const ESTADO_COLOR: Record<string, "success" | "error" | "warning" | "info"> = {
    pendiente: "warning",
    entregado_parcial: "info",
    entregado_total: "success",
    rechazado: "error",
    observado: "info",
};

export default function EntregasTable() {
    const { entregas, loading, fetchEntregas, changeState, firmarEntrega } = useEntregas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
    const [filtroGuia, setFiltroGuia] = useState("");
    const [filtroItem, setFiltroItem] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    useEffect(() => {
        fetchEntregas({
            id_guia: filtroGuia ? parseInt(filtroGuia) : undefined,
            id_item_reparto: filtroItem ? parseInt(filtroItem) : undefined,
            fecha_entrega: filtroFecha || undefined,
        });
    }, [filtroGuia, filtroItem, filtroFecha, fetchEntregas]);

    const handleEdit = (entrega: Entrega) => {
        setSelectedEntrega(entrega);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedEntrega(null);
        setModalOpen(true);
    };

    const handleFirmar = async (id: number, nombre?: string) => {
        const nombreRecibe = nombre || prompt("Nombre de quien recibe:");
        if (nombreRecibe !== null) {
            try {
                await firmarEntrega(id, nombreRecibe);
                toast.success("Entrega firmada");
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando entregas...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros y botón nueva entrega */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                    <div className="w-40">
                        <Label className="text-gray-700 dark:text-gray-300">Guía ID</Label>
                        <input
                            type="number"
                            value={filtroGuia}
                            onChange={(e) => setFiltroGuia(e.target.value)}
                            placeholder="ID guía"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        />
                    </div>
                    <div className="w-40">
                        <Label className="text-gray-700 dark:text-gray-300">Item Reparto</Label>
                        <input
                            type="number"
                            value={filtroItem}
                            onChange={(e) => setFiltroItem(e.target.value)}
                            placeholder="ID item"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        />
                    </div>
                    <div className="w-48">
                        <Label className="text-gray-700 dark:text-gray-300">Fecha Entrega</Label>

                        <DatePicker
                            id="fecha-filtro"
                            placeholder="dd/mm/aaaa"
                            onChange={(_, dateString) => setFiltroFecha(dateString || "")}
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Entrega
                </Button>
            </div>

            {/* Tabla con estilos consistentes */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Guía
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Item Reparto
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Fecha/Hora
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Cant. Entregada
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
                                {entregas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay entregas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entregas.map((entrega) => (
                                        <TableRow key={entrega.id_entrega}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {entrega.id_entrega}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {entrega.guias_operativas?.numero_guia || entrega.id_guia}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {entrega.id_item_reparto}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {new Date(entrega.fecha_entrega).toLocaleDateString()}
                                                {entrega.hora_entrega && ` ${entrega.hora_entrega.slice(0, 5)}`}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {entrega.cantidad_entregada}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={ESTADO_COLOR[entrega.estado_entrega] || "secondary"}>
                                                    {entrega.estado_entrega}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(entrega)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    {!entrega.firma_recibido && entrega.estado_entrega !== "entregado_total" && (
                                                        <button
                                                            onClick={() => handleFirmar(entrega.id_entrega)}
                                                            className="text-gray-500 transition-colors hover:text-success-500 dark:text-gray-400 dark:hover:text-success-400"
                                                            title="Firmar"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <select
                                                        value={entrega.estado_entrega}
                                                        onChange={(e) => changeState(entrega.id_entrega, e.target.value)}
                                                        className="rounded border border-gray-300 bg-transparent px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-brand-400"
                                                    >
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="entregado_parcial">Parcial</option>
                                                        <option value="entregado_total">Total</option>
                                                        <option value="rechazado">Rechazado</option>
                                                        <option value="observado">Observado</option>
                                                    </select>
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

            <EntregaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingEntrega={selectedEntrega}
                onSaved={() => fetchEntregas()}
            />
        </div>
    );
}