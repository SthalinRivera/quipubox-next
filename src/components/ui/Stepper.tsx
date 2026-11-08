'use client';
import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import {
  cargaEditable,
  cancelada,
  type OperacionFlujo,
} from '@/types/flujoOperacion';

export function Stepper({ operacion }: { operacion?: OperacionFlujo }) {
  const params = useParams();
  const pathname = usePathname();
  const [selectedHash, setSelectedHash] = useState('');
  useEffect(() => {
    const updateHash = () => setSelectedHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname]);
  const id = Number(params.id);
  const [loaded, setLoaded] = useState<OperacionFlujo | null>(null);
  useEffect(() => {
    if (operacion || !Number.isSafeInteger(id) || id <= 0) return;
    const controller = new AbortController();
    fetchWithAuth<OperacionFlujo>(`operaciones-carga/${id}`, {
      signal: controller.signal,
    })
      .then(setLoaded)
      .catch(() => setLoaded(null));
    return () => controller.abort();
  }, [id, operacion]);
  const op = operacion || (loaded?.id_operacion === id ? loaded : null);
  const base = op
    ? `/dashboard/operaciones-carga/${op.id_operacion}`
    : '/dashboard/operaciones-carga/nueva';
  const confirmed = !!op && !cargaEditable(op.estado) && !cancelada(op.estado);
  const hasDeliveries =
    op?.detalle_carga.some((d) =>
      d.items_reparto.some((i) => i.entregas.length > 0),
    ) || false;
  const steps = [
    {
      label: 'Carga',
      hint: 'Productos y cantidades',
      href: base + '#carga',
      done: !!op?.detalle_carga.length,
      enabled: true,
    },
    {
      label: 'Calidad y destinos',
      hint:
        op?.flujo.listaParaEntregar && !confirmed ? 'Falta confirmar carga' : op && !op.flujo.requiereCalidad
          ? 'Sin clasificación'
          : 'Clasificar y asignar',
      href: base + '#calidad',
      done: confirmed && !!op?.flujo.listaParaEntregar,
      enabled: !!op?.detalle_carga.length,
    },
    {
      label: 'Registrar entrega',
      hint: 'Confirmar lo recibido',
      href: base + '#entregar',
      done: !!op?.flujo.entregasCompletas,
      enabled: confirmed,
    },
    {
      label: 'Ver entregas',
      hint: 'Revisar registros',
      href: base + '#entregas',
      done: !!op?.flujo.entregasCompletas,
      enabled: hasDeliveries,
    },
    {
      label: 'Guías',
      hint: 'Consultar documentos',
      href: base + '#guias',
      done: !!op?.flujo.entregasCompletas,
      enabled: hasDeliveries,
    },
  ];
  const progressStep = pathname.endsWith('/detalles/nuevo')
    ? 0
    : pathname.includes('/calidades')
      ? 1
      : !op?.detalle_carga.length
        ? 0
        : !confirmed
          ? 1
          : !op.flujo.entregasCompletas
            ? 2
            : 4;
  const selectedIndex = steps.findIndex(
    (step) => selectedHash && step.href.endsWith(selectedHash),
  );
  const current =
    selectedIndex >= 0 && steps[selectedIndex].enabled
      ? selectedIndex
      : progressStep;
  return (
    <nav
      aria-label="Pasos de la operación"
      className="mb-4 overflow-x-auto pb-1"
    >
      <div className="grid min-w-[880px] grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const content = (
            <>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${step.done ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : index === current ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
              >
                {step.done ? (
                  <Check size={15} />
                ) : !step.enabled ? (
                  <Lock size={12} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-xs font-semibold">
                  {step.label}
                </span>
                <span className="mt-1 block truncate text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                  {step.done ? 'Completado' : step.hint}
                </span>
              </span>
            </>
          );
          return step.enabled ? (
            <Link
              key={step.label}
              href={step.href}
              onClick={() =>
                setSelectedHash(step.href.slice(step.href.indexOf('#')))
              }
              aria-current={index === current ? 'step' : undefined}
              className={`flex h-16 min-w-0 items-center gap-2 rounded-lg border px-3 text-gray-800 transition hover:border-brand-400 dark:text-gray-100 ${index === current ? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              {content}
            </Link>
          ) : (
            <div
              key={step.label}
              aria-disabled="true"
              className="flex h-16 min-w-0 items-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-500 dark:border-gray-800"
            >
              {content}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
