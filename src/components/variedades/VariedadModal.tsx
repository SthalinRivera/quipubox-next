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
import { useVariedades } from '@/hooks/useVariedades';
import { useFrutas } from '@/hooks/useFrutas';
import { useToast } from '@/hooks/useToast';
import type { Variedad } from '@/types/variedad';

// ✅ Cambiamos fruta_id → id_fruta
const variedadSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    id_fruta: z.number().min(1, 'Debes seleccionar una fruta'),
    estado: z.boolean().default(true),
});

type VariedadFormData = z.infer<typeof variedadSchema>;

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

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<VariedadFormData>({
        resolver: zodResolver(variedadSchema) as any,
        defaultValues: { nombre: '', id_fruta: 0, estado: true },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open) fetchFrutas();
    }, [open, fetchFrutas]);

    useEffect(() => {
        if (open) {
            if (editingVariedad) {
                // ✅ Usamos id_fruta (puede venir de la relación o directamente)
                const frutaId = editingVariedad.id_fruta ?? editingVariedad.frutas?.id_fruta ?? 0;
                reset({
                    nombre: editingVariedad.nombre,
                    id_fruta: frutaId,
                    estado: editingVariedad.estado ?? true,
                });
            } else {
                reset({ nombre: '', id_fruta: 0, estado: true });
            }
        }
    }, [open, editingVariedad, reset]);

    const frutasOptions = frutas.map((f) => ({
        value: f.id_fruta.toString(),
        label: f.nombre,
    }));

    const onSubmit = async (data: VariedadFormData) => {
        try {
            // ✅ Enviamos id_fruta (no fruta_id) y el id_empresa que necesites
            const payload = {
                nombre: data.nombre,
                id_fruta: data.id_fruta,
                estado: data.estado,
                id_empresa: 1, // Ajusta según tu lógica (siempre requerido)
                
            };
            if (editingVariedad) {
                await update(editingVariedad.id_variedad, payload);
                toast.success('Variedad actualizada');
            } else {
                await create(payload);
                toast.success('Variedad creada');
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
                    {editingVariedad ? 'Editar Variedad' : 'Nueva Variedad'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingVariedad ? 'Modifica los datos de la variedad' : 'Completa la información para crear una nueva variedad'}
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

                    {/* Fruta - ahora con id_fruta */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Fruta <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="id_fruta"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={frutasOptions}
                                    placeholder="Selecciona una fruta"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(val) => field.onChange(Number(val))}
                                />
                            )}
                        />
                        {errors.id_fruta && <p className="mt-1 text-xs text-error-500">{errors.id_fruta.message}</p>}
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
                        {isSubmitting ? 'Guardando...' : editingVariedad ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}