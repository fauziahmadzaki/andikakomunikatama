"use client";

import type { ReactNode } from "react";

import { SelectionCheckbox } from "@/components/shared/SelectionCheckbox";
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

export type DataTableSelection = {
  selectedKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  /** Keys used by the header checkbox. Defaults to the current page rows. */
  allKeys?: string[];
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
  selection,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  ariaLabel: string;
  selection?: DataTableSelection;
}) {
  const selectionKeys = selection?.allKeys ?? data.map((row) => getRowKey(row));
  const allSelected = selection
    ? selectionKeys.length > 0 &&
      selectionKeys.every((key) => selection.selectedKeys.has(key))
    : false;
  const someSelected = selection
    ? selectionKeys.some((key) => selection.selectedKeys.has(key))
    : false;

  function toggleAll(checked: boolean) {
    if (!selection) {
      return;
    }
    if (!checked) {
      selection.onSelectionChange(new Set());
      return;
    }
    const next = new Set(selection.selectedKeys);
    selectionKeys.forEach((key) => next.add(key));
    selection.onSelectionChange(next);
  }

  function toggleRow(key: string, checked: boolean) {
    if (!selection) {
      return;
    }
    const next = new Set(selection.selectedKeys);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    selection.onSelectionChange(next);
  }

  return (
    <div className="space-y-3">
      <Table aria-label={ariaLabel}>
        <TableHeader>
          {selection ? (
            <TableHead className="w-10 pr-0">
              <SelectionCheckbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                label="Pilih semua baris"
                onChange={() => toggleAll(!allSelected)}
              />
            </TableHead>
          ) : null}
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
          {data.map((row) => {
            const key = getRowKey(row);
            const selected = selection?.selectedKeys.has(key) ?? false;

            return (
              <TableRow key={key} className={cn(selected && "bg-muted/50")}>
                {selection ? (
                  <TableCell className="w-10 pr-0">
                    <SelectionCheckbox
                      checked={selected}
                      label="Pilih baris"
                      onChange={(checked) => toggleRow(key, checked)}
                    />
                  </TableCell>
                ) : null}
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
            );
          })}
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
