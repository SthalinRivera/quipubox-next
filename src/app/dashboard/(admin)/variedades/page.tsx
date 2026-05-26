import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import VariedadesTable from '@/components/variedades/VariedadesTable';

export default function VariedadesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Variedades" />
            <ComponentCard title="Listado de variedades">
                <VariedadesTable />
            </ComponentCard>
        </div>
    );
}