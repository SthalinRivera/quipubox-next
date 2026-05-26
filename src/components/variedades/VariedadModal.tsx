'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
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
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Partial<Variedad>>({
        defaultValues: { nombre: '', fruta_id: 0, estado: true }
    });
    const { create, update } = useVariedades();
    const toast = useToast();

    useEffect(() => {
        if (editingVariedad) {
            setValue('nombre', editingVariedad.nombre);
            setValue('fruta_id', editingVariedad.fruta_id);
            setValue('estado', editingVariedad.estado);
        } else {
            reset({ nombre: '', fruta_id: 0, estado: true });
        }
    }, [editingVariedad, setValue, reset]);

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onSubmit = async (data: Partial<Variedad>) => {
        try {
            if (editingVariedad) {
                await update(editingVariedad.id_variedad, data);
                toast.success('Variedad actualizada');
            } else {
                await create(data);
                toast.success('Variedad creada');
            }
            onSaved();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} title={editingVariedad ? 'Editar Variedad' : 'Nueva Variedad'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nombre"
                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                    error={!!errors.nombre}
                    hint={errors.nombre?.message}
                />
                <Input
                    label="ID de Fruta"
                    type="number"
                    {...register('fruta_id', { required: 'La fruta es obligatoria', valueAsNumber: true })}
                    error={!!errors.fruta_id}
                    hint={errors.fruta_id?.message}
                />
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="estado" {...register('estado')} />
                    <label htmlFor="estado" className="text-sm text-gray-700 dark:text-gray-300">Activo</label>
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}