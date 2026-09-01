'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useModulos } from '@/hooks/useModulos';
import { useCategorias } from '@/hooks/useCategorias';
import { useToast } from '@/hooks/useToast';
import { Plus, Pencil, Trash2, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

const schema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    ruta: z.string().min(1, 'La ruta es obligatoria'),
    id_categoria: z.coerce.number().min(1, 'Selecciona una categoría'),
    orden: z.coerce.number().default(0),
    estado: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function ModulosPage() {
    const { modulos, loading, fetchAll, create, update, toggleEstado, remove } = useModulos();
    const { categorias, loading: loadingCats, fetchAll: fetchCategorias } = useCategorias();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [filterCategoria, setFilterCategoria] = useState<number>(0);
    const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { nombre: '', ruta: '', id_categoria: 0, orden: 0, estado: true },
    });

    useEffect(() => { fetchAll(); fetchCategorias(); }, [fetchAll, fetchCategorias]);

    // Expandir todas las categorías al cargar
    useEffect(() => {
        if (categorias.length > 0) {
            const expanded: Record<number, boolean> = {};
            categorias.forEach(c => { expanded[c.id_categoria] = true; });
            setExpandedCats(expanded);
        }
    }, [categorias]);

    useEffect(() => {
        if (modalOpen) {
            if (editing) {
                reset({
                    nombre: editing.nombre,
                    ruta: editing.ruta,
                    id_categoria: Number(editing.id_categoria),
                    orden: editing.orden || 0,
                    estado: editing.estado,
                });
            } else {
                reset({ nombre: '', ruta: '', id_categoria: 0, orden: 0, estado: true });
            }
        }
    }, [modalOpen, editing, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (editing) {
                await update(editing.id_modulo, data);
                toast.success('Módulo actualizado');
            } else {
                await create(data);
                toast.success('Módulo creado');
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este módulo?')) return;
        try {
            await remove(id);
            toast.success('Módulo eliminado');
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
        }
    };

    const toggleCat = (id: number) => {
        setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Agrupar módulos por categoría
    const modulosPorCategoria = useMemo(() => {
        const filtered = filterCategoria > 0
            ? modulos.filter(m => Number(m.id_categoria) === filterCategoria)
            : modulos;

        const map = new Map<number, { categoria: any; items: any[] }>();

        for (const cat of categorias) {
            if (filterCategoria > 0 && cat.id_categoria !== filterCategoria) continue;
            map.set(cat.id_categoria, { categoria: cat, items: [] });
        }

        for (const mod of filtered) {
            const catId = Number(mod.id_categoria);
            if (!map.has(catId)) {
                map.set(catId, {
                    categoria: mod.categorias || { nombre: 'Sin categoría', id_categoria: catId, icono_web: null },
                    items: []
                });
            }
            map.get(catId)!.items.push(mod);
        }

        for (const entry of map.values()) {
            entry.items.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        }

        return Array.from(map.values()).filter(e => e.items.length > 0);
    }, [modulos, categorias, filterCategoria]);

    const totalFiltrados = modulosPorCategoria.reduce((sum, e) => sum + e.items.length, 0);

    return (
        <div className="space-y-4">
            {/* Header + Filtros */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Módulos
                        </h3>
                        <Badge size="sm" color="info">
                            {filterCategoria > 0 ? `${totalFiltrados} de ${modulos.length}` : modulos.length}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterCategoria}
                                onChange={(e) => setFilterCategoria(Number(e.target.value))}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white/90"
                            >
                                <option value={0}>Todas las categorías</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2" /> Nuevo módulo
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lista agrupada */}
            {loading || loadingCats ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : modulosPorCategoria.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-12 text-center text-gray-400">
                    No hay módulos{filterCategoria > 0 ? ' en esta categoría' : ' creados'}
                </div>
            ) : (
                <div className="space-y-3">
                    {modulosPorCategoria.map(({ categoria, items }) => {
                        const isExpanded = expandedCats[categoria.id_categoria] ?? true;
                        const activos = items.filter(m => m.estado).length;
                        const inactivos = items.length - activos;

                        return (
                            <div key={categoria.id_categoria} className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                                <button
                                    onClick={() => toggleCat(categoria.id_categoria)}
                                    className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded
                                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                                        }
                                        <span className="font-semibold text-gray-800 dark:text-white/90">{categoria.nombre}</span>
                                        <Badge size="sm" color="light">{items.length} módulos</Badge>
                                        {activos > 0 && <Badge size="sm" color="success">{activos} activos</Badge>}
                                        {inactivos > 0 && <Badge size="sm" color="error">{inactivos} inactivos</Badge>}
                                    </div>
                                    {categoria.icono_web && (
                                        <span className="text-xs text-gray-400 font-mono">icon: {categoria.icono_web}</span>
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                                                    <th className="text-left py-2 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-16">#</th>
                                                    <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                                                    <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ruta</th>
                                                    <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-24">Estado</th>
                                                    <th className="text-right py-2 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((mod) => (
                                                    <tr key={mod.id_modulo} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                                        <td className="py-3 px-6 text-gray-400 font-mono text-xs">{mod.orden || 0}</td>
                                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-white/90">{mod.nombre}</td>
                                                        <td className="py-3 px-4">
                                                            <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-400">
                                                                {mod.ruta}
                                                            </code>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge size="sm" color={mod.estado ? 'success' : 'error'}>
                                                                {mod.estado ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-6 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="sm" variant="outline" onClick={() => { setEditing(mod); setModalOpen(true); }}>
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => toggleEstado(mod.id_modulo, !mod.estado)}>
                                                                    {mod.estado ? 'Off' : 'On'}
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => handleDelete(mod.id_modulo)}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} className="max-w-[500px] p-5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        {editing ? 'Editar módulo' : 'Nuevo módulo'}
                    </h4>

                    <div>
                        <Label>Nombre <span className="text-error-500">*</span></Label>
                        <Controller name="nombre" control={control} render={({ field }) => <Input {...field} error={!!errors.nombre} />} />
                        {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <Label>Ruta <span className="text-error-500">*</span></Label>
                        <Controller name="ruta" control={control} render={({ field }) => <Input {...field} error={!!errors.ruta} placeholder="/reportes/operativos" />} />
                        {errors.ruta && <p className="mt-1 text-xs text-error-500">{errors.ruta.message}</p>}
                        <p className="mt-1 text-xs text-gray-400">Sin prefijo /dashboard. Ej: /reportes/operativos</p>
                    </div>

                    <div>
                        <Label>Categoría <span className="text-error-500">*</span></Label>
                        <Controller name="id_categoria" control={control} render={({ field }) => (
                            <select {...field} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white/90">
                                <option value={0}>Seleccionar categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                                ))}
                            </select>
                        )} />
                        {errors.id_categoria && <p className="mt-1 text-xs text-error-500">{errors.id_categoria.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Orden</Label>
                            <Controller name="orden" control={control} render={({ field }) => <Input {...field} type="number" />} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Controller
                                name="estado"
                                control={control}
                                render={({ field }) => (
                                    <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                                )}
                            />
                            <Label className="!mb-0">Activo</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setModalOpen(false); setEditing(null); }}>
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
