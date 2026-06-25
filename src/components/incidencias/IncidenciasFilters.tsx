'use client';

import { useState } from 'react';

export default function IncidenciasFilters() {
    const [estado, setEstado] = useState('todos');
    const [tipo, setTipo] = useState('');

    return (
        <div className="flex flex-wrap gap-4 items-center">
            <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    <option value="todos">Todos</option>
                    <option value="abierta">Abierta</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cerrada">Cerrada</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <input
                    type="text"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    placeholder="Ej: robo, daño, etc."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div className="self-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Buscar
                </button>
            </div>
        </div>
    );
}