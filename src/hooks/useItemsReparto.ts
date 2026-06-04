import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { ItemReparto, CreateItemRepartoDto } from '@/types/itemReparto';

export const useItemsReparto = (detalleId?: number) => {
    const [items, setItems] = useState<ItemReparto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = useCallback(async (params?: { id_detalle_carga?: number }) => {
        setLoading(true);
        try {
            let url = 'items-reparto';
            if (params?.id_detalle_carga) {
                url = `detalle-carga/${params.id_detalle_carga}/repartos`;
            }
            const data = await fetchWithAuth<ItemReparto[]>(url);
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createItem = async (dto: CreateItemRepartoDto) => {
        let url = 'items-reparto';
        if (dto.id_detalle_carga) {
            url = `detalle-carga/${dto.id_detalle_carga}/repartos`;
        }
        const newItem = await fetchWithAuth<ItemReparto>(url, {
            method: 'POST',
            body: dto,
        });
        await fetchItems({ id_detalle_carga: dto.id_detalle_carga });
        return newItem;
    };

    const updateItem = async (id: number, dto: Partial<CreateItemRepartoDto>) => {
        const updated = await fetchWithAuth<ItemReparto>(`items-reparto/${id}`, {
            method: 'PUT',
            body: dto,
        });
        await fetchItems();
        return updated;
    };

    const deleteItem = async (id: number) => {
        await fetchWithAuth(`items-reparto/${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return {
        items,
        loading,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
    };
};