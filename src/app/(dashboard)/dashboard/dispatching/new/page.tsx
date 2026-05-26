"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GIItemRow } from "@/components/features/dispatching/gi-item-row";
import {
  createGISchema,
  type CreateGIValues,
} from "@/lib/validators/dispatching";

export default function NewDispatchingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
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

  const onSubmit = async (data: CreateGIValues) => {
    setIsSubmitting(true);

    // Simulate loading delay (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);

    // Mock submit — no API call, no state save, no redirect
    toast.success("Form valid! (Mock submit, belum ada API)", {
      description: `${data.items.length} item akan dikeluarkan ke "${data.destination || "-"}"`,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 md:px-0">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          Buat Pengeluaran Barang (GI) Baru
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Isi form di bawah untuk membuat transaksi pengeluaran barang.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="min-h-[44px] w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Pengeluaran
          </Button>
        </div>
      </form>
    </div>
  );
}
