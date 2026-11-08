import { Skeleton } from './Skeleton';

type Variant = 'form' | 'overview' | 'list' | 'cards' | 'quality' | 'document' | 'compact';
const panel = 'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900';

function Fields({ count = 4 }: { count?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: count }, (_, i) => (
    <div key={i} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full" /></div>
  ))}</div>;
}

export function NuevaOperacionSkeleton() {
  return (
    <div role="status" aria-label="Cargando formulario de nueva carga" className="space-y-4 pb-6">
      <span className="sr-only">Preparando el formulario de nueva carga…</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-7 w-48" /></div>
        <div className="overflow-hidden"><div className="grid min-w-[880px] grid-cols-5 gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div></div>
        <div className="grid divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white md:grid-cols-2 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {[0, 1].map((i) => <div key={i} className="space-y-4 p-4"><Skeleton className="h-4 w-32" /><Fields count={2} /></div>)}
          <div className="space-y-4 p-4 md:col-span-2"><Skeleton className="h-4 w-32" /><Fields count={2} /><Skeleton className="h-3 w-28" /><Skeleton className="h-16 w-full" /></div>
        </div>
        <div className="flex justify-end gap-3"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-36" /></div>
      </div>
    </div>
  );
}

export function OperationTableRows({ columns = 8, rows = 5 }: { columns?: number; rows?: number }) {
  return <>{Array.from({ length: rows }, (_, row) => (
    <tr key={row}>{Array.from({ length: columns }, (_, col) => (
      <td key={col} className="px-3 py-4">
        {row === 0 && col === 0 && <span role="status" className="sr-only">Cargando registros…</span>}
        <Skeleton aria-hidden="true" className={`h-4 ${col === columns - 1 ? 'w-16' : row % 2 ? 'w-3/4 min-w-12' : 'w-full min-w-12'}`} />
      </td>
    ))}</tr>
  ))}</>;
}

export function OperationSkeleton({ variant = 'overview', heading = true }: { variant?: Variant; heading?: boolean }) {
  const compact = variant === 'compact';
  return <div role="status" aria-label="Cargando contenido de operaciones" className="space-y-4">
    <span className="sr-only">Cargando contenido. Espera un momento.</span>
    <div aria-hidden="true" className="space-y-4">
      {heading && !compact && <div className="space-y-3 py-1"><Skeleton className="h-3 w-28" /><Skeleton className="h-7 w-64 max-w-full" /><Skeleton className="h-4 w-96 max-w-full" /></div>}
      {['form', 'overview', 'quality'].includes(variant) && <div className="overflow-hidden"><div className="grid min-w-[880px] grid-cols-5 gap-2">{Array.from({ length: 5 }, (_, i) => <div key={i} className={`${panel} flex h-16 items-center gap-3`}><Skeleton className="h-7 w-7 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2 w-full" /></div></div>)}</div></div>}
      {compact ? <div className="space-y-5 py-3"><Fields /><Skeleton className="h-10 w-36" /></div>
        : variant === 'list' || variant === 'document' ? <div className={`${panel} space-y-5`}><div className="flex justify-between gap-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>{variant === 'document' && <Fields />}<div className="space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">{Array.from({ length: 6 }, (_, i) => <div key={i} className="grid grid-cols-4 gap-5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>)}</div></div>
        : variant === 'cards' ? <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className={`${panel} flex items-center justify-between gap-4`}><div className="w-2/3 space-y-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-full" /></div><Skeleton className="h-10 w-28" /></div>)}</div>
        : <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-4">{Array.from({ length: variant === 'quality' ? 2 : 3 }, (_, i) => <div key={i} className={`${panel} space-y-5`}><div className="flex items-center gap-3"><Skeleton className="h-9 w-9" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56 max-w-full" /></div></div><Fields count={variant === 'form' && i === 2 ? 4 : 2} /></div>)}</div><div className={`${panel} space-y-5`}><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-full" /><Fields count={2} /><Skeleton className="h-10 w-full" /></div></div>}
    </div>
  </div>;
}
