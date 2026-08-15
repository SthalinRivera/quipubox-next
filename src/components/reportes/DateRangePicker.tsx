'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
}

const presets = [
  { label: 'Hoy', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Ayer', getValue: () => ({ start: subDays(new Date(), 1), end: subDays(new Date(), 1) }) },
  { label: 'Últimos 7 días', getValue: () => ({ start: subDays(new Date(), 6), end: new Date() }) },
  { label: 'Últimos 30 días', getValue: () => ({ start: subDays(new Date(), 29), end: new Date() }) },
  { label: 'Este mes', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Mes pasado', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTempStart(startDate);
        setTempEnd(endDate);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [startDate, endDate]);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getValue();
    setTempStart(start);
    setTempEnd(end);
    setSelectingEnd(true);
    setCurrentMonth(start.getMonth());
    setCurrentYear(start.getFullYear());
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!selectingEnd || !tempStart) {
      setTempStart(clickedDate);
      setTempEnd(null);
      setSelectingEnd(true);
    } else {
      if (isBefore(clickedDate, tempStart)) {
        setTempStart(clickedDate);
        setTempEnd(null);
      } else {
        setTempEnd(clickedDate);
        setSelectingEnd(false);
      }
    }
  };

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    setSelectingEnd(false);
    onChange(null, null);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInRange = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (tempStart && tempEnd) {
      return isAfter(date, tempStart) && isBefore(date, tempEnd);
    }
    if (tempStart && hoveredDate && selectingEnd) {
      const start = tempStart;
      const end = hoveredDate;
      if (isBefore(end, start)) {
        return isAfter(date, end) && isBefore(date, start);
      }
      return isAfter(date, start) && isBefore(date, end);
    }
    return false;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return (tempStart && isSameDay(date, tempStart)) || (tempEnd && isSameDay(date, tempEnd));
  };

  const isDateHovered = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return hoveredDate && isSameDay(date, hoveredDate) && selectingEnd && !tempEnd;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);
      const isHovered = isDateHovered(day);
      const isToday = isSameDay(new Date(currentYear, currentMonth, day), new Date());

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDayClick(day)}
          onMouseEnter={() => {
            const date = new Date(currentYear, currentMonth, day);
            date.setHours(0, 0, 0, 0);
            setHoveredDate(date);
          }}
          onMouseLeave={() => setHoveredDate(null)}
          className={`
            h-8 w-8 rounded-full text-sm font-medium transition-all duration-150
            ${isSelected
              ? 'bg-blue-500 text-white shadow-md'
              : isInRange || isHovered
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }
            ${isToday && !isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-500/50' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
    if (startDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - Seleccionar fin`;
    }
    return 'Seleccionar rango de fechas';
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className={startDate ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>
          {formatDateRange()}
        </span>
        {startDate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-[340px] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {/* Presets */}
          <div className="border-b border-gray-100 p-3 dark:border-gray-700">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Acceso rápido</p>
            <div className="flex flex-wrap gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </p>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {/* Selected Range Display */}
          {(tempStart || tempEnd) && (
            <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tempStart && format(tempStart, 'dd MMM yyyy', { locale: es })}
                {tempStart && tempEnd && ' → '}
                {tempEnd && format(tempEnd, 'dd MMM yyyy', { locale: es })}
                {tempStart && !tempEnd && ' → Seleccionar fin'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 border-t border-gray-100 p-3 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!tempStart}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
