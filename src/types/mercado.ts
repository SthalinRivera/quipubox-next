export interface Mercado {
    id_lugar: number;
    id_empresa: number;
    id_sede: number;
    nombre: string;
    direccion_referencia?: string | null;
    observaciones?: string | null;
    tipo_lugar: string; // 'mercado'
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
    sedes?: { id_sede: number; nombre: string };
}