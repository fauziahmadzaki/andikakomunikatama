"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

function visiblePages(page: number, pageCount: number) {
  const start = Math.max(1, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DataTablePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Halaman {page} dari {pageCount}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <ActionIconButton
              icon={ChevronLeftIcon}
              label="Halaman sebelumnya"
              isDisabled={page <= 1}
              onPress={() => onPageChange(page - 1)}
            />
          </PaginationItem>

          {visiblePages(page, pageCount).map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <Button
                type="button"
                variant={pageNumber === page ? "outline" : "ghost"}
                size="icon-sm"
                aria-label={`Halaman ${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                onPress={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            </PaginationItem>
          ))}

          <PaginationItem>
            <ActionIconButton
              icon={ChevronRightIcon}
              label="Halaman berikutnya"
              isDisabled={page >= pageCount}
              onPress={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
