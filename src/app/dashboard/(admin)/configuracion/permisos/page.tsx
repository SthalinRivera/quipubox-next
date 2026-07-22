'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useRoles } from '@/hooks/useRoles';
import { useModulos } from '@/hooks/useModulos';
import { useRolesModulos } from '@/hooks/useRolesModulos';
import { useCategorias } from '@/hooks/useCategorias';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';
import { Check, X } from 'lucide-react';

export default function PermisosPage() {
    const { roles, fetchAll: fetchRoles } = useRoles();
    const { modulos, fetchAll: fetchModulos } = useModulos();
    const { categorias, fetchAll: fetchCategorias } = useCategorias();
    const { modulosAsignados, loading, fetchByRol, assignAll } = useRolesModulos();
    const toast = useToast();
    const user = useAuthStore((s) => s.user);

    const [selectedRol, setSelectedRol] = useState<number | null>(null);
    const [modulosSeleccionados, setModulosSeleccionados] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchRoles(); fetchModulos(); fetchCategorias(); }, [fetchRoles, fetchModulos, fetchCategorias]);

    useEffect(() => {
        if (selectedRol) {
            fetchByRol(selectedRol).then((data) => {
                const ids = new Set(data.map((m) => m.modulo.id_modulo));
                setModulosSeleccionados(ids);
            });
        }
    }, [selectedRol, fetchByRol]);

    const toggleModulo = (moduloId: number) => {
        setModulosSeleccionados((prev) => {
            const next = new Set(prev);
            if (next.has(moduloId)) {
                next.delete(moduloId);
            } else {
                next.add(moduloId);
            }
            return next;
        });
    };

    const toggleCategoria = (catId: number) => {
        const modulosDeCat = modulos.filter((m) => m.id_categoria === catId && m.estado);
        const todosSeleccionados = modulosDeCat.every((m) => modulosSeleccionados.has(m.id_modulo));

        setModulosSeleccionados((prev) => {
            const next = new Set(prev);
            for (const m of modulosDeCat) {
                if (todosSeleccionados) {
                    next.delete(m.id_modulo);
                } else {
                    next.add(m.id_modulo);
                }
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedRol) return;
        setSaving(true);
        try {
            await assignAll(selectedRol, Array.from(modulosSeleccionados), user?.id);
            toast.success('Permisos actualizados correctamente');
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar permisos');
        } finally {
            setSaving(false);
        }
    };

    // Agrupar módulos por categoría
    const modulosPorCategoria = categorias.map((cat) => ({
        ...cat,
        modulos: modulos.filter((m) => m.id_categoria === cat.id_categoria && m.estado),
    })).filter((cat) => cat.modulos.length > 0);

    return (
        <div className="space-y-6">
            {/* Selector de rol */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                    Seleccionar rol
                </h3>
                <div className="flex flex-wrap gap-3">
                    {roles.map((rol) => (
                        <button
                            key={rol.id_rol_usuario}
                            onClick={() => setSelectedRol(rol.id_rol_usuario)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedRol === rol.id_rol_usuario
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {rol.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de permisos */}
            {selectedRol && (
                <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Módulos permitidos — {roles.find((r) => r.id_rol_usuario === selectedRol)?.nombre}
                        </h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                                const allIds = modulos.filter((m) => m.estado).map((m) => m.id_modulo);
                                setModulosSeleccionados(new Set(allIds));
                            }}>
                                Seleccionar todos
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setModulosSeleccionados(new Set())}>
                                Limpiar
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar permisos'}
                            </Button>
                        </div>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {modulosPorCategoria.map((cat) => {
                                    const todosSeleccionados = cat.modulos.every((m) => modulosSeleccionados.has(m.id_modulo));
                                    const algunosSeleccionados = cat.modulos.some((m) => modulosSeleccionados.has(m.id_modulo)) && !todosSeleccionados;

                                    return (
                                        <div key={cat.id_categoria} className="border border-gray-100 dark:border-white/[0.05] rounded-lg">
                                            <div
                                                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/[0.02] rounded-t-lg cursor-pointer"
                                                onClick={() => toggleCategoria(cat.id_categoria)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={todosSeleccionados}
                                                    ref={(el) => { if (el) el.indeterminate = algunosSeleccionados; }}
                                                    onChange={() => toggleCategoria(cat.id_categoria)}
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                                />
                                                <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                                                    {cat.nombre}
                                                </span>
                                                <Badge size="sm" color="info">
                                                    {cat.modulos.filter((m) => modulosSeleccionados.has(m.id_modulo)).length}/{cat.modulos.length}
                                                </Badge>
                                            </div>
                                            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {cat.modulos.sort((a, b) => (a.orden || 0) - (b.orden || 0)).map((mod) => (
                                                    <label
                                                        key={mod.id_modulo}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                                            modulosSeleccionados.has(mod.id_modulo)
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                : 'bg-white dark:bg-transparent border border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={modulosSeleccionados.has(mod.id_modulo)}
                                                            onChange={() => toggleModulo(mod.id_modulo)}
                                                            className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                                                                {mod.nombre}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                {mod.ruta}
                                                            </p>
                                                        </div>
                                                        {modulosSeleccionados.has(mod.id_modulo) && (
                                                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!selectedRol && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    Selecciona un rol para configurar sus permisos
                </div>
            )}
        </div>
    );
}
