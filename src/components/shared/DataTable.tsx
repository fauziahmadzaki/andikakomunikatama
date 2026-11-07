import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell?: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = "Tidak ada data.",
  ariaLabel,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  ariaLabel: string;
}) {
  return (
    <div className="space-y-3">
      <Table aria-label={ariaLabel}>
        <TableHeader>
          {columns.map((column, index) => (
            <TableHead
              key={column.key}
              isRowHeader={index === 0}
              className={cn(
                column.align ? alignClass[column.align] : undefined,
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align ? alignClass[column.align] : undefined,
                    column.className
                  )}
                >
                  {column.cell
                    ? column.cell(row)
                    : String(
                        (row as Record<string, unknown>)[column.key] ?? "-"
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}
    </div>
  );
}
