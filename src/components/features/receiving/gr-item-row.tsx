"use client";

import { Trash2 } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PRODUCTS } from "@/lib/constants/mock-products";
import type { CreateGRValues } from "@/lib/validators/receiving";

interface GRItemRowProps {
  index: number;
  register: UseFormRegister<CreateGRValues>;
  errors: FieldErrors<CreateGRValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export function GRItemRow({ index, register, errors, onRemove, canRemove }: GRItemRowProps) {
  const itemErrors = errors.items?.[index];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_40px] gap-3 items-start">
      <div>
        <select
          {...register(`items.${index}.product_id`)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Pilih Produk --</option>
          {MOCK_PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} - {p.name} ({p.unit_name})
            </option>
          ))}
        </select>
        {itemErrors?.product_id && (
          <p className="text-xs text-destructive mt-1">{itemErrors.product_id.message}</p>
        )}
      </div>

      <div>
        <Input
          type="number"
          placeholder="Qty"
          min={1}
          {...register(`items.${index}.qty`)}
        />
        {itemErrors?.qty && (
          <p className="text-xs text-destructive mt-1">{itemErrors.qty.message}</p>
        )}
      </div>

      <div>
        <Input
          placeholder="Catatan (opsional)"
          {...register(`items.${index}.notes`)}
        />
      </div>

      <div>
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Hapus item">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
