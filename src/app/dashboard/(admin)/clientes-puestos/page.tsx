import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ClientesPuestosTable from '@/components/clientes-puestos/ClientesPuestosTable';

export default function ClientesPuestosPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Asignaciones Cliente → Puesto" />
            <ComponentCard title="Listado de asignaciones">
                <ClientesPuestosTable />
            </ComponentCard>
        </div>
    );
}