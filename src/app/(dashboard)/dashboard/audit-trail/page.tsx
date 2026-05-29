"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Download, Eye, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuditDetailDialog } from "@/components/features/audit/audit-detail-dialog";
import { AuditFilters } from "@/components/features/audit/audit-filters";
import { AuditPagination } from "@/components/shared/audit-pagination";
import { AuditSkeleton } from "@/components/shared/audit-skeleton";
import { AuditEmptyState } from "@/components/shared/audit-empty-state";
import { MOCK_AUDIT_LOGS } from "@/lib/constants/mock-audit-logs";
import { formatDateTimeID } from "@/lib/formatters";
import { exportAuditCsv } from "@/lib/utils/export-audit-csv";
import {
  applyAuditFilters,
  getUniqueUsers,
  DEFAULT_AUDIT_FILTERS,
  type AuditFilterCriteria,
} from "@/lib/utils/audit-filters";
import type { AuditLog, AuditAction } from "@/lib/types/audit";

// TODO: Replace with backend API endpoint — GET /api/v1/audit (paginated, filterable)

// -- Action badge color mapping (consistent with other modules) --
const ACTION_BADGE_STYLES: Record<AuditAction, string> = {
  CREATE: "bg-blue-100 text-blue-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  APPROVE: "bg-emerald-100 text-emerald-800",
  REJECT: "bg-gray-100 text-gray-800",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  APPROVE: "Approve",
  REJECT: "Reject",
};

// -- Table column definitions --
const col = createColumnHelper<AuditLog>();

const columns = [
  col.accessor("timestamp", {
    header: "Waktu",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs">
        {formatDateTimeID(info.getValue())}
      </span>
    ),
  }),
  col.accessor("user_name", {
    header: "User",
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">
          {info.row.original.user_role}
        </p>
      </div>
    ),
  }),
  col.accessor("action", {
    header: "Aksi",
    cell: (info) => {
      const action = info.getValue();
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_BADGE_STYLES[action]}`}
        >
          {ACTION_LABELS[action]}
        </span>
      );
    },
  }),
  col.accessor("entity_type", {
    header: "Entitas",
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">
          {info.row.original.entity_label}
        </p>
      </div>
    ),
  }),
  col.display({
    id: "detail",
    header: "Detail",
    cell: ({ row }) => <DetailButton log={row.original} />,
  }),
];

// -- Constants --
const SEARCH_DEBOUNCE_MS = 300;
const LOADING_SIMULATION_MS = 300;
const EXPORT_DEBOUNCE_MS = 500;
const DEFAULT_PAGE_SIZE = 20;

export default function AuditTrailPage() {
  // Filter state
  const [filters, setFilters] = useState<AuditFilterCriteria>(
    DEFAULT_AUDIT_FILTERS,
  );
  // Raw search input (before debounce)
  const [searchInput, setSearchInput] = useState("");
  // Debounced search value applied to filters
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Loading state (simulated)
  const [isLoading, setIsLoading] = useState(true);
  // Export debounce ref
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_SIMULATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // Simulate loading when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_SIMULATION_MS);
    return () => clearTimeout(timer);
  }, [filters, debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync debounced search into filter criteria
  const activeFilters = useMemo<AuditFilterCriteria>(
    () => ({ ...filters, searchQuery: debouncedSearch }),
    [filters, debouncedSearch],
  );

  // TODO: Replace with backend API endpoint — GET /api/v1/audit (server-side filter)
  // Apply filters to mock data
  const filteredData = useMemo(
    () => applyAuditFilters(MOCK_AUDIT_LOGS, activeFilters),
    [activeFilters],
  );

  // Extract unique users for dropdown
  const userOptions = useMemo(() => getUniqueUsers(MOCK_AUDIT_LOGS), []);

  // Handle filter changes from the filter component
  const handleFiltersChange = useCallback((updated: AuditFilterCriteria) => {
    setFilters(updated);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Export CSV handler with debounce/double-click protection
  const handleExportCsv = useCallback(() => {
    if (filteredData.length === 0) {
      toast.warning("Tidak ada data untuk diexport");
      return;
    }

    if (isExporting) return;

    setIsExporting(true);
    exportAuditCsv(filteredData);
    toast.success(
      `Berhasil mengexport ${filteredData.length} log audit ke CSV`,
    );

    // Debounce protection — prevent rapid clicks
    exportTimerRef.current = setTimeout(() => {
      setIsExporting(false);
    }, EXPORT_DEBOUNCE_MS);
  }, [filteredData, isExporting]);

  // Cleanup export timer on unmount
  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        clearTimeout(exportTimerRef.current);
      }
    };
  }, []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
      },
    },
  });

  // Reset pagination to first page when filtered data changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [filteredData, table]);

  const isExportDisabled = filteredData.length === 0 || isExporting;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Jejak Audit</h1>
          <p className="text-sm text-muted-foreground">
            Riwayat seluruh aktivitas perubahan data dalam sistem
          </p>
        </div>
      </div>

      {/* Filter bar + Export button */}
      <div className="space-y-3">
        <AuditFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          userOptions={userOptions}
        />

        {/* Export button row — full-width on mobile */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredData.length} dari {MOCK_AUDIT_LOGS.length} log ditemukan
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExportDisabled}
            className="min-h-[44px] w-full shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:min-h-[36px] md:w-auto"
            aria-label={
              isExporting
                ? "Sedang mengexport..."
                : `Export ${filteredData.length} log audit ke CSV`
            }
          >
            <Download className="mr-1.5 h-4 w-4" />
            {isExporting ? "Mengexport..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <AuditSkeleton />}

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && <AuditEmptyState />}

      {/* Table with aria-live for dynamic content updates */}
      {!isLoading && filteredData.length > 0 && (
        <div aria-live="polite" aria-atomic="true">
          {/* Accessible status announcement (screen readers only) */}
          <p className="sr-only">
            Menampilkan {table.getRowModel().rows.length} dari{" "}
            {filteredData.length} log audit. Halaman{" "}
            {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount()}.
          </p>

          {/* Table with horizontal scroll and sticky first column on mobile */}
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm" role="table">
              <thead className="border-b bg-muted/50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header, headerIndex) => (
                      <th
                        key={header.id}
                        scope="col"
                        className={`px-4 py-3 text-left font-medium text-muted-foreground ${
                          headerIndex === 0
                            ? "sticky left-0 z-10 bg-muted/50 md:static md:z-auto"
                            : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3 ${
                          cellIndex === 0
                            ? "sticky left-0 z-10 bg-background md:static md:z-auto"
                            : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4">
            <AuditPagination table={table} totalItems={filteredData.length} />
          </div>
        </div>
      )}
    </div>
  );
}

// -- Detail button with dialog state --
function DetailButton({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:min-h-[36px] md:min-w-[36px]"
        aria-label={`Lihat detail audit log: ${log.description}`}
      >
        <Eye className="mr-1.5 h-4 w-4" />
        <span className="hidden sm:inline">Lihat Detail</span>
      </Button>
      <AuditDetailDialog log={log} open={open} onOpenChange={setOpen} />
    </>
  );
}
