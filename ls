warning: in the working copy of 'src/app/api/proxy/[...path]/route.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/items-reparto/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/nuevo/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/operaciones-carga/[id]/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/dashboard/(admin)/operaciones-carga/nueva/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/detalle-carga/DetallesCargaTable.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/entregas/EntregaModal.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/entregas/EntregasTable.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/entregas/RegistrarEntregaModal.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/guias-operativas/GuiaDetallePageComponent.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/guias-operativas/GuiaPDF.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/guias-operativas/GuiasOperativasTable.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/items-reparto/ItemRepartoSimpleForm.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/operaciones-carga/OperacionCargaModal.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/operaciones-carga/OperacionesCargaTable.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/ui/Stepper.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/hooks/useItemsReparto.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/hooks/useToast.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/layout/AppSidebar.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/app/api/proxy/[...path]/route.ts b/src/app/api/proxy/[...path]/route.ts[m
[1mindex a403c1a..7cc966a 100644[m
[1m--- a/src/app/api/proxy/[...path]/route.ts[m
[1m+++ b/src/app/api/proxy/[...path]/route.ts[m
[36m@@ -52,7 +52,7 @@[m [masync function proxyRequest([m
     if (!session?.access_token) {[m
       return NextResponse.json({ error: 'No autorizado' }, { status: 401 });[m
     }[m
[31m-    console.log(session?.access_token);[m
[32m+[m
 [m
     // 2. Construir URL destino[m
     const targetPath = params.path.join('/');[m
[1mdiff --git a/src/app/dashboard/(admin)/items-reparto/page.tsx b/src/app/dashboard/(admin)/items-reparto/page.tsx[m
[1mindex 8c51047..622d0ab 100644[m
[1m--- a/src/app/dashboard/(admin)/items-reparto/page.tsx[m
[1m+++ b/src/app/dashboard/(admin)/items-reparto/page.tsx[m
[36m@@ -49,23 +49,7 @@[m [mexport default function ItemsRepartoPage() {[m
         fetchPendientes();[m
     };[m
 [m
[31m-    const handleGenerarGuiaPorPuesto = async (operacionId: number) => {[m
[31m-        if (!operacionId) {[m
[31m-            toast.error('No se puede generar guía: falta operación');[m
[31m-            return;[m
[31m-        }[m
[31m-        setGenerating(operacionId);[m
[31m-        try {[m
[31m-            await fetchWithAuth(`operaciones-carga/${operacionId}/generar-guias`, { method: 'POST' });[m
[31m-            toast.success('Guías generadas correctamente');[m
[31m-            await fetchItems();[m
[31m-            await fetchPendientes();[m
[31m-        } catch (error: any) {[m
[31m-            toast.error(error.message || 'Error al generar guías');[m
[31m-        } finally {[m
[31m-            setGenerating(null);[m
[31m-        }[m
[31m-    };[m
[32m+[m[32m    const handleGenerarGuiaPorPuesto = (operacionId: number) => router.push(`/dashboard/operaciones-carga/${operacionId}#entregar`);[m
 [m
     const filteredPendientes = pendientes.filter((det: any) => {[m
         if (!searchTerm) return true;[m
[36m@@ -100,7 +84,7 @@[m [mexport default function ItemsRepartoPage() {[m
         <div className="space-y-6 p-4 md:p-6">[m
             {/* Cabecera */}[m
             <div className="flex flex-wrap items-center justify-between gap-4">[m
[31m-                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Reparto</h1>[m
[32m+[m[32m                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preparar entregas</h1>[m
                 <div className="flex items-center gap-3">[m
 [m
                     <Button[m
[36m@@ -145,7 +129,7 @@[m [mexport default function ItemsRepartoPage() {[m
                         `}[m
                     >[m
                         <CheckCircle className="w-4 h-4" />[m
[31m-                        Items Repartidos[m
[32m+[m[32m                        Destinos asignados[m
                         {items.length > 0 && ([m
                             <span className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">[m
                                 {items.length}[m
[36m@@ -331,7 +315,7 @@[m [mexport default function ItemsRepartoPage() {[m
                                                                         className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"[m
                                                                     >[m
                                                                         <FileText className="w-4 h-4" />[m
[31m-                                                                        {generating === operacionId ? 'Generando...' : 'Generar guía'}[m
[32m+[m[32m                                                                        {generating === operacionId ? 'Generando...' : 'Continuar con la entrega'}[m
                                                                     </button>[m
                                                                 )}[m
                                                             </TableCell>[m
[1mdiff --git a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx[m
[1mindex 799943f..3372508 100644[m
[1m--- a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx[m
[1m+++ b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx[m
[36m@@ -32,7 +32,7 @@[m [mexport default function CalidadesPage() {[m
     const [submitting, setSubmitting] = useState(false);[m
     const [operacionEstado, setOperacionEstado] = useState<string>('');[m
     const { setPasoCompletado, setCurrentStep } = useCreacionCargaStore();[m
[31m-    const isLocked = operacionEstado === 'repartiendo' || operacionEstado === 'cancelada';[m
[32m+[m[32m    const isLocked = !['pendiente', 'en_curso'].includes(operacionEstado) || detalle?.es_reparto === false;[m
 [m
     const loadData = async () => {[m
         try {[m
[36m@@ -42,6 +42,7 @@[m [mexport default function CalidadesPage() {[m
                 fetchWithAuth<{ id_calidad: number; nombre: string }[]>('calidades'),[m
                 fetchWithAuth<any>(`operaciones-carga/${operacionId}`),[m
             ]);[m
[32m+[m[32m            if (Number((det as { id_operacion: number }).id_operacion) !== Number(operacionId)) throw new Error('El producto no pertenece a esta operación');[m
             setDetalle(det);[m
             setCalidades(cal || []);[m
             setCalidadesOptions(opts || []);[m
[36m@@ -64,7 +65,7 @@[m [mexport default function CalidadesPage() {[m
             }[m
             const completado = detalles.every(d => {[m
                 if (!d.es_reparto) return true;[m
[31m-                const totalCalidades = d.calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;[m
[32m+[m[32m                const totalCalidades = d.detalle_carga_calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;[m
                 return totalCalidades === d.cantidad_jabas;[m
             });[m
             setPasoCompletado(2, completado);[m
[36m@@ -94,7 +95,7 @@[m [mexport default function CalidadesPage() {[m
     const isComplete = pendiente === 0 && maxCantidad > 0;[m
 [m
     const handleAdd = async () => {[m
[31m-        if (newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0) {[m
[32m+[m[32m        if (newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0 || !Number.isInteger(newCalidad.cantidad)) {[m
             toast.error('Complete los campos obligatorios');[m
             return;[m
         }[m
[36m@@ -337,7 +338,7 @@[m [mexport default function CalidadesPage() {[m
                     </Button>[m
                     {isComplete && ([m
                         <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}>[m
[31m-                            Continuar[m
[32m+[m[32m                            Continuar con los destinos[m
                             <ArrowRight className="w-4 h-4 ml-2" />[m
                         </Button>[m
                     )}[m
[1mdiff --git a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/nuevo/page.tsx b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/nuevo/page.tsx[m
[1mindex e06fe1f..c04c4ea 100644[m
[1m--- a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/nuevo/page.tsx[m
[1m+++ b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/nuevo/page.tsx[m
[36m@@ -168,7 +168,7 @@[m [mexport default function NuevoDetallePage() {[m
                 method: 'POST',[m
                 body: payload,[m
             });[m
[31m-            toast.success(form.es_reparto ? 'Detalle creado' : 'Detalle creado — vaya a Items de Reparto para generar la guía');[m
[32m+[m[32m            toast.success(form.es_reparto ? 'Detalle creado' : 'Producto agregado. Revisa y confirma la carga para continuar con la entrega.');[m
             if (form.es_reparto) {[m
                 router.push(`/dashboard/operaciones-carga/${operacionId}/detalles/${newDetalle.id_detalle_carga}/calidades`);[m
             } else {[m
[36m@@ -187,7 +187,7 @@[m [mexport default function NuevoDetallePage() {[m
         <div className="max-w-3xl mx-auto p-6">[m
             <Stepper />[m
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-4">[m
[31m-                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nuevo detalle de carga</h1>[m
[32m+[m[32m                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agregar producto de carga</h1>[m
                 <p className="text-gray-600 dark:text-gray-400 mb-6">Complete los datos del detalle para agregarlo a la operación.</p>[m
 [m
                 <form onSubmit={handleSubmit} className="space-y-6">[m
[1mdiff --git a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/page.tsx b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/page.tsx[m
[1mindex cf2ffc7..c43ae73 100644[m
[1m--- a/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/page.tsx[m
[1m+++ b/src/app/dashboard/(admin)/operaciones-carga/[id]/detalles/page.tsx[m
[36m@@ -1,106 +1,5 @@[m
[31m-// app/dashboard/operaciones-carga/[id]/detalles/page.tsx[m
[31m-'use client';[m
[31m-import { useParams, useRouter } from 'next/navigation';[m
[31m-import { useEffect, useState } from 'react';[m
[31m-import Link from 'next/link';[m
[31m-import { fetchWithAuth } from '@/lib/api-client';[m
[31m-import Button from '@/components/ui/button/Button';[m
[31m-import { PlusCircle, Package, TrendingUp } from 'lucide-react';[m
[31m-[m
[31m-// Definir interfaces según la respuesta esperada[m
[31m-interface Camion {[m
[31m-    placa: string;[m
[32m+[m[32mimport { redirect } from 'next/navigation';[m
[32m+[m[32mexport default async function DetallesOperacion({ params }: { params: Promise<{id:string}> }) {[m
[32m+[m[32m  const {id} = await params;[m
[32m+[m[32m  redirect('/dashboard/operaciones-carga/' + id);[m
 }[m
[31m-[m
[31m-interface Operacion {[m
[31m-    id_operacion: number;[m
[31m-    fecha_carga: string;[m
[31m-    camiones?: Camion;[m
[31m-}[m
[31m-[m
[31m-interface Cliente {[m
[31m-    nombres: string;[m
[31m-}[m
[31m-[m
[31m-interface Fruta {[m
[31m-    nombre: string;[m
[31m-}[m
[31m-[m
[31m-interface TipoJaba {[m
[31m-    nombre: string;[m
[31m-}[m
[31m-[m
[31m-interface Detalle {[m
[31m-    id_detalle_carga: number;[m
[31m-    cantidad_jabas: number;[m
[31m-    es_reparto: boolean;[m
[31m-    clientes?: Cliente;[m
[31m-    frutas?: Fruta;[m
[31m-    tipos_jaba?: TipoJaba;[m
[31m-}[m
[31m-[m
[31m-export default function DetallesOperacion() {[m
[31m-    const { id } = useParams();[m
[31m-    const router = useRouter();[m
[31m-    const [operacion, setOperacion] = useState<Operacion | null>(null);[m
[31m-    const [detalles, setDetalles] = useState<Detalle[]>([]);[m
[31m-[m
[31m-    useEffect(() => {[m
[31m-        const fetchData = async () => {[m
[31m-            try {[m
[31m-                const [op, dets] = await Promise.all([[m
[31m-                    fetchWithAuth<Operacion>(`/operaciones-carga/${id}`),[m
[31m-                    fetchWithAuth<Detalle[]>(`/operaciones-carga/${id}/detalles`),[m
[31m-                ]);[m
[31m-                setOperacion(op);[m
[31m-                setDetalles(dets);[m
[31m-            } catch (error) {[m
[31m-                console.error(error);[m
[31m-            }[m
[31m-        };[m
[31m-        if (id) fetchData();[m
[31m-    }, [id]);[m
[31m-[m
[31m-    return ([m
[31m-        <div>[m
[31m-            <div className="flex justify-between items-center mb-4">[m
[31m-                <div>[m
[31m-                    <h1 className="text-2xl font-bold">Carga #{id}</h1>[m
[31m-                    <p className="text-gray-500">[m
[31m-                        {operacion?.fecha_carga ? new Date(operacion.fecha_carga).toLocaleDateString() : 'Cargando...'} |[m
[31m-                        Camión: {operacion?.camiones?.placa || '—'}[m
[31m-                    </p>[m
[31m-                </div>[m
[31m-                <Link href={`/dashboard/operaciones-carga/${id}/detalles/nuevo`}>[m
[31m-                    <Button><PlusCircle className="w-4 h-4 mr-1" /> Agregar detalle</Button>[m
[31m-                </Link>[m
[31m-            </div>[m
[31m-[m
[31m-            <div className="space-y-3">[m
[31m-                {detalles.length === 0 ? ([m
[31m-                    <p className="text-gray-500">No hay detalles de carga.</p>[m
[31m-                ) : ([m
[31m-                    detalles.map((det) => ([m
[31m-                        <div key={det.id_detalle_carga} className="border rounded-lg p-4">[m
[31m-                            <div className="flex justify-between items-start">[m
[31m-                                <div>[m
[31m-                                    <p className="font-semibold">[m
[31m-                                        {det.clientes?.nombres || 'N/A'} – {det.frutas?.nombre || 'N/A'} ({det.cantidad_jabas} jabas)[m
[31m-                                    </p>[m
[31m-                                    <p className="text-sm text-gray-500">[m
[31m-                                        Tipo: {det.tipos_jaba?.nombre || 'N/A'} | Reparto: {det.es_reparto ? 'Sí' : 'No'}[m
[31m-                                    </p>[m
[31m-                                </div>[m
[31m-                                {det.es_reparto && ([m
[31m-                                    <Link href={`/dashboard/detalle-carga/${det.id_detalle_carga}/calidades`}>[m
[31m-                                        <Button variant="outline" size="sm"><TrendingUp className="w-4 h-4 mr-1" /> Calidades</Button>[m
[31m-                                    </Link>[m
[31m-                                )}[m
[31m-                            </div>[m
[31m-                        </div>[m
[31m-                    ))[m
[31m-                )}[m
[31m-            </div>[m
[31m-        </div>[m
[31m-    );[m
[31m-}[m
\ No newline at end of file[m
[1mdiff --git a/src/app/dashboard/(admin)/operaciones-carga/[id]/page.tsx b/src/app/dashboard/(admin)/operaciones-carga/[id]/page.tsx[m
[1mindex 561c701..69c4512 100644[m
[1m--- a/src/app/dashboard/(admin)/operaciones-carga/[id]/page.tsx[m
[1m+++ b/src/app/dashboard/(admin)/operaciones-carga/[id]/page.tsx[m
[36m@@ -1,196 +1,583 @@[m
[31m-// app/dashboard/operaciones-carga/[id]/page.tsx[m
 'use client';[m
[31m-[m
[31m-import { useEffect, useState } from 'react';[m
[31m-import { useParams, useRouter } from 'next/navigation';[m
[32m+[m[32mimport { useCallback, useEffect, useState } from 'react';[m
[32m+[m[32mimport { useParams } from 'next/navigation';[m
[32m+[m[32mimport Link from 'next/link';[m
[32m+[m[32mimport {[m
[32m+[m[32m  CheckCircle,[m
[32m+[m[32m  ArrowLeft,[m
[32m+[m[32m  Plus,[m
[32m+[m[32m  Package,[m
[32m+[m[32m  Layers,[m
[32m+[m[32m  Truck,[m
[32m+[m[32m  FileText,[m
[32m+[m[32m} from 'lucide-react';[m
 import { fetchWithAuth } from '@/lib/api-client';[m
[31m-import { useToast } from '@/hooks/useToast';[m
 import { Stepper } from '@/components/ui/Stepper';[m
[31m-import { useCreacionCargaStore } from '@/stores/creacionCargaStore';[m
[31m-import PageBreadcrumb from '@/components/common/PageBreadCrumb';[m
[31m-import ComponentCard from '@/components/common/ComponentCard';[m
[31m-import DetallesCargaTable from '@/components/detalle-carga/DetallesCargaTable';[m
 import Button from '@/components/ui/butto