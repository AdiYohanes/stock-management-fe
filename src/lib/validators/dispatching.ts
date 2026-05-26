import { z } from "zod";

export const giItemSchema = z.object({
  product_id: z.string().min(1, "Produk wajib dipilih"),
  qty: z.coerce.number().gt(0, "Qty harus lebih dari 0"),
  notes: z.string().optional(),
});

export const createGISchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  destination: z.string().max(200).optional(),
  items: z.array(giItemSchema).min(1, "Minimal 1 item"),
});

/**
 * Stricter schema for GI finalization.
 * All items must have a valid product_id and qty > 0.
 * Date must be a valid date string (not empty).
 */
const finalizeGIItemSchema = z.object({
  product_id: z.string().min(1, "Produk wajib dipilih untuk setiap item"),
  qty: z.coerce
    .number({ invalid_type_error: "Qty harus berupa angka" })
    .int("Qty harus bilangan bulat")
    .gt(0, "Qty harus lebih dari 0"),
  notes: z.string().optional(),
});

export const finalizeGISchema = z.object({
  date: z
    .string()
    .min(1, "Tanggal wajib diisi")
    .refine((val) => !isNaN(Date.parse(val)), "Format tanggal tidak valid"),
  destination: z.string().max(200, "Tujuan maksimal 200 karakter").optional(),
  items: z
    .array(finalizeGIItemSchema)
    .min(1, "Minimal 1 item untuk menyelesaikan pengeluaran")
    .refine(
      (items) => items.every((item) => item.product_id !== ""),
      "Semua item harus memiliki produk yang dipilih",
    )
    .refine(
      (items) => items.every((item) => item.qty > 0),
      "Semua item harus memiliki qty lebih dari 0",
    )
    .refine((items) => {
      const productIds = items.map((item) => item.product_id);
      return new Set(productIds).size === productIds.length;
    }, "Tidak boleh ada produk duplikat dalam satu transaksi"),
});

export type CreateGIValues = z.infer<typeof createGISchema>;
export type FinalizeGIValues = z.infer<typeof finalizeGISchema>;
export type GIItemValues = z.infer<typeof giItemSchema>;
