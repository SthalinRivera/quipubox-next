'use client';

import { useEffect, useState, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import { Image, FileText, Trash2, Eye, Upload, Search, X, AlertTriangle, Package, BookOpen, FolderOpen, Clock } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';

interface Evidencia {
    id_evidencia: number;
    tipo_entidad: string;
    id_entidad: number;
    url_archivo: string;
    tipo_archivo: string | null;
    descripcion: string | null;
    created_at: string;
    usuarios?: { nombres: string; apellidos: string } | null;
}

export default function EvidenciasPage() {
    const toast = useToast();
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchEvidencias = async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<Evidencia[]>('evidencias');
            setEvidencias(data || []);
        } catch (err: any) {
            toast.error(err.message || 'Error al cargar evidencias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvidencias();
    }, []);

    const stats = useMemo(() => {
        const incidencias = evidencias.filter(e => e.tipo_entidad === 'incidencia').length;
        const entregas = evidencias.filter(e => e.tipo_entidad === 'entrega').length;
        const guias = evidencias.filter(e => e.tipo_entidad === 'guia').length;
        return { total: evidencias.length, incidencias, entregas, guias };
    }, [evidencias]);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta evidencia?')) return;
        try {
            await fetchWithAuth(`evidencias/${id}`, { method: 'DELETE' });
            toast.success('Evidencia eliminada');
            fetchEvidencias();
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tipo_entidad', 'incidencia');
            formData.append('id_entidad', '1');
            formData.append('descripcion', 'Subido desde módulo de evidencias');

            await fetchWithAuth('evidencias/upload', {
                method: 'POST',
                body: formData,
            });
            toast.success('Evidencia subida correctamente');
            fetchEvidencias();
        } catch (err: any) {
            toast.error(err.message || 'Error al subir');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const filtered = evidencias.filter((ev) => {
        if (!filtro) return true;
        const term = filtro.toLowerCase();
        return (
            ev.tipo_entidad?.toLowerCase().includes(term) ||
            ev.descripcion?.toLowerCase().includes(term) ||
            ev.usuarios?.nombres?.toLowerCase().includes(term) ||
            ev.usuarios?.apellidos?.toLowerCase().includes(term)
        );
    });

    const getIcon = (tipo: string | null) => {
        if (tipo === 'image') return <Image className="w-3.5 h-3.5" />;
        return <FileText className="w-3.5 h-3.5" />;
    };

    const getEntidadLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            incidencia: 'Incidencia',
            entrega: 'Entrega',
            guia: 'Guía',
        };
        return labels[tipo] || tipo;
    };

    const getEntidadIcon = (tipo: string) => {
        switch (tipo) {
            case 'incidencia': return <AlertTriangle className="w-3.5 h-3.5" />;
            case 'entrega': return <Package className="w-3.5 h-3.5" />;
            case 'guia': return <BookOpen className="w-3.5 h-3.5" />;
            default: return <FolderOpen className="w-3.5 h-3.5" />;
        }
    };

    const getEntidadColor = (tipo: string) => {
        switch (tipo) {
            case 'incidencia': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
            case 'entrega': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
            case 'guia': return 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20';
            default: return 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <TableSkeleton columns={7} rows={5} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Evidencias" />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Incidencias</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.incidencias}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Entregas</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.entregas}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Guías</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.guias}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por tipo, descripción o usuario..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                            />
                            {filtro && (
                                <button
                                    onClick={() => setFiltro('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Upload Button */}
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className={`
                                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                ${uploading
                                    ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                                }
                            `}>
                                <Upload className="w-4 h-4" />
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Subiendo...
                                    </span>
                                ) : 'Subir evidencia'}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Entidad</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Archivo</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subido por</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                                                <FolderOpen className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No hay evidencias</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Sube un archivo para comenzar</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ev) => (
                                    <tr
                                        key={ev.id_evidencia}
                                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150 group"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center border
                                                    ${ev.tipo_archivo === 'image'
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                                                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                                    }
                                                `}>
                                                    {getIcon(ev.tipo_archivo)}
                                                </div>
                                                <span className={`
                                                    inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border
                                                    ${ev.tipo_archivo === 'image'
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/20'
                                                        : ev.tipo_archivo === 'document'
                                                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'
                                                            : 'bg-gray-100 dark:bg-zinc-500/10 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-500/20'
                                                    }
                                                `}>
                                                    {ev.tipo_archivo || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className={`
                                                inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border
                                                ${getEntidadColor(ev.tipo_entidad)}
                                            `}>
                                                {getEntidadIcon(ev.tipo_entidad)}
                                                {getEntidadLabel(ev.tipo_entidad)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">#{ev.id_entidad}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <a
                                                href={ev.url_archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                                            >
                                                <span className="border-b border-transparent hover:border-blue-300 transition-colors">Ver archivo</span>
                                            </a>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {ev.usuarios
                                                    ? `${ev.usuarios.nombres} ${ev.usuarios.apellidos}`
                                                    : <span className="text-gray-300 dark:text-gray-600">—</span>
                                                }
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-sm">
                                                    {new Date(ev.created_at).toLocaleDateString('es-PE', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <a
                                                    href={ev.url_archivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                                                    title="Ver"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(ev.id_evidencia)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Mostrando <span className="text-gray-600 dark:text-gray-400 font-medium">{filtered.length}</span> de <span className="text-gray-600 dark:text-gray-400 font-medium">{evidencias.length}</span> evidencias
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
