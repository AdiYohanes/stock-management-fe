"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_ADJUSTMENTS } from "@/lib/constants/mock-adjustment";
import { formatNumber } from "@/lib/formatters";
import type { AdjustmentStatus } from "@/lib/types/adjustment";
import { ADJUSTMENT_REASON_LABELS } from "@/lib/types/adjustment";

/** Format ISO date string to Indonesian locale with time (e.g. "22 Mei 2026, 09:15 WIB") */
function formatDateTimeID(isoDate: string): string {
  const date = new Date(isoDate);
  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
  return `${dateStr}, ${timeStr} WIB`;
}

export default function AdjustmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const adjustment = MOCK_ADJUSTMENTS.find((a) => a.id === id);

  if (!adjustment) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/adjustments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <p className="text-muted-foreground">
          Data penyesuaian tidak ditemukan.
        </p>
      </div>
    );
  }

  const qtyDiff = adjustment.qty_after - adjustment.qty_before;
  const diffLabel =
    qtyDiff >= 0 ? `+${formatNumber(qtyDiff)}` : formatNumber(qtyDiff);
  const diffColor = qtyDiff >= 0 ? "text-emerald-700" : "text-red-700";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/dashboard/adjustments">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </Link>

      {/* Header Info */}
      <div className="rounded-md border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{adjustment.adj_number}</h1>
          <StatusBadge status={adjustment.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <InfoItem label="Tanggal" value={formatDateTimeID(adjustment.date)} />
          <InfoItem label="Dibuat oleh" value={adjustment.created_by} />
          <InfoItem
            label="Produk"
            value={`${adjustment.product_name} (${adjustment.sku})`}
          />
          <InfoItem
            label="Alasan"
            value={ADJUSTMENT_REASON_LABELS[adjustment.reason]}
          />
        </div>
      </div>

      {/* Stock Change Detail */}
      <div className="rounded-md border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Detail Perubahan Stok</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Qty Sebelum</p>
            <p className="text-2xl font-bold mt-1">
              {formatNumber(adjustment.qty_before)}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Qty Sesudah</p>
            <p className="text-2xl font-bold mt-1">
              {formatNumber(adjustment.qty_after)}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Selisih</p>
            <p className={`text-2xl font-bold mt-1 ${diffColor}`}>
              {diffLabel}
            </p>
          </div>
        </div>

        {adjustment.notes && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-1">Catatan</p>
            <p className="text-sm rounded-md bg-muted/30 p-3">
              {adjustment.notes}
            </p>
          </div>
        )}
      </div>

      {/* Approval Info */}
      {(adjustment.status === "APPROVED" ||
        adjustment.status === "REJECTED") && (
        <div className="rounded-md border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Informasi Persetujuan</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem
              label="Status"
              value={adjustment.status === "APPROVED" ? "Disetujui" : "Ditolak"}
            />
            <InfoItem
              label="Diproses oleh"
              value={adjustment.approved_by ?? "-"}
            />
            <InfoItem
              label="Waktu Proses"
              value={
                adjustment.approved_at
                  ? formatDateTimeID(adjustment.approved_at)
                  : "-"
              }
            />
          </div>

          {adjustment.rejection_reason && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-1">
                Alasan Penolakan
              </p>
              <p className="text-sm rounded-md bg-red-50 p-3 text-red-800">
                {adjustment.rejection_reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: AdjustmentStatus }) {
  const config: Record<AdjustmentStatus, { className: string; label: string }> =
    {
      PENDING: {
        className: "bg-amber-100 text-amber-800",
        label: "Menunggu",
      },
      APPROVED: {
        className: "bg-emerald-100 text-emerald-800",
        label: "Disetujui",
      },
      REJECTED: {
        className: "bg-red-100 text-red-800",
        label: "Ditolak",
      },
    };

  const { className, label } = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
