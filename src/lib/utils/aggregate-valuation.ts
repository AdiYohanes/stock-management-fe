/**
 * Client-side aggregation helper for Inventory Valuation Report.
 * Groups flat product data by category and computes summary metrics.
 * Separated from UI component for reusability and testability.
 */

import type { FlatProduct } from "@/lib/constants/mock-products-flat";

/** Aggregated valuation row per category */
export interface ValuationRow {
  category: string;
  sku_count: number;
  total_stock: number;
  inventory_value: number;
}

/**
 * Aggregate flat product list by category.
 * Computes: number of SKUs, total stock units, and inventory value (∑ stock_qty × cost_price).
 *
 * @param products - Flat product array to aggregate
 * @returns Array of ValuationRow sorted alphabetically by category
 */
export function aggregateByCategory(products: FlatProduct[]): ValuationRow[] {
  const categoryMap = products.reduce<Map<string, ValuationRow>>(
    (acc, product) => {
      const existing = acc.get(product.category);

      if (existing) {
        existing.sku_count += 1;
        existing.total_stock += product.stock_qty;
        existing.inventory_value += product.stock_qty * product.cost_price;
      } else {
        acc.set(product.category, {
          category: product.category,
          sku_count: 1,
          total_stock: product.stock_qty,
          inventory_value: product.stock_qty * product.cost_price,
        });
      }

      return acc;
    },
    new Map(),
  );

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.category.localeCompare(b.category, "id"),
  );
}

/**
 * Filter aggregated valuation rows by category.
 * Returns all rows if categoryFilter is empty string.
 *
 * @param rows - Aggregated valuation rows
 * @param categoryFilter - Category name to filter, or empty string for all
 * @returns Filtered array of ValuationRow
 */
export function filterValuationRows(
  rows: ValuationRow[],
  categoryFilter: string,
): ValuationRow[] {
  if (!categoryFilter) return rows;
  return rows.filter((row) => row.category === categoryFilter);
}
