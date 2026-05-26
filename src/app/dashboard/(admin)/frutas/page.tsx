import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import FrutasTable from '@/components/frutas/FrutasTable';

export default function FrutasPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Frutas (API real)" />
            <div className="space-y-6">
                <ComponentCard title="Listado de frutas desde backend">
                    <FrutasTable />
                </ComponentCard>
            </div>
        </div>
    );
}