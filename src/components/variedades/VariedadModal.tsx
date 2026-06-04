'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useVariedades } from '@/hooks/useVariedades';
import { useFrutas } from '@/hooks/useFrutas';
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
    const { frutas, fetchAll: fetchFrutas } = useFrutas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        fruta_id: 0,
        estado: true,
    });

    useEffect(() => {
        if (open) {
            fetchFrutas();
        }
    }, [open, fetchFrutas]);

    useEffect(() => {
        if (open) {
            if (editingVariedad) {
                // Obtener fruta_id desde frutas (si no viene directamente)
                const frutaId = editingVariedad.fruta_id ?? editingVariedad.frutas?.id_fruta ?? 0;
                setForm({
                    nombre: editingVariedad.nombre || '',
                    fruta_id: frutaId,
                    estado: editingVariedad.estado ?? true,
                });
            } else {
                setForm({ nombre: '', fruta_id: 0, estado: true });
            }
        }
    }, [open, editingVariedad]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        if (form.fruta_id === 0) {
            toast.error('Debes seleccionar una fruta');
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

    const frutasOptions = frutas.map((f) => ({
        value: f.id_fruta.toString(),
        label: f.nombre,
    }));

    const selectedFruta = form.fruta_id !== 0 ? form.fruta_id.toString() : '';

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {editingVariedad ? 'Editar Variedad' : 'Nueva Variedad'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingVariedad ? 'Modifica los datos de la variedad' : 'Completa la información para crear una nueva variedad'}
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">
                            Nombre *
                        </Label>
                        <Input
                            id="nombre"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            required
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fruta" className="text-gray-700 dark:text-gray-300">
                            Fruta *
                        </Label>
                        <Select
                            options={frutasOptions}
                            placeholder="Selecciona una fruta"
                            value={selectedFruta}
                            onChange={(value) => setForm({ ...form, fruta_id: parseInt(value) })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="estado"
                            checked={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label htmlFor="estado" className="text-sm text-gray-700 dark:text-gray-300">
                            Activo
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
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