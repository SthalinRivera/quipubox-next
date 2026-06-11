// components/frutas/FrutaModal.tsx
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useFrutas } from '@/hooks/useFrutas';
import { useToast } from '@/hooks/useToast';
import type { Fruta } from '@/types/fruta';

const frutaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    estado: z.boolean().default(true),
});

type FrutaFormData = z.infer<typeof frutaSchema>;

interface FrutaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingFruta: Fruta | null;
    onSaved: () => void;
}

export function FrutaModal({ open, onOpenChange, editingFruta, onSaved }: FrutaModalProps) {
    const { create, update } = useFrutas();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<FrutaFormData>({
        resolver: zodResolver(frutaSchema) as any,
        defaultValues: { nombre: '', descripcion: '', estado: true },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            if (editingFruta) {
                reset({
                    nombre: editingFruta.nombre,
                    descripcion: editingFruta.descripcion || '',
                    estado: editingFruta.estado ?? true,
                });
            } else {
                reset({ nombre: '', descripcion: '', estado: true });
            }
        }
    }, [open, editingFruta, reset]);

    const onSubmit = async (data: FrutaFormData) => {
        try {
            if (editingFruta) {
                await update(editingFruta.id_fruta, data);
                toast.success('Fruta actualizada');
            } else {
                await create(data);
                toast.success('Fruta creada');
            }
            onSaved(); // solo cierra el modal, NO llama a fetchAll
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {editingFruta ? 'Editar Fruta' : 'Nueva Fruta'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingFruta ? 'Modifica los datos de la fruta' : 'Completa la información para crear una nueva fruta'}
                </p>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">
                            Nombre <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="nombre"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.nombre}
                                />
                            )}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="descripcion" className="text-gray-700 dark:text-gray-300">
                            Descripción
                        </Label>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="descripcion"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Controller
                            name="estado"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="checkbox"
                                    id="estado"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                                />
                            )}
                        />
                        <Label htmlFor="estado" className="!mb-0 text-gray-700 dark:text-gray-300">
                            Activo
                        </Label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? 'Guardando...' : editingFruta ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}