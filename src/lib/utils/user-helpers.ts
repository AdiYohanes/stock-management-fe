/**
 * Small reusable helpers for User Management module.
 * Keep this file lean (< 20 functions).
 */

/**
 * Escape a CSV field value per RFC 4180 standard.
 * Wraps in double quotes if the value contains comma, double quote, or newline.
 * Escapes internal double quotes by doubling them.
 */
export function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert an array of user rows to a CSV string with proper escaping.
 */
export function usersToCsv(
  rows: Array<Record<string, string>>,
  headers: string[],
): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h] ?? "")).join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}
