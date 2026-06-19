// components/ui/table/Table.tsx
import React, { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

// Props for Table
interface TableProps {
  children: ReactNode;
  className?: string;
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode;
  className?: string;
}

// Props for TableCell: extiende atributos de <td> y <th>
interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement>,
  ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
}

// Componentes base (sin cambios)
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell actualizado: acepta rowSpan, colSpan, title, data-*, etc.
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  colSpan,
  rowSpan,
  ...rest // resto de props (title, id, data-*, etc.)
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={className}
      {...rest}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };