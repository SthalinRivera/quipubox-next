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
import DatePicker from "@/components/form/date-picker"; // Ajusta la ruta
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
    const dataLoadedRef = useRef(false); // <- para evitar cargar dos veces

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

    // Efecto para cargar datos auxiliares UNA SOLA VEZ al abrir el modal
    useEffect(() => {
        console.log("[Modal] isOpen =", isOpen, "dataLoadedRef.current =", dataLoadedRef.current);
        if (!isOpen) return;

        if (dataLoadedRef.current) {
            console.log("[Modal] Datos ya cargados, no recargar");
            setLoadingData(false);
            return;
        }

        let isMounted = true;
        console.log("[Modal] Iniciando carga de datos auxiliares...");
        setLoadingData(true);

        const loadData = async () => {
            try {
                console.log("[Modal] Llamando a fetchWithAuth para sedes, camiones, usuarios");
                const [sedesRes, camionesRes, usuariosRes] = await Promise.all([
                    fetchWithAuth<{ id_sede: number; nombre: string }[]>("sedes"),
                    fetchWithAuth<{ id_camion: number; placa: string }[]>("camiones"),
                    fetchWithAuth<{ id_usuario: number; nombres: string; apellidos: string | null }[]>("usuarios"),
                ]);

                console.log("[Modal] Respuesta sedes (raw):", sedesRes);
                console.log("[Modal] Respuesta camiones (raw):", camionesRes);
                console.log("[Modal] Respuesta usuarios (raw):", usuariosRes);

                if (isMounted) {
                    const mappedSedes = (sedesRes || []).map(s => ({ id: s.id_sede, nombre: s.nombre }));
                    const mappedCamiones = (camionesRes || []).map(c => ({ id: c.id_camion, placa: c.placa }));
                    const mappedUsuarios = (usuariosRes || []).map(u => ({
                        id: u.id_usuario,
                        nombre: `${u.nombres} ${u.apellidos || ''}`.trim()
                    }));

                    setSedes(mappedSedes);
                    setCamiones(mappedCamiones);
                    setUsuarios(mappedUsuarios);
                    dataLoadedRef.current = true;
                    console.log("[Modal] Datos guardados en estado. Sedes:", mappedSedes.length, "Camiones:", mappedCamiones.length, "Usuarios:", mappedUsuarios.length);
                }
            } catch (error) {
                console.error("[Modal] Error cargando datos:", error);
                toast.error("No se pudieron cargar los datos necesarios");
            } finally {
                if (isMounted) {
                    setLoadingData(false);
                    console.log("[Modal] loadingData = false");
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
            console.log("[Modal] Cleanup (modal cerrado o desmontado)");
        };
    }, [isOpen, toast]); // Solo depende de isOpen, pero dataLoadedRef evita recarga

    // Efecto para resetear el formulario cuando cambia editingOperacion
    useEffect(() => {
        if (!isOpen) return;
        console.log("[Modal] Resetear formulario, editingOperacion =", editingOperacion ? "Sí" : "No");
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
        console.log("[Modal] Submit form, valores:", form);
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
            console.error("[Modal] Error al guardar:", error);
            toast.error(error.message || "Error al guardar");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6">
                <h2 className="text-xl font-semibold">
                    {editingOperacion ? "Editar operación" : "Nueva operación"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">Complete los datos</p>

                {loadingData ? (
                    <div className="py-8 text-center text-gray-500">Cargando datos necesarios...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Sede origen */}
                            <div className="space-y-2">
                                <Label>Sede origen *</Label>
                                <select
                                    value={form.id_sede_origen}
                                    onChange={(e) => setForm({ ...form, id_sede_origen: parseInt(e.target.value) })}
                                    required
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value={0}>Seleccione</option>
                                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>

                            {/* Sede destino */}
                            <div className="space-y-2">
                                <Label>Sede destino (opcional)</Label>
                                <select
                                    value={form.id_sede_destino ?? 0}
                                    onChange={(e) => setForm({ ...form, id_sede_destino: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value={0}>-- Ninguna --</option>
                                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>

                            {/* Camión */}
                            <div className="space-y-2">
                                <Label>Camión *</Label>
                                <select
                                    value={form.id_camion}
                                    onChange={(e) => setForm({ ...form, id_camion: parseInt(e.target.value) })}
                                    required
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value={0}>Seleccione</option>
                                    {camiones.map(c => <option key={c.id} value={c.id}>{c.placa}</option>)}
                                </select>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <Label>Fecha *</Label>
                                <DatePicker
                                    id="fecha_carga"
                                    placeholder="dd/mm/aaaa"
                                    onChange={(dates, currentDateString) => {
                                        setForm({ ...form, fecha_carga: currentDateString || "" });
                                    }}
                                />                            </div>

                            {/* Hora */}
                            <div className="space-y-2">
                                <Label>Hora (opcional)</Label>
                                <Input type="time" value={form.hora_carga ?? ""} onChange={(e) => setForm({ ...form, hora_carga: e.target.value || null })} />
                            </div>

                            {/* Encargado */}
                            <div className="space-y-2">
                                <Label>Encargado</Label>
                                <select
                                    value={form.id_encargado_carga ?? 0}
                                    onChange={(e) => setForm({ ...form, id_encargado_carga: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value={0}>-- Sin asignar --</option>
                                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                </select>
                            </div>

                            {/* Repartidor */}
                            <div className="space-y-2">
                                <Label>Repartidor</Label>
                                <select
                                    value={form.id_repartidor_asignado ?? 0}
                                    onChange={(e) => setForm({ ...form, id_repartidor_asignado: parseInt(e.target.value) || null })}
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value={0}>-- Sin asignar --</option>
                                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                </select>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <select
                                    value={form.estado}
                                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                    className="w-full rounded-lg border p-2.5"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_proceso">En proceso</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            {/* Observaciones a ancho completo */}
                            <div className="md:col-span-2 space-y-2">
                                <Label>Observaciones</Label>
                                <textarea
                                    rows={3}
                                    value={form.observaciones ?? ""}
                                    onChange={(e) => setForm({ ...form, observaciones: e.target.value || null })}
                                    className="w-full rounded-lg border p-2.5"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 mt-4">
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={submitting}>{submitting ? "Guardando..." : (editingOperacion ? "Actualizar" : "Crear")}</Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}