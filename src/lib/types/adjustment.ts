export type AdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdjustmentReason =
  | "RUSAK"
  | "HILANG"
  | "SELISIH_HITUNG"
  | "KADALUARSA"
  | "LAINNYA";

/** Label mapping for adjustment reasons (Bahasa Indonesia) */
export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  RUSAK: "Rusak",
  HILANG: "Hilang",
  SELISIH_HITUNG: "Selisih Hitung",
  KADALUARSA: "Kadaluarsa",
  LAINNYA: "Lainnya",
};

export interface StockAdjustment {
  id: string;
  adj_number: string;
  date: string;
  product_id: string;
  product_name: string;
  sku: string;
  reason: AdjustmentReason;
  qty_before: number;
  qty_after: number;
  notes: string | null;
  status: AdjustmentStatus;
  created_by: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
}
