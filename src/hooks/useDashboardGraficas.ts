import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';

export interface DashboardGraficasData {
  operaciones_por_fecha: { fecha: string; total_operaciones: number; total_jabas: number }[];
  jabas_por_fecha: { fecha: string; total_jabas: number; jabas_por_tipo: { tipo: string; cantidad: number }[] }[];
  guias_por_estado: { estado: string; cantidad: number }[];
  guias_por_fecha: { fecha: string; emitidas: number; firmadas: number; anuladas: number }[];
  entregas_por_fecha: { fecha: string; total: number; entregadas: number; parciales: number; rechazadas: number; jabas_entregadas: number }[];
  incidencias_por_tipo: { tipo: string; cantidad: number }[];
  incidencias_por_fecha: { fecha: string; total: number; abiertas: number; en_proceso: number; cerradas: number }[];
  jabas_entregadas_por_fecha: { fecha: string; cantidad_entregada: number; cantidad_rechazada: number }[];
}

export type PeriodoType = 'dia' | 'mes' | 'anio';

function getDateRange(periodo: PeriodoType): { fecha_inicio: string; fecha_fin: string } {
  const hoy = new Date();
  const fin = hoy.toISOString().split('T')[0];
  let inicio: Date;

  switch (periodo) {
    case 'dia':
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 29);
      break;
    case 'mes':
      inicio = new Date(hoy);
      inicio.setMonth(hoy.getMonth() - 11);
      break;
    case 'anio':
      inicio = new Date(hoy);
      inicio.setFullYear(hoy.getFullYear() - 4);
      break;
  }

  return { fecha_inicio: inicio.toISOString().split('T')[0], fecha_fin: fin };
}

export const useDashboardGraficas = () => {
  const [data, setData] = useState<DashboardGraficasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraficas = useCallback(async (periodo: PeriodoType = 'mes') => {
    setLoading(true);
    setError(null);
    try {
      const { fecha_inicio, fecha_fin } = getDateRange(periodo);
      const params = new URLSearchParams({ fecha_inicio, fecha_fin });
      const result = await fetchWithAuth<DashboardGraficasData>(`reportes/dashboard-graficas?${params}`);
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard gráficas:', err);
      setError('Error al cargar datos de gráficas');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchGraficas };
};
