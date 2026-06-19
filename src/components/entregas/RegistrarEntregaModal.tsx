// components/entregas/RegistrarEntregaModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import type { GuiaOperativa } from '@/types/guiaOperativa';
import type { ItemReparto } from '@/types/itemReparto';

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

    const itemReparto = guia.items_reparto as ItemReparto | undefined;
    const hasItemReparto = !!itemReparto?.id_item_reparto;

    // Calcular cantidad total a entregar (usar total agrupado si existe, o cantidad del item)
    const totalAsignado = itemReparto?._total_asignado_agrupado ?? itemReparto?.cantidad_asignada ?? 0;

    // Fecha y hora automáticas al abrir el modal
    const [fechaEntrega] = useState(new Date().toISOString().split('T')[0]);
    const [horaEntrega] = useState(
        new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    );

    const [form, setForm] = useState({
        nombre_recibe: '',
        firma_recibido: false,
        observaciones: '',
    });

    // Resetear formulario al abrir el modal
    useEffect(() => {
        if (open) {
            setForm({
                nombre_recibe: '',
                firma_recibido: false,
                observaciones: '',
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasItemReparto) {
            toast.error('No hay items de reparto asociados a esta guía');
            return;
        }
        if (totalAsignado <= 0) {
            toast.error('La cantidad asignada es 0, no se puede registrar entrega');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                id_guia: guia.id_guia,
                id_item_reparto: Number(itemReparto.id_item_reparto),
                id_entregador: null,
                fecha_entrega: fechaEntrega,
                hora_entrega: horaEntrega || null,
                cantidad_entregada: totalAsignado,
                cantidad_rechazada: 0,
                estado_entrega: 'entregado_total',
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
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    router.push('/operaciones-carga');
                                }}
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
                        {/* Resumen automático */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Fecha de entrega:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{fechaEntrega}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Hora:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{horaEntrega}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                                <span className="text-gray-600 dark:text-gray-400">Cantidad a entregar:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{totalAsignado}</span>
                            </div>
                        </div>

                        {/* Nombre quien recibe */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_recibe" className="text-gray-700 dark:text-gray-300">
                                Nombre quien recibe *
                            </Label>
                            <Input
                                id="nombre_recibe"
                                value={form.nombre_recibe}
                                onChange={(e) => setForm({ ...form, nombre_recibe: e.target.value })}
                                required
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                placeholder="Nombre de la persona que recibe"
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
                                Observaciones (opcional)
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
                                {submitting ? 'Guardando...' : 'Registrar Entrega'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}