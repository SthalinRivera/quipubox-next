'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import type { Cliente } from '@/types/cliente';

// Esquema de validación con Zod
const clienteSchema = z.object({
    nombres: z.string()
        .min(1, 'El nombre es obligatorio')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellidos: z.string()
        .min(1, 'Los apellidos son obligatorios')
        .min(2, 'Los apellidos deben tener al menos 2 caracteres'),
    apodo: z.string()
        .min(1, 'El apodo es obligatorio')
        .min(2, 'El apodo debe tener al menos 2 caracteres'),
    telefono: z.string()
        .min(1, 'El teléfono es obligatorio')
        .regex(/^[0-9]{9,15}$/, 'Teléfono inválido (9 dígitos min)'),
    observaciones: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCliente?: Cliente | null;
    onSaved: () => void;
}

export function ClienteModal({ open, onOpenChange, editingCliente, onSaved }: ClienteModalProps) {
    const { create, update } = useClientes();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            nombres: '',
            apellidos: '',
            apodo: '',
            telefono: '',
            observaciones: '',
        },
        mode: 'onChange',
    });

    // Resetear formulario cuando el modal se abre o cambia el cliente a editar
    useEffect(() => {
        if (open) {
            if (editingCliente) {
                reset({
                    nombres: editingCliente.nombres ?? '',
                    apellidos: editingCliente.apellidos ?? '',
                    apodo: editingCliente.apodo ?? '',
                    telefono: editingCliente.telefono ?? '',
                    observaciones: editingCliente.observaciones ?? '',
                });
            } else {
                reset({
                    nombres: '',
                    apellidos: '',
                    apodo: '',
                    telefono: '',
                    observaciones: '',
                });
            }
        }
    }, [open, editingCliente, reset]);

    const onSubmit = async (data: ClienteFormData) => {
        try {
            const payload = {
                ...data,
                id_empresa: 1,
                estado: true,
            };
            if (editingCliente) {
                await update(editingCliente.id_cliente, payload);
                toast.success('Cliente actualizado');
            } else {
                await create(payload);
                toast.success('Cliente creado');
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
                    {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingCliente
                        ? 'Modifica los datos del cliente'
                        : 'Completa la información para crear un nuevo cliente'}
                </p>

                <div className="space-y-4">
                    {/* Nombres */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Nombres <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="nombres"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.nombres}
                                />
                            )}
                        />
                        {errors.nombres && <p className="mt-1 text-xs text-error-500">{errors.nombres.message}</p>}
                    </div>

                    {/* Apellidos */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Apellidos <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="apellidos"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.apellidos}
                                />
                            )}
                        />
                        {errors.apellidos && <p className="mt-1 text-xs text-error-500">{errors.apellidos.message}</p>}
                    </div>

                    {/* Apodo */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Apodo <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="apodo"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.apodo}
                                />
                            )}
                        />
                        {errors.apodo && <p className="mt-1 text-xs text-error-500">{errors.apodo.message}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Teléfono <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="telefono"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={!!errors.telefono}
                                />
                            )}
                        />
                        {errors.telefono && <p className="mt-1 text-xs text-error-500">{errors.telefono.message}</p>}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Observaciones (opcional)
                        </Label>
                        <Controller
                            name="observaciones"
                            control={control}
                            render={({ field }) => (
                                <TextArea
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    placeholder="Escribe aquí observaciones adicionales"
                                    rows={2}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? 'Guardando...' : editingCliente ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}