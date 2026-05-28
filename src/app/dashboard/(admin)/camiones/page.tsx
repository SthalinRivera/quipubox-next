import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import CamionesTable from '@/components/camiones/CamionesTable';

export default function CamionesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Camiones" />
            <div className="space-y-6">
                <ComponentCard title="Listado de camiones">
                    <CamionesTable />
                </ComponentCard>
            </div>
        </div>
    );
}