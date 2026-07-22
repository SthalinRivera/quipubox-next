'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/configuracion/categorias');
    }, [router]);
    return null;
}
