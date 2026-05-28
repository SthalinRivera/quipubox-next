export interface Seccion {
    id_seccion: number;
    id_puesto: number;
    nombre_seccion: string;
    descripcion?: string | null;
    observaciones?: string | null;
    estado: boolean;
    created_at?: string;
    puestos?: { id_puesto: number; numero_puesto: string };
}