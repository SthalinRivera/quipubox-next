
//app/api/proxy/[...path]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // 1. Autenticación con Supabase
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Construir URL destino
    const targetPath = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = `${API_BASE.replace(/\/$/, '')}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;
    console.log(`[Proxy] ${method} ${fullUrl}`);

    // 3. Detectar Content-Type
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // 4. Preparar headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // 5. Manejar body según el tipo
    if (!['GET', 'HEAD'].includes(method)) {
      if (isMultipart) {
        // Para FormData, leer como FormData
        const formData = await request.formData();
        fetchOptions.body = formData;
        // No establecer Content-Type; fetch lo generará automáticamente
        delete headers['Content-Type'];
      } else {
        // Para JSON u otros, leer como texto
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      }
    }

    // 6. Ejecutar la petición al backend
    const response = await fetch(fullUrl, fetchOptions);

    // 7. Leer el cuerpo como texto
    const responseText = await response.text();

    // 8. Intentar parsear como JSON
    try {
      const data = JSON.parse(responseText);
      // Si es JSON válido, devolverlo con el status del backend
      return NextResponse.json(data, { status: response.status });
    } catch {
      // Si no es JSON, devolver un objeto de error estructurado
      console.warn(`[Proxy] Respuesta no JSON desde ${fullUrl} (status ${response.status}):`, responseText.substring(0, 200));

      // Determinar si es HTML (respuesta de error de NestJS)
      const isHtml = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');
      const errorMessage = isHtml
        ? 'El backend devolvió HTML (probablemente un error no manejado)'
        : 'El backend no devolvió JSON';

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          details: responseText.substring(0, 500), // truncar para no saturar
          isHtml,
        },
        { status: response.status >= 400 ? response.status : 500 }
      );
    }
  } catch (error: any) {
    console.error('[Proxy Error]', error);
    return NextResponse.json(
      {
        error: 'Error interno del proxy',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}