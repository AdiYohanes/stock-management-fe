"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatDateTimeID } from "@/lib/formatters";
import type { AuditLog } from "@/lib/types/audit";

interface AuditDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditDetailDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation within dialog — focus trap via Radix Dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
      // Enter on focused close button triggers close
      if (e.key === "Enter" && e.target === closeButtonRef.current) {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  // Auto-focus the close button when dialog opens for immediate keyboard access
  useEffect(() => {
    if (open && closeButtonRef.current) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto backdrop-blur-sm sm:max-h-[85vh] sm:w-full"
        onKeyDown={handleKeyDown}
        aria-labelledby="audit-detail-title"
        aria-describedby="audit-detail-description"
      >
        <DialogHeader>
          <DialogTitle id="audit-detail-title">Detail Audit Log</DialogTitle>
          <DialogDescription id="audit-detail-description">
            {log.description}
          </DialogDescription>
        </DialogHeader>

        {/* Explicit close button with accessible touch target */}
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 h-8 w-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Tutup dialog detail audit"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Metadata section */}
        <div
          className="grid grid-cols-1 gap-4 rounded-md border p-4 text-sm sm:grid-cols-2"
          role="group"
          aria-label="Informasi metadata audit log"
        >
          <MetadataItem label="Waktu" value={formatDateTimeID(log.timestamp)} />
          <MetadataItem
            label="User"
            value={`${log.user_name} (${log.user_role})`}
          />
          <MetadataItem label="Aksi" value={log.action} />
          <MetadataItem
            label="Entitas"
            value={`${log.entity_type} — ${log.entity_label}`}
          />
          <MetadataItem label="ID Entitas" value={log.entity_id} />
          <MetadataItem label="ID Log" value={log.id} />
        </div>

        {/* JSON diff comparison with scroll containers for overflow */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Perbandingan Nilai
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ValueBlock
              title="Nilai Sebelum"
              values={log.old_values}
              variant="old"
            />
            <ValueBlock
              title="Nilai Sesudah"
              values={log.new_values}
              variant="new"
            />
          </div>
        </div>

        {/* Footer close button for mobile accessibility */}
        <div className="mt-4 flex justify-end sm:hidden">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground" aria-hidden="true">
        {label}
      </span>
      <p className="mt-0.5 font-medium" aria-label={`${label}: ${value}`}>
        {value}
      </p>
    </div>
  );
}

function ValueBlock({
  title,
  values,
  variant,
}: {
  title: string;
  values: Record<string, unknown> | null;
  variant: "old" | "new";
}) {
  const bgClass =
    variant === "old"
      ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
      : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";

  if (!values) {
    return (
      <div
        className={`rounded-md border p-3 ${bgClass}`}
        role="region"
        aria-label={title}
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {title}
        </p>
        <p className="text-sm italic text-muted-foreground">Tidak ada data</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-md border p-3 ${bgClass}`}
      role="region"
      aria-label={title}
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      {/* Scroll container with max-h-64 to prevent overflow on long JSON values */}
      <div className="max-h-64 overflow-auto rounded border border-inherit bg-white/50 p-2 dark:bg-black/10">
        <pre
          className="whitespace-pre-wrap break-words text-xs font-mono leading-relaxed"
          tabIndex={0}
          aria-label={`${title} JSON data`}
        >
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
