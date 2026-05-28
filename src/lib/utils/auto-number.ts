/**
 * Auto-generate adjustment number for demo/mock purposes.
 * Format: ADJ-YYYYMMDD-XXXX
 * - Date portion uses WIB (Asia/Jakarta) timezone
 * - XXXX is a random counter between 0001-9999 (mock, not sequential)
 *
 * NOTE: This is a client-side mock. In production, the backend
 * would generate sequential numbers with proper locking.
 */
export function generateAutoAdjNumber(): string {
  const now = new Date();
  const jakartaFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Format as YYYY-MM-DD then strip dashes
  const dateParts = jakartaFormatter.format(now).replace(/-/g, "");

  // Random counter 0001-9999 for demo
  const counter = Math.floor(Math.random() * 9999) + 1;
  const seq = String(counter).padStart(4, "0");

  return `ADJ-${dateParts}-${seq}`;
}
