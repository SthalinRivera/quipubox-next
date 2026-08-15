'use client';

import { useState } from 'react';
import Button from '@/components/ui/button/Button';
import DateRangePicker from './DateRangePicker';
import { Filter, X } from 'lucide-react';
import type { ReportFilters } from '@/types/reportes';

interface ReportFilterProps {
  onFilter: (filters: ReportFilters) => void;
  onClear: () => void;
  loading?: boolean;
  showEstado?: boolean;
  estados?: string[];
}

export default function ReportFilter({
  onFilter,
  onClear,
  loading = false,
  showEstado = false,
  estados = [],
}: ReportFilterProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [estado, setEstado] = useState('');

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleFilter = () => {
    const filters: ReportFilters = {};
    if (startDate) {
      filters.fecha_inicio = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
      filters.fecha_fin = endDate.toISOString().split('T')[0];
    }
    if (estado) {
      filters.estado = estado;
    }
    onFilter(filters);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setEstado('');
    onClear();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[280px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rango de Fechas
          </label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </div>
        {showEstado && (
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleFilter}
            disabled={loading}
            startIcon={<Filter className="h-4 w-4" />}
          >
            Filtrar
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            startIcon={<X className="h-4 w-4" />}
          >
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}
