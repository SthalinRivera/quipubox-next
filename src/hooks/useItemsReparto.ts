// hooks/useItemsReparto.ts
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';

export interface ItemReparto {
    id_item_reparto: number;
    id_detalle_carga: number;
    id_cliente_receptor: number;
    id_puesto: number;
    cantidad_asignada: number;
    orden_entrega?: number;
    observaciones?: string;
    seccion?: string;
    clientes?: { id_cliente: number; nombres: string; apellidos?: string };
    puestos?: { id_puesto: number; codigo_puesto: string };
    items_reparto_detalle?: any[];
    detalle_carga?: any;
}

export const useItemsReparto = () => {
    const toast = useToast();
    const [items, setItems] = useState<ItemReparto[]>([]);
    const [pendientes, setPendientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [detallesReparto, setDetallesReparto] = useState<any[]>([]);


    // --- Items ya asignados ---
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<ItemReparto[]>('items-reparto');
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error en fetchItems:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Pendientes de asignación ---
    const fetchPendientes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth<any[]>('operaciones-carga/detalles-pendientes');
            setPendientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error en fetchPendientes:', error);
            setPendientes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Detalles de reparto por operación ---
    const getDetallesReparto = useCallback(async (operacionId: number) => {
        try {
            const data = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/detalles-reparto-pendientes`);
            setDetallesReparto(Array.isArray(data) ? data : []);
            return data || [];
        } catch (error) {
            console.error('Error en getDetallesReparto:', error);
            setDetallesReparto([]);
            return [];
        }
    }, []);

    // --- Calidades de un detalle ---
    const getCalidadesByDetalle = useCallback(async (detalleId: number) => {
        try {
            const data = await fetchWithAuth<any[]>(`detalle-carga/${detalleId}/calidades`);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error en getCalidadesByDetalle:', error);
            return [];
        }
    }, []);

    // --- Crear múltiples desde calidades ---
    const createMultipleFromCalidades = useCallback(async (payload: any) => {
        try {
            const result = await fetchWithAuth<any[]>('items-reparto/from-calidades-multiple', {
                method: 'POST',
                body: payload,
            });
            toast.success('Calidad asignada correctamente');
            return result;
        } catch (error: any) {
            toast.error(error.message || 'Error al asignar calidad');
            throw error;
        }
    }, [fetchItems, fetchPendientes, toast]);

    // --- Eliminar item ---
    const deleteItem = useCallback(async (id: number) => {
        try {
            await fetchWithAuth(`items-reparto/${id}`, { method: 'DELETE' });
            toast.success('Item eliminado');
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar');
            throw error;
        }
    }, [fetchItems, fetchPendientes, toast]);

    const generarGuias = useCallback(async (operacionId: number) => {
        setLoading(true);
        try {
            const result = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/generar-guias`, {
                method: 'POST',
            });
            toast.success(`Se generaron ${result?.length || 0} guías correctamente`);
            return result;
        } catch (error: any) {
            toast.error(error.message || 'Error al generar guías');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchItems, fetchPendientes, toast]);
    return {
        items,
        pendientes,
        loading,
        detallesReparto,
        fetchItems,
        fetchPendientes,
        getDetallesReparto,
        getCalidadesByDetalle,
        createMultipleFromCalidades,
        deleteItem,
        generarGuias,
    };
};