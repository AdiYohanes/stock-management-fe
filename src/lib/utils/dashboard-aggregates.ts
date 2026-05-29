import type { Product } from "@/lib/validators/product";
import type { MockUser } from "@/lib/constants/mock-users";
import type { MockTransaction } from "@/lib/constants/mock-transactions";

// --- Interfaces ---

export interface TotalProductSummary {
  /** Total unique active SKUs */
  totalSku: number;
  /** Total inventory valuation (stock_qty * cost_price) */
  totalValue: number;
}

export interface LowStockSummary {
  /** Count of products where stock_qty <= stock_min (and stock_min > 0) */
  count: number;
}

export interface TodayTransactionSummary {
  /** Total transactions (GR + GI + ADJ) for today */
  count: number;
}

export interface ActiveUserSummary {
  /** Count of users with status AKTIF */
  count: number;
}

export interface DashboardSummary {
  totalProduct: TotalProductSummary;
  lowStock: LowStockSummary;
  todayTransaction: TodayTransactionSummary;
  activeUser: ActiveUserSummary;
}

// --- Pure Aggregation Functions ---

/**
 * Calculate total active SKUs and inventory valuation.
 * Valuation = sum of (stock_qty * cost_price) for all active products.
 */
export function aggregateTotalProducts(
  products: Product[],
): TotalProductSummary {
  const activeProducts = products.filter((p) => p.is_active);

  const totalValue = activeProducts.reduce(
    (sum, p) => sum + p.stock_qty * p.cost_price,
    0,
  );

  return {
    totalSku: activeProducts.length,
    totalValue,
  };
}

/**
 * Count products with low stock (stock_qty <= stock_min where stock_min > 0).
 * Includes products with stock_qty === 0 if stock_min > 0.
 */
export function aggregateLowStock(products: Product[]): LowStockSummary {
  const count = products.filter(
    (p) => p.is_active && p.stock_min > 0 && p.stock_qty <= p.stock_min,
  ).length;

  return { count };
}

/**
 * Count transactions for today's date.
 * Compares transaction date (YYYY-MM-DD) against current local date.
 */
export function aggregateTodayTransactions(
  transactions: MockTransaction[],
): TodayTransactionSummary {
  const today = new Date().toISOString().split("T")[0];

  const count = transactions.filter((t) => t.date === today).length;

  return { count };
}

/**
 * Count users with status AKTIF.
 */
export function aggregateActiveUsers(users: MockUser[]): ActiveUserSummary {
  const count = users.filter((u) => u.status === "AKTIF").length;

  return { count };
}

/**
 * Compute all dashboard summary aggregates from mock data sources.
 */
export function computeDashboardSummary(
  products: Product[],
  transactions: MockTransaction[],
  users: MockUser[],
): DashboardSummary {
  return {
    totalProduct: aggregateTotalProducts(products),
    lowStock: aggregateLowStock(products),
    todayTransaction: aggregateTodayTransactions(transactions),
    activeUser: aggregateActiveUsers(users),
  };
}
