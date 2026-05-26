"use client";

import Link from "next/link";
import { PackageOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GREmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 px-4 text-center">
      <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold">Belum ada penerimaan barang</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Mulai catat penerimaan barang pertama Anda.
      </p>
      <Link href="/dashboard/receiving/new">
        <Button className="min-h-[44px]">
          <Plus className="mr-2 h-4 w-4" />
          Buat GR Pertama
        </Button>
      </Link>
    </div>
  );
}
