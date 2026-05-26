'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useFrutas } from '@/hooks/useFrutas';
import { useToast } from '@/hooks/useToast';
import type { Fruta } from '@/types/fruta';

interface FrutaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingFruta: Fruta | null;
    onSaved: () => void;
}

export function FrutaModal({ open, onOpenChange, editingFruta, onSaved }: FrutaModalProps) {
    const { create, update } = useFrutas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        estado: true,
    });

    useEffect(() => {
        if (editingFruta) {
            setForm({
                nombre: editingFruta.nombre || '',
                descripcion: editingFruta.descripcion || '',
                estado: editingFruta.estado ?? true,
            });
        } else {
            setForm({ nombre: '', descripcion: '', estado: true });
        }
    }, [editingFruta, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        setSubmitting(true);
        try {
            if (editingFruta) {
                await update(editingFruta.id_fruta, form);
                toast.success('Fruta actualizada');
            } else {
                await create(form);
                toast.success('Fruta creada');
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
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {editingFruta ? 'Editar Fruta' : 'Nueva Fruta'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingFruta ? 'Modifica los datos de la fruta' : 'Completa la información para crear una nueva fruta'}
                </p>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                            id="nombre"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}

                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="estado"
                            checked={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <Label htmlFor="estado" className="!mb-0">Activo</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={submitting}>
                        {submitting ? 'Guardando...' : editingFruta ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}