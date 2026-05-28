import type { AdjustmentStatus } from "@/lib/types/adjustment";

/**
 * Status badge configuration — single source of truth for badge styling.
 * Consistent with Inventory (emerald for active) & Receiving (amber for draft) modules.
 */
export const STATUS_BADGE_CONFIG: Record<
  AdjustmentStatus,
  { className: string; label: string }
> = {
  PENDING: { className: "bg-amber-100 text-amber-800", label: "Menunggu" },
  APPROVED: {
    className: "bg-emerald-100 text-emerald-800",
    label: "Disetujui",
  },
  REJECTED: { className: "bg-red-100 text-red-800", label: "Ditolak" },
};

/** Fallback badge config for unknown/null status */
export const FALLBACK_BADGE_CONFIG = {
  className: "bg-gray-100 text-gray-800",
  label: "—",
};

/**
 * Format ISO date string to Indonesian locale date.
 * Returns "—" for null/undefined/invalid dates.
 */
export function formatDateSafe(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}
