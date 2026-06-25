// app/layout.tsx
import { Providers } from '../app/providers';
export const dynamic = 'force-dynamic';  // ← Agrega esta línea

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}