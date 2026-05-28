export interface Rol {
    id_rol_usuario: number;
    nombre: string;
    descripcion?: string | null;
    estado: boolean;
    created_at?: string;
}