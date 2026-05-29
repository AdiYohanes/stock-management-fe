"use client";

import Link from "next/link";
import { Package, Send, ClipboardList, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Types ---

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
}

// --- Configuration ---

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Buat Penerimaan (GR)",
    description: "Catat barang masuk ke gudang",
    href: "/dashboard/receiving/new",
    icon: Package,
    iconClassName: "text-emerald-600",
  },
  {
    label: "Buat Pengeluaran (GI)",
    description: "Catat barang keluar dari gudang",
    href: "/dashboard/dispatching/new",
    icon: Send,
    iconClassName: "text-blue-600",
  },
  {
    label: "Ajukan Penyesuaian",
    description: "Koreksi stok dengan persetujuan",
    href: "/dashboard/adjustments/new",
    icon: ClipboardList,
    iconClassName: "text-amber-600",
  },
  {
    label: "Tambah Pengguna",
    description: "Daftarkan pengguna baru",
    href: "/dashboard/users/new",
    icon: UserPlus,
    iconClassName: "text-violet-600",
  },
];

// --- Quick Action Button Component ---

function QuickActionButton({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <Button
      asChild
      variant="outline"
      className="h-auto w-full justify-start gap-3 px-4 py-3 min-h-[44px]"
    >
      <Link href={action.href}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon
            className={`h-4 w-4 ${action.iconClassName}`}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-medium">{action.label}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {action.description}
          </span>
        </div>
      </Link>
    </Button>
  );
}

// --- Main Export ---

/**
 * Quick Actions Panel component.
 * Displays 4 prominent navigation buttons for common warehouse operations.
 */
export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton key={action.href} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
