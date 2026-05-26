import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    // Get the auth session from Supabase server-side
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Build the target URL
    const pathSegments = params.path || [];
    const targetPath = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = `${API_BASE.replace(/\/$/, '')}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

    // Build headers for the proxied request
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    // Build the proxied request options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Forward body for non-GET/HEAD methods
    if (!['GET', 'HEAD'].includes(method)) {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch {
        // No body to forward
      }
    }

    // Make the server-side request (no CORS restrictions!)
    const response = await fetch(fullUrl, fetchOptions);

    // Get the response body
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del proxy' },
      { status: 500 }
    );
  }
}
