/**
 * Generate a mock GI number in format: GI-YYYYMMDD-XXXX
 * Uses WIB (Asia/Jakarta) timezone for the date portion.
 * XXXX is a random 4-digit counter (0001-9999) for demo purposes.
 */
export function generateGINumber(): string {
  const now = new Date();

  // Format date in WIB timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // en-CA gives YYYY-MM-DD format
  const dateStr = formatter.format(now).replace(/-/g, "");

  // Random counter 0001-9999
  const counter = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");

  return `GI-${dateStr}-${counter}`;
}
