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
import { format } from "date-fns"; // npm install date-fns (o usar new Date().toISOString().slice(0,10))

interface Sede {
    id_sede: number;
    nombre: string;
    tipo_sede: "origen" | "destino" | "ambos" | null;
}

interface Camion {
    id_camion: number;
    placa: string;
}

interface Usuario {
    id_usuario: number;
    nombres: string;
    apellidos: string | null;
    usuarios_roles?: { roles_usuarios: { nombre: string } }[];
}

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
    const [sedesOrigen, setSedesOrigen] = useState<Sede[]>([]);
    const [sedesDestino, setSedesDestino] = useState<Sede[]>([]);
    const [camiones, setCamiones] = useState<Camion[]>([]);
    const [encargados, setEncargados] = useState<Usuario[]>([]);
    const [repartidores, setRepartidores] = useState<Usuario[]>([]);
    const dataLoadedRef = useRef(false);

    // Fecha y hora actual para valores por defecto (formato 'YYYY-MM-DD' y 'HH:MM')
    const now = new Date();
    const defaultFecha = format(now, "yyyy-MM-dd");
    const defaultHora = format(now, "HH:mm");

    const [form, setForm] = useState<CreateOperacionCargaDTO>({
        id_sede_origen: 0,
        id_sede_destino: null,
        id_camion: 0,
        id_encargado_carga: null,
        id_repartidor_asignado: null,
        fecha_carga: defaultFecha,
        hora_carga: defaultHora,
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
                // Cargar sedes, camiones y usuarios en paralelo
                const [sedesRes, camionesRes, usuariosRes] = await Promise.all([
                    fetchWithAuth<Sede[]>("sedes"),
                    fetchWithAuth<Camion[]>("camiones"),
                    fetchWithAuth<Usuario[]>("usuarios"),
                ]);

                if (!isMounted) return;

                // Filtrar sedes por tipo
                const sedes = sedesRes || [];
                const origen = sedes.filter(s => s.tipo_sede === "origen" || s.tipo_sede === "ambos");
                const destino = sedes.filter(s => s.tipo_sede === "destino" || s.tipo_sede === "ambos");
                setSedesOrigen(origen);
                setSedesDestino(destino);

                setCamiones(camionesRes || []);

                // Filtrar usuarios según rol (asumiendo que cada usuario tiene una lista de roles)
                const usuarios = usuariosRes || [];
                const encargadosFiltrados = usuarios.filter(u =>
                    u.usuarios_roles?.some(r => r.roles_usuarios.nombre === "encargado_carga")
                );
                const repartidoresFiltrados = usuarios.filter(u =>
                    u.usuarios_roles?.some(r => r.roles_usuarios.nombre === "repartidor")
                );
                setEncargados(encargadosFiltrados);
                setRepartidores(repartidoresFiltrados);

                dataLoadedRef.current = true;
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

    // Resetear formulario según si estamos editando o creando
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
                hora_carga: editingOperacion.hora_carga ?? defaultHora,
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
                fecha_carga: defaultFecha,
                hora_carga: defaultHora,
                estado: "pendiente",
                observaciones: null,
            });
        }
    }, [editingOperacion, isOpen, defaultFecha, defaultHora]);

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

    // Función auxiliar para renderizar selects con estilo consistente
    const renderSelect = (id: string, label: string, value: number, onChange: (val: number) => void, options: { id: number; label: string }[], required?: boolean, disabled?: boolean) => (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-gray-700 dark:text-gray-300">
                {label} {required && "*"}
            </Label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                required={required}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
            >
                <option value={0}>-- Seleccione --</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const camionesOptions = camiones.map(c => ({ id: c.id_camion, label: c.placa }));
    const sedesOrigenOptions = sedesOrigen.map(s => ({ id: s.id_sede, label: s.nombre }));
    const sedesDestinoOptions = sedesDestino.map(s => ({ id: s.id_sede, label: s.nombre }));
    const encargadosOptions = encargados.map(u => ({ id: u.id_usuario, label: `${u.nombres} ${u.apellidos || ''}`.trim() }));
    const repartidoresOptions = repartidores.map(u => ({ id: u.id_usuario, label: `${u.nombres} ${u.apellidos || ''}`.trim() }));

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
                            {/* Sede origen (solo origen/ambos) */}
                            {renderSelect(
                                "sede_origen",
                                "Sede origen",
                                form.id_sede_origen,
                                (val) => setForm({ ...form, id_sede_origen: val }),
                                sedesOrigenOptions,
                                true
                            )}

                            {/* Sede destino (solo destino/ambos) */}
                            {renderSelect(
                                "sede_destino",
                                "Sede destino",
                                form.id_sede_destino || 0,
                                (val) => setForm({ ...form, id_sede_destino: val || null }),
                                sedesDestinoOptions,
                                false
                            )}

                            {/* Camión */}
                            {renderSelect(
                                "camion",
                                "Camión",
                                form.id_camion,
                                (val) => setForm({ ...form, id_camion: val }),
                                camionesOptions,
                                true
                            )}

                            {/* Fecha (con valor por defecto, pero editable) */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_carga" className="text-gray-700 dark:text-gray-300">
                                    Fecha * (por defecto hoy)
                                </Label>
                                <Input
                                    id="fecha_carga"
                                    type="date"
                                    value={form.fecha_carga}
                                    onChange={(e) => setForm({ ...form, fecha_carga: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Hora (con valor por defecto, editable) */}
                            <div className="space-y-2">
                                <Label htmlFor="hora_carga" className="text-gray-700 dark:text-gray-300">
                                    Hora (por defecto ahora)
                                </Label>
                                <Input
                                    id="hora_carga"
                                    type="time"
                                    value={form.hora_carga ?? ""}
                                    onChange={(e) => setForm({ ...form, hora_carga: e.target.value || null })}
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Encargado (solo usuarios con rol encargado_carga) */}
                            {renderSelect(
                                "encargado",
                                "Encargado de carga",
                                form.id_encargado_carga || 0,
                                (val) => setForm({ ...form, id_encargado_carga: val || null }),
                                encargadosOptions,
                                false
                            )}

                            {/* Repartidor (solo usuarios con rol repartidor) */}
                            {renderSelect(
                                "repartidor",
                                "Repartidor asignado",
                                form.id_repartidor_asignado || 0,
                                (val) => setForm({ ...form, id_repartidor_asignado: val || null }),
                                repartidoresOptions,
                                false
                            )}



                            {/* Observaciones (ocupa ambas columnas) */}
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