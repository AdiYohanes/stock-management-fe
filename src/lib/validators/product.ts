import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi"),
  name: z.string().min(1, "Nama produk wajib diisi"),
  category_id: z.string().optional(),
  unit_id: z.string().min(1, "Satuan wajib dipilih"),
  barcode: z.string().optional(),
  stock_min: z.coerce.number().min(0).default(0),
  stock_max: z.coerce.number().min(0).default(0),
  cost_price: z.coerce.number().min(0).default(0),
  selling_price: z.coerce.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema;

export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  unit_id: string;
  unit_name: string;
  barcode: string | null;
  stock_qty: number;
  stock_min: number;
  stock_max: number;
  cost_price: number;
  selling_price: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductListMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ProductListResponse {
  success: true;
  data: Product[];
  meta: ProductListMeta;
}

export type StockStatus = "normal" | "warning" | "danger";

export function getStockStatus(qty: number, min: number): StockStatus {
  if (qty === 0) return "danger";
  if (min > 0 && qty <= min) return "warning";
  return "normal";
}
