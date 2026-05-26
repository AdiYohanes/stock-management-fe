"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Save, CheckCircle, FileDown } from "lucide-react";
import { toast } from "sonner";

import {
  checkAvailableStock,
  simulateStockIncrement,
} from "@/lib/api/mock-stock";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRItemRow } from "@/components/features/receiving/gr-item-row";
import { GRPdfSlip } from "@/components/features/receiving/gr-pdf-slip";
import { createGRSchema, type CreateGRValues } from "@/lib/validators/receiving";
import { useReceivingDraftStore } from "@/stores/receiving-draft-store";
import { MOCK_PRODUCTS } from "@/lib/constants/mock-products";
import type { GoodsReceipt } from "@/lib/types/receiving";

/** Generate mock GR number in WIB timezone: GR-YYYYMMDD-XXXX */
function generateGRNumber(): string {
  const now = new Date();
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, "0");
  const d = String(wib.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `GR-${y}${m}${d}-${seq}`;
}

export default function NewReceivingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizedGR, setFinalizedGR] = useState<GoodsReceipt | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const draftLoaded = useRef(false);

  const grNumber = useMemo(() => generateGRNumber(), []);

  const { formData, lastSaved, saveDraft, clearDraft } = useReceivingDraftStore();

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CreateGRValues>({
    resolver: zodResolver(createGRSchema),
    defaultValues: {
      date: "",
      supplier_name: "",
      items: [{ product_id: "", qty: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Load draft on mount (once)
  useEffect(() => {
    if (!draftLoaded.current && formData) {
      reset(formData);
      draftLoaded.current = true;
    }
  }, [formData, reset]);

  const handleSaveDraft = async () => {
    const values = getValues();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    saveDraft(values);
    setIsSaving(false);
    toast.success("Draft tersimpan");
  };

  const handleCancel = () => {
    clearDraft();
    reset({ date: "", supplier_name: "", items: [{ product_id: "", qty: 0, notes: "" }] });
    router.push("/dashboard/receiving");
  };

  const handleFinalize = async (data: CreateGRValues) => {
    const stockErrors = checkAvailableStock(data.items);
    if (stockErrors.length > 0) {
      for (const err of stockErrors) {
        toast.error(
          `Stok ${err.product_name} tidak mencukupi (maks ${err.available}, diminta ${err.requested})`
        );
      }
      return;
    }

    setIsFinalizing(true);
    try {
      await simulateStockIncrement(data.items);
      clearDraft();

      // Build finalized GR object for PDF
      const gr: GoodsReceipt = {
        id: crypto.randomUUID(),
        gr_number: grNumber,
        date: data.date,
        supplier_name: data.supplier_name,
        status: "COMPLETED",
        created_by: "Staff",
        created_at: new Date().toISOString(),
        items: data.items.map((item, idx) => {
          const product = MOCK_PRODUCTS.find((p) => p.id === item.product_id);
          return {
            id: `item-${idx}`,
            product_id: item.product_id,
            product_name: product?.name ?? "Unknown",
            sku: product?.sku ?? "-",
            qty: item.qty,
            unit_name: product?.unit_name ?? "PCS",
            batch_no: null,
            notes: item.notes ?? null,
          };
        }),
      };

      setFinalizedGR(gr);
      toast.success("Penerimaan barang berhasil disimpan (COMPLETED)");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Buat Penerimaan Barang Baru</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{grNumber}</p>
        </div>
        {lastSaved && (
          <p className="text-xs text-muted-foreground">
            Draft tersimpan pada {new Date(lastSaved).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* PDF Download after finalize */}
      {finalizedGR && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800">GR berhasil disimpan!</p>
            <p className="text-xs text-emerald-600">Unduh slip penerimaan barang di bawah.</p>
          </div>
          <Button
            variant="outline"
            className="min-h-[44px] w-full sm:w-auto"
            disabled={isPdfGenerating}
            onClick={async () => {
              setIsPdfGenerating(true);
              try {
                const { pdf } = await import("@react-pdf/renderer");
                const blob = await pdf(<GRPdfSlip data={finalizedGR} />).toBlob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${finalizedGR.gr_number}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              } finally {
                setIsPdfGenerating(false);
              }
            }}
          >
            {isPdfGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Cetak Slip
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFinalize)} className="space-y-6">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nomor GR</Label>
            <Input value={grNumber} disabled readOnly className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Supplier <span className="text-destructive">*</span></Label>
          <Input placeholder="Nama supplier" {...register("supplier_name")} />
          {errors.supplier_name && <p className="text-xs text-destructive">{errors.supplier_name.message}</p>}
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Item Penerimaan</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] md:min-h-0"
              onClick={() => append({ product_id: "", qty: 0, notes: "" })}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Item
            </Button>
          </div>

          {errors.items?.root && (
            <p className="text-xs text-destructive">{errors.items.root.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <GRItemRow
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
        <div className="flex flex-col md:flex-row flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || !!finalizedGR}
            variant="outline"
            className="min-h-[44px] w-full md:w-auto"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan sebagai Draft
          </Button>
          <Button
            type="submit"
            disabled={isFinalizing || !!finalizedGR}
            className="min-h-[44px] w-full md:w-auto"
          >
            {isFinalizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Simpan &amp; Selesaikan
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="min-h-[44px] w-full md:w-auto"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
