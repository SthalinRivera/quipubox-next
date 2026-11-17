'use client';

import Button from '@/components/ui/button/Button';

interface Props {
    page: number;
    limit: number;
    total: number;
    loading?: boolean;
    error?: string;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    reload?: () => void;
}
export default function PaginationControls({ page, limit, total, loading, error, onPageChange, onLimitChange, reload }: Props) {
    const pages = Math.max(1, Math.ceil(total / limit));
    return (
        <div className="space-y-2 px-1 py-3">
            {error && <div role="alert" className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}<Button size="sm" variant="outline" onClick={reload}>Reintentar</Button></div>}
            <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span aria-live="polite">{loading ? 'Cargando…' : total ? `Mostrando ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} de ${total}` : 'Sin resultados'}</span>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2">Por página
                        <select aria-label="Registros por página" value={limit} disabled={loading} onChange={e => onLimitChange(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900">
                            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </label>
                    <Button size="sm" variant="outline" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</Button>
                    <span>Página {page} de {pages}</span>
                    <Button size="sm" variant="outline" disabled={loading || page >= pages} onClick={() => onPageChange(page + 1)}>Siguiente</Button>
                </div>
            </nav>
        </div>
    );
}