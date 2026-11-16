'use client';

import { useEffect, useRef, useState } from 'react';
import Select from '@/components/form/Select';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';

type Region = { nombre: string; id_departamento?: string; id_provincia?: string; id_ubigeo?: string };

function useRegions(url: string) {
    const [items, setItems] = useState<Region[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let active = true;
        setItems([]); setError(''); setLoading(Boolean(url));
        if (url) fetchWithAuth<Region[]>(url)
            .then(data => { if (active) setItems(data); })
            .catch(error => { if (active) setError(error instanceof Error ? error.message : 'No se pudieron cargar las ubicaciones.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [url, attempt]);
    return { items, loading, error, retry: () => setAttempt(n => n + 1) };
}

export default function DistritoSelector({ value, onChange, disabled = false }: {
    value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
    const user = useAuthStore(state => state.user);
    const [departamento, setDepartamento] = useState(value.slice(0, 2));
    const [provincia, setProvincia] = useState(value.slice(0, 4));
    const [suggested, setSuggested] = useState(false);
    const [profileError, setProfileError] = useState(false);
    const touched = useRef(Boolean(value));
    const departamentos = useRegions('ubicaciones/departamentos');
    const provincias = useRegions(departamento ? `ubicaciones/provincias?id_departamento=${departamento}` : '');
    const distritos = useRegions(provincia ? `ubicaciones/distritos?id_provincia=${provincia}` : '');

    useEffect(() => {
        if (touched.current) return;
        let active = true;
        const suggest = (ubigeo?: string) => {
            if (!active || touched.current || !ubigeo || !/^\d{6}$/.test(ubigeo)) return;
            setDepartamento(ubigeo.slice(0, 2));
            setProvincia(ubigeo.slice(0, 4));
            setSuggested(true);
        };
        if (user?.id_ubigeo || user?.ubicacion?.id_ubigeo) {
            suggest(user.id_ubigeo || user.ubicacion.id_ubigeo);
        } else {
            fetchWithAuth<{ id_ubigeo?: string }>('auth/profile')
                .then(profile => suggest(profile.id_ubigeo))
                .catch(() => { if (active) setProfileError(true); });
        }
        return () => { active = false; };
    }, [user?.id, user?.id_ubigeo, user?.ubicacion?.id_ubigeo]);

    const options = (items: Region[], key: 'id_departamento' | 'id_provincia' | 'id_ubigeo') => items.map(item => ({ value: item[key]!, label: item.nombre }));
    const changeRegion = () => { touched.current = true; setSuggested(false); onChange(''); };

    return <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-gray-700 dark:text-gray-300">Departamento
                <Select value={departamento} options={options(departamentos.items, 'id_departamento')}
                    placeholder={departamentos.loading ? 'Cargando…' : 'Seleccionar departamento'}
                    disabled={disabled || departamentos.loading}
                    onChange={next => { changeRegion(); setDepartamento(next); setProvincia(''); }} />
            </label>
            <label className="space-y-1 text-sm text-gray-700 dark:text-gray-300">Provincia
                <Select value={provincia} options={options(provincias.items, 'id_provincia')}
                    placeholder={provincias.loading ? 'Cargando…' : 'Seleccionar provincia'}
                    disabled={disabled || !departamento || provincias.loading}
                    onChange={next => { changeRegion(); setProvincia(next); }} />
            </label>
        </div>
        <label className="block space-y-1 text-sm text-gray-700 dark:text-gray-300">Distrito
            <Select value={value} options={options(distritos.items, 'id_ubigeo')}
                placeholder={distritos.loading ? 'Cargando…' : 'Seleccionar distrito'}
                disabled={disabled || !provincia || distritos.loading}
                onChange={next => { touched.current = true; onChange(next); }} />
        </label>
        {suggested && <p className="text-xs text-gray-500">Zona sugerida según tu perfil. Puedes cambiarla para operar en otro lugar.</p>}
        {profileError && <p className="text-xs text-gray-500">No se pudo consultar tu ubicación. Selecciona el departamento y la provincia.</p>}
        {provincia && !distritos.loading && !distritos.error && !distritos.items.length && <p role="status" className="text-sm text-gray-500">No hay distritos disponibles en esta provincia.</p>}
        {[departamentos, provincias, distritos].map((region, index) => region.error && <p key={index} role="alert" className="text-sm text-red-600">
            {region.error} <button type="button" disabled={disabled} onClick={region.retry} className="underline">Reintentar</button>
        </p>)}
    </div>;
}
