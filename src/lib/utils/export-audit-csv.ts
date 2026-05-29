import { exportCsv } from "./export-csv";
import { formatDateTimeID } from "@/lib/formatters";
import type { AuditLog } from "@/lib/types/audit";

/** CSV column headers for audit export (Bahasa Indonesia) */
const AUDIT_CSV_HEADERS = [
  "Waktu",
  "User",
  "Aksi",
  "Entitas",
  "Detail Singkat",
] as const;

/**
 * Summarize old/new values into a short string for CSV readability.
 * Avoids raw JSON overflow in spreadsheet cells.
 */
function summarizeValues(log: AuditLog): string {
  const parts: string[] = [];

  if (log.old_values) {
    const keys = Object.keys(log.old_values);
    const summary = keys
      .slice(0, 3)
      .map((k) => `${k}: ${String(log.old_values![k])}`)
      .join("; ");
    parts.push(`Sebelum: ${summary}${keys.length > 3 ? " ..." : ""}`);
  }

  if (log.new_values) {
    const keys = Object.keys(log.new_values);
    const summary = keys
      .slice(0, 3)
      .map((k) => `${k}: ${String(log.new_values![k])}`)
      .join("; ");
    parts.push(`Sesudah: ${summary}${keys.length > 3 ? " ..." : ""}`);
  }

  if (parts.length === 0) {
    return log.description;
  }

  return parts.join(" | ");
}

/**
 * Transform an array of AuditLog entries into CSV rows.
 * Each row maps to AUDIT_CSV_HEADERS order.
 */
function buildAuditRows(logs: AuditLog[]): string[][] {
  return logs.map((log) => [
    formatDateTimeID(log.timestamp),
    `${log.user_name} (${log.user_role})`,
    log.action,
    `${log.entity_type} — ${log.entity_label}`,
    summarizeValues(log),
  ]);
}

/**
 * Export filtered audit logs to a CSV file.
 * Generates filename with current date for traceability.
 */
export function exportAuditCsv(logs: AuditLog[]): void {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `audit-trail-${dateStr}`;

  exportCsv({
    headers: [...AUDIT_CSV_HEADERS],
    rows: buildAuditRows(logs),
    filename,
  });
}
