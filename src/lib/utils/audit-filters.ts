import type { AuditLog, AuditAction, AuditEntity } from "@/lib/types/audit";

/** Filter criteria for audit log entries */
export interface AuditFilterCriteria {
  dateFrom: string | null; // ISO date string (start of day)
  dateTo: string | null; // ISO date string (end of day)
  entityType: AuditEntity | "ALL";
  action: AuditAction | "ALL";
  userName: string | "ALL";
  searchQuery: string;
}

/** Default filter values (shows all data) */
export const DEFAULT_AUDIT_FILTERS: AuditFilterCriteria = {
  dateFrom: null,
  dateTo: null,
  entityType: "ALL",
  action: "ALL",
  userName: "ALL",
  searchQuery: "",
};

/** Maximum allowed date range in days */
export const MAX_DATE_RANGE_DAYS = 90;

/**
 * Validates that the date range does not exceed MAX_DATE_RANGE_DAYS.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateDateRange(
  dateFrom: string | null,
  dateTo: string | null,
): string | null {
  if (!dateFrom || !dateTo) return null;

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;

  const diffMs = to.getTime() - from.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > MAX_DATE_RANGE_DAYS) {
    return `Maksimal rentang tanggal ${MAX_DATE_RANGE_DAYS} hari`;
  }

  return null;
}

/**
 * Apply all filter criteria to an array of audit logs.
 * Pure function — no side effects.
 */
export function applyAuditFilters(
  logs: AuditLog[],
  filters: AuditFilterCriteria,
): AuditLog[] {
  return logs.filter((log) => {
    // Date range filter
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (logDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (logDate > toDate) return false;
    }

    // Entity type filter
    if (
      filters.entityType !== "ALL" &&
      log.entity_type !== filters.entityType
    ) {
      return false;
    }

    // Action filter
    if (filters.action !== "ALL" && log.action !== filters.action) {
      return false;
    }

    // User filter
    if (filters.userName !== "ALL" && log.user_name !== filters.userName) {
      return false;
    }

    // Search query filter (min 2 chars to trigger)
    if (filters.searchQuery.length >= 2) {
      const query = filters.searchQuery.toLowerCase();
      const searchableFields = [
        log.user_name,
        log.entity_label,
        log.entity_type,
        log.description,
        log.action,
      ];
      const matches = searchableFields.some((field) =>
        field.toLowerCase().includes(query),
      );
      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Extract unique user names from audit logs for the user filter dropdown.
 */
export function getUniqueUsers(logs: AuditLog[]): string[] {
  const users = new Set(logs.map((log) => log.user_name));
  return Array.from(users).sort();
}
