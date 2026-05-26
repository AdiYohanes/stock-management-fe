import {
  MOCK_PRODUCTS_DISPATCHING,
  type MockProductWithStock,
} from "@/lib/constants/mock-products-dispatching";
import type { CreateGIValues } from "@/lib/validators/dispatching";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StockCheckItem {
  product_id: string;
  qty: number;
}

export interface StockCheckError {
  product_id: string;
  product_name: string;
  requested: number;
  available: number;
}

export interface FinalizeGIResult {
  success: boolean;
  gi_number: string;
  status: "COMPLETED";
  finalized_at: string;
}

// ─── Mutable In-Memory Stock ─────────────────────────────────────────────────

/** Local mutable copy of stock data — simulates DB state */
const mockStockData: MockProductWithStock[] = MOCK_PRODUCTS_DISPATCHING.map(
  (p) => ({ ...p }),
);

// ─── Public Functions ────────────────────────────────────────────────────────

/**
 * Check if requested quantities are available in mock stock.
 * Returns an array of errors for items where qty > available stock.
 * Empty array = all items pass stock check.
 */
export function checkAvailableStockGI(
  items: StockCheckItem[],
): StockCheckError[] {
  const errors: StockCheckError[] = [];

  for (const item of items) {
    const product = mockStockData.find((p) => p.id === item.product_id);

    if (!product) {
      errors.push({
        product_id: item.product_id,
        product_name: "Produk tidak ditemukan",
        requested: item.qty,
        available: 0,
      });
      continue;
    }

    if (item.qty > product.stock) {
      errors.push({
        product_id: item.product_id,
        product_name: product.name,
        requested: item.qty,
        available: product.stock,
      });
    }
  }

  return errors;
}

/**
 * Simulate GI finalization:
 * 1. Validates stock availability (throws if insufficient)
 * 2. Decrements mock stock
 * 3. Returns finalized GI metadata
 *
 * Simulates 600ms network delay.
 */
export function mockFinalizeGI(
  formData: CreateGIValues,
): Promise<FinalizeGIResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Final stock check before decrement
      const stockErrors = checkAvailableStockGI(
        formData.items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
        })),
      );

      if (stockErrors.length > 0) {
        reject(stockErrors);
        return;
      }

      // Decrement stock (atomic simulation)
      for (const item of formData.items) {
        const product = mockStockData.find((p) => p.id === item.product_id);
        if (product) {
          product.stock -= item.qty;
          console.log(
            `[Mock Stock GI] ${product.name}: -${item.qty} → sisa ${product.stock}`,
          );
        }
      }

      // Generate mock GI number (WIB timezone)
      const now = new Date();
      const wibDate = now.toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // Format: GI-YYYYMMDD-XXXX
      const [day, month, year] = wibDate.split("/");
      const giNumber = `GI-${year}${month}${day}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`;

      const result: FinalizeGIResult = {
        success: true,
        gi_number: giNumber,
        status: "COMPLETED",
        finalized_at: now.toISOString(),
      };

      console.log("[Mock Stock GI] Finalized:", result);
      resolve(result);
    }, 600);
  });
}

/**
 * Get current mock stock state (for debugging/verification).
 */
export function getMockStockGI(): MockProductWithStock[] {
  return mockStockData;
}
