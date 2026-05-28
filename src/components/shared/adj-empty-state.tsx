"use client";

import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state placeholder for the adjustments list.
 * Shown when there are no adjustment records to display.
 */
export function AdjEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 px-6 text-center">
      {/* Illustration placeholder */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-lg font-semibold">Belum ada penyesuaian stok</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Penyesuaian stok yang diajukan akan muncul di sini. Mulai dengan
        mengajukan penyesuaian baru.
      </p>

      <Link href="/dashboard/adjustments/new" className="mt-6">
        <Button className="min-h-[44px] min-w-[44px]">
          <Plus className="mr-2 h-4 w-4" />
          Ajukan Penyesuaian
        </Button>
      </Link>
    </div>
  );
}
