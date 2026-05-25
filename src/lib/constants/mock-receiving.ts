import type { GoodsReceipt } from "@/lib/types/receiving";

export const MOCK_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: "gr-1",
    gr_number: "GR-20260522-0001",
    date: "2026-05-22",
    supplier_name: "PT Sumber Makmur",
    status: "COMPLETED",
    created_by: "Admin",
    created_at: "2026-05-22T08:30:00",
    items: [
      { id: "gi-1", product_id: "1", product_name: "Beras Premium 5kg", sku: "BRG-001", qty: 100, unit_name: "PCS", batch_no: "BATCH-2026A", notes: null },
      { id: "gi-2", product_id: "2", product_name: "Minyak Goreng 2L", sku: "BRG-002", qty: 50, unit_name: "PCS", batch_no: "BATCH-2026B", notes: "Expired 2027-06" },
    ],
  },
  {
    id: "gr-2",
    gr_number: "GR-20260522-0002",
    date: "2026-05-22",
    supplier_name: "CV Jaya Abadi",
    status: "COMPLETED",
    created_by: "Admin",
    created_at: "2026-05-22T10:15:00",
    items: [
      { id: "gi-3", product_id: "5", product_name: "Sabun Cuci Piring", sku: "BRG-005", qty: 200, unit_name: "PCS", batch_no: null, notes: null },
      { id: "gi-4", product_id: "6", product_name: "Deterjen Bubuk 1kg", sku: "BRG-006", qty: 75, unit_name: "KG", batch_no: "DET-0526", notes: null },
      { id: "gi-5", product_id: "7", product_name: "Kopi Bubuk 250g", sku: "BRG-007", qty: 120, unit_name: "PCS", batch_no: null, notes: "Promo supplier" },
    ],
  },
  {
    id: "gr-3",
    gr_number: "GR-20260523-0001",
    date: "2026-05-23",
    supplier_name: "PT Sumber Makmur",
    status: "DRAFT",
    created_by: "Staff",
    created_at: "2026-05-23T09:00:00",
    items: [
      { id: "gi-6", product_id: "3", product_name: "Gula Pasir 1kg", sku: "BRG-003", qty: 300, unit_name: "KG", batch_no: "GP-0523", notes: null },
      { id: "gi-7", product_id: "4", product_name: "Tepung Terigu 1kg", sku: "BRG-004", qty: 150, unit_name: "KG", batch_no: null, notes: "Cek kualitas" },
    ],
  },
  {
    id: "gr-4",
    gr_number: "GR-20260524-0001",
    date: "2026-05-24",
    supplier_name: "UD Berkah Sentosa",
    status: "DRAFT",
    created_by: "Staff",
    created_at: "2026-05-24T14:20:00",
    items: [
      { id: "gi-8", product_id: "9", product_name: "Susu UHT 1L", sku: "BRG-009", qty: 80, unit_name: "PCS", batch_no: "UHT-0524", notes: "Cold storage" },
      { id: "gi-9", product_id: "10", product_name: "Mie Instan Goreng", sku: "BRG-010", qty: 500, unit_name: "PCS", batch_no: null, notes: null },
    ],
  },
];
