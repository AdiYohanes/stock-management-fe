"use client";

import { useCallback, useRef, useState } from "react";
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

/** Debounce duration for pagination button clicks (ms) */
const PAGINATION_DEBOUNCE_MS = 500;

interface AuditPaginationProps<TData> {
  table: Table<TData>;
}

/**
 * Pagination controls for the audit trail table.
 * Includes per-page dropdown, prev/next buttons, page indicator,
 * double-click prevention, keyboard navigation, and mobile responsive layout.
 */
export function AuditPagination<TData>({ table }: AuditPaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;

  // Double-click prevention state
  const [isNavigating, setIsNavigating] = useState(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced page navigation to prevent double-clicks
  const handlePageChange = useCallback(
    (direction: "prev" | "next") => {
      if (isNavigating) return;

      setIsNavigating(true);

      if (direction === "prev") {
        table.previousPage();
      } else {
        table.nextPage();
      }

      navTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, PAGINATION_DEBOUNCE_MS);
    },
    [isNavigating, table],
  );

  // Keyboard navigation handler for arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" && table.getCanPreviousPage()) {
        e.preventDefault();
        handlePageChange("prev");
      } else if (e.key === "ArrowRight" && table.getCanNextPage()) {
        e.preventDefault();
        handlePageChange("next");
      }
    },
    [handlePageChange, table],
  );

  const isPrevDisabled = !table.getCanPreviousPage() || isNavigating;
  const isNextDisabled = !table.getCanNextPage() || isNavigating;

  return (
    <div
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      role="navigation"
      aria-label="Navigasi halaman tabel audit"
      onKeyDown={handleKeyDown}
    >
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
          <SelectTrigger
            id="audit-page-size"
            className="min-h-[44px] w-[80px] md:min-h-[36px]"
          >
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
      <div className="flex w-full items-center gap-2 md:w-auto">
        <span className="flex-1 text-sm text-muted-foreground md:flex-none">
          Halaman {pageIndex + 1} dari {pageCount || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("prev")}
          disabled={isPrevDisabled}
          aria-label="Halaman sebelumnya"
          className="min-h-[44px] min-w-[44px] flex-1 md:min-h-[36px] md:min-w-[36px] md:flex-none"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Prev</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("next")}
          disabled={isNextDisabled}
          aria-label="Halaman berikutnya"
          className="min-h-[44px] min-w-[44px] flex-1 md:min-h-[36px] md:min-w-[36px] md:flex-none"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
