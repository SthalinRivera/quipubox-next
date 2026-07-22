'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import { Activity, Filter, ChevronDown, ChevronUp, Clock, Hash, User, FileText, ArrowRight, Minus } from 'lucide-react';

interface LogActividad {
    id_log: number;
    accion: string;
    tabla_afectada: string | null;
    id_registro: number | null;
    datos_anteriores: any;
    datos_nuevos: any;
    created_at: string;
    usuarios?: { id_usuario: number; nombres: string; apellidos: string } | null;
}

export default function LogsActividadPage() {
    const toast = useToast();
    const [logs, setLogs] = useState<LogActividad[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [filtroTabla, setFiltroTabla] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');
    const [stats, setStats] = useState({ total: 0, hoy: 0 });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtroTabla) params.append('tabla', filtroTabla);
            const url = `logs-actividad?${params.toString()}`;
            const data = await fetchWithAuth<LogActividad[]>(url);
            setLogs(data || []);
        } catch (err: any) {
            toast.error(err.message || 'Error al cargar logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await fetchWithAuth<any>('logs-actividad/stats');
            setStats(data || { total: 0, hoy: 0 });
        } catch {}
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filtroTabla]);

    const getAccionColor = (accion: string) => {
        if (accion.includes('crear') || accion.includes('create')) return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
        if (accion.includes('actualizar') || accion.includes('update')) return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
        if (accion.includes('eliminar') || accion.includes('delete')) return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    };

    const getAccionIcon = (accion: string) => {
        if (accion.includes('crear') || accion.includes('create')) return '+';
        if (accion.includes('actualizar') || accion.includes('update')) return '~';
        if (accion.includes('eliminar') || accion.includes('delete')) return '−';
        return '•';
    };

    const filtered = logs.filter((log) => {
        if (!filtroAccion) return true;
        return log.accion.toLowerCase().includes(filtroAccion.toLowerCase());
    });

    const formatJson = (obj: any) => {
        if (!obj) return '—';
        try {
            if (typeof obj === 'string') return obj;
            return JSON.stringify(obj, null, 2);
        } catch {
            return String(obj);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <TableSkeleton columns={6} rows={5} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Logs de Actividad" />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hoy</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.hoy}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tablas</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{new Set(logs.map(l => l.tabla_afectada).filter(Boolean)).size}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Usuarios</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{new Set(logs.map(l => l.usuarios?.id_usuario).filter(Boolean)).size}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <select
                                value={filtroTabla}
                                onChange={(e) => setFiltroTabla(e.target.value)}
                                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                            >
                                <option value="">Todas las tablas</option>
                                <option value="operaciones_carga">Operaciones</option>
                                <option value="guias_operativas">Guías</option>
                                <option value="entregas">Entregas</option>
                                <option value="incidencias">Incidencias</option>
                                <option value="clientes">Clientes</option>
                                <option value="detalle_carga">Detalle carga</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            placeholder="Filtrar por acción..."
                            value={filtroAccion}
                            onChange={(e) => setFiltroAccion(e.target.value)}
                            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 w-48 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Acción</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tabla</th>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID Registro</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                                                <Activity className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No hay registros de actividad</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Los registros aparecerán cuando haya actividad</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((log) => (
                                    <tr
                                        key={log.id_log}
                                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150 group"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {new Date(log.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 dark:text-gray-600">
                                                        {new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {log.usuarios
                                                    ? `${log.usuarios.nombres} ${log.usuarios.apellidos}`
                                                    : <span className="text-gray-300 dark:text-gray-600">—</span>
                                                }
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border
                                                ${getAccionColor(log.accion)}
                                            `}>
                                                <span className="text-[13px] leading-none font-bold">{getAccionIcon(log.accion)}</span>
                                                {log.accion}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                                                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{log.tabla_afectada || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                                {log.id_registro ? `#${log.id_registro}` : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={() => setExpandedLog(expandedLog === log.id_log ? null : log.id_log)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                                                    title="Ver detalles"
                                                >
                                                    {expandedLog === log.id_log ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Expanded Detail */}
                {expandedLog && (() => {
                    const log = logs.find((l) => l.id_log === expandedLog);
                    if (!log) return null;
                    return (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div className="px-5 py-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Detalle del log #{expandedLog}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Minus className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Datos anteriores</p>
                                        </div>
                                        <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono">
                                            {formatJson(log.datos_anteriores)}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Datos nuevos</p>
                                        </div>
                                        <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono">
                                            {formatJson(log.datos_nuevos)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Mostrando <span className="text-gray-600 dark:text-gray-400 font-medium">{filtered.length}</span> de <span className="text-gray-600 dark:text-gray-400 font-medium">{logs.length}</span> registros
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
