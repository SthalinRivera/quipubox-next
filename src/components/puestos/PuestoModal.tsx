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
import { usePuestos } from '@/hooks/usePuestos';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';
import type { Puesto } from '@/types/puesto';

const puestoSchema = z.object({
    id_lugar: z.number().min(1, 'Debes seleccionar un mercado'),
    numero_puesto: z.string().min(1, 'El número de puesto es obligatorio'),
    referencia: z.string().optional(),
    estado: z.boolean().default(true),
});

type PuestoFormData = z.infer<typeof puestoSchema>;

interface PuestoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingPuesto?: Puesto | null;
    onSaved: () => void;
}

export function PuestoModal({ open, onOpenChange, editingPuesto, onSaved }: PuestoModalProps) {
    const { create, update } = usePuestos();
    const { lugares, fetchAll: fetchMercados } = useLugarOperativo();
    const toast = useToast();
    const user = useAuthStore((s) => s.user);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<PuestoFormData>({
        resolver: zodResolver(puestoSchema) as any,
        defaultValues: {
            id_lugar: 0,
            numero_puesto: '',
            referencia: '',
            estado: true,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) fetchMercados();
    }, [open, fetchMercados]);

    useEffect(() => {
        if (open) {
            if (editingPuesto) {
                reset({
                    id_lugar: editingPuesto.id_lugar,
                    numero_puesto: editingPuesto.numero_puesto,
                    referencia: editingPuesto.referencia || '',
                    estado: editingPuesto.estado,
                });
            } else {
                reset({ id_lugar: 0, numero_puesto: '', referencia: '', estado: true });
            }
        }
    }, [open, editingPuesto, reset]);

    const mercadosOptions = lugares.map(m => ({
        value: m.id_lugar.toString(),
        label: m.nombre,
    }));

    const onSubmit = async (data: PuestoFormData) => {
        if (!user?.id_empresa) {
            toast.error('No se pudo determinar la empresa del usuario');
            return;
        }
        try {
            const payload = {
                id_empresa: user.id_empresa,
                id_lugar: data.id_lugar,
                numero_puesto: data.numero_puesto,
                referencia: data.referencia?.trim() === '' ? null : (data.referencia || null),
                estado: data.estado,
            };
            if (editingPuesto) {
                await update(editingPuesto.id_puesto, payload);
                toast.success('Puesto actualizado');
            } else {
                await create(payload);
                toast.success('Puesto creado');
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
                    {editingPuesto ? 'Editar puesto' : 'Nuevo puesto'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingPuesto
                        ? 'Modifica los datos del puesto'
                        : 'Completa la información para crear un nuevo puesto'}
                </p>

                <div className="space-y-4">
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Mercado <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="id_lugar"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={mercadosOptions}
                                    placeholder="Seleccionar mercado"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(val) => field.onChange(Number(val))}
                                />
                            )}
                        />
                        {errors.id_lugar && <p className="mt-1 text-xs text-error-500">{errors.id_lugar.message}</p>}
                    </div>

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Número de puesto <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="numero_puesto"
                            control={control}
                            render={({ field }) => <Input {...field} error={!!errors.numero_puesto} />}
                        />
                        {errors.numero_puesto && <p className="mt-1 text-xs text-error-500">{errors.numero_puesto.message}</p>}
                    </div>

                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Referencia</Label>
                        <Controller name="referencia" control={control} render={({ field }) => <Input {...field} />} />
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
                        {isSubmitting ? 'Guardando...' : editingPuesto ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
