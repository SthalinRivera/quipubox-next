'use client';

import { useState } from 'react';
import DistritoSelector from '@/components/form/DistritoSelector';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';

type Lugar = { id_lugar: number; nombre: string; estado: boolean; direccion_referencia?: string };

export default function EmpresaLugaresPanel({ onSaved, onCreate }: { onSaved: () => Promise<unknown>; onCreate: (ubigeo: string) => void }) {
    const roles = useAuthStore(s => s.roles);
    const admin = roles.some(r => ['admin', 'administrador', 'superadmin', 'super_admin'].includes(r.toLowerCase()));
    const [ubigeo, setUbigeo] = useState('');
    const [lugares, setLugares] = useState<Lugar[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [catalogoLoaded, setCatalogoLoaded] = useState(false);
    if (!admin) return null;

    async function seleccionarDistrito(value: string) {
        setUbigeo(value); setLugares([]); setError(''); setMensaje(''); setCatalogoLoaded(false);
        if (!value) return;
        setBusy(true);
        try {
            const data = await fetchWithAuth<Lugar[]>(`lugares-operativos/catalogo/${value}`);
            setLugares(data); setCatalogoLoaded(true);
            if (!data.length) setMensaje('Este distrito no tiene establecimientos activos en el catálogo.');
        } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo consultar el catálogo.'); }
        finally { setBusy(false); }
    }
    async function asignar(lugar: Lugar) {
        if (busy) return;
        setBusy(true); setError(''); setMensaje('');
        try {
            const actualizado = await fetchWithAuth<Lugar>(`lugares-operativos/${lugar.id_lugar}/asignacion`, {
                method: 'PUT', body: { estado: !lugar.estado },
            });
            setLugares(prev => prev.map(x => x.id_lugar === lugar.id_lugar ? actualizado : x));
            setMensaje(actualizado.estado ? 'Establecimiento asignado a tu empresa.' : 'Asociación desactivada.');
            await onSaved();
        } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la asociación.'); }
        finally { setBusy(false); }
    }
    return <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Asignar establecimientos a mi empresa</h2>
        <p className="text-sm text-gray-500">Selecciona departamento, provincia y distrito para asignar establecimientos a tu empresa.</p>
        <DistritoSelector value={ubigeo} onChange={value => void seleccionarDistrito(value)} disabled={busy} />
        {catalogoLoaded && !busy && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <span className="text-sm text-gray-500">¿No encuentras el establecimiento?</span>
            <button type="button" onClick={() => onCreate(ubigeo)} className="rounded-lg border px-3 py-2 text-sm">Crear en este distrito</button>
        </div>}
        {busy && <p role="status">Procesando…</p>}
        {error && <p role="alert" className="text-red-600">{error}</p>}
        {mensaje && <p role="status">{mensaje}</p>}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {lugares.map(l => <li key={l.id_lugar} className="flex items-center justify-between gap-3 py-3">
                <span>{l.nombre}{l.direccion_referencia && <small className="block text-gray-500">{l.direccion_referencia}</small>}</span>
                <button type="button" disabled={busy} onClick={() => void asignar(l)} className="rounded-lg border px-3 py-2 disabled:opacity-50">{l.estado ? 'Desactivar asociación' : 'Asignar a mi empresa'}</button>
            </li>)}
        </ul>
    </section>;
}
