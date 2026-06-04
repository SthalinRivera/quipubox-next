import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import GuiasOperativasTable from '@/components/guias-operativas/GuiasOperativasTable';

export default function GuiasOperativasPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Guías Operativas" />
            <ComponentCard title="Listado de guías">
                <GuiasOperativasTable />
            </ComponentCard>
        </div>
    );
}