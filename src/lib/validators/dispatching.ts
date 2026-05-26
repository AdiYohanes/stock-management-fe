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

export type CreateGIValues = z.infer<typeof createGISchema>;
export type GIItemValues = z.infer<typeof giItemSchema>;
