"use client";

import { useState, useRef, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameDay,
    isSameMonth,
    isToday,
    setMonth,
    setYear,
    getYear,
    getMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

interface DatePickerProps {
    value?: string;
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

export default function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", label }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(value ? new Date(value + "T00:00:00") : new Date());
    const [view, setView] = useState<"days" | "months" | "years">("days");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) setViewDate(new Date(value + "T00:00:00"));
    }, [value]);

    const selectedDate = value ? new Date(value + "T00:00:00") : null;

    const days = (() => {
        const monthStart = startOfMonth(viewDate);
        const monthEnd = endOfMonth(viewDate);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const result: Date[] = [];
        let day = calStart;
        while (day <= calEnd) {
            result.push(day);
            day = addDays(day, 1);
        }
        return result;
    })();

    const currentYear = getYear(viewDate);
    const yearRangeStart = Math.floor(currentYear / 12) * 12;

    const handleDayClick = (day: Date) => {
        onChange(format(day, "yyyy-MM-dd"));
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div ref={ref} className="relative">
            {label && <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className={selectedDate ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}
                </span>
                {selectedDate && (
                    <span onClick={handleClear} className="ml-auto p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X className="h-3 w-3 text-gray-400" />
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (view === "days") setViewDate(subMonths(viewDate, 1));
                                else if (view === "months") setViewDate(new Date(currentYear - 1, 0));
                                else setViewDate(new Date(currentYear - 12, 0));
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setView("months")}
                                className="rounded-lg px-3 py-1 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {MONTHS[getMonth(viewDate)]}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView("years")}
                                className="rounded-lg px-3 py-1 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {currentYear}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (view === "days") setViewDate(addMonths(viewDate, 1));
                                else if (view === "months") setViewDate(new Date(currentYear + 1, 0));
                                else setViewDate(new Date(currentYear + 12, 0));
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Vista días */}
                    {view === "days" && (
                        <>
                            <div className="grid grid-cols-7 gap-0 mb-1">
                                {WEEKDAYS.map((d) => (
                                    <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-0">
                                {days.map((day, i) => {
                                    const inMonth = isSameMonth(day, viewDate);
                                    const selected = selectedDate && isSameDay(day, selectedDate);
                                    const today = isToday(day);
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleDayClick(day)}
                                            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-sm transition-colors
                                                ${!inMonth ? "text-gray-300 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}
                                                ${selected ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-blue-50 dark:hover:bg-blue-900/30"}
                                                ${today && !selected ? "font-bold text-blue-600 dark:text-blue-400" : ""}
                                            `}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Vista meses */}
                    {view === "months" && (
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setViewDate(setMonth(viewDate, i));
                                        setView("days");
                                    }}
                                    className={`rounded-lg py-2 text-sm font-medium transition-colors
                                        ${getMonth(viewDate) === i
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-900/30"
                                        }
                                    `}
                                >
                                    {m.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Vista años */}
                    {view === "years" && (
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => {
                                        setViewDate(setYear(viewDate, y));
                                        setView("months");
                                    }}
                                    className={`rounded-lg py-2 text-sm font-medium transition-colors
                                        ${currentYear === y
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-900/30"
                                        }
                                    `}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Botón hoy */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => handleDayClick(new Date())}
                            className="w-full rounded-lg py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
