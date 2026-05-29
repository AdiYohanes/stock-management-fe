"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";

/** Available page size options */
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

interface AuditPaginationProps<TData> {
  table: Table<TData>;
}

/**
 * Pagination controls for the audit trail table.
 * Includes per-page dropdown, prev/next buttons, and page indicator.
 */
export function AuditPagination<TData>({ table }: AuditPaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Per-page selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="audit-page-size"
          className="text-sm text-muted-foreground"
        >
          Baris per halaman:
        </label>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger id="audit-page-size" className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page indicator + navigation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Halaman {pageIndex + 1} dari {pageCount || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Halaman sebelumnya"
          className="min-h-[36px] min-w-[36px]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Prev</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Halaman berikutnya"
          className="min-h-[36px] min-w-[36px]"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
