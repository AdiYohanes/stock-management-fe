"use client";

import { useState } from "react";
import { Plus, Search, PackageOpen } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductTable } from "@/components/features/inventory/product-table";
import { ProductDialog } from "@/components/features/inventory/product-dialog";
import { useGetProducts, useDeleteProduct, MOCK_CATEGORIES } from "@/lib/api/products";
import { useProductFilterStore } from "@/stores/product-filter-store";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@/lib/validators/product";

const queryClient = new QueryClient();

export default function InventoryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryContent />
    </QueryClientProvider>
  );
}

function InventoryContent() {
  const store = useProductFilterStore();
  const debouncedSearch = useDebounce(store.search, 300);

  const { data, isLoading } = useGetProducts({
    page: store.page,
    perPage: store.perPage,
    search: debouncedSearch.length >= 2 ? debouncedSearch : "",
    categoryId: store.categoryId,
    stockStatus: store.stockStatus,
    sortField: store.sortField,
    sortOrder: store.sortOrder,
  });

  const deleteMutation = useDeleteProduct();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Nonaktifkan produk "${product.name}"?`)) return;
    await deleteMutation.mutateAsync(product.id);
    toast.success("Produk berhasil dinonaktifkan");
  };

  const handleCreate = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };

  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Inventaris</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari SKU atau nama..."
            value={store.search}
            onChange={(e) => store.setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={store.categoryId}
          onChange={(e) => store.setCategoryId(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua Kategori</option>
          {MOCK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={store.stockStatus}
          onChange={(e) => store.setStockStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua Stok</option>
          <option value="low">Rendah</option>
          <option value="out">Habis</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : data?.data.length === 0 ? (
        <EmptyState />
      ) : (
        <ProductTable data={data?.data ?? []} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {meta && meta.total_pages > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(meta.page - 1) * meta.per_page + 1}–{Math.min(meta.page * meta.per_page, meta.total)} dari {meta.total} produk
          </p>
          <div className="flex items-center gap-2">
            <select
              value={store.perPage}
              onChange={(e) => store.setPerPage(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
              <option value={100}>100 / halaman</option>
            </select>
            <Button variant="outline" size="sm" disabled={store.page <= 1} onClick={() => store.setPage(store.page - 1)}>
              Sebelumnya
            </Button>
            <span className="text-sm">{meta.page} / {meta.total_pages}</span>
            <Button variant="outline" size="sm" disabled={store.page >= meta.total_pages} onClick={() => store.setPage(store.page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Dialog */}
      <ProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} product={editProduct} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">Belum ada produk</h3>
      <p className="mt-1 text-sm text-muted-foreground">Tambahkan produk pertama Anda untuk memulai.</p>
    </div>
  );
}
