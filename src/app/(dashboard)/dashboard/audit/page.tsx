"use client";

import { FileSearch, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Placeholder data — will be replaced with API call via TanStack Query
const MOCK_AUDIT_LOGS = [
  {
    id: "audit-001",
    timestamp: "2026-05-29 14:30:00",
    user: "admin@company.com",
    action: "CREATE",
    module: "Penerimaan",
    description: "Membuat GR-20260529-0001",
  },
  {
    id: "audit-002",
    timestamp: "2026-05-29 14:25:00",
    user: "staff@company.com",
    action: "UPDATE",
    module: "Inventaris",
    description: "Mengubah harga produk Kertas A4",
  },
  {
    id: "audit-003",
    timestamp: "2026-05-29 13:10:00",
    user: "supervisor@company.com",
    action: "APPROVE",
    module: "Penyesuaian",
    description: "Menyetujui penyesuaian stok ADJ-20260529-0001",
  },
];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jejak Audit</h1>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Waktu
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Pengguna
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Aksi
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Modul
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT_LOGS.map((log) => (
              <tr
                key={log.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 font-mono text-xs">{log.timestamp}</td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-4 py-3">{log.module}</td>
                <td className="px-4 py-3">{log.description}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/audit/${log.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1.5 h-4 w-4" />
                      Detail
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const cls =
    {
      CREATE: "bg-emerald-100 text-emerald-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      APPROVE: "bg-amber-100 text-amber-800",
    }[action] ?? "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {action}
    </span>
  );
}
