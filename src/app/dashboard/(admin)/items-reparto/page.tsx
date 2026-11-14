'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, ArrowRight } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import {
  estadoOperacion,
} from '@/types/flujoOperacion';
import Button from '@/components/ui/button/Button';

interface Carga {
  id_operacion: number;
  estado: string;
  fecha_carga: string;
  camiones?: { placa: string };
}
export default function EntregarPage() {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await fetchWithAuth<Carga[]>(`opciones-flujo/operaciones?proceso=entrega&buscar=${encodeURIComponent(buscar)}`, { signal });
      if (signal?.aborted) return;
      setCargas(data);
      setError('');
    } catch (e) {
      if (signal?.aborted) return;
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar las operaciones.',
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [buscar]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void load(controller.signal), 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load]);
  const visibles = cargas;
  return (
    <div className="mx-auto max-w-full space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Operaciones · Entregas
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Entregar
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Selecciona una operación con carga y calidades completas. Aquí se asignan los receptores y se registran las entregas.
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm text-gray-600 dark:text-gray-300">
          Buscar carga o placa
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Número de carga o placa"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <Button variant="outline" disabled={loading} onClick={() => void load()}>
          Actualizar
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
        <div className="space-y-3">
          {visibles.map((c) => (
            <article
              key={c.id_operacion}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Truck size={22} />
                </span>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Carga #{c.id_operacion} · {c.camiones?.placa}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {c.fecha_carga.slice(0, 10).split('-').reverse().join('/')}{' '}
                    · {estadoOperacion[c.estado] || c.estado}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/items-reparto/${c.id_operacion}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
              >
                {c.estado === 'en_curso' ? 'Preparar entrega' : c.estado === 'en_transito' ? 'Preparar reparto' : 'Registrar entrega'}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          {!visibles.length && (
            <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No hay operaciones disponibles para entregar. Completa la carga y las calidades y déjala en curso.
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm font-medium text-brand-600 dark:text-brand-300">
        <Link href="/dashboard/operaciones-carga">Ver todas las cargas</Link>
        <Link href="/dashboard/entregas">Ver entregas registradas</Link>
        <Link href="/dashboard/guias-operativas">Consultar guías</Link>
      </div>
    </div>
  );
}
