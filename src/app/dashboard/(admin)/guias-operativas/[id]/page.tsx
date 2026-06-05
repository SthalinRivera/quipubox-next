import { GuiaDetallePageComponent } from '@/components/guias-operativas/GuiaDetallePageComponent';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function GuiaDetallePage({ params }: Props) {
    const { id } = await params;
    return (
        <div>
            <PageBreadcrumb pageTitle={`Guía ${id}`} />


            <ComponentCard title="Detalle de guía">
                <GuiaDetallePageComponent id={id} />
            </ComponentCard>
        </div>
    );
}