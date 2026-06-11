"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { fetchWithAuth } from "@/lib/api-client";
import { useToast } from "@/hooks/useToast";

interface EntregaManualModalProps {
    isOpen: boolean;
    onClose: () => void;
    detalleId: number;
    onSuccess: () => void;
}

export function EntregaManualModal({ isOpen, onClose, detalleId, onSuccess }: EntregaManualModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        fecha_entrega: new Date().toISOString().split("T")[0],
        hora_entrega: new Date().toTimeString().slice(0, 5),
        nombre_recibe: "",
        observaciones: "",
    });
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetchWithAuth(`/detalles-carga/${detalleId}/entregar`, {
                method: "POST",
                body: form,
            });
            toast.success("Entrega registrada correctamente");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al registrar entrega");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    Registrar entrega manual
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos de la entrega para este detalle sin reparto.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Fecha de entrega *</Label>
                        <Input
                            type="date"
                            value={form.fecha_entrega}
                            onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                            required
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Hora de entrega *</Label>
                        <Input
                            type="time"
                            value={form.hora_entrega}
                            onChange={(e) => setForm({ ...form, hora_entrega: e.target.value })}
                            required
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Nombre de quien recibe *</Label>
                        <Input
                            value={form.nombre_recibe}
                            onChange={(e) => setForm({ ...form, nombre_recibe: e.target.value })}
                            required
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Observaciones</Label>
                        <Input
                            value={form.observaciones}
                            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="dark:bg-brand-600 dark:hover:bg-brand-700"
                        >
                            {submitting ? "Registrando..." : "Registrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}