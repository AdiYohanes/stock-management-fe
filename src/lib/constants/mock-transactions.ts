export type TransactionType = "GR" | "GI" | "ADJ";

export interface MockTransaction {
  id: string;
  type: TransactionType;
  reference_number: string;
  date: string;
  description: string;
  created_by: string;
  created_at: string;
}

/**
 * Mock transactions for dashboard aggregation.
 * Includes GR (Goods Receipt), GI (Goods Issue), and ADJ (Adjustment).
 * Some entries use today's date for "Transaksi Hari Ini" widget testing.
 */
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  // Today's transactions (use dynamic date in aggregation)
  {
    id: "t-1",
    type: "GR",
    reference_number: "GR-20260529-0001",
    date: "2026-05-29",
    description: "Penerimaan dari PT Sumber Makmur",
    created_by: "Andi Pratama",
    created_at: "2026-05-29T08:30:00",
  },
  {
    id: "t-2",
    type: "GI",
    reference_number: "GI-20260529-0001",
    date: "2026-05-29",
    description: "Pengeluaran ke Divisi Marketing",
    created_by: "Dewi Lestari",
    created_at: "2026-05-29T09:15:00",
  },
  {
    id: "t-3",
    type: "ADJ",
    reference_number: "ADJ-20260529-0001",
    date: "2026-05-29",
    description: "Penyesuaian stok Beras Premium",
    created_by: "Siti Rahayu",
    created_at: "2026-05-29T10:00:00",
  },
  {
    id: "t-4",
    type: "GR",
    reference_number: "GR-20260529-0002",
    date: "2026-05-29",
    description: "Penerimaan dari CV Jaya Abadi",
    created_by: "Andi Pratama",
    created_at: "2026-05-29T11:45:00",
  },
  {
    id: "t-5",
    type: "GI",
    reference_number: "GI-20260529-0002",
    date: "2026-05-29",
    description: "Pengeluaran ke Cabang Surabaya",
    created_by: "Dewi Lestari",
    created_at: "2026-05-29T14:20:00",
  },
  // Yesterday
  {
    id: "t-6",
    type: "GR",
    reference_number: "GR-20260528-0001",
    date: "2026-05-28",
    description: "Penerimaan dari UD Berkah Sentosa",
    created_by: "Andi Pratama",
    created_at: "2026-05-28T08:00:00",
  },
  {
    id: "t-7",
    type: "GI",
    reference_number: "GI-20260528-0001",
    date: "2026-05-28",
    description: "Pengeluaran ke Divisi Produksi",
    created_by: "Dewi Lestari",
    created_at: "2026-05-28T10:30:00",
  },
  // Older
  {
    id: "t-8",
    type: "ADJ",
    reference_number: "ADJ-20260527-0001",
    date: "2026-05-27",
    description: "Koreksi stok Minyak Goreng",
    created_by: "Siti Rahayu",
    created_at: "2026-05-27T09:00:00",
  },
  {
    id: "t-9",
    type: "GR",
    reference_number: "GR-20260526-0001",
    date: "2026-05-26",
    description: "Penerimaan dari PT Indo Jaya",
    created_by: "Andi Pratama",
    created_at: "2026-05-26T08:15:00",
  },
  {
    id: "t-10",
    type: "GI",
    reference_number: "GI-20260525-0001",
    date: "2026-05-25",
    description: "Pengeluaran ke Gudang Cabang",
    created_by: "Dewi Lestari",
    created_at: "2026-05-25T13:00:00",
  },
];
