'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { Loader2, PlusCircle, Package, Truck, ClipboardList, AlertTriangle, CalendarCheck, ListTodo } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import { SkeletonDashboardContent } from '@/components/ui/skeleton/SkeletonDashboardContent';
import { useDashboardGraficas, PeriodoType } from '@/hooks/useDashboardGraficas';
import { OperacionesChart, JabasChart, GuiasChart, EntregasChart, IncidenciasChart } from '@/components/dashboard-charts';

interface DashboardStats {
  operacionesHoy: number;
  operacionesEnCurso: number;
  jabasCargadasHoy: number;
  camionesEnRuta: number;
  alertasPendientes: number;
  repartosPendientes: number;
  entregasHoy: number;
}

const rolePriority: Record<string, number> = {
  administrador: 100,
  Supervisor: 80,
  encargado_carga: 60,
  encargado_retorno: 50,
  repartidor: 40,
  chofer: 30,
  estibador: 20,
};

function getPrimaryRole(roles: string[]): string | null {
  if (!roles.length) return null;
  return roles.reduce((prev, curr) =>
    (rolePriority[curr] || 0) > (rolePriority[prev] || 0) ? curr : prev
  );
}

function PeriodoSelector({ value, onChange }: { value: PeriodoType; onChange: (v: PeriodoType) => void }) {
  const opciones: { label: string; value: PeriodoType }[] = [
    { label: 'Últimos 30 días', value: 'dia' },
    { label: 'Último año', value: 'mes' },
    { label: 'Últimos 5 años', value: 'anio' },
  ];
  return (
    <div className="flex gap-2">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === op.value
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { roles, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoType>('mes');
  const { data: graficasData, loading: loadingGraficas, fetchGraficas } = useDashboardGraficas();

  useEffect(() => {
    if (!authLoading && roles.length === 0) {
      router.push('/signin');
    }
  }, [authLoading, roles, router]);

  const primaryRole = getPrimaryRole(roles);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchWithAuth<DashboardStats>('dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas del dashboard:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (primaryRole && ['administrador', 'Supervisor', 'encargado_carga'].includes(primaryRole)) {
      fetchStats();
    }
  }, [primaryRole]);

  useEffect(() => {
    if (primaryRole && ['administrador', 'Supervisor'].includes(primaryRole)) {
      fetchGraficas(periodo);
    }
  }, [primaryRole, periodo, fetchGraficas]);

  if (authLoading) {
    return (
      <div>
        <SkeletonDashboardContent />
      </div>
    );
  }

  // ============================================================
  // 1. ADMINISTRADOR
  // ============================================================
  if (primaryRole === 'administrador') {
    return (
      <div className="space-y-6">
        {loadingStats ? (
          <div>
            <SkeletonDashboardContent />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard title="Operaciones hoy" value={stats?.operacionesHoy ?? 0} icon={CalendarCheck} color="blue" />
            <MetricCard title="Jabas cargadas hoy" value={stats?.jabasCargadasHoy ?? 0} icon={Package} color="green" />
            <MetricCard title="Camiones en ruta" value={stats?.camionesEnRuta ?? 0} icon={Truck} color="orange" />
            <MetricCard title="Alertas pendientes" value={stats?.alertasPendientes ?? 0} icon={AlertTriangle} color="red" />
            <MetricCard title="Repartos pendientes" value={stats?.repartosPendientes ?? 0} icon={ListTodo} color="purple" />
            <MetricCard title="Entregas hoy" value={stats?.entregasHoy ?? 0} icon={ClipboardList} color="teal" />
          </div>
        )}

        {/* Selector de período */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Gráficas del Dashboard</h2>
          <PeriodoSelector value={periodo} onChange={setPeriodo} />
        </div>

        {/* Gráficas de operaciones y jabas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <OperacionesChart data={graficasData?.operaciones_por_fecha || []} loading={loadingGraficas} />
          <JabasChart data={graficasData?.jabas_por_fecha || []} loading={loadingGraficas} />
        </div>

        {/* Gráficas de guías operativas */}
        <GuiasChart
          porEstado={graficasData?.guias_por_estado || []}
          porFecha={graficasData?.guias_por_fecha || []}
          loading={loadingGraficas}
        />

        {/* Gráficas de entregas */}
        <EntregasChart
          porFecha={graficasData?.entregas_por_fecha || []}
          jabasEntregadas={graficasData?.jabas_entregadas_por_fecha || []}
          loading={loadingGraficas}
        />

        {/* Gráficas de incidencias */}
        <IncidenciasChart
          porTipo={graficasData?.incidencias_por_tipo || []}
          porFecha={graficasData?.incidencias_por_fecha || []}
          loading={loadingGraficas}
        />
      </div>
    );
  }

  // ============================================================
  // 2. SUPERVISOR
  // ============================================================
  if (primaryRole === 'Supervisor') {
    return (
      <div className="space-y-6">
        {loadingStats ? (
          <div>
            <SkeletonDashboardContent />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard title="Operaciones hoy" value={stats?.operacionesHoy ?? 0} icon={CalendarCheck} color="blue" />
            <MetricCard title="Jabas cargadas hoy" value={stats?.jabasCargadasHoy ?? 0} icon={Package} color="green" />
            <MetricCard title="Camiones en ruta" value={stats?.camionesEnRuta ?? 0} icon={Truck} color="orange" />
            <MetricCard title="Alertas pendientes" value={stats?.alertasPendientes ?? 0} icon={AlertTriangle} color="red" />
          </div>
        )}

        {/* Selector de período */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Gráficas del Dashboard</h2>
          <PeriodoSelector value={periodo} onChange={setPeriodo} />
        </div>

        {/* Gráficas de operaciones y jabas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <OperacionesChart data={graficasData?.operaciones_por_fecha || []} loading={loadingGraficas} />
          <JabasChart data={graficasData?.jabas_por_fecha || []} loading={loadingGraficas} />
        </div>

        {/* Gráficas de guías operativas */}
        <GuiasChart
          porEstado={graficasData?.guias_por_estado || []}
          porFecha={graficasData?.guias_por_fecha || []}
          loading={loadingGraficas}
        />

        {/* Gráficas de entregas */}
        <EntregasChart
          porFecha={graficasData?.entregas_por_fecha || []}
          jabasEntregadas={graficasData?.jabas_entregadas_por_fecha || []}
          loading={loadingGraficas}
        />

        {/* Gráficas de incidencias */}
        <IncidenciasChart
          porTipo={graficasData?.incidencias_por_tipo || []}
          porFecha={graficasData?.incidencias_por_fecha || []}
          loading={loadingGraficas}
        />
      </div>
    );
  }

  // ============================================================
  // 3. ENCARGADO DE CARGA
  // ============================================================
  if (primaryRole === 'encargado_carga') {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/dashboard/operaciones-carga/nueva">
            <Button className="gap-2 text-lg px-6 py-3">
              <PlusCircle className="h-5 w-5" />
              Nueva Carga
            </Button>
          </Link>
        </div>

        {loadingStats ? (
          <div>
            <SkeletonDashboardContent />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard title="Cargas activas hoy" value={stats?.operacionesEnCurso ?? 0} icon={ClipboardList} color="blue" />
            <MetricCard title="Jabas cargadas hoy" value={stats?.jabasCargadasHoy ?? 0} icon={Package} color="green" />
            <MetricCard title="Camiones en ruta" value={stats?.camionesEnRuta ?? 0} icon={Truck} color="orange" />
            <MetricCard title="Alertas" value={stats?.alertasPendientes ?? 0} icon={AlertTriangle} color="red" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ComponentCard title="Últimas cargas">
            <p className="text-gray-500">Consulta las operaciones recientes</p>
            <Link href="/dashboard/operaciones-carga" className="text-blue-600 text-sm block mt-2">
              Ver todas las operaciones →
            </Link>
          </ComponentCard>
          <ComponentCard title="Guía rápida">
            <p className="text-gray-500">¿Cómo registrar una carga?</p>
            <Button variant="outline" size="sm" className="mt-2">
              Ver tutorial
            </Button>
          </ComponentCard>
        </div>
      </div>
    );
  }

  // ============================================================
  // 4. OTROS ROLES
  // ============================================================
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Bienvenido</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Usa el menú lateral para acceder a tus herramientas de trabajo.
      </p>
      <div className="mt-6">
        <Link href="/dashboard/operaciones-carga">
          <Button variant="outline">Ir a Operaciones de Carga</Button>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'border-l-blue-500 text-blue-500',
    green: 'border-l-green-500 text-green-500',
    orange: 'border-l-orange-500 text-orange-500',
    red: 'border-l-red-500 text-red-500',
    purple: 'border-l-purple-500 text-purple-500',
    teal: 'border-l-teal-500 text-teal-500',
  };
  return (
    <ComponentCard title={title} className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <Icon className={`h-10 w-10 opacity-70 ${colorClasses[color as keyof typeof colorClasses]}`} />
      </div>
    </ComponentCard>
  );
}
