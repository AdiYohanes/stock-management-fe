/**
 * Mock products for the dispatching (GI) form dropdown.
 * Consistent with MOCK_PRODUCTS from the inventory module — includes mock stock for display only.
 */
export interface MockProductWithStock {
  id: string;
  sku: string;
  name: string;
  unit_name: string;
  stock: number;
}

export const MOCK_PRODUCTS_DISPATCHING: MockProductWithStock[] = [
  {
    id: "1",
    sku: "BRG-001",
    name: "Beras Premium 5kg",
    unit_name: "PCS",
    stock: 150,
  },
  {
    id: "2",
    sku: "BRG-002",
    name: "Minyak Goreng 2L",
    unit_name: "PCS",
    stock: 80,
  },
  {
    id: "3",
    sku: "BRG-003",
    name: "Gula Pasir 1kg",
    unit_name: "KG",
    stock: 200,
  },
  {
    id: "4",
    sku: "BRG-004",
    name: "Tepung Terigu 1kg",
    unit_name: "KG",
    stock: 120,
  },
  {
    id: "5",
    sku: "BRG-005",
    name: "Sabun Cuci Piring",
    unit_name: "PCS",
    stock: 95,
  },
  {
    id: "6",
    sku: "BRG-006",
    name: "Deterjen Bubuk 1kg",
    unit_name: "KG",
    stock: 60,
  },
  {
    id: "7",
    sku: "BRG-007",
    name: "Kopi Bubuk 250g",
    unit_name: "PCS",
    stock: 45,
  },
  {
    id: "8",
    sku: "BRG-008",
    name: "Teh Celup 25pcs",
    unit_name: "BOX",
    stock: 30,
  },
  {
    id: "9",
    sku: "BRG-009",
    name: "Susu UHT 1L",
    unit_name: "PCS",
    stock: 110,
  },
  {
    id: "10",
    sku: "BRG-010",
    name: "Mie Instan Goreng",
    unit_name: "PCS",
    stock: 500,
  },
];
