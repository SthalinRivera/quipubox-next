import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Reporte') => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-width columns
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length),
    ),
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToExcelMultipleSheets = (
  sheets: { name: string; data: any[] }[],
  filename: string,
) => {
  if (!sheets || sheets.length === 0) return;

  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    if (sheet.data && sheet.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      const colWidths = Object.keys(sheet.data[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...sheet.data.map((row) => String(row[key] || '').length),
        ),
      }));
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    }
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = async (
  data: any[],
  title: string,
  filename: string,
  columns?: { header: string; key: string; width?: number }[],
) => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

  // Table
  const cols =
    columns ||
    (data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          header: key.replace(/_/g, ' ').toUpperCase(),
          key,
        }))
      : []);

  const rows = data.map((row) => cols.map((col) => String(row[col.key] ?? '')));

  (doc as any).autoTable({
    startY: 35,
    head: [cols.map((c) => c.header)],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-PE').format(value);
};
