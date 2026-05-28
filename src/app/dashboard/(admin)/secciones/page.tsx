import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import SeccionesTable from '@/components/secciones/SeccionesTable';

export default function SeccionesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Secciones de Puestos" />
            <div className="space-y-6">
                <ComponentCard title="Listado de secciones">
                    <SeccionesTable />
                </ComponentCard>
            </div>
        </div>
    );
}