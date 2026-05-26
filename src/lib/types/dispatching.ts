export type GoodsIssueStatus = "DRAFT" | "COMPLETED";

export interface GoodsIssueItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  qty: number;
  unit_name: string;
  notes: string | null;
}

export interface GoodsIssue {
  id: string;
  gi_number: string;
  date: string;
  destination: string;
  status: GoodsIssueStatus;
  items: GoodsIssueItem[];
  created_by: string;
  created_at: string;
}
