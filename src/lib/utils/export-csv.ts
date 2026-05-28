/**
 * Native CSV export utility using Blob + URL.createObjectURL.
 * Generates raw numbers (no thousand separators) for Excel compatibility.
 * Headers are in Bahasa Indonesia per PRD FR-RPT-04.
 */

interface ExportCsvOptions {
  /** CSV column headers */
  headers: string[];
  /** 2D array of row values (each row matches headers order) */
  rows: (string | number)[][];
  /** Output filename (without extension) */
  filename: string;
}

/**
 * Generate and trigger download of a CSV file from structured data.
 * Uses native Blob + anchor download pattern (no external libraries).
 */
export function exportCsv({ headers, rows, filename }: ExportCsvOptions): void {
  const csvContent = buildCsvContent(headers, rows);
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build CSV string content from headers and rows.
 * Escapes values containing commas, quotes, or newlines.
 */
function buildCsvContent(
  headers: string[],
  rows: (string | number)[][],
): string {
  const lines: string[] = [];

  lines.push(headers.map(escapeCsvValue).join(","));

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }

  return lines.join("\r\n");
}

/**
 * Escape a single CSV cell value.
 * Wraps in double quotes if the value contains comma, quote, or newline.
 */
function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
