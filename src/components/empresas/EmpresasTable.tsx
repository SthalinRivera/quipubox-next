"use client";

import { useEffect, useState } from "react";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Power, Play, Plus } from "lucide-react";
import { EmpresaModal } from "./EmpresaModal";
import type { Empresa } from "@/types/empresa";
import { TableSkeleton } from "../ui/skeleton/TableSkeleton";

export default function EmpresasTable() {
    const { empresas, loading, fetchAll, toggleEstado } = useEmpresas();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ empresa: Empresa; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedEmpresa(null);
        setModalOpen(true);
    };

    const handleToggle = (empresa: Empresa) => {
        const nuevoEstado = !empresa.estado;
        setPendingAction({ empresa, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { empresa, nuevoEstado } = pendingAction;
        try {
            await toggleEstado(empresa.id_empresa, nuevoEstado);
            toast.success(`Empresa ${nuevoEstado ? "activada" : "desactivada"}`);
        } catch (error: any) {
            toast.error(error.message || "Error al cambiar el estado");
        } finally {
            setConfirmOpen(false);
            setPendingAction(null);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);

    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                <TableSkeleton columns={7} rows={5} showActionButton={true} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nueva Empresa
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Razón Social</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre Comercial</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">RUC</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Teléfono</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {empresas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
                                                <Badge size="sm" color={empresa.estado ? "success" : "error"}>
                                                    {empresa.estado ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(empresa)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar empresa"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>

                                                    {empresa.estado ? (
                                                        <button
                                                            onClick={() => handleToggle(empresa)}
                                                            className="text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                                            title="Desactivar empresa"
                                                        >
                                                            <Power className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggle(empresa)}
                                                            className="text-gray-500 transition-colors hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500"
                                                            title="Activar empresa"
                                                        >
                                                            <Play className="h-5 w-5" />
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

            <EmpresaModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                editingEmpresa={selectedEmpresa}
                onSaved={handleModalClose}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? "Activar empresa" : "Desactivar empresa"}
                message={`¿${pendingAction?.nuevoEstado ? "activar" : "desactivar"} la empresa "${pendingAction?.empresa.razon_social}"?`}
                confirmText={pendingAction?.nuevoEstado ? "Activar" : "Desactivar"}
                variant={pendingAction?.nuevoEstado ? "info" : "danger"}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}