import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api-client';
import { useClientesUIStore } from '@/stores/clientesStore';
import type { Cliente } from '@/types/cliente';

interface PaginatedResponse {
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const fetchClientes = async (
    page: number,
    search: string,
    estado: boolean | 'todos',
    tipo_relacion: string
): Promise<PaginatedResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');
    if (search) params.append('buscar', search);
    if (estado !== 'todos') params.append('estado', estado.toString());
    if (tipo_relacion !== 'todos') params.append('tipo_relacion', tipo_relacion);
    const response = await fetchWithAuth<PaginatedResponse>(`clientes?${params.toString()}`);
    return response;
};

export const useClientesData = () => {
    const { page, search, estado, tipo_relacion, setPage } = useClientesUIStore();
    const queryClient = useQueryClient();

    // -------------------- Consulta principal --------------------
    const query = useQuery({
        queryKey: ['clientes', { page, search, estado, tipo_relacion }],
        queryFn: () => fetchClientes(page, search, estado, tipo_relacion),
        placeholderData: keepPreviousData,
    });

    // -------------------- Crear cliente --------------------
    const createCliente = useMutation({
        mutationFn: (cliente: any) =>
            fetchWithAuth<Cliente>('clientes', { method: 'POST', body: cliente }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    // -------------------- Actualizar cliente (PATCH) --------------------
    const updateCliente = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            fetchWithAuth<Cliente>(`clientes/${id}`, { method: 'PATCH', body: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    // -------------------- Soft delete: activar/desactivar --------------------
    const toggleEstado = useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: boolean }) =>
            fetchWithAuth<Cliente>(`clientes/${id}/estado`, {
                method: 'PATCH',
                body: { estado },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    // ❌ deleteCliente eliminado (ya no se usa)

    return {
        clientes: query.data?.data ?? [],
        total: query.data?.total ?? 0,
        totalPages: query.data?.totalPages ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        page,
        setPage,
        refetch: query.refetch,
        createCliente: createCliente.mutateAsync,
        updateCliente: updateCliente.mutateAsync,
        toggleEstado: toggleEstado.mutateAsync,   // ✅ función unificada
    };
};