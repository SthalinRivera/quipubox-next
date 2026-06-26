import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import JabasTabs from '@/components/jabas/JabasTabs';


export default function JabasPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Gestión de Jabas (Retorno)" />
            <div className="space-y-6">
                <ComponentCard title="Control de jabas por cobrar / pagar">
                    <JabasTabs />
                </ComponentCard>
            </div>
        </div>
    );
}