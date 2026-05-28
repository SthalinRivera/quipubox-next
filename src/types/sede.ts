export interface Sede {
    id_sede: number;
    id_empresa: number;
    nombre: string;
    tipo_sede?: 'origen' | 'destino' | 'ambos' | null;
    direccion?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
}