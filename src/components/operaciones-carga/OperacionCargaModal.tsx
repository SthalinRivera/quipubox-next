"use client";

import { useState, useEffect, useRef } from "react";
import { useOperacionesCarga } from "@/hooks/useOperacionesCarga";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { OperacionCarga, CreateOperacionCargaDTO } from "@/types/operacionCarga";
import { fetchWithAuth } from "@/lib/api-client";
import DatePicker from "@/components/form/date-picker";

interface OperacionCargaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingOperacion?: OperacionCarga | null;
    onSaved: () => void;
}

export function OperacionCargaModal({
    isOpen,
    onClose,
    editingOperacion,
    onSaved,
}: OperacionCargaModalProps) {
    const { create, update } = useOperacionesCarga();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
    const [camiones, setCamiones] = useState<{ id: number; placa: string }[]>([]);
    const [usuarios, setUsuarios] = useState<{ id: number; nombre: string }[]>([]);
    const dataLoadedRef = useRef(false);

    const [form, setForm] = useState<CreateOperacionCargaDTO>({
        id_sede_origen: 0,
        id_sede_destino: null,
        id_camion: 0,
        id_encargado_carga: null,
        id_repartidor_asignado: null,
        fecha_carga: "",
        hora_carga: null,
        estado: "pendiente",
        observaciones: null,
    });

    // Cargar datos auxiliares una sola vez al abrir el modal
    useEffect(() => {
        if (!isOpen) return;

        if (dataLoadedRef.current) {
            setLoadingData(false);
            return;
        }

        let isMounted = true;
        setLoadingData(true);

        const loadData = async () => {
            try {
                const [sedesRes, camionesRes, usuariosRes] = await Promise.all([
                    fetchWithAuth<{ id_sede: number; nombre: string }[]>("sedes"),
                    fetchWithAuth<{ id_camion: number; placa: string }[]>("camiones"),
                    fetchWithAuth<{ id_usuario: number; nombres: string; apellidos: string | null }[]>("usuarios"),
                ]);

                if (isMounted) {
                    setSedes((sedesRes || []).map(s => ({ id: s.id_sede, nombre: s.nombre })));
                    setCamiones((camionesRes || []).map(c => ({ id: c.id_camion, placa: c.placa })));
                    setUsuarios((usuariosRes || []).map(u => ({
                        id: u.id_usuario,
                        nombre: `${u.nombres} ${u.apellidos || ''}`.trim(),
                    })));
                    dataLoadedRef.current = true;
                }
            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar los datos necesarios");
            } finally {
                if (isMounted) setLoadingData(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [isOpen, toast]);

    // Resetear formulario cuando cambia editingOperacion
    useEffect(() => {
        if (!isOpen) return;
        if (editingOperacion) {
            setForm({
                id_sede_origen: editingOperacion.id_sede_origen,
                id_sede_destino: editingOperacion.id_sede_destino ?? null,
                id_camion: editingOperacion.id_camion,
                id_encargado_carga: editingOperacion.id_encargado_carga ?? null,
                id_repartidor_asignado: editingOperacion.id_repartidor_asignado ?? null,
                fecha_carga: editingOperacion.fecha_carga,
                hora_carga: editingOperacion.hora_carga ?? null,
                estado: editingOperacion.estado,
                observaciones: editingOperacion.observaciones ?? null,
            });
        } else {
            setForm({
                id_sede_origen: 0,
                id_sede_destino: null,
                id_camion: 0,
                id_encargado_carga: null,
                id_repartidor_asignado: null,
                fecha_carga: "",
                hora_carga: null,
                estado: "pendiente",
                observaciones: null,
            });
        }
    }, [editingOperacion, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_sede_origen === 0 || form.id_camion === 0 || !form.fecha_carga) {
            toast.error("Complete los campos obligatorios");
            return;
        }
        setSubmitting(true);
        try {
            if (editingOperacion) {
                await update(editingOperacion.id_operacion, form);
                toast.success("Operación actualizada");
            } else {
                await create(form);
                toast.success("Operación creada");
            }
            onSaved();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al guardar");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingOperacion ? "Editar operación" : "Nueva operación"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos de la operación de carga
                </p>

                {loadingData ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        Cargando datos necesarios...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Sede origen */}
                            <div className="space-y-2">
                                <Label htmlFor="sede_origen" className="text-gray-700 dark:text-gray-300">
                                    Sede origen *
                                </Label>
                                <select
                                    id="sede_origen"
                                    value={form.id_sede_origen}
                                    onChange={(e) => setForm({ ...form, id_sede_origen: parseInt(e.target.value) })}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value={0}>Seleccione una sede</option>
                                    {sedes.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sede destino */}
                            <div className="space-y-2">
                                <Label htmlFor="sede_destino" className="text-gray-700 dark:text-gray-300">
                                    Sede destino (opcional)
                                </Label>
                                <select
                                    id="sede_destino"
                                    value={form.id_sede_destino ?? 0}
                                    onChange={(e) => setForm({ ...form, id_sede_destino: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value={0}>-- Ninguna --</option>
                                    {sedes.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Camión */}
                            <div className="space-y-2">
                                <Label htmlFor="camion" className="text-gray-700 dark:text-gray-300">
                                    Camión *
                                </Label>
                                <select
                                    id="camion"
                                    value={form.id_camion}
                                    onChange={(e) => setForm({ ...form, id_camion: parseInt(e.target.value) })}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value={0}>Seleccione un camión</option>
                                    {camiones.map(c => (
                                        <option key={c.id} value={c.id}>{c.placa}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_carga" className="text-gray-700 dark:text-gray-300">
                                    Fecha *
                                </Label>
                                <DatePicker
                                    id="fecha_carga"
                                    placeholder="dd/mm/aaaa"
                                    onChange={(_, currentDateString) => {
                                        setForm({ ...form, fecha_carga: currentDateString || "" });
                                    }}
                                />
                            </div>

                            {/* Hora */}
                            <div className="space-y-2">
                                <Label htmlFor="hora_carga" className="text-gray-700 dark:text-gray-300">
                                    Hora (opcional)
                                </Label>
                                <Input
                                    id="hora_carga"
                                    type="time"
                                    value={form.hora_carga ?? ""}
                                    onChange={(e) => setForm({ ...form, hora_carga: e.target.value || null })}
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Encargado */}
                            <div className="space-y-2">
                                <Label htmlFor="encargado" className="text-gray-700 dark:text-gray-300">
                                    Encargado
                                </Label>
                                <select
                                    id="encargado"
                                    value={form.id_encargado_carga ?? 0}
                                    onChange={(e) => setForm({ ...form, id_encargado_carga: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value={0}>-- Sin asignar --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Repartidor */}
                            <div className="space-y-2">
                                <Label htmlFor="repartidor" className="text-gray-700 dark:text-gray-300">
                                    Repartidor
                                </Label>
                                <select
                                    id="repartidor"
                                    value={form.id_repartidor_asignado ?? 0}
                                    onChange={(e) => setForm({ ...form, id_repartidor_asignado: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value={0}>-- Sin asignar --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="estado" className="text-gray-700 dark:text-gray-300">
                                    Estado
                                </Label>
                                <select
                                    id="estado"
                                    value={form.estado}
                                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_proceso">En proceso</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            {/* Observaciones */}
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="observaciones" className="text-gray-700 dark:text-gray-300">
                                    Observaciones
                                </Label>
                                <textarea
                                    id="observaciones"
                                    rows={3}
                                    value={form.observaciones ?? ""}
                                    onChange={(e) => setForm({ ...form, observaciones: e.target.value || null })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                    placeholder="Observaciones adicionales"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Guardando..." : (editingOperacion ? "Actualizar" : "Crear")}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}