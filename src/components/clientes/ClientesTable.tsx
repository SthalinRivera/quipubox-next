'use client';

import { useState } from 'react';
import { useClientesData } from '@/hooks/useClientesData';
import { useClientesUIStore } from '@/stores/clientesStore';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ClienteModal } from '@/components/clientes/ClienteModal';
import { ClienteSedesModal } from '@/components/clientes/ClienteSedesModal';
import { ClientePuestosModal } from '@/components/clientes/ClientePuestosModal';
import { PencilIcon, PlusIcon, SearchIcon, } from '@/icons';
import { Power, Play, Plus } from "lucide-react";
import Pagination from './Pagination';
import type { Cliente, ClienteSede, PuestoAsignado } from '@/types/cliente';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

export default function ClientesTable() {
  const {
    clientes,
    totalPages,
    isLoading,
    isError,
    error,
    page,
    setPage,
    toggleEstado,      // ← nueva función (debe venir del hook)
    updateCliente,
    refetch,
  } = useClientesData();
  const { estado, setEstado, resetFilters, tipo_relacion, setTipoRelacion } = useClientesUIStore();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sedesOpen, setSedesOpen] = useState(false);
  const [puestosOpen, setPuestosOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ cliente: Cliente; nuevoEstado: boolean } | null>(null);

  const filteredClientes = clientes.filter((cliente: Cliente) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      cliente.nombres.toLowerCase().includes(term) ||
      (cliente.apellidos && cliente.apellidos.toLowerCase().includes(term)) ||
      (cliente.apodo && cliente.apodo.toLowerCase().includes(term)) ||
      (cliente.telefono && cliente.telefono.includes(term))
    );
  });

  const handleCreate = () => {
    setSelectedCliente(null);
    setModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleSedes = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setSedesOpen(true);
  };

  const handlePuestos = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setPuestosOpen(true);
  };

  // ✅ Nueva función para activar/desactivar (con confirmación)
  const handleToggleEstado = (cliente: Cliente) => {
    const nuevoEstado = !cliente.estado;
    setPendingAction({ cliente, nuevoEstado });
    setConfirmOpen(true);
  };

  const executeToggle = async () => {
    if (!pendingAction) return;
    const { cliente, nuevoEstado } = pendingAction;
    try {
      // ✅ CORRECTO:
      await toggleEstado({ id: cliente.id_cliente, estado: nuevoEstado });
      toast.success(`Cliente ${nuevoEstado ? 'activado' : 'desactivado'}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado');
    } finally {
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setSedesOpen(false);
    setPuestosOpen(false);
    refetch();
  };

  const renderSedes = (sedes: ClienteSede[], cliente: Cliente) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {sedes && sedes.length > 0 ? (
            sedes.map((rel) => {
              let badgeColor: BadgeColor = 'light';
              switch (rel.tipo_relacion) {
                case 'emisor': badgeColor = 'info'; break;
                case 'receptor': badgeColor = 'success'; break;
                case 'ambos': badgeColor = 'warning'; break;
              }
              return (
                <div key={rel.id_cliente_sede} className="relative group" title={`${rel.sedes?.nombre} - ${rel.tipo_relacion}`}>
                  <Badge size="sm" color={badgeColor}>
                    {rel.sedes?.nombre} ({rel.tipo_relacion === 'emisor' ? 'E' : rel.tipo_relacion === 'receptor' ? 'R' : 'E/R'})
                  </Badge>
                </div>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>


        <Button size="sm" variant="outline" onClick={() => handleSedes(cliente)} className="h-6 px-2 text-xs">
          <Plus className="mr-1 h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderPuestos = (puestos: PuestoAsignado[], cliente: Cliente) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {puestos && puestos.length > 0 ? (
            puestos.map((pa) => {
              let badgeColor: BadgeColor = 'light';
              if (pa.seccion === 'A') badgeColor = 'primary';
              else if (pa.seccion === 'B') badgeColor = 'info';
              else if (pa.seccion === 'C') badgeColor = 'success';
              const tooltipText = `${pa.puestos?.numero_puesto} - ${pa.puestos?.lugares_operativos?.nombre || '?'} (Sede: ${pa.puestos?.lugares_operativos?.sedes?.nombre || '?'})${pa.seccion ? ` - Sección ${pa.seccion}` : ''}`;
              return (
                <div key={pa.id_cliente_puesto} className="relative group" title={tooltipText}>
                  <Badge size="sm" color={badgeColor}>
                    {pa.puestos?.numero_puesto || pa.id_puesto}
                    {pa.seccion && <span className="ml-0.5 text-[10px] opacity-80">({pa.seccion})</span>}
                  </Badge>
                </div>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">Sin puesto</span>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={() => handlePuestos(cliente)} className="h-6 px-2 text-xs">
          <Plus className="mr-1 h-3 w-3" />

        </Button>
      </div>
    );
  };

  const renderLugaresOperativos = (puestos: PuestoAsignado[]) => {
    if (!puestos || puestos.length === 0) return '—';
    const lugaresUnicos = new Map();
    puestos.forEach(pa => {
      const lugar = pa.puestos?.lugares_operativos;
      if (lugar && !lugaresUnicos.has(lugar.id_lugar)) {
        let color: BadgeColor = 'light';
        switch (lugar.tipo_lugar) {
          case 'mercado': color = 'primary'; break;
          case 'almacen': color = 'info'; break;
          case 'calle': color = 'warning'; break;
          case 'rampa': color = 'error'; break;
          case 'pasaje': color = 'success'; break;
          case 'cajoneria': color = 'dark'; break;
          default: color = 'light';
        }
        lugaresUnicos.set(lugar.id_lugar, {
          nombre: lugar.nombre,
          tipo: lugar.tipo_lugar,
          color
        });
      }
    });
    if (lugaresUnicos.size === 0) return '—';
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from(lugaresUnicos.values()).map((lugar, idx) => (
          <div key={idx} className="relative group" title={`Tipo: ${lugar.tipo}`}>
            <Badge size="sm" color={lugar.color}>
              {lugar.nombre}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">

        <TableSkeleton columns={7} rows={10} showActionButton={true} />;
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error?.message}</p>
        <Button onClick={() => window.location.reload()} size="sm" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros (igual que antes) */}
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-gray-700 dark:text-gray-300 mb-1 block">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, apellido o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="w-48">
            <label className="text-gray-700 dark:text-gray-300 mb-1 block">Tipo Relación</label>
            <select
              value={tipo_relacion}
              onChange={(e) => setTipoRelacion(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              <option value="todos">Todos</option>
              <option value="emisor">Emisor</option>
              <option value="receptor">Receptor</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div className="w-48">
            <label className="text-gray-700 dark:text-gray-300 mb-1 block">Estado</label>
            <select
              value={estado === 'todos' ? 'todos' : estado.toString()}
              onChange={(e) => setEstado(e.target.value === 'todos' ? 'todos' : e.target.value === 'true')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              <option value="todos">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {(searchTerm || estado !== 'todos' || tipo_relacion !== 'todos') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                resetFilters();
              }}
              className="self-end mb-0.5"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        <Button onClick={handleCreate} startIcon={<PlusIcon className="h-2 w-4" />}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombres</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Apellidos</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Teléfono</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Sedes</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Lugares Operativos</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Puestos</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay clientes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id_cliente}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{cliente.id_cliente}</TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{cliente.nombres}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{cliente.apellidos || '—'}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{cliente.telefono || '—'}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {renderSedes(cliente.cliente_sede || [], cliente)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {renderLugaresOperativos((cliente.clientes_puestos as PuestoAsignado[]) || [])}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {renderPuestos((cliente.clientes_puestos as PuestoAsignado[]) || [], cliente)}
                      </TableCell>
                      {/* Estado con Badge (ya no Switch) */}
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={cliente.estado ? 'success' : 'error'}>
                          {cliente.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      {/* Acciones: Editar + Toggle */}
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                            title="Editar cliente"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleEstado(cliente)}
                            className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                            title={cliente.estado ? 'Desactivar cliente' : 'Activar cliente'}
                          >
                            {cliente.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center pt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modales */}
      <ClienteModal open={modalOpen} onOpenChange={setModalOpen} editingCliente={selectedCliente} onSaved={handleSaved} />
      <ClienteSedesModal open={sedesOpen} onOpenChange={setSedesOpen} cliente={selectedCliente} onSaved={handleSaved} />
      <ClientePuestosModal open={puestosOpen} onOpenChange={setPuestosOpen} cliente={selectedCliente} onSaved={handleSaved} />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeToggle}
        title={pendingAction?.nuevoEstado ? 'Activar cliente' : 'Desactivar cliente'}
        message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} al cliente "${pendingAction?.cliente.nombres}"?`}
        confirmText="Confirmar"
        variant={pendingAction?.nuevoEstado ? 'success' : 'danger'}
      />
    </div>
  );
}