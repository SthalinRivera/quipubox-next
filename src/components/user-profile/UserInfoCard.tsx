'use client';

import React, { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useProfile } from '@/hooks/useProfile';

export default function UserInfoCard() {
  const { profile, loading, refetch } = useProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        nombres: profile.nombres,
        apellidos: profile.apellidos || '',
        email: profile.email,
        telefono: profile.telefono || '',
        bio: profile.usuarios_roles?.[0]?.roles_usuarios?.descripcion || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    // Aquí enviarías PUT /auth/profile con los nuevos datos
    console.log('Guardando info personal:', form);
    closeModal();
    // await refetch(); // si el backend devuelve los datos actualizados
  };

  if (loading) return <div className="p-5 border rounded-2xl">Cargando...</div>;
  if (!profile) return <div className="p-5 border rounded-2xl">Sin datos</div>;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div><p className="mb-2 text-xs text-gray-500">First Name</p><p className="text-sm font-medium">{profile.nombres}</p></div>
            <div><p className="mb-2 text-xs text-gray-500">Last Name</p><p className="text-sm font-medium">{profile.apellidos || '—'}</p></div>
            <div><p className="mb-2 text-xs text-gray-500">Email address</p><p className="text-sm font-medium">{profile.email}</p></div>
            <div><p className="mb-2 text-xs text-gray-500">Phone</p><p className="text-sm font-medium">{profile.telefono || '—'}</p></div>
            <div><p className="mb-2 text-xs text-gray-500">Bio</p><p className="text-sm font-medium">{profile.usuarios_roles?.[0]?.roles_usuarios?.descripcion || '—'}</p></div>
          </div>
        </div>
        <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 lg:inline-flex lg:w-auto">
          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold">Edit Personal Information</h4>
            <p className="mb-6 text-sm text-gray-500">Update your details to keep your profile up-to-date.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 px-2">
              <div><Label>First Name</Label><Input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} /></div>
              <div><Label>Last Name</Label><Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} /></div>
              <div><Label>Email Address</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
              <div className="col-span-2"><Label>Bio</Label><Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
              <Button size="sm" type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}