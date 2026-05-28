"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_ADJUSTMENTS } from "@/lib/constants/mock-adjustment";
import { formatNumber } from "@/lib/formatters";
import type { AdjustmentStatus, StockAdjustment } from "@/lib/types/adjustment";
import { ADJUSTMENT_REASON_LABELS } from "@/lib/types/adjustment";
import { useAdjustmentStore } from "@/stores/adjustment-store";
import { logMockStockUpdate } from "@/lib/utils/adjustment-actions";

// ─── Rejection Reason Schema ─────────────────────────────────────────────────

const rejectionReasonSchema = z.object({
  rejection_reason: z
    .string()
    .min(3, "Alasan penolakan minimal 3 karakter")
    .max(300, "Alasan penolakan maksimal 300 karakter"),
});

type RejectionReasonValues = z.infer<typeof rejectionReasonSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format ISO date string to Indonesian locale with time */
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

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AdjustmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getAdjustmentById, approveAdjustment, rejectAdjustment } =
    useAdjustmentStore();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Look up in store first, then fall back to mock data
  const storeAdjustment = getAdjustmentById(id);
  const mockAdjustment = MOCK_ADJUSTMENTS.find((a) => a.id === id);
  const adjustment: StockAdjustment | undefined =
    storeAdjustment ?? mockAdjustment;

  // Whether this adjustment is from the store (can be reviewed)
  const isFromStore = storeAdjustment !== undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<RejectionReasonValues>({
    resolver: zodResolver(rejectionReasonSchema),
    mode: "onChange",
    defaultValues: { rejection_reason: "" },
  });

  const rejectionReasonLength = watch("rejection_reason")?.length ?? 0;

  if (!adjustment) {
    return (
      <div className="space-y-4 px-4 md:px-0">
        <Link href="/dashboard/adjustments">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
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

  const canReview = adjustment.status === "PENDING" && isFromStore;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleApprove = async () => {
    setIsApproving(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    approveAdjustment({
      id: adjustment.id,
      approved_by: "Supervisor Gudang", // Mock reviewer
    });

    logMockStockUpdate(adjustment);
    setIsApproving(false);
    toast.success("Penyesuaian berhasil disetujui!", {
      position: "top-right",
    });
    router.refresh();
  };

  const handleReject = async (data: RejectionReasonValues) => {
    setIsRejecting(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    rejectAdjustment({
      id: adjustment.id,
      approved_by: "Supervisor Gudang", // Mock reviewer
      rejection_reason: data.rejection_reason.trim(),
    });

    setIsRejecting(false);
    setRejectDialogOpen(false);
    reset();
    toast.success("Penyesuaian berhasil ditolak.", { position: "top-right" });
    router.refresh();
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Back button */}
      <Link href="/dashboard/adjustments">
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </Link>

      {/* Header Info */}
      <div className="rounded-md border p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold font-mono sm:text-2xl">
            {adjustment.adj_number}
          </h1>
          <StatusBadge status={adjustment.status} />
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
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
      <div className="rounded-md border p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold">Detail Perubahan Stok</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Qty Sebelum</p>
            <p className="text-xl font-bold tabular-nums mt-1 sm:text-2xl">
              {formatNumber(adjustment.qty_before)}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Qty Sesudah</p>
            <p className="text-xl font-bold tabular-nums mt-1 sm:text-2xl">
              {formatNumber(adjustment.qty_after)}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Selisih</p>
            <p
              className={`text-xl font-bold tabular-nums mt-1 sm:text-2xl ${diffColor}`}
            >
              {diffLabel}
            </p>
          </div>
        </div>

        {adjustment.notes && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-1">Catatan</p>
            <p className="text-sm rounded-md bg-muted/30 p-3 break-words">
              {adjustment.notes}
            </p>
          </div>
        )}
      </div>

      {/* Review Approval Section — only for PENDING store adjustments */}
      {canReview && (
        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-amber-900">
            Review Approval
          </h2>
          <p className="text-sm text-amber-800">
            Penyesuaian ini menunggu persetujuan. Silakan review dan pilih aksi
            di bawah.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Approve Button with AlertDialog confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {isApproving ? "Memproses..." : "Setujui"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-md sm:mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menyetujui penyesuaian stok ini?
                    Perubahan stok akan diterapkan:{" "}
                    <strong>
                      {adjustment.product_name} (
                      {formatNumber(adjustment.qty_before)} →{" "}
                      {formatNumber(adjustment.qty_after)})
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel
                    disabled={isApproving}
                    className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {isApproving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ya, Setujui
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Reject Button with Dialog for reason input */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] border-red-300 text-red-700 hover:bg-red-50 active:bg-red-100 sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {isRejecting ? "Memproses..." : "Tolak"}
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-md sm:mx-auto">
                <DialogHeader>
                  <DialogTitle>Tolak Penyesuaian</DialogTitle>
                  <DialogDescription>
                    Berikan alasan penolakan untuk penyesuaian{" "}
                    <strong>{adjustment.adj_number}</strong>. Alasan ini akan
                    ditampilkan kepada pengaju.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(handleReject)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="rejection_reason">
                      Alasan Penolakan{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="rejection_reason"
                      {...register("rejection_reason")}
                      placeholder="Tuliskan alasan penolakan..."
                      rows={4}
                      maxLength={300}
                      className="transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-describedby="rejection_reason-error rejection_reason-count"
                      aria-invalid={!!errors.rejection_reason}
                    />
                    <div className="flex items-center justify-between">
                      {errors.rejection_reason ? (
                        <p
                          id="rejection_reason-error"
                          className="text-xs text-destructive"
                        >
                          {errors.rejection_reason.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p
                        id="rejection_reason-count"
                        className="text-xs text-muted-foreground"
                      >
                        {rejectionReasonLength}/300
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectDialogOpen(false);
                        reset();
                      }}
                      disabled={isRejecting}
                      className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={!isValid || isRejecting}
                      className="min-h-[44px] active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {isRejecting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isRejecting ? "Memproses..." : "Tolak Penyesuaian"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Approval Info — for already processed adjustments */}
      {(adjustment.status === "APPROVED" ||
        adjustment.status === "REJECTED") && (
        <div className="rounded-md border p-4 sm:p-6 space-y-3">
          <h2 className="text-lg font-semibold">Informasi Persetujuan</h2>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
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
              <p className="text-sm rounded-md bg-red-50 p-3 text-red-800 break-words">
                {adjustment.rejection_reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium break-words">{value}</span>
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
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
