'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSedes } from '@/hooks/useSedes';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import type { Sede } from '@/types/sede';

// ✅ Esquema con tipos exactos
const sedeSchema = z.object({
    id_empresa: z.number().min(1, 'Debes seleccionar una empresa'),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    tipo_sede: z.enum(['origen', 'destino', 'ambos']).optional(),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    departamento: z.string().optional(),
    estado: z.boolean().default(true),
});

type SedeFormData = z.infer<typeof sedeSchema>;

interface SedeModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingSede?: Sede | null;
    onSaved: () => void;
}

export function SedeModal({ isOpen, onClose, editingSede, onSaved }: SedeModalProps) {
    const { create, update } = useSedes();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<SedeFormData>({
        resolver: zodResolver(sedeSchema) as any,
        defaultValues: {
            id_empresa: 0,          // ✅ valor numérico, no undefined
            nombre: '',
            tipo_sede: undefined,
            direccion: '',
            ciudad: '',
            departamento: '',
            estado: true,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (editingSede) {
                reset({
                    id_empresa: editingSede.id_empresa,
                    nombre: editingSede.nombre,
                    tipo_sede: editingSede.tipo_sede as 'origen' | 'destino' | 'ambos' | undefined,
                    direccion: editingSede.direccion || '',
                    ciudad: editingSede.ciudad || '',
                    departamento: editingSede.departamento || '',
                    estado: editingSede.estado,
                });
            } else {
                reset({
                    id_empresa: 0,
                    nombre: '',
                    tipo_sede: undefined,
                    direccion: '',
                    ciudad: '',
                    departamento: '',
                    estado: true,
                });
            }
        }
    }, [isOpen, editingSede, reset]);

    const empresasOptions = empresas.map((emp) => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const tipoOptions = [
        { value: 'origen', label: 'Origen' },
        { value: 'destino', label: 'Destino' },
        { value: 'ambos', label: 'Ambos' },
    ];

    const onSubmit = async (data: SedeFormData) => {
        try {
            const payload = {
                id_empresa: data.id_empresa,
                nombre: data.nombre,
                tipo_sede: data.tipo_sede,
                direccion: data.direccion || undefined,
                ciudad: data.ciudad || undefined,
                departamento: data.departamento || undefined,
                estado: data.estado,
            };
            if (editingSede) {
                await update(editingSede.id_sede, payload);
                toast.success('Sede actualizada');
            } else {
                await create(payload);
                toast.success('Sede creada');
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
                    {editingSede ? 'Editar sede' : 'Nueva sede'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingSede
                        ? 'Modifica los datos de la sede'
                        : 'Completa la información para crear una nueva sede'}
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
                            render={({ field }) => <Input {...field} error={!!errors.nombre} />}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                    </div>

                    {/* Tipo de sede */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Tipo de sede</Label>
                        <Controller
                            name="tipo_sede"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={tipoOptions}
                                    placeholder="Seleccionar tipo"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Dirección</Label>
                        <Controller name="direccion" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    {/* Ciudad */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Ciudad</Label>
                        <Controller name="ciudad" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    {/* Departamento */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Departamento</Label>
                        <Controller name="departamento" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    {/* Estado */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Estado</Label>
                        <Controller
                            name="estado"
                            control={control}
                            render={({ field }) => (
                                <select
                                    value={field.value ? 'activo' : 'inactivo'}
                                    onChange={(e) => field.onChange(e.target.value === 'activo')}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-400"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                        {isSubmitting ? 'Guardando...' : editingSede ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}