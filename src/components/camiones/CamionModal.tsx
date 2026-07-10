'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useCamiones } from '@/hooks/useCamiones';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';
import type { Camion } from '@/types/camion';

const camionSchema = z.object({
    placa: z.string().min(1, 'La placa es obligatoria'),
    descripcion: z.string().optional(),
    observaciones: z.string().optional(),
    estado: z.boolean().default(true),
});

type CamionFormData = z.infer<typeof camionSchema>;

interface CamionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCamion?: Camion | null;
    onSaved: () => void;
}

export function CamionModal({ open, onOpenChange, editingCamion, onSaved }: CamionModalProps) {
    const { create, update } = useCamiones();
    const toast = useToast();
    const user = useAuthStore((s) => s.user);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<CamionFormData>({
        resolver: zodResolver(camionSchema) as any,
        defaultValues: {
            placa: '',
            descripcion: '',
            observaciones: '',
            estado: true,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) {
            if (editingCamion) {
                reset({
                    placa: editingCamion.placa,
                    descripcion: editingCamion.descripcion || '',
                    observaciones: editingCamion.observaciones || '',
                    estado: editingCamion.estado,
                });
            } else {
                reset({ placa: '', descripcion: '', observaciones: '', estado: true });
            }
        }
    }, [open, editingCamion, reset]);

    const onSubmit = async (data: CamionFormData) => {
        if (!user?.id_empresa) {
            toast.error('No se pudo determinar la empresa del usuario');
            return;
        }
        try {
            const payload = {
                id_empresa: user.id_empresa,
                placa: data.placa,
                descripcion: data.descripcion || undefined,
                observaciones: data.observaciones || undefined,
                estado: data.estado,
            };
            if (editingCamion) {
                await update(editingCamion.id_camion, payload);
                toast.success('Camión actualizado');
            } else {
                await create(payload);
                toast.success('Camión creado');
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
                    {editingCamion ? 'Editar camión' : 'Nuevo camión'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingCamion
                        ? 'Modifica los datos del camión'
                        : 'Completa la información para crear un nuevo camión'}
                </p>



                <div className="space-y-4">
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Placa <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="placa"
                            control={control}
                            render={({ field }) => <Input {...field} error={!!errors.placa} />}
                        />
                        {errors.placa && <p className="mt-1 text-xs text-error-500">{errors.placa.message}</p>}
                    </div>

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
                        <Controller name="descripcion" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Observaciones</Label>
                        <Controller name="observaciones" control={control} render={({ field }) => <Input {...field} />} />
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
                        {isSubmitting ? 'Guardando...' : editingCamion ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
