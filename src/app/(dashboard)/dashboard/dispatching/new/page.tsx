"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GIItemRow } from "@/components/features/dispatching/gi-item-row";
import {
  createGISchema,
  type CreateGIValues,
} from "@/lib/validators/dispatching";
import { useGIDraftStore } from "@/stores/gi-draft-store";

export default function NewDispatchingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const draftLoaded = useRef(false);

  const { formData, lastSaved, saveDraft, clearDraft } = useGIDraftStore();

  const {
    register,
    control,
    getValues,
    reset,
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

  // Load draft on mount (once)
  useEffect(() => {
    if (!draftLoaded.current && formData) {
      reset(formData);
      draftLoaded.current = true;
    }
  }, [formData, reset]);

  const handleSaveDraft = async () => {
    const values = getValues();
    // Draft validation: date must be filled AND at least 1 item with product_id
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

  const handleCancel = () => {
    clearDraft();
    reset({
      date: "",
      destination: "",
      items: [{ product_id: "", qty: 0, notes: "" }],
    });
    router.push("/dashboard/dispatching");
  };

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
          {/* GI Number (read-only placeholder) */}
          <div className="space-y-1.5">
            <Label htmlFor="gi_number">Nomor GI</Label>
            <Input
              id="gi_number"
              value="Auto-generated saat submit"
              disabled
              readOnly
              className="font-mono"
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
              className="min-h-[44px] md:min-h-0"
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
            disabled={isSaving}
            className="min-h-[44px] w-full sm:w-auto"
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
            disabled
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => toast.info("Fitur finalize belum tersedia")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Simpan &amp; Selesaikan
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
