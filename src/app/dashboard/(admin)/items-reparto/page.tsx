'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, ArrowRight } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import {
  cargaEditable,
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
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCargas(await fetchWithAuth<Carga[]>('operaciones-carga'));
      setError('');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar las operaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const visibles = cargas.filter(
    (c) =>
      c.estado !== 'completado' &&
      `${c.id_operacion} ${c.camiones?.placa || ''}`
        .toLowerCase()
        .includes(buscar.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-full space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Operaciones Â· Entregas
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Preparar y registrar entregas
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Selecciona una carga. AllÃ­ podrÃ¡s completar sus destinos, confirmar la
          carga y registrar lo recibido.
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm text-gray-600 dark:text-gray-300">
          Buscar carga o placa
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="NÃºmero de carga o placa"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <Button variant="outline" disabled={loading} onClick={load}>
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
                    Carga #{c.id_operacion} Â· {c.camiones?.placa}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {c.fecha_carga.slice(0, 10).split('-').reverse().join('/')}{' '}
                    Â· {estadoOperacion[c.estado] || c.estado}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/operaciones-carga/${c.id_operacion}${cargaEditable(c.estado) ? '#calidad' : c.estado === 'en_transito' ? '#guias' : '#entregar'}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
              >
                {cargaEditable(c.estado)
                  ? 'Completar preparaciÃ³n'
                  : c.estado === 'en_transito' ? 'Preparar reparto' : 'Registrar entrega'}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          {!visibles.length && (
            <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No hay cargas pendientes que coincidan con la bÃºsqueda.
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm font-medium text-brand-600 dark:text-brand-300">
        <Link href="/dashboard/operaciones-carga">Ver todas las cargas</Link>
        <Link href="/dashboard/entregas">Ver entregas registradas</Link>
        <Link href="/dashboard/guias-operativas">Consultar guÃ­as</Link>
      </div>
    </div>
  );
}
