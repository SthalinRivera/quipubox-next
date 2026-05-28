"use client";

import { useEffect, useState } from "react";
import { useEmpresas } from "@/hooks/useEmpresas";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { EmpresaModal } from "./EmpresaModal";
import type { Empresa } from "@/types/empresa";

export default function EmpresasTable() {
    const { empresas, loading, fetchAll, remove } = useEmpresas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedEmpresa(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Eliminar la empresa "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success("Empresa eliminada");
            } catch (err: any) {
                toast.error(err.message || "Error al eliminar");
            }
        }
    };

    if (loading)
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando empresas...
            </div>
        );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={handleCreate}
                    startIcon={<Plus className="h-4 w-4" />}
                >
                    Nueva Empresa
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
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
                                        Razón Social
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Nombre Comercial
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        RUC
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Teléfono
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Estado
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
                                {empresas.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay empresas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    empresas.map((empresa) => (
                                        <TableRow key={empresa.id_empresa}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {empresa.id_empresa}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {empresa.razon_social}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {empresa.nombre_comercial}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {empresa.ruc || "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {empresa.telefono || "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    size="sm"
                                                    color={empresa.estado ? "success" : "error"}
                                                >
                                                    {empresa.estado ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(empresa)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(empresa.id_empresa, empresa.razon_social)
                                                        }
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

            <EmpresaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingEmpresa={selectedEmpresa}
                onSaved={fetchAll}
            />
        </div>
    );
}