import { MOCK_PRODUCTS } from "@/lib/constants/mock-products";

interface StockRecord {
  product_id: string;
  available_qty: number;
}

// Mutable in-memory stock data
const mockStock: StockRecord[] = MOCK_PRODUCTS.map((p) => ({
  product_id: p.id,
  available_qty: 100, // default 100 units each
}));

interface StockCheckItem {
  product_id: string;
  qty: number;
}

interface StockError {
  product_id: string;
  product_name: string;
  requested: number;
  available: number;
}

/**
 * Check if incoming qty exceeds a max threshold (500 per product).
 * For GR (receiving), we validate that qty doesn't exceed a reasonable max.
 */
export function checkAvailableStock(items: StockCheckItem[]): StockError[] {
  const MAX_RECEIVE_QTY = 500;
  const errors: StockError[] = [];

  for (const item of items) {
    if (item.qty > MAX_RECEIVE_QTY) {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.product_id);
      errors.push({
        product_id: item.product_id,
        product_name: product?.name ?? "Unknown",
        requested: item.qty,
        available: MAX_RECEIVE_QTY,
      });
    }
  }

  return errors;
}

/**
 * Simulate stock increment after GR finalization.
 * Returns a promise that resolves after 600ms delay.
 */
export function simulateStockIncrement(
  items: StockCheckItem[]
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      for (const item of items) {
        const record = mockStock.find((s) => s.product_id === item.product_id);
        if (record) {
          record.available_qty += item.qty;
          console.log(
            `[Mock Stock] ${item.product_id}: +${item.qty} → total ${record.available_qty}`
          );
        }
      }
      resolve();
    }, 600);
  });
}

/** Get current mock stock (for debugging) */
export function getMockStock(): StockRecord[] {
  return mockStock;
}
