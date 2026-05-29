"use client";

import { X, Shield, Clock, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "@/lib/formatters";
import type { UserAccount, UserStatus } from "@/lib/types/user";
import type { UserRole } from "@/lib/validators/auth";

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserAccount | null;
}

/** Role badge color mapping per spec */
const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-blue-100 text-blue-800",
  SUPERVISOR: "bg-purple-100 text-purple-800",
  STAFF: "bg-lime-100 text-lime-800",
  AUDITOR: "bg-yellow-100 text-yellow-800",
};

/** Status badge color mapping per spec */
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

/** Get initials from full name (max 2 chars) */
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (first && second) {
    return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserProfileDialog({
  open,
  onClose,
  user,
}: UserProfileDialogProps) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
        className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg mx-4"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Tutup dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header: Avatar + Name + Role */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 id="user-profile-title" className="text-xl font-semibold">
              {user.name}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[user.status]}`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* User info section */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">{ROLE_LABELS[user.role]}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Terakhir Login:</span>
            <span className="font-medium">
              {user.last_login
                ? formatDateTime(user.last_login)
                : "Belum pernah login"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Terdaftar:</span>
            <span className="font-medium">{formatDate(user.created_at)}</span>
          </div>
        </div>

        {/* Status toggle placeholder */}
        <div className="mt-4 rounded-md border border-dashed p-3">
          <p className="text-xs text-muted-foreground italic">
            Toggle status (Aktif/Nonaktif) — akan tersedia di Task 2
          </p>
        </div>

        <Separator className="my-4" />

        {/* Activity log section */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Log Aktivitas Terakhir</h3>
          {user.activity_logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas tercatat.
            </p>
          ) : (
            <div className="space-y-3">
              {user.activity_logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                  <div className="space-y-0.5">
                    <p className="text-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
