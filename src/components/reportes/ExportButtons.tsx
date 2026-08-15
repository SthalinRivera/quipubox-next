'use client';

import Button from '@/components/ui/button/Button';
import { Download, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title: string;
  pdfColumns?: { header: string; key: string; width?: number }[];
  excelSheetName?: string;
  disabled?: boolean;
}

export default function ExportButtons({
  data,
  filename,
  title,
  pdfColumns,
  excelSheetName = 'Reporte',
  disabled = false,
}: ExportButtonsProps) {
  const handleExcel = () => {
    if (!data || data.length === 0) return;
    exportToExcel(data, filename, excelSheetName);
  };

  const handlePDF = () => {
    if (!data || data.length === 0) return;
    exportToPDF(data, title, filename, pdfColumns);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleExcel}
        disabled={disabled || !data || data.length === 0}
        startIcon={<Download className="h-4 w-4" />}
      >
        Excel
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handlePDF}
        disabled={disabled || !data || data.length === 0}
        startIcon={<FileText className="h-4 w-4" />}
      >
        PDF
      </Button>
    </div>
  );
}
