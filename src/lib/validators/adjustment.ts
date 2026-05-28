import { z } from "zod";

/**
 * Zod schema for the Stock Adjustment creation form.
 * Validates product selection, actual stock quantity, reason, and optional notes.
 */
export const createAdjustmentSchema = z.object({
  product_id: z.string().min(1, "Produk wajib dipilih"),
  stok_aktual: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z
      .number({
        required_error: "Stok aktual wajib diisi",
        invalid_type_error: "Stok aktual harus berupa angka",
      })
      .int("Stok aktual harus bilangan bulat")
      .min(0, "Stok aktual tidak boleh negatif"),
  ),
  reason: z.string().min(1, "Alasan penyesuaian wajib diisi"),
  notes: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type CreateAdjustmentValues = z.infer<typeof createAdjustmentSchema>;
