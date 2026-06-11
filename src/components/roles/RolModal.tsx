// components/roles/RolModal.tsx
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/useToast';
import type { Rol } from '@/types/rol';

const rolSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    estado: z.boolean().default(true),
});

type RolFormData = z.infer<typeof rolSchema>;

interface RolModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingRol?: Rol | null;
    onSaved: () => void;
}

export function RolModal({ open, onOpenChange, editingRol, onSaved }: RolModalProps) {
    const { create, update } = useRoles();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<RolFormData>({
        resolver: zodResolver(rolSchema) as any,
        defaultValues: { nombre: '', descripcion: '', estado: true },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            if (editingRol) {
                reset({
                    nombre: editingRol.nombre,
                    descripcion: editingRol.descripcion || '',
                    estado: editingRol.estado,
                });
            } else {
                reset({ nombre: '', descripcion: '', estado: true });
            }
        }
    }, [open, editingRol, reset]);

    const onSubmit = async (data: RolFormData) => {
        try {
            const payload = { ...data, estado: data.estado };
            if (editingRol) {
                await update(editingRol.id_rol_usuario, payload);
                toast.success('Rol actualizado');
            } else {
                await create(payload);
                toast.success('Rol creado');
            }
            onSaved();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {editingRol ? 'Editar rol' : 'Nuevo rol'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingRol
                        ? 'Modifica los datos del rol'
                        : 'Completa la información para crear un nuevo rol'}
                </p>

                <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Nombre <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => <Input {...field} error={!!errors.nombre} />}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
                        <Controller name="descripcion" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    {/* Estado (checkbox) */}
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
                        <Label htmlFor="estado" className="!mb-0 text-gray-700 dark:text-gray-300 cursor-pointer">
                            Activo
                        </Label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? 'Guardando...' : editingRol ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}