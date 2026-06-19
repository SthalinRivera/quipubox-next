// lib/items-reparto-api.ts
import { fetchWithAuth } from '@/lib/api-client';

export interface ItemReparto {
    id_item_reparto: number;
    id_detalle_carga: number;
    id_cliente_receptor: number;
    id_puesto: number;
    cantidad_asignada: number;
    orden_entrega?: number;
    observaciones?: string;
    seccion?: string;
    cliente?: { id_cliente: number; nombres: string; apellidos?: string };
    puesto?: { id_puesto: number; numero_puesto: string; referencia?: string };
    detalle_carga?: any;
    entregas?: any[];
    items_reparto_detalle?: {
        id_item_reparto_detalle: number;
        cantidad: number;
        precio_unitario?: number;
        detalle_carga_calidades: {
            id_detalle_carga_calidad: number;
            cantidad: number;
            calidades: { nombre: string };
        };
    }[];
}

export interface CreateItemRepartoDto {
    id_detalle_carga: number;
    id_cliente_receptor: number;
    id_puesto: number;
    cantidad_asignada: number;
    orden_entrega?: number;
    observaciones?: string;
    seccion?: string;
}

export interface CreateItemFromCalidadesDto {
    id_detalle_carga: number;
    id_cliente_receptor: number;
    id_puesto: number;
    detalles: {
        id_detalle_carga_calidad: number;
        cantidad: number;
        precio_unitario?: number;
    }[];
    orden_entrega?: number;
    observaciones?: string;
    seccion?: string;
}

export interface ItemRepartoDetalle {
    id_item_reparto_detalle: number;
    id_item_reparto: number;
    id_detalle_carga_calidad: number;
    cantidad: number;
    precio_unitario?: number;
}

// Obtener todos los items (con filtros)
export async function getItemsReparto(params?: {
    id_detalle_carga?: number;
    id_cliente_receptor?: number;
    id_puesto?: number;
    seccion?: string;
}) {
    const query = new URLSearchParams();
    if (params?.id_detalle_carga) query.append('id_detalle_carga', String(params.id_detalle_carga));
    if (params?.id_cliente_receptor) query.append('id_cliente_receptor', String(params.id_cliente_receptor));
    if (params?.id_puesto) query.append('id_puesto', String(params.id_puesto));
    if (params?.seccion) query.append('seccion', params.seccion);

    const url = `/items-reparto?${query.toString()}`;
    return fetchWithAuth<ItemReparto[]>(url);
}

// Obtener un item por ID
export async function getItemReparto(id: number) {
    return fetchWithAuth<ItemReparto>(`/items-reparto/${id}`);
}

// Crear un item simple (sin calidades)
export async function createItemReparto(data: CreateItemRepartoDto) {
    return fetchWithAuth<ItemReparto>('/items-reparto', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Crear un item desde calidades (flujo principal)
export async function createItemFromCalidades(data: CreateItemFromCalidadesDto) {
    return fetchWithAuth<ItemReparto>('/items-reparto/from-calidades', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Actualizar item
export async function updateItemReparto(id: number, data: Partial<CreateItemRepartoDto>) {
    return fetchWithAuth<ItemReparto>(`/items-reparto/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// Eliminar item
export async function deleteItemReparto(id: number) {
    return fetchWithAuth<void>(`/items-reparto/${id}`, { method: 'DELETE' });
}

// ===== Detalles de item =====

// Agregar detalle a un item
export async function addDetalleToItem(itemId: number, data: {
    id_detalle_carga_calidad: number;
    cantidad: number;
    precio_unitario?: number;
}) {
    return fetchWithAuth<ItemRepartoDetalle>(`/items-reparto/${itemId}/detalle`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Obtener detalles de un item
export async function getDetallesByItem(itemId: number) {
    return fetchWithAuth<ItemRepartoDetalle[]>(`/items-reparto/${itemId}/detalle`);
}

// Actualizar detalle
export async function updateDetalle(detalleId: number, data: { cantidad?: number; precio_unitario?: number }) {
    return fetchWithAuth<ItemRepartoDetalle>(`/items-reparto/detalle/${detalleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// Eliminar detalle
export async function deleteDetalle(detalleId: number) {
    return fetchWithAuth<void>(`/items-reparto/detalle/${detalleId}`, { method: 'DELETE' });
}