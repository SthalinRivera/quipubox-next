// utils/date.ts
export function formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '—';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) return '—';

        // Formato local: dd/mm/yyyy o según el navegador
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return '—';
    }
}

// Para usar en input tipo date (YYYY-MM-DD)
export function formatDateForInput(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
}