"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/ui/form-alert";
import {
  createProductSchema,
  type CreateProductValues,
  type Product,
} from "@/lib/validators/product";
import { useCreateProduct, useUpdateProduct, MOCK_CATEGORIES, MOCK_UNITS } from "@/lib/api/products";
import { formatNumber } from "@/lib/formatters";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const isEdit = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              sku: product.sku,
              name: product.name,
              category_id: product.category_id ?? undefined,
              unit_id: product.unit_id,
              barcode: product.barcode ?? undefined,
              stock_min: product.stock_min,
              stock_max: product.stock_max,
              cost_price: product.cost_price,
              selling_price: product.selling_price,
            }
          : {
              sku: "",
              name: "",
              category_id: undefined,
              unit_id: "",
              barcode: undefined,
              stock_min: 0,
              stock_max: 0,
              cost_price: 0,
              selling_price: 0,
            }
      );
    }
  }, [open, product, reset]);

  const onSubmit = async (values: CreateProductValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: product.id, values });
        toast.success("Produk berhasil diperbarui");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Produk berhasil ditambahkan");
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes("SKU")) {
        setError("sku", { message: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  /** Format number on blur for price/stock fields */
  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value.replace(/\D/g, ""));
    if (!isNaN(raw) && raw > 0) {
      e.target.value = formatNumber(raw);
    }
  };

  /** Strip formatting on focus */
  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "");
    e.target.value = raw;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* SKU + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SKU" error={errors.sku?.message} required>
              <Input {...register("sku")} disabled={isPending} aria-describedby={errors.sku ? "sku-err" : undefined} />
            </Field>
            <Field label="Nama Produk" error={errors.name?.message} required>
              <Input {...register("name")} disabled={isPending} />
            </Field>
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Kategori">
              <select {...register("category_id")} disabled={isPending} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">-- Pilih Kategori --</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Satuan" error={errors.unit_id?.message} required>
              <select {...register("unit_id")} disabled={isPending} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">-- Pilih Satuan --</option>
                {MOCK_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Barcode */}
          <Field label="Barcode">
            <Input {...register("barcode")} disabled={isPending} placeholder="Opsional" />
          </Field>

          {/* Stock min/max */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stok Minimum">
              <Input type="number" {...register("stock_min", { valueAsNumber: true })} disabled={isPending} min={0} />
            </Field>
            <Field label="Stok Maksimum">
              <Input type="number" {...register("stock_max", { valueAsNumber: true })} disabled={isPending} min={0} />
            </Field>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Harga Beli">
              <Input
                type="text"
                inputMode="numeric"
                {...register("cost_price", { valueAsNumber: true })}
                disabled={isPending}
                onBlur={handleNumberBlur}
                onFocus={handleNumberFocus}
              />
            </Field>
            <Field label="Harga Jual">
              <Input
                type="text"
                inputMode="numeric"
                {...register("selling_price", { valueAsNumber: true })}
                disabled={isPending}
                onBlur={handleNumberBlur}
                onFocus={handleNumberFocus}
              />
            </Field>
          </div>

          {/* API error */}
          {(createMutation.error || updateMutation.error) && (
            <FormAlert
              variant="error"
              message={
                (createMutation.error ?? updateMutation.error)?.message ?? "Terjadi kesalahan"
              }
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Form field wrapper */
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
