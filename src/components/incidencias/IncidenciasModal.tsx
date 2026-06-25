// src/components/incidencias/IncidenciaModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useIncidencias } from '@/hooks/useIncidencias';
import { useToast } from '@/hooks/useToast';
import type { Incidencia } from '@/types/incidencia';

// Esquema de validación
const incidenciaSchema = z.object({
    fecha_incidencia: z.string().min(1, 'La fecha es obligatoria'),
    hora_incidencia: z.string().optional(),
    tipo_incidencia: z.string().min(1, 'El tipo es obligatorio'),
    descripcion: z.string().min(1, 'La descripción es obligatoria'),
    estado: z.string().default('abierta'),
});

type IncidenciaFormData = z.infer<typeof incidenciaSchema>;

interface IncidenciaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    incidencia?: Incidencia | null;
}

export default function IncidenciaModal({
    isOpen,
    onClose,
    onSuccess,
    incidencia,
}: IncidenciaModalProps) {
    const { create, updateWithFiles, update } = useIncidencias();
    const toast = useToast();

    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<IncidenciaFormData>({
        resolver: zodResolver(incidenciaSchema) as any,
        defaultValues: {
            fecha_incidencia: new Date().toISOString().split('T')[0],
            hora_incidencia: '',
            tipo_incidencia: '',
            descripcion: '',
            estado: 'abierta',
        },
        mode: 'onChange',
    });

    // Cargar datos al editar
    useEffect(() => {
        if (isOpen) {
            if (incidencia) {
                reset({
                    fecha_incidencia: incidencia.fecha_incidencia?.split('T')[0] || '',
                    hora_incidencia: incidencia.hora_incidencia || '',
                    tipo_incidencia: incidencia.tipo_incidencia || '',
                    descripcion: incidencia.descripcion || '',
                    estado: incidencia.estado || 'abierta',
                });
                // Los archivos no se precargan
                setFiles([]);
            } else {
                reset({
                    fecha_incidencia: new Date().toISOString().split('T')[0],
                    hora_incidencia: '',
                    tipo_incidencia: '',
                    descripcion: '',
                    estado: 'abierta',
                });
                setFiles([]);
            }
        }
    }, [isOpen, incidencia, reset]);

    const onSubmit = async (data: IncidenciaFormData) => {
        console.log('📝 Datos del formulario:', data);
        console.log('📸 Archivos seleccionados:', files);

        setSubmitting(true);
        try {
            const formData = new FormData();
            // Agregar campos
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            // Agregar archivos (si los hay)
            files.forEach((file) => {
                formData.append('evidencias', file);
            });

            let result;
            if (incidencia) {
                console.log("se agreggo un incidendia ", incidencia);

                // Edición: si hay archivos, usamos updateWithFiles; si no, update normal
                if (files.length > 0) {
                    result = await updateWithFiles(incidencia.id_incidencia, formData);
                } else {
                    // Solo actualizar datos (sin archivos)
                    result = await update(incidencia.id_incidencia, data);
                }
                toast.success('Incidencia actualizada');
            } else {
                result = await create(formData);
                toast.success('Incidencia creada');
            }
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar la incidencia');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-5 lg:p-10 z-99999">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {incidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {incidencia
                        ? 'Modifica los datos de la incidencia'
                        : 'Completa la información para registrar una incidencia'}
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Fecha */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Fecha <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                            name="fecha_incidencia"
                            control={control}
                            render={({ field }) => (
                                <Input type="date" {...field} error={!!errors.fecha_incidencia} />
                            )}
                        />
                        {errors.fecha_incidencia && (
                            <p className="mt-1 text-xs text-error-500">{errors.fecha_incidencia.message}</p>
                        )}
                    </div>

                    {/* Hora */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Hora</Label>
                        <Controller
                            name="hora_incidencia"
                            control={control}
                            render={({ field }) => <Input type="time" {...field} />}
                        />
                    </div>
                </div>

                {/* Tipo */}
                <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                        Tipo <span className="text-error-500">*</span>
                    </Label>
                    <Controller
                        name="tipo_incidencia"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="cambio_destino">Cambio de destino</option>
                                <option value="rechazo_receptor">Rechazo del receptor</option>
                                <option value="diferencia_cantidad">Diferencia de cantidad</option>
                                <option value="daño_producto">Daño al producto</option>
                                <option value="perdida_jaba">Pérdida de jaba</option>
                                <option value="accidente">Accidente</option>
                                <option value="otro">Otro</option>
                            </select>
                        )}
                    />
                    {errors.tipo_incidencia && (
                        <p className="mt-1 text-xs text-error-500">{errors.tipo_incidencia.message}</p>
                    )}
                </div>

                {/* Descripción */}
                <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                        Descripción <span className="text-error-500">*</span>
                    </Label>
                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                placeholder="Describe la incidencia"
                            />
                        )}
                    />
                    {errors.descripcion && (
                        <p className="mt-1 text-xs text-error-500">{errors.descripcion.message}</p>
                    )}
                </div>

                {/* Estado (solo para edición) */}
                {incidencia && (
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Estado</Label>
                        <Controller
                            name="estado"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                >
                                    <option value="abierta">Abierta</option>
                                    <option value="cerrada">Cerrada</option>
                                </select>
                            )}
                        />
                    </div>
                )}

                {/* Subida de archivos */}
                <div>
                    <Label className="text-gray-700 dark:text-gray-300">Evidencias (imágenes)</Label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/20 dark:file:text-brand-400"
                    />
                    {files.length > 0 && (
                        <p className="mt-1 text-sm text-gray-600">{files.length} archivo(s) seleccionado(s)</p>
                    )}
                    {incidencia && incidencia.evidencias && incidencia.evidencias.length > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                            📷 {incidencia.evidencias.length} evidencias existentes (no se modificarán)
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={submitting || !isValid}>
                        {submitting
                            ? 'Guardando...'
                            : incidencia
                                ? 'Actualizar'
                                : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}