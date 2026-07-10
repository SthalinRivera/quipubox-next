'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useTiposJaba } from '@/hooks/useTiposJaba';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';
import type { TipoJaba } from '@/types/tipoJaba';

const tipoJabaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    tipo_material: z.enum(['madera', 'plastico']).optional(),
    descripcion: z.string().optional(),
    estado: z.boolean().default(true),
});

type TipoJabaFormData = z.infer<typeof tipoJabaSchema>;

interface TipoJabaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTipo?: TipoJaba | null;
    onSaved: () => void;
}

export function TipoJabaModal({ open, onOpenChange, editingTipo, onSaved }: TipoJabaModalProps) {
    const { create, update } = useTiposJaba();
    const toast = useToast();
    const user = useAuthStore((s) => s.user);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<TipoJabaFormData>({
        resolver: zodResolver(tipoJabaSchema) as any,
        defaultValues: {
            nombre: '',
            tipo_material: undefined,
            descripcion: '',
            estado: true,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            if (editingTipo) {
                reset({
                    nombre: editingTipo.nombre,
                    tipo_material: editingTipo.tipo_material as 'madera' | 'plastico' | undefined,
                    descripcion: editingTipo.descripcion || '',
                    estado: editingTipo.estado,
                });
            } else {
                reset({ nombre: '', tipo_material: undefined, descripcion: '', estado: true });
            }
        }
    }, [open, editingTipo, reset]);

    const materialOptions = [
        { value: 'madera', label: 'Madera' },
        { value: 'plastico', label: 'Plástico' },
    ];

    const onSubmit = async (data: TipoJabaFormData) => {
        if (!user?.id_empresa) {
            toast.error('No se pudo determinar la empresa del usuario');
            return;
        }
        try {
            const payload = {
                id_empresa: user.id_empresa,
                nombre: data.nombre,
                tipo_material: data.tipo_material,
                descripcion: data.descripcion?.trim() === '' ? null : (data.descripcion || null),
                estado: data.estado,
            };
            if (editingTipo) {
                await update(editingTipo.id_tipo_jaba, payload);
                toast.success('Tipo de jaba actualizado');
            } else {
                await create(payload);
                toast.success('Tipo de jaba creado');
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
                    {editingTipo ? 'Editar tipo de jaba' : 'Nuevo tipo de jaba'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingTipo
                        ? 'Modifica los datos del tipo de jaba'
                        : 'Completa la información para crear un nuevo tipo de jaba'}
                </p>

                <div className="space-y-4">
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

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Tipo de material</Label>
                        <Controller
                            name="tipo_material"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={materialOptions}
                                    placeholder="Seleccionar material"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => <Input {...field} />}
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
                        {isSubmitting ? 'Guardando...' : editingTipo ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
