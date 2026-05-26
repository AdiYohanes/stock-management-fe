"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Save, CheckCircle, FileDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GIItemRow } from "@/components/features/dispatching/gi-item-row";
import {
  createGISchema,
  finalizeGISchema,
  type CreateGIValues,
} from "@/lib/validators/dispatching";
import { useGIDraftStore } from "@/stores/gi-draft-store";
import {
  checkAvailableStockGI,
  mockFinalizeGI,
  type StockCheckError,
} from "@/lib/api/mock-stock-dispatching";
import { generateGINumber } from "@/lib/utils/generate-gi-number";
import { MOCK_PRODUCTS_DISPATCHING } from "@/lib/constants/mock-products-dispatching";
import type { GoodsIssue, GoodsIssueItem } from "@/lib/types/dispatching";

export default function NewDispatchingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [giNumber, setGiNumber] = useState("");
  const [finalizedGI, setFinalizedGI] = useState<GoodsIssue | null>(null);
  const draftLoaded = useRef(false);

  const { formData, lastSaved, saveDraft, clearDraft } = useGIDraftStore();

  const {
    register,
    control,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CreateGIValues>({
    resolver: zodResolver(createGISchema),
    mode: "onChange",
    defaultValues: {
      date: "",
      destination: "",
      items: [{ product_id: "", qty: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Auto-generate GI number on mount
  useEffect(() => {
    setGiNumber(generateGINumber());
  }, []);

  // Load draft on mount (once)
  useEffect(() => {
    if (!draftLoaded.current && formData) {
      reset(formData);
      draftLoaded.current = true;
    }
  }, [formData, reset]);

  const handleSaveDraft = async () => {
    const values = getValues();
    if (!values.date || !values.items.some((item) => item.product_id !== "")) {
      toast.error("Isi tanggal dan minimal 1 produk untuk menyimpan draft");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    saveDraft(values);
    setIsSaving(false);
    toast.success("Draft tersimpan");
  };

  const handleFinalize = async () => {
    // Step 1: Trigger form validation
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return;
    }

    const values = getValues();

    // Step 2: Strict finalize validation with Zod
    const parseResult = finalizeGISchema.safeParse(values);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      toast.error(firstError?.message ?? "Validasi gagal");
      return;
    }

    // Step 3: Pre-check stock availability
    const stockErrors = checkAvailableStockGI(
      values.items.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
      })),
    );

    if (stockErrors.length > 0) {
      for (const err of stockErrors) {
        toast.error(
          `Stok ${err.product_name} tidak mencukupi. Tersedia: ${err.available}`,
        );
      }
      return;
    }

    // Step 4: Finalize
    setIsFinalizing(true);

    try {
      const result = await mockFinalizeGI(parseResult.data);

      // Build finalized GI data for PDF
      const finalizedData: GoodsIssue = {
        id: crypto.randomUUID(),
        gi_number: giNumber || result.gi_number,
        date: values.date,
        destination: values.destination ?? "",
        status: "COMPLETED",
        items: values.items.map((item, idx): GoodsIssueItem => {
          const product = MOCK_PRODUCTS_DISPATCHING.find(
            (p) => p.id === item.product_id,
          );
          return {
            id: `gii-new-${idx}`,
            product_id: item.product_id,
            product_name: product?.name ?? "Unknown",
            sku: product?.sku ?? "-",
            qty: item.qty,
            unit_name: product?.unit_name ?? "-",
            notes: item.notes ?? null,
          };
        }),
        created_by: "Staff",
        created_at: new Date().toISOString(),
      };

      setFinalizedGI(finalizedData);

      // Clear draft from store
      clearDraft();

      toast.success(
        `Pengeluaran ${giNumber || result.gi_number} berhasil diselesaikan`,
      );
    } catch (error: unknown) {
      if (Array.isArray(error)) {
        for (const err of error as StockCheckError[]) {
          toast.error(
            `Stok ${err.product_name} tidak mencukupi. Tersedia: ${err.available}`,
          );
        }
      } else {
        toast.error("Gagal menyelesaikan pengeluaran. Silakan coba lagi.");
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!finalizedGI) return;

    setIsGeneratingPdf(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import("@react-pdf/renderer");
      const { GIPdfSlip } =
        await import("@/components/features/dispatching/gi-pdf-slip");

      const blob = await pdf(<GIPdfSlip data={finalizedGI} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${finalizedGI.gi_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF berhasil diunduh");
    } catch {
      toast.error("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [finalizedGI]);

  const handleCancel = () => {
    clearDraft();
    reset({
      date: "",
      destination: "",
      items: [{ product_id: "", qty: 0, notes: "" }],
    });
    router.push("/dashboard/dispatching");
  };

  // If finalized, show success state with PDF download
  if (finalizedGI) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto px-4 py-12 text-center">
        <div className="rounded-full bg-emerald-100 p-4">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold">
            Pengeluaran Berhasil
          </h1>
          <p className="text-muted-foreground">
            Transaksi{" "}
            <span className="font-mono font-semibold">
              {finalizedGI.gi_number}
            </span>{" "}
            telah diselesaikan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="min-h-[44px] w-full sm:w-auto transition-all duration-150 active:scale-95"
          >
            {isGeneratingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Cetak Bukti
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/dispatching")}
            className="min-h-[44px] w-full sm:w-auto transition-all duration-150 active:scale-95"
          >
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 md:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Buat Pengeluaran Barang (GI) Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Isi form di bawah untuk membuat transaksi pengeluaran barang.
          </p>
        </div>
        {lastSaved && (
          <p className="text-xs text-muted-foreground">
            Draft tersimpan pada{" "}
            {new Date(lastSaved).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            })}{" "}
            WIB
          </p>
        )}
      </div>

      <form className="space-y-6">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GI Number (auto-generated, read-only) */}
          <div className="space-y-1.5">
            <Label htmlFor="gi_number">Nomor GI</Label>
            <Input
              id="gi_number"
              value={giNumber || "Generating..."}
              disabled
              readOnly
              className="font-mono bg-muted/50"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              aria-describedby={errors.date ? "date-error" : undefined}
              className="min-h-[44px] md:min-h-0"
              {...register("date")}
            />
            {errors.date && (
              <p id="date-error" className="text-xs text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <Label htmlFor="destination">Tujuan / Destination</Label>
          <Input
            id="destination"
            placeholder="Contoh: Divisi Marketing"
            maxLength={200}
            className="min-h-[44px] md:min-h-0"
            {...register("destination")}
          />
          {errors.destination && (
            <p className="text-xs text-destructive">
              {errors.destination.message}
            </p>
          )}
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Item Pengeluaran</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] md:min-h-0 transition-all duration-150 hover:bg-accent active:scale-95"
              onClick={() => append({ product_id: "", qty: 0, notes: "" })}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Item
            </Button>
          </div>

          {errors.items?.root && (
            <p className="text-xs text-destructive">
              {errors.items.root.message}
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <GIItemRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || isFinalizing}
            className="min-h-[44px] w-full sm:w-auto transition-all duration-150 hover:bg-accent active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan sebagai Draft
          </Button>
          <Button
            type="button"
            onClick={handleFinalize}
            disabled={isFinalizing || isSaving}
            className="min-h-[44px] w-full sm:w-auto transition-all duration-150 active:scale-95"
          >
            {isFinalizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Simpan &amp; Selesaikan
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isFinalizing}
            className="min-h-[44px] w-full sm:w-auto transition-all duration-150 hover:bg-accent active:scale-95"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
