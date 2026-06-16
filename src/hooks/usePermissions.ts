import { useAuthStore } from '@/stores/authStore';

export const usePermissions = () => {
    const roles = useAuthStore((state) => state.roles);

    const hasRole = (requiredRoles: string | string[]) => {
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return rolesArray.some(role => roles.includes(role));
    };

    return { roles, hasRole };
};