'use client';
import { useEffect, useState } from 'react';
import { useUbicaciones } from '@/hooks/useUbicaciones';
export default function UbicacionesPage() {
 const { ubicaciones, fetchAll, loading, error } = useUbicaciones();
 const [buscar, setBuscar] = useState('');
 useEffect(() => { void fetchAll(); }, [fetchAll]);
 const rows = ubicaciones.filter(u => [u.id_ubigeo,u.nombre,u.provincias?.nombre,u.provincias?.departamentos?.nombre].join(' ').toLowerCase().includes(buscar.toLowerCase()));
 return <div className="space-y-5"><h1 className="text-2xl font-semibold">Ubicaciones</h1><p>Catálogo de departamentos, provincias y distritos para usuarios, clientes y operaciones.</p><input aria-label="Buscar ubicación" placeholder="Buscar por ubigeo, distrito, provincia o departamento" value={buscar} onChange={e=>setBuscar(e.target.value)} className="w-full rounded border p-3 dark:bg-gray-900"/>{loading ? <p>Cargando ubicaciones…</p> : error ? <p role="alert">{error.message}</p> : <div className="max-h-[65vh] overflow-auto"><table className="w-full text-left"><thead><tr><th>Ubigeo</th><th>Distrito</th><th>Provincia</th><th>Departamento</th></tr></thead><tbody>{rows.map(u=><tr key={u.id_ubigeo} className="border-b"><td className="py-2">{u.id_ubigeo}</td><td>{u.nombre}</td><td>{u.provincias?.nombre}</td><td>{u.provincias?.departamentos?.nombre}</td></tr>)}</tbody></table>{!rows.length && <p>Sin resultados.</p>}</div>}</div>;
}
