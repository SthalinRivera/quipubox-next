'use client';

import React, { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { Building2, MapPin, Shield, User, Mail, Phone, Edit2, X } from 'lucide-react';

// Definición local del tipo Perfil (ajústalo según tu definición real)
interface PerfilUsuario {
  nombres: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  empresas?: { id: number; razon_social: string }; // ← es un objeto, no array
  sedes?: { id: number; nombre: string };          // ← es un objeto, no array
  // roles no está aquí, se obtiene del store
}

export default function UserInfo() {
  const { profile, loading, refetch } = useProfile();
  const { roles: userRoles } = useAuthStore(); // roles del store (array de strings)
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del perfil en el formulario
  useEffect(() => {
    if (profile) {
      setForm({
        nombres: profile.nombres,
        apellidos: profile.apellidos || '',
        email: profile.email,
        telefono: profile.telefono || '',
      });
    }
  }, [profile]);

  // Guardar cambios
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/proxy/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Error al actualizar');
      await refetch(); // refrescar perfil
      closeModal();
    } catch (error) {
      console.error(error);
      alert('No se pudo actualizar la información');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 text-center text-gray-500">
        No se pudo cargar la información del usuario.
      </div>
    );
  }

  // Acceso directo a las propiedades individuales
  const empresa = profile.empresas; // objeto o undefined
  const sede = profile.sedes;       // objeto o undefined

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Header con título y botón de edición */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Mi perfil</h3>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Contenido principal - Grid compacto */}
      <div className="p-5 space-y-5">
        {/* Datos personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={User} label="Nombres" value={form.nombres} />
          <InfoRow icon={User} label="Apellidos" value={form.apellidos || '—'} />
          <InfoRow icon={Mail} label="Email" value={form.email} />
          <InfoRow icon={Phone} label="Teléfono" value={form.telefono || '—'} />
        </div>

        {/* Empresa y Sede (acceso directo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <InfoRow icon={Building2} label="Empresa" value={empresa?.razon_social || '—'} />
          <InfoRow icon={MapPin} label="Sede" value={sede?.nombre || '—'} />
        </div>

        {/* Roles (solo desde el store) */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Roles asignados</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {userRoles.map((rol) => (
                  <span
                    key={rol}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {rol}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Editar información</h4>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Nombres</Label>
                <Input
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

// Componente auxiliar para cada fila de información
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white break-words">{value}</p>
      </div>
    </div>
  );
}