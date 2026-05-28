import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PuestosTable from '@/components/puestos/PuestosTable';

export default function PuestosPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Puestos" />
            <div className="space-y-6">
                <ComponentCard title="Listado de puestos">
                    <PuestosTable />
                </ComponentCard>
            </div>
        </div>
    );
}