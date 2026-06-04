import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import EntregasTable from '@/components/entregas/EntregasTable';

export default function EntregasPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Entregas" />
            <ComponentCard title="Listado de entregas">
                <EntregasTable />
            </ComponentCard>
        </div>
    );
}