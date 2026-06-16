'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useRoles } from '@/hooks/useRoles';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import ReactSelect from 'react-select';
import { Check, ChevronRight, ChevronLeft, User, Shield, X } from 'lucide-react';
import type { Usuario } from '@/types/usuario';

interface FormData {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    id_empresa: string;
    id_sede: string;
    roles: number[];
    estado: boolean;        // ahora es booleano, se usará un checkbox
}

interface RoleOption {
    value: number;
    label: string;
}

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser?: Usuario | null;
    onSaved: () => void;
}

export function UsuarioModal({ isOpen, onClose, editingUser, onSaved }: UsuarioModalProps) {
    const { empresas, loading: loadingEmpresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const { roles, fetchAll: fetchRoles } = useRoles();
    const toast = useToast();

    const [step, setStep] = useState<1 | 2>(1);
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined);

    const [form, setForm] = useState<FormData>({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        id_empresa: '',
        id_sede: '',
        roles: [],
        estado: true,   // por defecto activo
    });

    const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchEmpresas();
            fetchRoles();
            fetchSedes();
        }
    }, [isOpen, fetchEmpresas, fetchRoles, fetchSedes]);

    useEffect(() => {
        if (editingUser && isOpen) {
            // Aseguramos que el usuario tenga la estructura esperada
            const rolesActuales: RoleOption[] = editingUser.usuarios_roles?.map(ur => ({
                value: ur.id_rol_usuario,
                label: ur.roles_usuarios?.nombre || '',
            })) || [];

            setForm({
                nombres: editingUser.nombres,
                apellidos: editingUser.apellidos || '',
                email: editingUser.email,
                telefono: editingUser.telefono || '',
                id_empresa: editingUser.id_empresa?.toString() || '',
                id_sede: editingUser.id_sede?.toString() || '',
                roles: rolesActuales.map(r => r.value),
                estado: editingUser.estado ?? true,
            });
            setSelectedRoles(rolesActuales);
            setSelectedEmpresaId(editingUser.id_empresa);
            setStep(1);
        } else if (!editingUser && isOpen) {
            // Resetear formulario
            setForm({
                nombres: '',
                apellidos: '',
                email: '',
                telefono: '',
                id_empresa: '',
                id_sede: '',
                roles: [],
                estado: true,
            });
            setSelectedRoles([]);
            setSelectedEmpresaId(undefined);
            setStep(1);
        }
    }, [editingUser, isOpen]);

    const sedesFiltradas = useMemo(() => {
        if (!form.id_empresa) return [];
        return sedes.filter(s => s.id_empresa === Number(form.id_empresa));
    }, [sedes, form.id_empresa]);

    const empresasOptions = empresas.map(e => ({
        value: e.id_empresa.toString(),
        label: e.nombre_comercial || e.razon_social,
    }));
    const sedesOptions = sedesFiltradas.map(s => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));
    const roleOptions: RoleOption[] = roles.map(r => ({
        value: r.id_rol_usuario,
        label: r.nombre,
    }));

    const handleRolesChange = (newValue: readonly RoleOption[]) => {
        const selected = [...newValue];
        setSelectedRoles(selected);
        setForm(prev => ({ ...prev, roles: selected.map(r => r.value) }));
    };

    const isStepValid = () => {
        if (step === 1) {
            return !!(form.nombres && form.email && form.id_empresa && form.id_sede);
        }
        if (step === 2) {
            return form.roles.length > 0;
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStepValid()) {
            toast.error(step === 1 ? 'Complete todos los campos obligatorios' : 'Debe asignar al menos un rol');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                nombres: form.nombres,
                apellidos: form.apellidos || undefined,
                email: form.email,
                telefono: form.telefono || undefined,
                id_empresa: Number(form.id_empresa),
                id_sede: Number(form.id_sede),
                roles: form.roles,
                estado: form.estado,   // booleano
            };

            if (editingUser) {
                // Validar que el usuario existe antes de actualizar (opcional, pero evita errores)
                if (!editingUser.id_usuario) {
                    throw new Error('ID de usuario inválido');
                }
                await fetchWithAuth(`usuarios/${editingUser.id_usuario}/full`, {
                    method: 'PUT',
                    body: payload,
                });
                toast.success('Usuario actualizado correctamente');
            } else {
                await fetchWithAuth('usuarios/full', {
                    method: 'POST',
                    body: payload,
                });
                toast.success('Usuario creado correctamente');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al guardar el usuario');
        } finally {
            setSubmitting(false);
        }
    };

    // Estilos para react-select (modo oscuro/claro)
    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'var(--input-bg, #ffffff)',
            borderColor: state.isFocused ? '#3b82f6' : 'var(--input-border, #d1d5db)',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': { borderColor: '#3b82f6' },
        }),
        menu: (base: any) => ({ ...base, backgroundColor: 'var(--bg-color, #ffffff)' }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#e5e7eb' : 'transparent',
            color: '#111827',
        }),
        multiValue: (base: any) => ({ ...base, backgroundColor: '#e0e7ff' }),
        multiValueLabel: (base: any) => ({ ...base, color: '#1e40af' }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: '#1e40af',
            ':hover': { backgroundColor: '#bfdbfe', color: '#dc2626' },
        }),
    };

    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
        selectStyles.control = (base: any) => ({ ...base, backgroundColor: '#1f2937', borderColor: '#374151' });
        selectStyles.menu = (base: any) => ({ ...base, backgroundColor: '#1f2937' });
        selectStyles.option = (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? '#374151' : '#1f2937', color: '#f3f4f6' });
        selectStyles.multiValue = (base: any) => ({ ...base, backgroundColor: '#374151' });
        selectStyles.multiValueLabel = (base: any) => ({ ...base, color: '#93c5fd' });
        selectStyles.multiValueRemove = (base: any) => ({ ...base, color: '#93c5fd', ':hover': { backgroundColor: '#4b5563' } });
    }

    const steps = [
        { id: 1, label: 'Datos básicos', icon: User },
        { id: 2, label: 'Roles', icon: Shield },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0 overflow-hidden">
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                <div className="border-b border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${step >= s.id ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
                                        {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{s.label}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Nombres *</Label>
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
                                <Label>Email *</Label>
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
                            <div>
                                <Label>Empresa *</Label>
                                {loadingEmpresas ? (
                                    <p className="text-sm text-gray-400">Cargando...</p>
                                ) : (
                                    <Select
                                        options={empresasOptions}
                                        placeholder="Seleccionar empresa"
                                        value={form.id_empresa}
                                        onChange={(val) => {
                                            setForm({ ...form, id_empresa: val, id_sede: '' });
                                            setSelectedEmpresaId(Number(val));
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <Label>Sede *</Label>
                                <Select
                                    options={sedesOptions}
                                    placeholder={selectedEmpresaId ? "Seleccionar sede" : "Primero selecciona empresa"}
                                    value={form.id_sede}
                                    onChange={(val) => setForm({ ...form, id_sede: val })}
                                    disabled={!selectedEmpresaId}
                                />
                                {selectedEmpresaId && sedesFiltradas.length === 0 && (
                                    <p className="text-xs text-amber-500 mt-1">Esta empresa no tiene sedes registradas</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="estado"
                                    checked={form.estado}
                                    onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <Label htmlFor="estado" className="mb-0">Usuario activo</Label>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <Label>Asignar roles * (puede seleccionar varios)</Label>
                            <ReactSelect
                                isMulti
                                options={roleOptions}
                                value={selectedRoles}
                                onChange={handleRolesChange}
                                placeholder="Buscar o seleccionar roles..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={selectStyles}
                            />
                            {form.roles.length === 0 && (
                                <p className="text-sm text-red-500">Debes seleccionar al menos un rol</p>
                            )}
                            {form.roles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedRoles.map(role => (
                                        <span key={role.value} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                            {role.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={step === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                        </Button>
                        {step === 1 ? (
                            <Button type="button" onClick={() => setStep(2)} disabled={!isStepValid()}>
                                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={submitting || !isStepValid()}>
                                {submitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}