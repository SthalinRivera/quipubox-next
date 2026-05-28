'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useToast } from "@/hooks/useToast";

export function SignInErrorHandler() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const processedErrorRef = useRef<string | null>(null);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error && processedErrorRef.current !== error) {
            processedErrorRef.current = error;
            toast.error(decodeURIComponent(error));

            // Limpiar el parámetro de la URL
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams, toast]);

    return null;
}