const numberFormatter = new Intl.NumberFormat("id-ID");
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/**
 * Format ISO date string to Indonesian locale (e.g. "22 Mei 2026").
 * Uses Asia/Jakarta timezone.
 */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
