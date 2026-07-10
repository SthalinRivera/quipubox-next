'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import Badge from '@/components/ui/badge/Badge';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import { Activity, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

    const getAccionColor = (accion: string): 'success' | 'warning' | 'error' | 'info' => {
        if (accion.includes('crear') || accion.includes('create')) return 'success';
        if (accion.includes('actualizar') || accion.includes('update')) return 'warning';
        if (accion.includes('eliminar') || accion.includes('delete')) return 'error';
        return 'info';
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
            <div className="p-4">
                <TableSkeleton columns={7} rows={5} />
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Logs de Actividad" />
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de logs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hoy}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <ComponentCard title="Registro de Actividad">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filtroTabla}
                                onChange={(e) => setFiltroTabla(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-48"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>Fecha</TableCell>
                                    <TableCell isHeader>Usuario</TableCell>
                                    <TableCell isHeader>Acción</TableCell>
                                    <TableCell isHeader>Tabla</TableCell>
                                    <TableCell isHeader>ID Registro</TableCell>
                                    <TableCell isHeader>Detalles</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                            No hay registros de actividad
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((log) => (
                                        <TableRow key={log.id_log}>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{new Date(log.created_at).toLocaleDateString('es-PE')}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.usuarios
                                                    ? `${log.usuarios.nombres} ${log.usuarios.apellidos}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge size="sm" color={getAccionColor(log.accion)}>
                                                    {log.accion}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{log.tabla_afectada || '—'}</TableCell>
                                            <TableCell className="text-sm">{log.id_registro ? `#${log.id_registro}` : '—'}</TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => setExpandedLog(expandedLog === log.id_log ? null : log.id_log)}
                                                    className="text-gray-500 hover:text-blue-500"
                                                >
                                                    {expandedLog === log.id_log ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Expanded detail */}
                    {expandedLog && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Detalle del log #{expandedLog}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Datos anteriores</p>
                                    <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                                        {formatJson(logs.find((l) => l.id_log === expandedLog)?.datos_anteriores)}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Datos nuevos</p>
                                    <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                                        {formatJson(logs.find((l) => l.id_log === expandedLog)?.datos_nuevos)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </div>
    );
}
