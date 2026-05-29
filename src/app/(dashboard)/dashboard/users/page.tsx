"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  ToggleLeft,
  Lock,
  Unlock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfileDialog } from "@/components/features/users/user-profile-dialog";
import { useUserStore } from "@/stores/user-store";
import { formatDateTime } from "@/lib/formatters";
import type { UserAccount, UserStatus } from "@/lib/types/user";
import type { UserRole } from "@/lib/validators/auth";

/** Role badge color mapping */
const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-blue-100 text-blue-800",
  SUPERVISOR: "bg-purple-100 text-purple-800",
  STAFF: "bg-lime-100 text-lime-800",
  AUDITOR: "bg-yellow-100 text-yellow-800",
};

/** Status badge color mapping */
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
  const users = useUserStore((s) => s.users);
  const toggleUserStatus = useUserStore((s) => s.toggleUserStatus);
  const disableUser = useUserStore((s) => s.disableUser);
  const enableUser = useUserStore((s) => s.enableUser);

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Confirmation dialog state for disable/enable
  const [confirmAction, setConfirmAction] = useState<{
    user: UserAccount;
    type: "disable" | "enable";
  } | null>(null);

  const handleViewDetail = (user: UserAccount) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: UserAccount) => {
    toggleUserStatus(user.id);
    const newStatus = user.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
    toast.success(`Status ${user.name} berhasil diubah menjadi ${newStatus}`);
  };

  const handleConfirmDisableEnable = () => {
    if (!confirmAction) return;
    const { user, type } = confirmAction;

    if (type === "disable") {
      disableUser(user.id);
      toast.success(`Akun ${user.name} berhasil dinonaktifkan (TERKUNCI)`);
    } else {
      enableUser(user.id);
      toast.success(`Akun ${user.name} berhasil diaktifkan kembali`);
    }

    setConfirmAction(null);
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
      cell: ({ row }) => {
        const user = row.original;
        const isLocked = user.status === "TERKUNCI";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Aksi untuk ${user.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetail(user)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>

              {/* Toggle Status: only available when not TERKUNCI */}
              {!isLocked && (
                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  {user.status === "AKTIF"
                    ? "Nonaktifkan Status"
                    : "Aktifkan Status"}
                </DropdownMenuItem>
              )}

              {/* Disable/Enable (lock/unlock) */}
              {isLocked ? (
                <DropdownMenuItem
                  onClick={() => setConfirmAction({ user, type: "enable" })}
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Aktifkan Akun
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setConfirmAction({ user, type: "disable" })}
                  className="text-destructive focus:text-destructive"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Kunci Akun
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users,
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

      {/* Confirmation dialog for disable/enable */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "disable"
                ? "Kunci Akun Pengguna"
                : "Aktifkan Akun Pengguna"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "disable"
                ? `Apakah Anda yakin ingin mengunci akun ${confirmAction.user.name}? Pengguna tidak akan dapat login selama akun terkunci.`
                : `Apakah Anda yakin ingin mengaktifkan kembali akun ${confirmAction?.user.name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Batal
            </Button>
            <Button
              variant={
                confirmAction?.type === "disable" ? "destructive" : "default"
              }
              onClick={handleConfirmDisableEnable}
            >
              {confirmAction?.type === "disable"
                ? "Ya, Kunci Akun"
                : "Ya, Aktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
