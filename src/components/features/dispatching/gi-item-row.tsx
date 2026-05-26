"use client";

import { Trash2 } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PRODUCTS_DISPATCHING } from "@/lib/constants/mock-products-dispatching";
import type { CreateGIValues } from "@/lib/validators/dispatching";

interface GIItemRowProps {
  index: number;
  register: UseFormRegister<CreateGIValues>;
  errors: FieldErrors<CreateGIValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export function GIItemRow({
  index,
  register,
  errors,
  onRemove,
  canRemove,
}: GIItemRowProps) {
  const itemErrors = errors.items?.[index];

  return (
    <div className="rounded-md border border-border p-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_40px] gap-3 items-start">
        {/* Product select */}
        <div>
          <label htmlFor={`items.${index}.product_id`} className="sr-only">
            Produk baris {index + 1}
          </label>
          <select
            id={`items.${index}.product_id`}
            {...register(`items.${index}.product_id`)}
            aria-describedby={
              itemErrors?.product_id
                ? `items.${index}.product_id-error`
                : undefined
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">-- Pilih Produk --</option>
            {MOCK_PRODUCTS_DISPATCHING.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name} ({p.unit_name}) [Stok: {p.stock}]
              </option>
            ))}
          </select>
          {itemErrors?.product_id && (
            <p
              id={`items.${index}.product_id-error`}
              className="text-xs text-destructive mt-1"
            >
              {itemErrors.product_id.message}
            </p>
          )}
        </div>

        {/* Qty input */}
        <div>
          <label htmlFor={`items.${index}.qty`} className="sr-only">
            Qty baris {index + 1}
          </label>
          <Input
            id={`items.${index}.qty`}
            type="number"
            placeholder="Qty"
            min={1}
            aria-describedby={
              itemErrors?.qty ? `items.${index}.qty-error` : undefined
            }
            {...register(`items.${index}.qty`)}
          />
          {itemErrors?.qty && (
            <p
              id={`items.${index}.qty-error`}
              className="text-xs text-destructive mt-1"
            >
              {itemErrors.qty.message}
            </p>
          )}
        </div>

        {/* Notes input */}
        <div>
          <label htmlFor={`items.${index}.notes`} className="sr-only">
            Catatan baris {index + 1}
          </label>
          <Input
            id={`items.${index}.notes`}
            placeholder="Catatan (opsional)"
            {...register(`items.${index}.notes`)}
          />
        </div>

        {/* Remove button */}
        <div className="flex items-center justify-center h-10">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label={`Hapus item baris ${index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
