"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRItemRow } from "@/components/features/receiving/gr-item-row";
import { createGRSchema, type CreateGRValues } from "@/lib/validators/receiving";
import { useReceivingDraftStore } from "@/stores/receiving-draft-store";

export default function NewReceivingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const draftLoaded = useRef(false);

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

  const handleFinalize = () => {
    toast.info("Fitur finalize belum tersedia di Task 3");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Penerimaan Barang Baru</h1>
        {lastSaved && (
          <p className="text-xs text-muted-foreground">
            Draft tersimpan pada {new Date(lastSaved).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFinalize)} className="space-y-6">
        {/* Header Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nomor GR</Label>
            <Input value="Auto-generated saat submit" disabled readOnly />
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
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSaveDraft} disabled={isSaving} variant="outline">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan sebagai Draft
          </Button>
          <Button type="submit" disabled>
            Simpan &amp; Selesaikan
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
