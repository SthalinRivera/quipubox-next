'use client';

import { useState, useEffect, useMemo } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { usePuestos } from '@/hooks/usePuestos';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { TrashBinIcon, PlusIcon, StoreIcon } from '@/icons'; // Ajusta según tus iconos
import type { Cliente, PuestoAsignado } from '@/types/cliente';
import type { Puesto } from '@/types/puesto';

interface ClientePuestosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onSaved?: () => void;
}

export function ClientePuestosModal({ open, onOpenChange, cliente, onSaved }: ClientePuestosModalProps) {
  const { getPuestos, assignPuesto, removePuesto } = useClientes();
  const { puestos, fetchAll: fetchPuestos } = usePuestos();
  const toast = useToast();

  const [puestosAsignados, setPuestosAsignados] = useState<PuestoAsignado[]>([]);
  const [adding, setAdding] = useState(false);
  const [newPuestoId, setNewPuestoId] = useState<string>('');
  const [seccion, setSeccion] = useState<string>('');

  const loadPuestos = async () => {
    if (cliente) {
      try {
        const data = await getPuestos(cliente.id_cliente);
        setPuestosAsignados(data || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clientSedeIds = useMemo(() => {
    if (!cliente?.cliente_sede) return [];
    return cliente.cliente_sede.map(cs => cs.id_sede).filter(id => id != null);
  }, [cliente]);

  const puestosDisponibles = useMemo(() => {
    let disponibles = puestos.filter(
      (p: Puesto) => !puestosAsignados.some((pa) => pa.id_puesto === p.id_puesto)
    );
    if (clientSedeIds.length > 0) {
      disponibles = disponibles.filter((p: Puesto) =>
        clientSedeIds.includes(p.lugares_operativos?.sedes?.id_sede ?? 0)
      );
    }
    return disponibles;
  }, [puestos, puestosAsignados, clientSedeIds]);

  const selectOptions = puestosDisponibles.map((p: Puesto) => ({
    value: p.id_puesto.toString(),
    label: `${p.numero_puesto} - ${p.lugares_operativos?.nombre || 'Mercado'} (${p.lugares_operativos?.sedes?.nombre || '?'})`,
  }));

  useEffect(() => {
    if (open && cliente) {
      fetchPuestos();
      loadPuestos();
      setNewPuestoId('');
      setSeccion('');
    }
  }, [open, cliente, fetchPuestos]);

  const handleAdd = async () => {
    if (!cliente || !newPuestoId) return;
    setAdding(true);
    try {
      await assignPuesto(cliente.id_cliente, Number(newPuestoId), seccion || null);
      toast.success('Puesto asignado correctamente');
      await loadPuestos();
      setNewPuestoId('');
      setSeccion('');
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar puesto');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (puestoId: number, numeroPuesto: string) => {
    if (!cliente) return;
    const confirmar = window.confirm(`¿Desvincular el puesto "${numeroPuesto}" de este cliente?`);
    if (!confirmar) return;
    try {
      await removePuesto(cliente.id_cliente, puestoId);
      toast.success(`Puesto "${numeroPuesto}" desvinculado`);
      await loadPuestos();
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al desvincular puesto');
    }
  };

  const seccionOptions = [
    { value: '', label: '— Sin sección —' },
    { value: 'A', label: 'Sección A' },
    { value: 'B', label: 'Sección B' },
    { value: 'C', label: 'Sección C' },
  ];

  const noPuestosMessage = () => {
    if (puestosDisponibles.length === 0 && puestos.length > 0) {
      if (clientSedeIds.length > 0) {
        return (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            No hay más puestos disponibles en las sedes de este cliente.
          </p>
        );
      }
      return (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Este cliente no tiene sedes asociadas. Primero asigne una sede.
        </p>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[500px] p-5">
      <div className="space-y-5">
        {/* Header con icono */}
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Puestos del cliente
          </h4>
        </div>


        {/* Lista de puestos asignados */}
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 Puestos asignados</Label>
          <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700">
            {puestosAsignados.length === 0 ? (
              <li className="text-sm text-gray-500 italic text-center py-2">
                Sin puestos asignados.
              </li>
            ) : (
              puestosAsignados.map((pa) => (
                <li key={pa.id_cliente_puesto} className="flex justify-between items-center border-b pb-2 last:border-0 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {pa.puestos?.numero_puesto || pa.id_puesto}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pa.puestos?.lugares_operativos?.nombre || 'Mercado'} -
                      Sede: {pa.puestos?.lugares_operativos?.sedes?.nombre || '?'}
                    </p>
                    {pa.seccion && <p className="text-xs text-gray-500">Sección: {pa.seccion}</p>}
                  </div>
                  <button
                    onClick={() => handleRemove(pa.id_puesto, pa.puestos?.numero_puesto || String(pa.id_puesto))}
                    className="text-red-500 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:text-red-300"
                    title="Desvincular"
                  >
                    <TrashBinIcon className="w-4 h-6 m-2" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Formulario para agregar nuevo puesto */}
        <div className="border-t pt-4 space-y-4 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <PlusIcon className="h-4 w-4" /> Asignar nuevo puesto
          </p>

          <div>
            <Label htmlFor="puestoSelect" className="text-gray-700 dark:text-gray-300">
              Seleccionar puesto
            </Label>
            <Select
              options={selectOptions}
              placeholder={puestosDisponibles.length === 0 ? '— No hay puestos disponibles —' : '— Elige un puesto —'}
              value={newPuestoId}
              onChange={setNewPuestoId}
              disabled={puestosDisponibles.length === 0}
            />
            {noPuestosMessage()}
          </div>

          <div>
            <Label htmlFor="seccionSelect" className="text-gray-700 dark:text-gray-300">
              Sección (opcional)
            </Label>
            <Select
              options={seccionOptions}
              placeholder="Seleccionar sección"
              value={seccion}
              onChange={(val) => setSeccion(val)}
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={adding || !newPuestoId || puestosDisponibles.length === 0}
            size="sm"
            className="w-full"
          >
            {adding ? 'Agregando...' : '➕ Asignar puesto'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}