'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import type { Empresa } from '@/types/empresa';

// Esquema con estado obligatorio (siempre presente)
const empresaSchema = z.object({
    razon_social: z.string().min(1, 'La razón social es obligatoria'),
    nombre_comercial: z.string().min(1, 'El nombre comercial es obligatorio'),
    ruc: z.string()
        .optional()
        .refine(val => !val || /^\d{11}$/.test(val), { message: 'El RUC debe tener 11 dígitos' }),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    estado: z.boolean(), // ahora es obligatorio, pero se asigna por default en el formulario
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEmpresa?: Empresa | null;
    onSaved: () => void;
}

export function EmpresaModal({ isOpen, onClose, editingEmpresa, onSaved }: EmpresaModalProps) {
    const { create, update } = useEmpresas();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<EmpresaFormData>({
        resolver: zodResolver(empresaSchema),
        defaultValues: {
            razon_social: '',
            nombre_comercial: '',
            ruc: '',
            telefono: '',
            direccion: '',
            estado: true,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen) {
            if (editingEmpresa) {
                reset({
                    razon_social: editingEmpresa.razon_social ?? '',
                    nombre_comercial: editingEmpresa.nombre_comercial ?? '',
                    ruc: editingEmpresa.ruc ?? '',
                    telefono: editingEmpresa.telefono ?? '',
                    direccion: editingEmpresa.direccion ?? '',
                    estado: editingEmpresa.estado ?? true,
                });
            } else {
                reset({
                    razon_social: '',
                    nombre_comercial: '',
                    ruc: '',
                    telefono: '',
                    direccion: '',
                    estado: true,
                });
            }
        }
    }, [isOpen, editingEmpresa, reset]);

    const onSubmit = async (data: EmpresaFormData) => {
        try {
            const payload = {
                razon_social: data.razon_social,
                nombre_comercial: data.nombre_comercial,
                ruc: data.ruc || undefined,
                telefono: data.telefono || undefined,
                direccion: data.direccion || undefined,
                estado: data.estado,
            };
            if (editingEmpresa) {
                await update(editingEmpresa.id_empresa, payload);
                toast.success('Empresa actualizada');
            } else {
                await create(payload);
                toast.success('Empresa creada');
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
                    {editingEmpresa ? 'Editar empresa' : 'Nueva empresa'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingEmpresa
                        ? 'Modifica los datos de la empresa'
                        : 'Completa la información para crear una nueva empresa'}
                </p>

                <div className="space-y-4">
                    {/* Razón Social */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Razón Social <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="razon_social"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.razon_social}
                                />
                            )}
                        />
                        {errors.razon_social && <p className="mt-1 text-xs text-error-500">{errors.razon_social.message}</p>}
                    </div>

                    {/* Nombre Comercial */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Nombre Comercial <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="nombre_comercial"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.nombre_comercial}
                                />
                            )}
                        />
                        {errors.nombre_comercial && <p className="mt-1 text-xs text-error-500">{errors.nombre_comercial.message}</p>}
                    </div>

                    {/* RUC */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">RUC</Label>
                        <Controller
                            name="ruc"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.ruc}
                                />
                            )}
                        />
                        {errors.ruc && <p className="mt-1 text-xs text-error-500">{errors.ruc.message}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Teléfono</Label>
                        <Controller
                            name="telefono"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Dirección</Label>
                        <Controller
                            name="direccion"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    {/* Estado (checkbox) */}
                    <div className="flex items-center gap-2 pt-2">
                        <Controller
                            name="estado"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="checkbox"
                                    id="estado"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-brand-500"
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
                        {isSubmitting ? 'Guardando...' : editingEmpresa ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}