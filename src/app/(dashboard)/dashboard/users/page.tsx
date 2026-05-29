"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileDialog } from "@/components/features/users/user-profile-dialog";
import { MOCK_USERS } from "@/lib/constants/mock-users";
import { formatDateTime } from "@/lib/formatters";
import type { UserAccount, UserStatus } from "@/lib/types/user";
import type { UserRole } from "@/lib/validators/auth";

/** Role badge color mapping per spec: ADMIN=biru, SUPERVISOR=ungu, STAFF=hijau muda, AUDITOR=kuning */
const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-blue-100 text-blue-800",
  SUPERVISOR: "bg-purple-100 text-purple-800",
  STAFF: "bg-lime-100 text-lime-800",
  AUDITOR: "bg-yellow-100 text-yellow-800",
};

/** Status badge color mapping per spec: AKTIF=hijau, NONAKTIF=merah, TERKUNCI=abu */
const STATUS_COLORS: Record<UserStatus, string> = {
  AKTIF: "bg-emerald-100 text-emerald-800",
  NONAKTIF: "bg-red-100 text-red-800",
  TERKUNCI: "bg-slate-100 text-slate-800",
};

/** Role display labels */
const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  STAFF: "Staff",
  AUDITOR: "Auditor",
};

const col = createColumnHelper<UserAccount>();

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetail = (user: UserAccount) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    col.accessor("name", { header: "Nama" }),
    col.accessor("email", { header: "Email" }),
    col.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue();
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}
          >
            {ROLE_LABELS[role]}
          </span>
        );
      },
    }),
    col.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
          >
            {status}
          </span>
        );
      },
    }),
    col.accessor("last_login", {
      header: "Terakhir Login",
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <span className="text-sm">{formatDateTime(value)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    }),
    col.display({
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.original)}
          aria-label={`Lihat detail ${row.original.name}`}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          Lihat Detail
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: MOCK_USERS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
      </div>

      {/* Users table */}
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

      {/* Profile dialog */}
      <UserProfileDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </div>
  );
}
