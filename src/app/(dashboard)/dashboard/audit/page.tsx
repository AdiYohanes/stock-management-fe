"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Eye, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditDetailDialog } from "@/components/features/audit/audit-detail-dialog";
import { MOCK_AUDIT_LOGS } from "@/lib/constants/mock-audit-logs";
import { formatDateTimeID } from "@/lib/formatters";
import type { AuditLog, AuditAction } from "@/lib/types/audit";

// -- Action badge color mapping --
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

export default function AuditPage() {
  const table = useReactTable({
    data: MOCK_AUDIT_LOGS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Audit Trail</h1>
            <p className="text-sm text-muted-foreground">
              Riwayat seluruh aktivitas perubahan data dalam sistem
            </p>
          </div>
        </div>
        {/* Placeholder filter button — not functional in Task 1 */}
        <Button variant="outline" disabled>
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
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
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <p className="text-xs text-muted-foreground">
        Menampilkan {MOCK_AUDIT_LOGS.length} log aktivitas
      </p>
    </div>
  );
}

// -- Detail button with dialog state --
function DetailButton({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Eye className="mr-1.5 h-4 w-4" />
        Lihat Detail
      </Button>
      <AuditDetailDialog log={log} open={open} onOpenChange={setOpen} />
    </>
  );
}
