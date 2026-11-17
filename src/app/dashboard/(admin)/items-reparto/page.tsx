'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useState } from 'react';
import Link from 'next/link';
import { Truck, ArrowRight, RefreshCw } from 'lucide-react';
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import PaginationControls from '@/components/tables/PaginationControls';
import { estadoOperacion } from '@/types/flujoOperacion';
import Button from '@/components/ui/button/Button';

interface Carga {
  id_operacion: number;
  estado: string;
  fecha_carga: string;
  camiones?: { placa: string };
}

const accionesPorEstado: Record<string, string> = {
  en_curso: 'Preparar destinos',
  en_transito: 'Gestionar reparto',
  repartiendo: 'Continuar reparto',
};

const enlaceSecundario =
  'inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800';

export default function EntregarPage() {
  const [buscar, setBuscar] = useState('');
  const pagination = usePaginatedResource<Carga>('opciones-flujo/operaciones', { proceso: 'entrega', buscar });
  const { data: cargas, loading, error, reload: load } = pagination;
  return (
    <div className="mx-auto max-w-full space-y-4 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Operaciones · Reparto
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            Operaciones para entregar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Abre una carga para preparar destinos, revisar guías y registrar lo recibido en cada entrega.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/operaciones-carga" className={enlaceSecundario}>
            Ver cargas
          </Link>
          <Link href="/dashboard/entregas" className={enlaceSecundario}>
            Entregas registradas
          </Link>
          <Link href="/dashboard/guias-operativas" className={enlaceSecundario}>
            Consultar guías
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="block w-full max-w-md text-sm font-medium text-gray-700 dark:text-gray-300">
          Buscar por número de carga o placa
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Ej. 45 o ABC-123"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-brand-500/20"
          />
        </label>
        <Button variant="outline" disabled={loading} onClick={() => void load()} startIcon={<RefreshCw size={16} />}>
          {loading ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading ? (
        <OperationSkeleton variant="cards" heading={false} />
      ) : (
        <div className="space-y-3" aria-live="polite">
          {cargas.map((c) => (
            <article
              key={c.id_operacion}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Truck size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      Carga #{c.id_operacion}
                    </h2>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {estadoOperacion[c.estado] || c.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Camión {c.camiones?.placa || 'sin asignar'} ·{' '}
                    {c.fecha_carga.slice(0, 10).split('-').reverse().join('/')}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Siguiente paso: {accionesPorEstado[c.estado] || 'Abrir operación'}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/items-reparto/${c.id_operacion}`}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {accionesPorEstado[c.estado] || 'Abrir operación'}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          {!cargas.length && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              {buscar
                ? 'No se encontraron operaciones con ese número o placa.'
                : 'No hay operaciones disponibles. Completa la carga y clasificación desde Operaciones de Carga y vuelve a intentarlo.'}
            </p>
          )}
        </div>
      )}
      <PaginationControls {...pagination} />
    </div>
  );
}
