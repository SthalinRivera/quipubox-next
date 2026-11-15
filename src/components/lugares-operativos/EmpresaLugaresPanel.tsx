'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';

type Distrito = { id_ubigeo: string; nombre: string; provincias: { nombre: string; departamentos: { nombre: string } } };
type Lugar = { id_lugar: number; nombre: string; estado: boolean; direccion_referencia?: string };

export default function EmpresaLugaresPanel({ onSaved }: { onSaved: () => Promise<unknown> }) {
    const roles = useAuthStore(s => s.roles);
    const admin = roles.some(r => ['admin', 'administrador', 'superadmin', 'super_admin'].includes(r.toLowerCase()));
    const [buscar, setBuscar] = useState('');
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [ubigeo, setUbigeo] = useState('');
    const [lugares, setLugares] = useState<Lugar[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const inputClass = 'rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';
    if (!admin) return null;

    async function buscarDistritos(e: React.FormEvent) {
        e.preventDefault();
        if (busy || buscar.trim().length < 3) return;
        setBusy(true); setError(''); setMensaje(''); setUbigeo(''); setLugares([]); setDistritos([]);
        try {
            const data = await fetchWithAuth<Distrito[]>(`ubicaciones/distritos?buscar=${encodeURIComponent(buscar.trim())}`);
            setDistritos(data);
            if (!data.length) setMensaje('No se encontraron distritos.');
        } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron consultar los distritos.'); }
        finally { setBusy(false); }
    }
    async function seleccionarDistrito(value: string) {
        setUbigeo(value); setLugares([]); setError(''); setMensaje('');
        if (!value) return;
        setBusy(true);
        try {
            const data = await fetchWithAuth<Lugar[]>(`lugares-operativos/catalogo/${value}`);
            setLugares(data);
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
        <p className="text-sm text-gray-500">Busca un distrito y activa los establecimientos donde opera tu empresa.</p>
        <form onSubmit={buscarDistritos} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">Nombre del distrito
                <input className={inputClass} value={buscar} onChange={e => setBuscar(e.target.value)} minLength={3} required disabled={busy} placeholder="Ej. Imperial" />
            </label>
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50" disabled={busy || buscar.trim().length < 3}>Buscar distritos</button>
        </form>
        {distritos.length > 0 && <label className="flex flex-col gap-1 text-sm">Distrito
            <select className={inputClass} value={ubigeo} disabled={busy} onChange={e => void seleccionarDistrito(e.target.value)}>
                <option value="">Selecciona un distrito</option>
                {distritos.map(d => <option key={d.id_ubigeo} value={d.id_ubigeo}>{d.nombre} — {d.provincias.nombre}, {d.provincias.departamentos.nombre} ({d.id_ubigeo})</option>)}
            </select>
        </label>}
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
