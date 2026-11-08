import { redirect } from 'next/navigation';
export default async function DetallesOperacion({ params }: { params: Promise<{id:string}> }) {
  const {id} = await params;
  redirect('/dashboard/operaciones-carga/' + id);
}
