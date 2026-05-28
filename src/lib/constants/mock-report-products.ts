/**
 * Mock product data for the Current Stock Report page.
 * Includes cost_price and stock_min for inventory valuation and status calculation.
 */

export interface ReportProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock_qty: number;
  stock_min: number;
  cost_price: number;
}

export const MOCK_REPORT_PRODUCTS: ReportProduct[] = [
  {
    id: "1",
    sku: "BRG-001",
    name: "Beras Premium 5kg",
    category: "Bahan Pokok",
    unit: "PCS",
    stock_qty: 100,
    stock_min: 20,
    cost_price: 65000,
  },
  {
    id: "2",
    sku: "BRG-002",
    name: "Minyak Goreng 2L",
    category: "Bahan Pokok",
    unit: "PCS",
    stock_qty: 75,
    stock_min: 15,
    cost_price: 32000,
  },
  {
    id: "3",
    sku: "BRG-003",
    name: "Gula Pasir 1kg",
    category: "Bahan Pokok",
    unit: "KG",
    stock_qty: 312,
    stock_min: 50,
    cost_price: 14500,
  },
  {
    id: "4",
    sku: "BRG-004",
    name: "Tepung Terigu 1kg",
    category: "Bahan Pokok",
    unit: "KG",
    stock_qty: 8,
    stock_min: 30,
    cost_price: 12000,
  },
  {
    id: "5",
    sku: "BRG-005",
    name: "Sabun Cuci Piring 750ml",
    category: "Kebersihan",
    unit: "PCS",
    stock_qty: 0,
    stock_min: 10,
    cost_price: 8500,
  },
  {
    id: "6",
    sku: "BRG-006",
    name: "Deterjen Bubuk 1kg",
    category: "Kebersihan",
    unit: "KG",
    stock_qty: 88,
    stock_min: 20,
    cost_price: 22000,
  },
  {
    id: "7",
    sku: "BRG-007",
    name: "Kopi Bubuk 250g",
    category: "Minuman",
    unit: "PCS",
    stock_qty: 5,
    stock_min: 10,
    cost_price: 18000,
  },
  {
    id: "8",
    sku: "BRG-008",
    name: "Teh Celup 25pcs",
    category: "Minuman",
    unit: "BOX",
    stock_qty: 60,
    stock_min: 15,
    cost_price: 9500,
  },
  {
    id: "9",
    sku: "BRG-009",
    name: "Susu UHT 1L",
    category: "Minuman",
    unit: "PCS",
    stock_qty: 0,
    stock_min: 20,
    cost_price: 16000,
  },
  {
    id: "10",
    sku: "BRG-010",
    name: "Mie Instan Goreng",
    category: "Makanan Instan",
    unit: "PCS",
    stock_qty: 500,
    stock_min: 100,
    cost_price: 2800,
  },
];

/** Unique categories derived from mock data */
export const REPORT_CATEGORIES: string[] = Array.from(
  new Set(MOCK_REPORT_PRODUCTS.map((p) => p.category)),
);
