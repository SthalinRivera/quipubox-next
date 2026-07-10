// hooks/useJabas.ts
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import type { JabaPorPagar, JabaPorCobrar, DevolucionEmisor, RecuperacionJaba } from '@/types/jaba';
import { useToast } from './useToast';

export function useJabas() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [porCobrar, setPorCobrar] = useState<JabaPorCobrar[]>([]);
    const [porPagar, setPorPagar] = useState<JabaPorPagar[]>([]);

    // Obtener jabas por cobrar
    const fetchPorCobrar = useCallback(async (filters?: Record<string, any>) => {
        setLoading(true);
        try {
            const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
            const data = await fetchWithAuth<JabaPorCobrar[]>(`jabas/por-cobrar${query}`);
            setPorCobrar(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error(error?.message || 'Error al cargar jabas por cobrar');
            setPorCobrar([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Obtener jabas por pagar
    const fetchPorPagar = useCallback(async (filters?: Record<string, any>) => {
        setLoading(true);
        try {
            const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
            const data = await fetchWithAuth<JabaPorPagar[]>(`jabas/por-pagar${query}`);
            setPorPagar(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error(error?.message || 'Error al cargar jabas por pagar');
            setPorPagar([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Registrar recuperación (para jabas por cobrar)
    const registrarRecuperacion = useCallback(async (payload: Omit<RecuperacionJaba, 'id_recuperacion' | 'created_at' | 'saldo_resultante' | 'id_empresa'>) => {
        setLoading(true);
        try {
            const nueva = await fetchWithAuth<RecuperacionJaba>('jabas/recuperaciones', {
                method: 'POST',
                body: payload,
            });
            toast.success('Recuperación registrada correctamente');
            await fetchPorCobrar(); // refrescar lista
            return nueva;
        } catch (error: any) {
            toast.error(error?.message || 'Error al registrar recuperación');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [toast, fetchPorCobrar]);

    // Registrar devolución al emisor (para jabas por pagar)
    const registrarDevolucion = useCallback(async (payload: Omit<DevolucionEmisor, 'id_devolucion' | 'created_at' | 'saldo_resultante' | 'id_empresa'>) => {
        setLoading(true);
        try {
            const nueva = await fetchWithAuth<DevolucionEmisor>('jabas/devoluciones-emisor', {
                method: 'POST',
                body: payload,
            });
            toast.success('Devolución registrada correctamente');
            await fetchPorPagar(); // refrescar lista
            return nueva;
        } catch (error: any) {
            toast.error(error?.message || 'Error al registrar devolución');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [toast, fetchPorPagar]);

    // Cambiar estado (para jabas por cobrar)
    const cambiarEstadoPorCobrar = useCallback(async (id: number, estado: JabaPorCobrar['estado']) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<JabaPorCobrar>(`jabas/por-cobrar/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            // Actualizar localmente
            setPorCobrar(prev => prev.map(j => j.id_jaba_cobrar === id ? updated : j));
            toast.success('Estado actualizado');
            return updated;
        } catch (error: any) {
            toast.error(error?.message || 'Error al cambiar estado');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Cambiar estado (para jabas por pagar)
    const cambiarEstadoPorPagar = useCallback(async (id: number, estado: JabaPorPagar['estado']) => {
        setLoading(true);
        try {
            const updated = await fetchWithAuth<JabaPorPagar>(`jabas/por-pagar/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            });
            setPorPagar(prev => prev.map(j => j.id_jaba_pagar === id ? updated : j));
            toast.success('Estado actualizado');
            return updated;
        } catch (error: any) {
            toast.error(error?.message || 'Error al cambiar estado');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        loading,
        porCobrar,
        porPagar,
        fetchPorCobrar,
        fetchPorPagar,
        registrarRecuperacion,
        registrarDevolucion,
        cambiarEstadoPorCobrar,
        cambiarEstadoPorPagar,
    };
}