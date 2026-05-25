import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import { getStockStatus, type StockStatus } from "@/lib/validators/product";

const BADGE_CLASSES: Record<StockStatus, string> = {
  normal: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

const BADGE_LABELS: Record<StockStatus, string> = {
  normal: "Tersedia",
  warning: "Rendah",
  danger: "Habis",
};

interface StockBadgeProps {
  qty: number;
  min: number;
  unit: string;
}

export function StockBadge({ qty, min, unit }: StockBadgeProps) {
  const status = getStockStatus(qty, min);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_CLASSES[status]
      )}
      title={BADGE_LABELS[status]}
    >
      {formatNumber(qty)} {unit}
    </span>
  );
}
