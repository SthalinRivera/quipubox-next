import { connection } from 'next/server';
import SignInForm from "@/components/auth/SignInForm";
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Login - Quipubox",
    description: "Login to your Quipubox account",
};

export default async function SignIn() {
    await connection();
    return (
        <Suspense fallback={null}>
            {/* SignInForm ya tiene la lógica del error dentro */}
            <SignInForm />
        </Suspense>
    );
}