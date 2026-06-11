// components/lugares-operativos/LugarOperativoModal.tsx
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
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { TipoLugar, TIPOS_LUGAR } from '@/types/enums';
import type { LugarOperativo } from '@/types/lugarOperativo';

const lugarOperativoSchema = z.object({
    id_empresa: z.number().min(1, 'Debes seleccionar una empresa'),
    id_sede: z.number().min(1, 'Debes seleccionar una sede'),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    direccion_referencia: z.string().optional(),
    observaciones: z.string().optional(),
    tipo_lugar: z.enum(TIPOS_LUGAR as [string, ...string[]]),
    estado: z.boolean().default(true),
});

type LugarOperativoFormData = z.infer<typeof lugarOperativoSchema>;

interface LugarOperativoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingMercado?: LugarOperativo | null;
    onSaved: () => void;
}

export function LugarOperativoModal({ open, onOpenChange, editingMercado, onSaved }: LugarOperativoModalProps) {
    const { create, update } = useLugarOperativo();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LugarOperativoFormData>({
        resolver: zodResolver(lugarOperativoSchema) as any,
        defaultValues: {
            id_empresa: 0,
            id_sede: 0,
            nombre: '',
            direccion_referencia: '',
            observaciones: '',
            tipo_lugar: TipoLugar.MERCADO,
            estado: true,
        },
        mode: 'onChange',
    });

    const selectedEmpresaId = watch('id_empresa');

    // Cargar datos iniciales
    useEffect(() => {
        if (open) {
            fetchEmpresas();
            if (selectedEmpresaId) fetchSedes();
        }
    }, [open, fetchEmpresas, fetchSedes, selectedEmpresaId]);

    // Resetear formulario al abrir/cerrar o cambiar editingMercado
    useEffect(() => {
        if (open) {
            if (editingMercado) {
                reset({
                    id_empresa: editingMercado.id_empresa,
                    id_sede: editingMercado.id_sede,
                    nombre: editingMercado.nombre,
                    direccion_referencia: editingMercado.direccion_referencia || '',
                    observaciones: editingMercado.observaciones || '',
                    tipo_lugar: editingMercado.tipo_lugar as TipoLugar,
                    estado: editingMercado.estado,
                });
            } else {
                reset({
                    id_empresa: 0,
                    id_sede: 0,
                    nombre: '',
                    direccion_referencia: '',
                    observaciones: '',
                    tipo_lugar: TipoLugar.MERCADO,
                    estado: true,
                });
            }
        }
    }, [open, editingMercado, reset]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    // Filtrar sedes según empresa seleccionada
    const sedesFiltradas = sedes.filter(s => s.id_empresa === selectedEmpresaId);
    const sedesOptions = sedesFiltradas.map(s => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));

    const tipoLugarOptions = TIPOS_LUGAR.map(valor => ({
        value: valor,
        label: valor.charAt(0).toUpperCase() + valor.slice(1),
    }));

    const onSubmit = async (data: LugarOperativoFormData) => {
        try {
            const payload = {
                id_empresa: data.id_empresa,
                id_sede: data.id_sede,
                nombre: data.nombre,
                direccion_referencia: data.direccion_referencia || undefined,
                observaciones: data.observaciones || undefined,
                tipo_lugar: data.tipo_lugar,
                estado: data.estado,
            };
            if (editingMercado) {
                await update(editingMercado.id_lugar, payload);
                toast.success('Lugar operativo actualizado');
            } else {
                await create(payload);
                toast.success('Lugar operativo creado');
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
                    {editingMercado ? 'Editar lugar operativo' : 'Nuevo lugar operativo'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingMercado
                        ? 'Modifica los datos del lugar operativo'
                        : 'Completa la información para crear un nuevo lugar operativo'}
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

                    {/* Sede */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Sede <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="id_sede"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={sedesOptions}
                                    placeholder="Seleccionar sede"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(val) => field.onChange(Number(val))}
                                    disabled={!selectedEmpresaId}
                                />
                            )}
                        />
                        {errors.id_sede && <p className="mt-1 text-xs text-error-500">{errors.id_sede.message}</p>}
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

                    {/* Tipo de lugar */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Tipo de lugar <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="tipo_lugar"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={tipoLugarOptions}
                                    placeholder="Seleccionar tipo"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    {/* Dirección / Referencia */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Dirección / Referencia</Label>
                        <Controller name="direccion_referencia" control={control} render={({ field }) => <Input {...field} />} />
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Observaciones</Label>
                        <Controller name="observaciones" control={control} render={({ field }) => <Input {...field} />} />
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
                        {isSubmitting ? 'Guardando...' : editingMercado ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}