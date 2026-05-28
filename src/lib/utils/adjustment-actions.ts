import type { StockAdjustment } from "@/lib/types/adjustment";

/**
 * Generate a unique adjustment number in format: ADJ-YYYYMMDD-XXXX
 * Uses WIB timezone (Asia/Jakarta) for date portion.
 */
export function generateAdjNumber(existingCount: number): string {
  const now = new Date();
  const jakartaDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const year = jakartaDate.getFullYear();
  const month = String(jakartaDate.getMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getDate()).padStart(2, "0");
  const seq = String(existingCount + 1).padStart(4, "0");
  return `ADJ-${year}${month}${day}-${seq}`;
}

/**
 * Generate a unique ID for a new adjustment.
 */
export function generateAdjId(): string {
  return `adj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if an adjustment can be approved or rejected.
 * Only PENDING adjustments can transition.
 */
export function canReview(adjustment: StockAdjustment): boolean {
  return adjustment.status === "PENDING";
}

/**
 * Validate rejection reason.
 * Must be between 3 and 300 characters.
 */
export function validateRejectionReason(reason: string): string | null {
  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return "Alasan penolakan minimal 3 karakter";
  }
  if (trimmed.length > 300) {
    return "Alasan penolakan maksimal 300 karakter";
  }
  return null;
}

/**
 * Log mock stock update to console (simulates backend stock mutation).
 */
export function logMockStockUpdate(adjustment: StockAdjustment): void {
  console.log(
    `✅ [MOCK] Stock updated: ${adjustment.product_name} ${adjustment.qty_before} → ${adjustment.qty_after}`,
  );
}
