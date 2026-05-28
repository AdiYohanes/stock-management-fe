/**
 * Mock product data with current stock quantities.
 * Used by the Stock Adjustment form to populate the product dropdown
 * and display the "Stok Sistem" (system stock) value.
 *
 * Consistent with MOCK_PRODUCTS from mock-products.ts.
 */

export interface MockProductStock {
  id: string;
  sku: string;
  name: string;
  current_stock_qty: number;
  unit: string;
}

export const MOCK_PRODUCTS_STOCK: MockProductStock[] = [
  {
    id: "1",
    sku: "BRG-001",
    name: "Beras Premium 5kg",
    current_stock_qty: 100,
    unit: "PCS",
  },
  {
    id: "2",
    sku: "BRG-002",
    name: "Minyak Goreng 2L",
    current_stock_qty: 75,
    unit: "PCS",
  },
  {
    id: "3",
    sku: "BRG-003",
    name: "Gula Pasir 1kg",
    current_stock_qty: 312,
    unit: "KG",
  },
  {
    id: "4",
    sku: "BRG-004",
    name: "Tepung Terigu 1kg",
    current_stock_qty: 150,
    unit: "KG",
  },
  {
    id: "5",
    sku: "BRG-005",
    name: "Sabun Cuci Piring",
    current_stock_qty: 192,
    unit: "PCS",
  },
  {
    id: "6",
    sku: "BRG-006",
    name: "Deterjen Bubuk 1kg",
    current_stock_qty: 88,
    unit: "KG",
  },
  {
    id: "7",
    sku: "BRG-007",
    name: "Kopi Bubuk 250g",
    current_stock_qty: 45,
    unit: "PCS",
  },
  {
    id: "8",
    sku: "BRG-008",
    name: "Teh Celup 25pcs",
    current_stock_qty: 60,
    unit: "BOX",
  },
  {
    id: "9",
    sku: "BRG-009",
    name: "Susu UHT 1L",
    current_stock_qty: 65,
    unit: "PCS",
  },
  {
    id: "10",
    sku: "BRG-010",
    name: "Mie Instan Goreng",
    current_stock_qty: 500,
    unit: "PCS",
  },
];
