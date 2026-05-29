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

/** Maximum character length for a single CSV cell value before truncation */
const CSV_CELL_MAX_LENGTH = 100;

/**
 * Sanitize and truncate a string value for safe CSV output.
 * - Truncates to CSV_CELL_MAX_LENGTH characters with "..." suffix
 * - Handles special characters (commas, quotes, newlines) via the shared exportCsv utility
 *
 * Per RFC 4180: fields containing commas, double-quotes, or line breaks
 * are wrapped in double-quotes, with internal quotes escaped as "".
 * The shared `exportCsv` utility handles the wrapping/escaping;
 * this function only handles truncation for readability in spreadsheets.
 */
function sanitizeCsvCellValue(value: string): string {
  if (value.length <= CSV_CELL_MAX_LENGTH) {
    return value;
  }
  return value.slice(0, CSV_CELL_MAX_LENGTH) + "...";
}

/**
 * Summarize old/new values into a short string for CSV readability.
 * Avoids raw JSON overflow in spreadsheet cells.
 * Truncates output to CSV_CELL_MAX_LENGTH to prevent cell overflow in Excel.
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
    return sanitizeCsvCellValue(log.description);
  }

  return sanitizeCsvCellValue(parts.join(" | "));
}

/**
 * Transform an array of AuditLog entries into CSV rows.
 * Each row maps to AUDIT_CSV_HEADERS order.
 * All cell values are sanitized for CSV compatibility (truncation + safe characters).
 */
function buildAuditRows(logs: AuditLog[]): string[][] {
  return logs.map((log) => [
    formatDateTimeID(log.timestamp),
    sanitizeCsvCellValue(`${log.user_name} (${log.user_role})`),
    log.action,
    sanitizeCsvCellValue(`${log.entity_type} — ${log.entity_label}`),
    summarizeValues(log),
  ]);
}

/**
 * Export filtered audit logs to a CSV file.
 * Generates filename with current date for traceability.
 *
 * // TODO: Replace with backend API endpoint — POST /api/v1/audit/export
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
