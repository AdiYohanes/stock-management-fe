"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Calculator, AlertCircle, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  createAdjustmentSchema,
  type CreateAdjustmentValues,
} from "@/lib/validators/adjustment";
import {
  MOCK_PRODUCTS_STOCK,
  type MockProductStock,
} from "@/lib/constants/mock-products-stock";
import { ADJUSTMENT_REASON_LABELS } from "@/lib/types/adjustment";
import type { AdjustmentReason, StockAdjustment } from "@/lib/types/adjustment";
import { formatNumber } from "@/lib/formatters";
import { useAdjustmentStore } from "@/stores/adjustment-store";
import { generateAdjId } from "@/lib/utils/adjustment-actions";
import { generateAutoAdjNumber } from "@/lib/utils/auto-number";

/** Format diff value with sign prefix and number formatting */
function formatDiff(diff: number): string {
  if (diff === 0) return "0";
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${formatNumber(diff)}`;
}

/** Get Tailwind color class based on diff value */
function getDiffColorClass(diff: number): string {
  if (diff > 0) return "text-emerald-600";
  if (diff < 0) return "text-red-600";
  return "text-muted-foreground";
}

/** Reason options for the dropdown */
const REASON_OPTIONS: { value: AdjustmentReason; label: string }[] = [
  { value: "RUSAK", label: ADJUSTMENT_REASON_LABELS.RUSAK },
  { value: "HILANG", label: ADJUSTMENT_REASON_LABELS.HILANG },
  { value: "SELISIH_HITUNG", label: ADJUSTMENT_REASON_LABELS.SELISIH_HITUNG },
  { value: "KADALUARSA", label: ADJUSTMENT_REASON_LABELS.KADALUARSA },
  { value: "LAINNYA", label: ADJUSTMENT_REASON_LABELS.LAINNYA },
];

/** Minimum debounce time (ms) to prevent double-submit */
const SUBMIT_DEBOUNCE_MS = 300;

export default function NewAdjustmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const router = useRouter();
  const { addAdjustment } = useAdjustmentStore();

  // Auto-generate adjustment number on mount (memo ensures stable across re-renders)
  const autoNumber = useMemo(() => generateAutoAdjNumber(), []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateAdjustmentValues>({
    resolver: zodResolver(createAdjustmentSchema),
    mode: "onChange",
    defaultValues: {
      product_id: "",
      stok_aktual: undefined as unknown as number,
      reason: "",
      notes: "",
    },
  });

  // Watch product_id and stok_aktual for real-time diff calculation
  const watchedProductId = useWatch({ control, name: "product_id" });
  const watchedStokAktual = useWatch({ control, name: "stok_aktual" });

  // Find selected product from mock data
  const selectedProduct: MockProductStock | undefined = useMemo(
    () => MOCK_PRODUCTS_STOCK.find((p) => p.id === watchedProductId),
    [watchedProductId],
  );

  // Calculate diff in real-time
  const systemStock = selectedProduct?.current_stock_qty ?? null;
  const stokAktualNum =
    typeof watchedStokAktual === "number" && !isNaN(watchedStokAktual)
      ? watchedStokAktual
      : null;
  const diff =
    systemStock !== null && stokAktualNum !== null
      ? stokAktualNum - systemStock
      : null;

  // Edge case: detect when stok_aktual equals stok_sistem (no actual change)
  const hasNoStockChange = diff === 0 && stokAktualNum !== null;

  // Notes character count
  const watchedNotes = useWatch({ control, name: "notes" });
  const notesLength = watchedNotes?.length ?? 0;

  const onSubmit = useCallback(
    async (data: CreateAdjustmentValues) => {
      // Double-submit prevention via ref lock
      if (submitLockRef.current) return;
      submitLockRef.current = true;
      setIsSubmitting(true);

      // Edge case: prevent submit if stok_aktual === stok_sistem
      const product = MOCK_PRODUCTS_STOCK.find((p) => p.id === data.product_id);
      if (!product) {
        setIsSubmitting(false);
        submitLockRef.current = false;
        toast.error("Produk tidak ditemukan", { position: "top-right" });
        return;
      }

      if (data.stok_aktual === product.current_stock_qty) {
        setIsSubmitting(false);
        submitLockRef.current = false;
        toast.warning(
          "Tidak ada perubahan pada stok aktual. Stok aktual sama dengan stok sistem.",
          { position: "top-right" },
        );
        return;
      }

      // Simulate processing delay (300ms as per spec)
      await new Promise((resolve) => setTimeout(resolve, SUBMIT_DEBOUNCE_MS));

      // TODO: Replace with backend API — POST /api/v1/adjustments
      const newAdjustment: StockAdjustment = {
        id: generateAdjId(),
        adj_number: autoNumber,
        date: new Date().toISOString(),
        product_id: data.product_id,
        product_name: product.name,
        sku: product.sku,
        reason: data.reason as AdjustmentReason,
        qty_before: product.current_stock_qty,
        qty_after: data.stok_aktual,
        notes: data.notes || null,
        status: "PENDING",
        created_by: "Staff Gudang", // TODO: Replace with real user from auth context
        created_at: new Date().toISOString(),
        approved_by: null,
        approved_at: null,
        rejection_reason: null,
      };

      addAdjustment(newAdjustment);
      setIsSubmitting(false);
      submitLockRef.current = false;
      toast.success(
        "Penyesuaian berhasil diajukan! Status: Menunggu Persetujuan",
        { position: "top-right" },
      );
      router.push("/dashboard/adjustments");
    },
    [addAdjustment, autoNumber, router],
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 md:px-0">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <Calculator className="h-6 w-6 shrink-0 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Ajukan Penyesuaian Stok
          </h1>
          <p className="text-sm text-muted-foreground">
            Isi form berikut untuk mengajukan penyesuaian stok barang.
          </p>
        </div>
      </div>

      {/* Auto-generated Number Badge */}
      <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/30 px-4 py-3">
        <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Nomor Penyesuaian</p>
          <p className="truncate font-mono text-sm font-semibold">
            {autoNumber}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Penyesuaian</CardTitle>
          <CardDescription>
            Selisih stok akan dihitung otomatis berdasarkan stok aktual yang
            diinput.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Product Selection & System Stock */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="product_id">
                  Produk <span className="text-destructive">*</span>
                </Label>
                <select
                  id="product_id"
                  {...register("product_id")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-describedby="product_id-error"
                  aria-invalid={!!errors.product_id}
                >
                  <option value="">-- Pilih Produk --</option>
                  {MOCK_PRODUCTS_STOCK.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p
                    id="product_id-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.product_id.message}
                  </p>
                )}
              </div>

              {/* System Stock (readonly) */}
              <div className="space-y-1.5">
                <Label htmlFor="stok_sistem">Stok Sistem</Label>
                <Input
                  id="stok_sistem"
                  value={
                    selectedProduct
                      ? `${formatNumber(selectedProduct.current_stock_qty)} ${selectedProduct.unit}`
                      : "—"
                  }
                  disabled
                  readOnly
                  aria-label="Stok sistem saat ini"
                  className="tabular-nums"
                />
                <p className="text-xs text-muted-foreground">
                  Otomatis terisi berdasarkan produk yang dipilih.
                </p>
              </div>
            </div>

            <Separator />

            {/* Actual Stock & Diff */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Stok Aktual */}
              <div className="space-y-1.5">
                <Label htmlFor="stok_aktual">
                  Stok Aktual <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stok_aktual"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Masukkan jumlah stok aktual"
                  {...register("stok_aktual")}
                  className="tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-describedby="stok_aktual-error"
                  aria-invalid={!!errors.stok_aktual}
                />
                {errors.stok_aktual && (
                  <p
                    id="stok_aktual-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.stok_aktual.message}
                  </p>
                )}
              </div>

              {/* Selisih (readonly, real-time) */}
              <div className="space-y-1.5">
                <Label htmlFor="selisih">Selisih</Label>
                <div
                  id="selisih"
                  className={`flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-semibold tabular-nums ${
                    diff !== null
                      ? getDiffColorClass(diff)
                      : "text-muted-foreground"
                  }`}
                  aria-live="polite"
                  aria-label="Selisih stok"
                >
                  {diff !== null ? formatDiff(diff) : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dihitung otomatis: Stok Aktual − Stok Sistem
                </p>
              </div>
            </div>

            <Separator />

            {/* Reason & Notes */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Reason Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="reason">
                  Alasan <span className="text-destructive">*</span>
                </Label>
                <select
                  id="reason"
                  {...register("reason")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-describedby="reason-error"
                  aria-invalid={!!errors.reason}
                >
                  <option value="">-- Pilih Alasan --</option>
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p
                    id="reason-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {/* Notes (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan</Label>
                <textarea
                  id="notes"
                  {...register("notes")}
                  rows={3}
                  maxLength={500}
                  placeholder="Catatan tambahan (opsional)"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-describedby="notes-error notes-count"
                  aria-invalid={!!errors.notes}
                />
                <div className="flex items-center justify-between">
                  {errors.notes ? (
                    <p
                      id="notes-error"
                      className="flex items-center gap-1 text-xs text-destructive"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.notes.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p id="notes-count" className="text-xs text-muted-foreground">
                    {notesLength}/500
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Edge case warning: no stock change */}
            {hasNoStockChange && (
              <div
                className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Stok aktual sama dengan stok sistem. Tidak ada perubahan yang
                  perlu diajukan.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || hasNoStockChange}
                className="w-full min-h-[44px] sm:w-auto sm:min-w-[180px] active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Mengajukan..." : "Ajukan Penyesuaian"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
