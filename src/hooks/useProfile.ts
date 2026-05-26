'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';

interface Empresa {
    id_empresa: number;
    razon_social: string;
    nombre_comercial: string;
    ruc?: string;
}

interface Sede {
    id_sede: number;
    nombre: string;
    ciudad?: string;
    departamento?: string;
    tipo_sede?: string;
}

interface Rol {
    id_rol_usuario: number;
    nombre: string;
    descripcion: string;
}

export interface PerfilUsuario {
    id_usuario: number;
    nombres: string;
    apellidos?: string;
    email: string;
    telefono?: string;
    avatar_url?: string;
    estado_acceso: 'activo' | 'bloqueado';
    created_at?: string;
    empresas?: Empresa;
    sedes?: Sede;
    usuarios_roles?: { roles_usuarios: Rol }[];
}

export const useProfile = () => {
    const [profile, setProfile] = useState<PerfilUsuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth<PerfilUsuario>('auth/profile');
            setProfile(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, error, refetch: fetchProfile };
};