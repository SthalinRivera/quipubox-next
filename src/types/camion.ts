export interface Camion {
    id_camion: number;
    id_empresa: number;
    placa: string;
    observaciones?: string | null;
    descripcion?: string | null;
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
}