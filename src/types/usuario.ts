export interface Usuario {
    id_usuario: number;
    id_empresa: number;
    id_ubigeo?: string | null;
    nombres: string;
    apellidos?: string | null;
    telefono?: string | null;
    email: string;
    google_uid?: string | null;
    avatar_url?: string | null;
    estado_acceso: 'activo' | 'bloqueado';
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
    distritos?: { id_ubigeo: string; nombre: string };
    usuarios_roles?: Array<{
        id_rol_usuario: number;
        roles_usuarios: {
            id_rol_usuario: number;
            nombre: string;
            descripcion: string;
        };
    }>;
}

export interface Rol {
    id_rol_usuario: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
}