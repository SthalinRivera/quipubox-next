import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type {
  ReportFilters,
  ReporteCargaPorFecha,
  ReporteDetalleCarga,
  ReporteItemsReparto,
  ReporteGuias,
  ReporteEntregas,
  ReporteIncidencias,
  ReporteJabasPorPagar,
  ReporteJabasPorCobrar,
  ReporteRecuperaciones,
  ReporteDevoluciones,
  ReporteClientesPorSede,
  ReporteClientesPorPuesto,
  ReporteHistorialAsignacionPuestos,
  ReporteInventario,
  ReporteUsuariosRoles,
  ReporteActividadUsuarios,
  ReporteModulosPorRol,
} from '@/types/reportes';

const buildQuery = (filters: ReportFilters): string => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
  if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.id_sede) params.append('id_sede', String(filters.id_sede));
  if (filters.id_cliente) params.append('id_cliente', String(filters.id_cliente));
  if (filters.id_fruta) params.append('id_fruta', String(filters.id_fruta));
  if (filters.id_tipo_jaba) params.append('id_tipo_jaba', String(filters.id_tipo_jaba));
  if (filters.id_repartidor) params.append('id_repartidor', String(filters.id_repartidor));
  if (filters.id_usuario) params.append('id_usuario', String(filters.id_usuario));
  if (filters.id_puesto) params.append('id_puesto', String(filters.id_puesto));
  if (filters.id_lugar) params.append('id_lugar', String(filters.id_lugar));
  if (filters.tipo_incidencia) params.append('tipo_incidencia', filters.tipo_incidencia);
  if (filters.id_operacion) params.append('id_operacion', String(filters.id_operacion));
  if (filters.id_guia) params.append('id_guia', String(filters.id_guia));
  const str = params.toString();
  return str ? `?${str}` : '';
};

export const useReportes = () => {
  const [loading, setLoading] = useState(false);

  const fetchCargasPorFecha = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteCargaPorFecha[]>(`reportes/cargas-por-fecha${query}`);
    } catch (error) {
      console.error('Error fetching reporte cargas:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetalleCargaPorOperacion = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteDetalleCarga[]>(`reportes/detalle-carga-por-operacion${query}`);
    } catch (error) {
      console.error('Error fetching reporte detalle carga:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItemsRepartoPorDetalle = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteItemsReparto[]>(`reportes/items-reparto-por-detalle${query}`);
    } catch (error) {
      console.error('Error fetching reporte items reparto:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGuias = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteGuias>(`reportes/guias${query}`);
    } catch (error) {
      console.error('Error fetching reporte guías:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntregas = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteEntregas>(`reportes/entregas${query}`);
    } catch (error) {
      console.error('Error fetching reporte entregas:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIncidencias = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteIncidencias>(`reportes/incidencias${query}`);
    } catch (error) {
      console.error('Error fetching reporte incidencias:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJabasPorPagar = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteJabasPorPagar>(`reportes/jabas-por-pagar${query}`);
    } catch (error) {
      console.error('Error fetching reporte jabas por pagar:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJabasPorCobrar = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteJabasPorCobrar>(`reportes/jabas-por-cobrar${query}`);
    } catch (error) {
      console.error('Error fetching reporte jabas por cobrar:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecuperaciones = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteRecuperaciones>(`reportes/recuperaciones${query}`);
    } catch (error) {
      console.error('Error fetching reporte recuperaciones:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDevoluciones = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteDevoluciones>(`reportes/devoluciones${query}`);
    } catch (error) {
      console.error('Error fetching reporte devoluciones:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientesPorSede = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteClientesPorSede[]>(`reportes/clientes-por-sede${query}`);
    } catch (error) {
      console.error('Error fetching reporte clientes por sede:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientesPorPuesto = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteClientesPorPuesto[]>(`reportes/clientes-por-puesto${query}`);
    } catch (error) {
      console.error('Error fetching reporte clientes por puesto:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorialAsignacionPuestos = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteHistorialAsignacionPuestos>(
        `reportes/historial-asignacion-puestos${query}`,
      );
    } catch (error) {
      console.error('Error fetching reporte historial asignación:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInventario = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteInventario>(`reportes/inventario${query}`);
    } catch (error) {
      console.error('Error fetching reporte inventario:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsuariosRoles = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteUsuariosRoles>(`reportes/usuarios-roles${query}`);
    } catch (error) {
      console.error('Error fetching reporte usuarios roles:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActividadUsuarios = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteActividadUsuarios>(`reportes/actividad-usuarios${query}`);
    } catch (error) {
      console.error('Error fetching reporte actividad usuarios:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModulosPorRol = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      return await fetchWithAuth<ReporteModulosPorRol>(`reportes/modulos-por-rol${query}`);
    } catch (error) {
      console.error('Error fetching reporte módulos por rol:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchCargasPorFecha,
    fetchDetalleCargaPorOperacion,
    fetchItemsRepartoPorDetalle,
    fetchGuias,
    fetchEntregas,
    fetchIncidencias,
    fetchJabasPorPagar,
    fetchJabasPorCobrar,
    fetchRecuperaciones,
    fetchDevoluciones,
    fetchClientesPorSede,
    fetchClientesPorPuesto,
    fetchHistorialAsignacionPuestos,
    fetchInventario,
    fetchUsuariosRoles,
    fetchActividadUsuarios,
    fetchModulosPorRol,
  };
};
