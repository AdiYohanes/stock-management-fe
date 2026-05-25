export type GoodsReceiptStatus = "DRAFT" | "COMPLETED";

export interface GoodsReceiptItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  qty: number;
  unit_name: string;
  batch_no: string | null;
  notes: string | null;
}

export interface GoodsReceipt {
  id: string;
  gr_number: string;
  date: string;
  supplier_name: string;
  status: GoodsReceiptStatus;
  items: GoodsReceiptItem[];
  created_by: string;
  created_at: string;
}
