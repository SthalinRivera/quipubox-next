// app/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';  // ← Agrega esta línea

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect('/dashboard');
    } else {
        redirect('/signin');
    }
}