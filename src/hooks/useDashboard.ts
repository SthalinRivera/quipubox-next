// hooks/useDashboard.ts
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';

interface DashboardData {
    operacionesHoy: number;
    operacionesEnCurso: number;
    jabasCargadasHoy: number;
    camionesEnRuta: number;
    alertasPendientes: number;
    repartosPendientes: number;
    entregasHoy: number;
}

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await fetchWithAuth<DashboardData>('dashboard');
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    return { data, loading, error };
};