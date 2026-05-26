'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useVariedades } from '@/hooks/useVariedades';
import { useToast } from '@/hooks/useToast';
import type { Variedad } from '@/types/variedad';

interface VariedadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingVariedad: Variedad | null;
    onSaved: () => void;
}

export function VariedadModal({ open, onOpenChange, editingVariedad, onSaved }: VariedadModalProps) {
    const { create, update } = useVariedades();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ nombre: '', fruta_id: 0, estado: true });

    useEffect(() => {
        if (editingVariedad) {
            setForm({
                nombre: editingVariedad.nombre,
                fruta_id: editingVariedad.fruta_id,
                estado: editingVariedad.estado,
            });
        } else {
            setForm({ nombre: '', fruta_id: 0, estado: true });
        }
    }, [editingVariedad, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        setSubmitting(true);
        try {
            if (editingVariedad) {
                await update(editingVariedad.id_variedad, form);
                toast.success('Variedad actualizada');
            } else {
                await create(form);
                toast.success('Variedad creada');
            }
            onSaved();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium">
                    {editingVariedad ? 'Editar Variedad' : 'Nueva Variedad'}
                </h4>
                <p className="mb-6 text-sm text-gray-500">
                    {editingVariedad ? 'Modifica los datos' : 'Completa la información'}
                </p>

                <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                        id="nombre"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="fruta_id">ID de Fruta *</Label>
                    <Input
                        id="fruta_id"
                        type="number"
                        value={form.fruta_id}
                        onChange={(e) => setForm({ ...form, fruta_id: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="estado"
                        checked={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                    />
                    <label htmlFor="estado">Activo</label>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}