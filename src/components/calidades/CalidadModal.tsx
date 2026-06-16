// components/calidades/CalidadModal.tsx
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
import { useCalidades } from '@/hooks/useCalidades';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useToast } from '@/hooks/useToast';
import type { Calidad } from '@/types/calidad';

const calidadSchema = z.object({
    id_empresa: z.number().min(1, 'Debes seleccionar una empresa'),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    estado: z.boolean().default(true),
});

type CalidadFormData = z.infer<typeof calidadSchema>;

interface CalidadModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCalidad?: Calidad | null;
    onSaved: () => void;
}

export function CalidadModal({ isOpen, onClose, editingCalidad, onSaved }: CalidadModalProps) {
    const { create, update } = useCalidades();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<CalidadFormData>({
        resolver: zodResolver(calidadSchema) as any,
        defaultValues: { id_empresa: 0, nombre: '', descripcion: '', estado: true },
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen) fetchEmpresas();
    }, [isOpen, fetchEmpresas]);

    useEffect(() => {
        if (isOpen) {
            if (editingCalidad) {
                reset({
                    id_empresa: editingCalidad.id_empresa,
                    nombre: editingCalidad.nombre,
                    descripcion: editingCalidad.descripcion || '',
                    estado: editingCalidad.estado,
                });
            } else {
                reset({ id_empresa: 0, nombre: '', descripcion: '', estado: true });
            }
        }
    }, [isOpen, editingCalidad, reset]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const onSubmit = async (data: CalidadFormData) => {
        try {
            const payload = {
                id_empresa: data.id_empresa,
                nombre: data.nombre,
                descripcion: data.descripcion?.trim() === '' ? null : (data.descripcion || null),
                estado: data.estado,
            };
            if (editingCalidad) {
                await update(editingCalidad.id_calidad, payload);
                toast.success('Calidad actualizada');
            } else {
                await create(payload);
                toast.success('Calidad creada');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {editingCalidad ? 'Editar calidad' : 'Nueva calidad'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingCalidad
                        ? 'Modifica los datos de la calidad'
                        : 'Completa la información para crear una nueva calidad'}
                </p>

                <div className="space-y-4">
                    {/* Empresa */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Empresa <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="id_empresa"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={empresasOptions}
                                    placeholder="Seleccionar empresa"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(val) => field.onChange(Number(val))}
                                />
                            )}
                        />
                        {errors.id_empresa && <p className="mt-1 text-xs text-error-500">{errors.id_empresa.message}</p>}
                    </div>

                    {/* Nombre */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Nombre <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} error={!!errors.nombre} />
                            )}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
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
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? 'Guardando...' : editingCalidad ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}