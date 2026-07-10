'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';
import { Image, FileText, Trash2, Eye, Upload } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
            ev.usuarios?.nombres?.toLowerCase().includes(term)
        );
    });

    const getIcon = (tipo: string | null) => {
        if (tipo === 'image') return <Image className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const getEntidadLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            incidencia: 'Incidencia',
            entrega: 'Entrega',
            guia: 'Guía',
        };
        return labels[tipo] || tipo;
    };

    if (loading) {
        return (
            <div className="p-4">
                <TableSkeleton columns={6} rows={5} />
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Evidencias" />
            <div className="space-y-6">
                <ComponentCard title="Evidencias">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                        />
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <Button size="sm" disabled={uploading}>
                                <Upload className="w-4 h-4 mr-2" />
                                {uploading ? 'Subiendo...' : 'Subir evidencia'}
                            </Button>
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>Tipo</TableCell>
                                    <TableCell isHeader>Entidad</TableCell>
                                    <TableCell isHeader>ID</TableCell>
                                    <TableCell isHeader>Archivo</TableCell>
                                    <TableCell isHeader>Subido por</TableCell>
                                    <TableCell isHeader>Fecha</TableCell>
                                    <TableCell isHeader>Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                                            No hay evidencias
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((ev) => (
                                        <TableRow key={ev.id_evidencia}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getIcon(ev.tipo_archivo)}
                                                    <Badge size="sm" color="info">
                                                        {ev.tipo_archivo || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getEntidadLabel(ev.tipo_entidad)}</TableCell>
                                            <TableCell>#{ev.id_entidad}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={ev.url_archivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
                                                >
                                                    Ver archivo
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                {ev.usuarios
                                                    ? `${ev.usuarios.nombres} ${ev.usuarios.apellidos}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(ev.created_at).toLocaleDateString('es-PE')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={ev.url_archivo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-500 hover:text-blue-500"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(ev.id_evidencia)}
                                                        className="text-gray-500 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
