"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/ui/stock-badge";
import { formatCurrency } from "@/lib/formatters";
import { useProductFilterStore } from "@/stores/product-filter-store";
import type { Product } from "@/lib/validators/product";

const col = createColumnHelper<Product>();

interface ProductTableProps {
  data: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ data, onEdit, onDelete }: ProductTableProps) {
  const { sortField, sortOrder, toggleSort } = useProductFilterStore();

  const columns = [
    col.accessor("sku", { header: "SKU" }),
    col.accessor("name", {
      header: () => (
        <SortHeader field="name" label="Nama Produk" active={sortField} order={sortOrder} onSort={toggleSort} />
      ),
    }),
    col.accessor("category_name", { header: "Kategori", cell: (info) => info.getValue() ?? "-" }),
    col.accessor("unit_name", { header: "Satuan" }),
    col.display({
      id: "stock",
      header: () => (
        <SortHeader field="stock_qty" label="Stok" active={sortField} order={sortOrder} onSort={toggleSort} />
      ),
      cell: ({ row }) => (
        <StockBadge qty={row.original.stock_qty} min={row.original.stock_min} unit={row.original.unit_name} />
      ),
    }),
    col.accessor("selling_price", {
      header: () => (
        <SortHeader field="selling_price" label="Harga Jual" active={sortField} order={sortOrder} onSort={toggleSort} />
      ),
      cell: (info) => formatCurrency(info.getValue()),
    }),
    col.display({
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)} aria-label="Edit produk">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)} aria-label="Nonaktifkan produk">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sortable column header */
function SortHeader({
  field,
  label,
  active,
  order,
  onSort,
}: {
  field: string;
  label: string;
  active: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {label}
      <ArrowUpDown className={`h-3.5 w-3.5 ${active === field ? "text-foreground" : "text-muted-foreground/50"}`} />
      {active === field && <span className="sr-only">{order === "asc" ? "ascending" : "descending"}</span>}
    </button>
  );
}
