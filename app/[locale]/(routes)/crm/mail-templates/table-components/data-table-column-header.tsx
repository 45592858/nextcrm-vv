import { Column } from "@tanstack/react-table";

export function DataTableColumnHeader({ column, title }: { column: Column<any, any>; title: string }) {
  return <span>{title}</span>;
} 