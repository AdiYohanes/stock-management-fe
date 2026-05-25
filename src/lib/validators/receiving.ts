import { z } from "zod";

export const grItemSchema = z.object({
  product_id: z.string().min(1, "Produk wajib dipilih"),
  qty: z.coerce.number().gt(0, "Qty harus lebih dari 0"),
  notes: z.string().optional(),
});

export const createGRSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  supplier_name: z.string().min(1, "Supplier wajib diisi"),
  items: z.array(grItemSchema).min(1, "Minimal 1 item"),
});

export type CreateGRValues = z.infer<typeof createGRSchema>;
export type GRItemValues = z.infer<typeof grItemSchema>;
