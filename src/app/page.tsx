'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            } else {
                router.push('/signin');
            }
            setChecking(false);
        };
        checkAuth();
    }, [router]);

    // Mientras verifica, muestra un loader o nada
    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
            </div>
        );
    }

    return null; // nunca se ve porque redirige inmediatamente
}