'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import type { Entrega } from '@/types/entrega';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entrega: Entrega;
    onSaved: () => void;
}

export function EditarEntregaModal({ open, onOpenChange, entrega, onSaved }: Props) {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        fecha_entrega: entrega.fecha_entrega.split('T')[0],
        hora_entrega: entrega.hora_entrega?.slice(0, 5) || '',
        cantidad_entregada: entrega.cantidad_entregada,
        cantidad_rechazada: entrega.cantidad_rechazada,
        nombre_recibe: entrega.nombre_recibe || '',
        firma_recibido: entrega.firma_recibido,
        observaciones: entrega.observaciones || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetchWithAuth(`entregas/${entrega.id_entrega}`, {
                method: 'PUT',
                body: {
                    ...form,
                    hora_entrega: form.hora_entrega || null,
                    cantidad_rechazada: form.cantidad_rechazada || 0,
                },
            });
            toast.success('Entrega actualizada');
            onSaved();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-semibold">Editar Entrega</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Fecha</Label>
                            <Input type="date" value={form.fecha_entrega} onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Hora</Label>
                            <Input type="time" value={form.hora_entrega} onChange={(e) => setForm({ ...form, hora_entrega: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Cant. Entregada</Label>
                            <Input type="number" min="0" value={form.cantidad_entregada} onChange={(e) => setForm({ ...form, cantidad_entregada: parseInt(e.target.value) || 0 })} required />
                        </div>
                        <div>
                            <Label>Cant. Rechazada</Label>
                            <Input type="number" min="0" value={form.cantidad_rechazada} onChange={(e) => setForm({ ...form, cantidad_rechazada: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div>
                        <Label>Nombre quien recibe</Label>
                        <Input value={form.nombre_recibe} onChange={(e) => setForm({ ...form, nombre_recibe: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="firma_edit" checked={form.firma_recibido} onChange={(e) => setForm({ ...form, firma_recibido: e.target.checked })} />
                        <label htmlFor="firma_edit">¿Firma recibida?</label>
                    </div>
                    <div>
                        <Label>Observaciones</Label>
                        <textarea rows={2} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Actualizar'}</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}