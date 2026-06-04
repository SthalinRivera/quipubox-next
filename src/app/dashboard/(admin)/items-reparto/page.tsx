import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ItemsRepartoTable from '@/components/items-reparto/ItemsRepartoTable';

export default function ItemsRepartoPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Items de Reparto" />
            <ComponentCard title="Listado de repartos">
                <ItemsRepartoTable />
            </ComponentCard>
        </div>
    );
}