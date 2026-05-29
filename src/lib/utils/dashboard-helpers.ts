import type {
  MockTransaction,
  TransactionType,
} from "@/lib/constants/mock-transactions";

// --- Types ---

export interface RecentActivity {
  id: string;
  type: TransactionType;
  referenceNumber: string;
  description: string;
  createdBy: string;
  createdAt: string;
  relativeTime: string;
}

// --- Relative Time Formatting ---

/**
 * Format a timestamp into a human-readable relative time string (Bahasa Indonesia).
 * - If less than 1 hour ago: "X menit yang lalu"
 * - If less than 24 hours ago: "X jam yang lalu"
 * - Otherwise: "DD MMM YYYY, HH:mm"
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return "Baru saja";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  }

  if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  }

  // Format as "DD MMM YYYY, HH:mm"
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(date);
}

// --- Transaction Type Labels ---

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  GR: "Penerimaan",
  GI: "Pengeluaran",
  ADJ: "Penyesuaian",
};

export function getTransactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type];
}

// --- Recent Activities Helper ---

/**
 * Get the 5 most recent transactions sorted by created_at descending.
 * Pure function — no side effects, no API calls.
 */
export function getRecentActivities(
  transactions: MockTransaction[],
): RecentActivity[] {
  return [...transactions]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      type: t.type,
      referenceNumber: t.reference_number,
      description: t.description,
      createdBy: t.created_by,
      createdAt: t.created_at,
      relativeTime: formatRelativeTime(t.created_at),
    }));
}
