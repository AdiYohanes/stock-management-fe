"use client";

import { useCallback, useMemo, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarIcon, RotateCcw, Search, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AUDIT_FILTERS,
  MAX_DATE_RANGE_DAYS,
  validateDateRange,
  type AuditFilterCriteria,
} from "@/lib/utils/audit-filters";
import type { AuditAction, AuditEntity } from "@/lib/types/audit";

// -- Entity options for dropdown --
const ENTITY_OPTIONS: { value: AuditEntity | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "Product", label: "Product" },
  { value: "GoodsReceipt", label: "Goods Receipt (GR)" },
  { value: "GoodsIssue", label: "Goods Issue (GI)" },
  { value: "Adjustment", label: "Adjustment" },
];

// -- Action options for dropdown --
const ACTION_OPTIONS: { value: AuditAction | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
];

interface AuditFiltersProps {
  filters: AuditFilterCriteria;
  onFiltersChange: (filters: AuditFilterCriteria) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  userOptions: string[];
}

export function AuditFilters({
  filters,
  onFiltersChange,
  searchValue,
  onSearchChange,
  userOptions,
}: AuditFiltersProps) {
  // Track date range validation error for visual feedback
  const [dateRangeError, setDateRangeError] = useState(false);

  // Compute whether date range exceeds limit for visual indicator
  const isDateRangeExceeded = useMemo(() => {
    if (!filters.dateFrom || !filters.dateTo) return false;
    const from = new Date(filters.dateFrom);
    const to = new Date(filters.dateTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
    return differenceInDays(to, from) > MAX_DATE_RANGE_DAYS;
  }, [filters.dateFrom, filters.dateTo]);

  // Update a single filter field
  const updateFilter = useCallback(
    <K extends keyof AuditFilterCriteria>(
      key: K,
      value: AuditFilterCriteria[K],
    ) => {
      const updated = { ...filters, [key]: value };

      // Validate date range when dates change
      if (key === "dateFrom" || key === "dateTo") {
        const newFrom =
          key === "dateFrom" ? (value as string | null) : filters.dateFrom;
        const newTo =
          key === "dateTo" ? (value as string | null) : filters.dateTo;
        const error = validateDateRange(newFrom, newTo);

        if (error) {
          setDateRangeError(true);
          toast.error(error, {
            description: `Silakan pilih rentang maksimal ${MAX_DATE_RANGE_DAYS} hari.`,
          });
          return;
        }
        setDateRangeError(false);
      }

      onFiltersChange(updated);
    },
    [filters, onFiltersChange],
  );

  // Clear a specific date field — resets to null without error
  const handleClearDate = useCallback(
    (field: "dateFrom" | "dateTo") => {
      setDateRangeError(false);
      onFiltersChange({ ...filters, [field]: null });
    },
    [filters, onFiltersChange],
  );

  // Reset all filters to default
  const handleReset = useCallback(() => {
    setDateRangeError(false);
    onFiltersChange(DEFAULT_AUDIT_FILTERS);
    onSearchChange("");
  }, [onFiltersChange, onSearchChange]);

  // Check if any filter is active (non-default)
  const hasActiveFilters =
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.entityType !== "ALL" ||
    filters.action !== "ALL" ||
    filters.userName !== "ALL" ||
    searchValue.length > 0;

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Filter grid — stacks vertically on mobile, grid on larger screens */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Date range - From */}
        <DatePickerField
          label="Dari Tanggal"
          value={filters.dateFrom}
          onChange={(date) => updateFilter("dateFrom", date)}
          onClear={() => handleClearDate("dateFrom")}
          maxDate={filters.dateTo ? new Date(filters.dateTo) : undefined}
          hasError={dateRangeError || isDateRangeExceeded}
        />

        {/* Date range - To */}
        <DatePickerField
          label="Sampai Tanggal"
          value={filters.dateTo}
          onChange={(date) => updateFilter("dateTo", date)}
          onClear={() => handleClearDate("dateTo")}
          minDate={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
          hasError={dateRangeError || isDateRangeExceeded}
        />

        {/* Entity type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Entitas
          </label>
          <Select
            value={filters.entityType}
            onValueChange={(val) =>
              updateFilter("entityType", val as AuditEntity | "ALL")
            }
          >
            <SelectTrigger className="min-h-[44px] md:min-h-[36px]">
              <SelectValue placeholder="Pilih entitas" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Aksi
          </label>
          <Select
            value={filters.action}
            onValueChange={(val) =>
              updateFilter("action", val as AuditAction | "ALL")
            }
          >
            <SelectTrigger className="min-h-[44px] md:min-h-[36px]">
              <SelectValue placeholder="Pilih aksi" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            User
          </label>
          <Select
            value={filters.userName}
            onValueChange={(val) => updateFilter("userName", val)}
          >
            <SelectTrigger className="min-h-[44px] md:min-h-[36px]">
              <SelectValue placeholder="Pilih user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {userOptions.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search + Reset row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Pencarian
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari user, entitas, deskripsi... (min. 2 karakter)"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-h-[44px] pl-9 md:min-h-[36px]"
              aria-label="Pencarian audit log"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="min-h-[44px] w-full shrink-0 md:min-h-[36px] md:w-auto"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset Filter
        </Button>
      </div>
    </div>
  );
}

// -- Date picker field sub-component --
interface DatePickerFieldProps {
  label: string;
  value: string | null;
  onChange: (date: string | null) => void;
  onClear: () => void;
  minDate?: Date;
  maxDate?: Date;
  hasError?: boolean;
}

function DatePickerField({
  label,
  value,
  onChange,
  onClear,
  minDate,
  maxDate,
  hasError = false,
}: DatePickerFieldProps) {
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(day.toISOString());
    } else {
      onChange(null);
    }
  };

  // Handle clear without triggering validation error
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "min-h-[44px] w-full justify-start text-left font-normal md:min-h-[36px]",
                !value && "text-muted-foreground",
                hasError && "border-red-500 focus-visible:ring-red-500",
              )}
              aria-label={`${label}: ${selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: localeID }) : "Belum dipilih"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {selectedDate
                  ? format(selectedDate, "dd MMM yyyy", { locale: localeID })
                  : "Pilih tanggal"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              locale={localeID}
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                button_previous:
                  "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
                button_next:
                  "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday:
                  "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                day_button:
                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
                selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                today: "bg-accent text-accent-foreground",
                outside: "text-muted-foreground opacity-50",
                disabled: "text-muted-foreground opacity-50",
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Clear button — only visible when a date is selected */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Hapus ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {/* Inline validation hint for date range exceeded */}
      {hasError && (
        <p className="text-xs text-red-600" role="alert">
          Maks. {MAX_DATE_RANGE_DAYS} hari
        </p>
      )}
    </div>
  );
}
