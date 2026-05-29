"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Audit Log</DialogTitle>
          <DialogDescription>{log.description}</DialogDescription>
        </DialogHeader>

        {/* Metadata section */}
        <div className="grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
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

        {/* JSON diff comparison */}
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
      </DialogContent>
    </Dialog>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="mt-0.5 font-medium">{value}</p>
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
      ? "bg-red-50 border-red-200"
      : "bg-green-50 border-green-200";

  if (!values) {
    return (
      <div className={`rounded-md border p-3 ${bgClass}`}>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {title}
        </p>
        <p className="text-sm italic text-muted-foreground">Tidak ada data</p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border p-3 ${bgClass}`}>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <pre className="whitespace-pre-wrap break-words text-xs font-mono leading-relaxed">
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
}
