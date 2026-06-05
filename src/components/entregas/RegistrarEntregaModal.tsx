'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import type { GuiaOperativa } from '@/types/guiaOperativa';

interface RegistrarEntregaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guia: GuiaOperativa;
    onSaved: () => void;
}

export function RegistrarEntregaModal({ open, onOpenChange, guia, onSaved }: RegistrarEntregaModalProps) {
    const toast = useToast();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // items_reparto es un objeto, no un array
    const itemReparto = guia.items_reparto;
    const hasItemReparto = itemReparto && itemReparto.id_item_reparto;

    const [form, setForm] = useState({
        fecha_entrega: new Date().toISOString().split('T')[0],
        hora_entrega: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        cantidad_entregada: itemReparto?.cantidad_asignada || 0,
        cantidad_rechazada: 0,
        nombre_recibe: '',
        firma_recibido: false,
        observaciones: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasItemReparto) {
            toast.error('No hay items de reparto asociados a esta guía');
            return;
        }
        if (form.cantidad_entregada <= 0) {
            toast.error('La cantidad entregada debe ser mayor a 0');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                id_guia: guia.id_guia,
                id_item_reparto: Number(itemReparto.id_item_reparto),
                id_entregador: null,
                fecha_entrega: form.fecha_entrega,
                hora_entrega: form.hora_entrega || null,
                cantidad_entregada: Number(form.cantidad_entregada),
                cantidad_rechazada: Number(form.cantidad_rechazada),
                estado_entrega: form.cantidad_entregada >= (itemReparto.cantidad_asignada || 0) ? 'entregado_total' : 'entregado_parcial',
                firma_recibido: form.firma_recibido,
                nombre_recibe: form.nombre_recibe || null,
                observaciones: form.observaciones || null,
            };
            await fetchWithAuth('entregas', { method: 'POST', body: payload });
            toast.success('Entrega registrada');
            onSaved();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || 'Error al registrar entrega');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    Registrar Entrega
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Guía: {guia.numero_guia}
                </p>

                {!hasItemReparto ? (
                    <div className="mt-4 space-y-3">
                        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            ⚠️ Esta guía no tiene items de reparto asociados. No se puede registrar una entrega.
                            <br />
                            <span className="text-sm">
                                Asegúrate de que el detalle de carga tenga marcada la opción <strong>"Requiere reparto"</strong> y que el cliente receptor tenga un puesto activo.
                                Luego, genera nuevamente las guías desde la operación.
                            </span>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    router.push('/operaciones-carga');
                                }}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Ir a Operaciones de Carga
                            </Button>
                            <Button type="button" onClick={() => onOpenChange(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Fecha y Hora */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fecha_entrega" className="text-gray-700 dark:text-gray-300">
                                    Fecha Entrega *
                                </Label>
                                <Input
                                    id="fecha_entrega"
                                    type="date"
                                    value={form.fecha_entrega}
                                    onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hora_entrega" className="text-gray-700 dark:text-gray-300">
                                    Hora (opcional)
                                </Label>
                                <Input
                                    id="hora_entrega"
                                    type="time"
                                    value={form.hora_entrega}
                                    onChange={(e) => setForm({ ...form, hora_entrega: e.target.value })}
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Cantidades */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cantidad_entregada" className="text-gray-700 dark:text-gray-300">
                                    Cant. Entregada *
                                </Label>
                                <Input
                                    id="cantidad_entregada"
                                    type="number"
                                    min="0"
                                    value={form.cantidad_entregada}
                                    onChange={(e) => setForm({ ...form, cantidad_entregada: parseInt(e.target.value) || 0 })}
                                    required
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cantidad_rechazada" className="text-gray-700 dark:text-gray-300">
                                    Cant. Rechazada
                                </Label>
                                <Input
                                    id="cantidad_rechazada"
                                    type="number"
                                    min="0"
                                    value={form.cantidad_rechazada}
                                    onChange={(e) => setForm({ ...form, cantidad_rechazada: parseInt(e.target.value) || 0 })}
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Nombre quien recibe */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_recibe" className="text-gray-700 dark:text-gray-300">
                                Nombre quien recibe
                            </Label>
                            <Input
                                id="nombre_recibe"
                                value={form.nombre_recibe}
                                onChange={(e) => setForm({ ...form, nombre_recibe: e.target.value })}
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Firma */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="firma"
                                checked={form.firma_recibido}
                                onChange={(e) => setForm({ ...form, firma_recibido: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <label htmlFor="firma" className="text-sm text-gray-700 dark:text-gray-300">
                                ¿Firma recibida?
                            </label>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <Label htmlFor="observaciones" className="text-gray-700 dark:text-gray-300">
                                Observaciones
                            </Label>
                            <textarea
                                id="observaciones"
                                rows={2}
                                value={form.observaciones}
                                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                placeholder="Observaciones adicionales"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Guardando...' : 'Registrar'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}