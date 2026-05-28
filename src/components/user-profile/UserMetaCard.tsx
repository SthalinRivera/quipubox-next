'use client';

import React from 'react';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Image from 'next/image';
import { useProfile } from '@/hooks/useProfile';

export default function UserMetaCard() {
  const { profile, loading, refetch } = useProfile();
  const { isOpen, openModal, closeModal } = useModal();

  // Estado local para el formulario de edición (social links)
  const [social, setSocial] = React.useState({
    facebook: '',
    x: '',
    linkedin: '',
    instagram: '',
  });

  // Precargar valores actuales (si existen en el perfil - podrías tener campos extras)
  React.useEffect(() => {
    if (profile) {
      // Si tu API devuelve redes sociales, ajústalo aquí; por ahora dejamos vacío o datos mock
      setSocial({
        facebook: profile.empresas?.nombre_comercial ? 'https://facebook.com/' + profile.empresas.nombre_comercial : '',
        x: '',
        linkedin: '',
        instagram: '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    // Aquí enviarías los cambios al backend (ej: PUT /auth/profile)
    console.log('Guardando redes sociales:', social);
    closeModal();
    // Opcional: refetch para actualizar datos si el backend los devuelve
    // await refetch();
  };

  if (loading) {
    return <div className="p-5 border rounded-2xl">Cargando perfil...</div>;
  }

  if (!profile) {
    return <div className="p-5 border rounded-2xl">No se pudo cargar el perfil</div>;
  }

  const fullName = `${profile.nombres} ${profile.apellidos || ''}`.trim();
  const userRole = profile.usuarios_roles?.[0]?.roles_usuarios?.nombre || 'Sin rol';
  const userLocation = profile.sedes ? `${profile.sedes.ciudad || ''}, ${profile.sedes.departamento || ''}`.replace(/^, /, '') : 'Ubicación no especificada';

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={profile.avatar_url || '/images/user/default-avatar.jpg'}
                alt={fullName}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">{userRole}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userLocation}</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Personal Information</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your details to keep your profile up-to-date.</p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">Social Links</h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div><Label>Facebook</Label><Input type="text" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></div>
                  <div><Label>X.com</Label><Input type="text" value={social.x} onChange={(e) => setSocial({ ...social, x: e.target.value })} /></div>
                  <div><Label>Linkedin</Label><Input type="text" value={social.linkedin} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} /></div>
                  <div><Label>Instagram</Label><Input type="text" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
              <Button size="sm" type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}