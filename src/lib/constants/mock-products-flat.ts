/**
 * Flat mock product data for the Inventory Valuation Report.
 * Contains 18 products across 5 categories with realistic stock_qty and cost_price.
 * Used for client-side aggregation per category.
 */

export interface FlatProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock_qty: number;
  cost_price: number;
}

export const MOCK_PRODUCTS_FLAT: FlatProduct[] = [
  // Bahan Pokok (5 items)
  {
    id: "fp-01",
    sku: "BP-001",
    name: "Beras Premium 5kg",
    category: "Bahan Pokok",
    unit: "PCS",
    stock_qty: 120,
    cost_price: 65000,
  },
  {
    id: "fp-02",
    sku: "BP-002",
    name: "Minyak Goreng 2L",
    category: "Bahan Pokok",
    unit: "PCS",
    stock_qty: 85,
    cost_price: 32000,
  },
  {
    id: "fp-03",
    sku: "BP-003",
    name: "Gula Pasir 1kg",
    category: "Bahan Pokok",
    unit: "KG",
    stock_qty: 200,
    cost_price: 14500,
  },
  {
    id: "fp-04",
    sku: "BP-004",
    name: "Tepung Terigu 1kg",
    category: "Bahan Pokok",
    unit: "KG",
    stock_qty: 150,
    cost_price: 12000,
  },
  {
    id: "fp-05",
    sku: "BP-005",
    name: "Garam Halus 500g",
    category: "Bahan Pokok",
    unit: "PCS",
    stock_qty: 300,
    cost_price: 5000,
  },
  // Kebersihan (4 items)
  {
    id: "fp-06",
    sku: "KB-001",
    name: "Sabun Cuci Piring 750ml",
    category: "Kebersihan",
    unit: "PCS",
    stock_qty: 60,
    cost_price: 8500,
  },
  {
    id: "fp-07",
    sku: "KB-002",
    name: "Deterjen Bubuk 1kg",
    category: "Kebersihan",
    unit: "KG",
    stock_qty: 90,
    cost_price: 22000,
  },
  {
    id: "fp-08",
    sku: "KB-003",
    name: "Pewangi Pakaian 900ml",
    category: "Kebersihan",
    unit: "PCS",
    stock_qty: 45,
    cost_price: 15000,
  },
  {
    id: "fp-09",
    sku: "KB-004",
    name: "Pembersih Lantai 1L",
    category: "Kebersihan",
    unit: "PCS",
    stock_qty: 35,
    cost_price: 18000,
  },
  // Minuman (4 items)
  {
    id: "fp-10",
    sku: "MN-001",
    name: "Kopi Bubuk 250g",
    category: "Minuman",
    unit: "PCS",
    stock_qty: 75,
    cost_price: 18000,
  },
  {
    id: "fp-11",
    sku: "MN-002",
    name: "Teh Celup 25pcs",
    category: "Minuman",
    unit: "BOX",
    stock_qty: 110,
    cost_price: 9500,
  },
  {
    id: "fp-12",
    sku: "MN-003",
    name: "Susu UHT 1L",
    category: "Minuman",
    unit: "PCS",
    stock_qty: 60,
    cost_price: 16000,
  },
  {
    id: "fp-13",
    sku: "MN-004",
    name: "Sirup Rasa Buah 650ml",
    category: "Minuman",
    unit: "PCS",
    stock_qty: 40,
    cost_price: 12500,
  },
  // Makanan Instan (3 items)
  {
    id: "fp-14",
    sku: "MI-001",
    name: "Mie Instan Goreng",
    category: "Makanan Instan",
    unit: "PCS",
    stock_qty: 500,
    cost_price: 2800,
  },
  {
    id: "fp-15",
    sku: "MI-002",
    name: "Mie Instan Kuah Soto",
    category: "Makanan Instan",
    unit: "PCS",
    stock_qty: 350,
    cost_price: 2800,
  },
  {
    id: "fp-16",
    sku: "MI-003",
    name: "Sarden Kaleng 155g",
    category: "Makanan Instan",
    unit: "PCS",
    stock_qty: 80,
    cost_price: 14000,
  },
  // Peralatan (2 items)
  {
    id: "fp-17",
    sku: "PR-001",
    name: "Sapu Ijuk",
    category: "Peralatan",
    unit: "PCS",
    stock_qty: 25,
    cost_price: 28000,
  },
  {
    id: "fp-18",
    sku: "PR-002",
    name: "Ember Plastik 20L",
    category: "Peralatan",
    unit: "PCS",
    stock_qty: 18,
    cost_price: 35000,
  },
];

/** Unique categories derived from flat mock data */
export const FLAT_PRODUCT_CATEGORIES: string[] = Array.from(
  new Set(MOCK_PRODUCTS_FLAT.map((p) => p.category)),
);
