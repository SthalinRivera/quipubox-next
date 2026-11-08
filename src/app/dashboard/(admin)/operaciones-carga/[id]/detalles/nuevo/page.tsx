import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NuevoDetallePage({ params }: Props) {
  const { id } = await params;
  redirect(`/dashboard/operaciones-carga/${id}?agregarProducto=1#carga`);
}
