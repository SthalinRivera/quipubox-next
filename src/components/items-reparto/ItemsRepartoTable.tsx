"use client";

import { useEffect, useState } from "react";
import { useItemsReparto } from "@/hooks/useItemsReparto";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ItemRepartoModal } from "./ItemRepartoModal";
import type { ItemReparto } from "@/types/itemReparto";

interface ItemsRepartoTableProps {
    detalleId?: number;
    hideCreateButton?: boolean;
}

export default function ItemsRepartoTable({ detalleId, hideCreateButton }: ItemsRepartoTableProps) {
    const { items, loading, fetchItems, deleteItem } = useItemsReparto();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemReparto | null>(null);

    useEffect(() => {
        if (detalleId) {
            fetchItems({ id_detalle_carga: detalleId });
        } else {
            fetchItems();
        }
    }, [detalleId, fetchItems]);

    const handleEdit = (item: ItemReparto) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Eliminar este item de reparto?")) {
            try {
                await deleteItem(id);
                toast.success("Item eliminado");
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando items de reparto...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!hideCreateButton && (
                <div className="flex justify-end">
                    <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                        Nuevo Reparto
                    </Button>
                </div>
            )}

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
                                        Cliente Receptor
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Puesto
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Cantidad
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Sección
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay items de reparto.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id_item_reparto}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {item.id_item_reparto}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {item.clientes?.nombres} {item.clientes?.apellidos || ""}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {item.puestos?.numero_puesto}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {item.cantidad_asignada}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {item.seccion || "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id_item_reparto)}
                                                        className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                        title="Eliminar"
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

            <ItemRepartoModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                detalleId={detalleId}
                editingItem={selectedItem}
                onSaved={() => fetchItems(detalleId ? { id_detalle_carga: detalleId } : undefined)}
            />
        </div>
    );
}