import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Product,
  ProductListResponse,
  CreateProductValues,
} from "@/lib/validators/product";

// --- Mock Data ---

const MOCK_PRODUCTS: Product[] = [
  { id: "1", sku: "BRG-001", name: "Beras Premium 5kg", category_id: "1", category_name: "Bahan Pokok", unit_id: "1", unit_name: "PCS", barcode: "8991234567890", stock_qty: 150, stock_min: 20, stock_max: 500, cost_price: 65000, selling_price: 75000, is_active: true, created_at: "2026-01-15" },
  { id: "2", sku: "BRG-002", name: "Minyak Goreng 2L", category_id: "1", category_name: "Bahan Pokok", unit_id: "1", unit_name: "PCS", barcode: "8991234567891", stock_qty: 5, stock_min: 10, stock_max: 200, cost_price: 28000, selling_price: 35000, is_active: true, created_at: "2026-01-16" },
  { id: "3", sku: "BRG-003", name: "Gula Pasir 1kg", category_id: "1", category_name: "Bahan Pokok", unit_id: "2", unit_name: "KG", barcode: null, stock_qty: 0, stock_min: 15, stock_max: 300, cost_price: 14000, selling_price: 18000, is_active: true, created_at: "2026-01-17" },
  { id: "4", sku: "BRG-004", name: "Tepung Terigu 1kg", category_id: "1", category_name: "Bahan Pokok", unit_id: "2", unit_name: "KG", barcode: null, stock_qty: 80, stock_min: 10, stock_max: 200, cost_price: 10000, selling_price: 13000, is_active: true, created_at: "2026-02-01" },
  { id: "5", sku: "BRG-005", name: "Sabun Cuci Piring", category_id: "2", category_name: "Kebersihan", unit_id: "1", unit_name: "PCS", barcode: "8991234567895", stock_qty: 45, stock_min: 0, stock_max: 100, cost_price: 5000, selling_price: 8000, is_active: true, created_at: "2026-02-05" },
  { id: "6", sku: "BRG-006", name: "Deterjen Bubuk 1kg", category_id: "2", category_name: "Kebersihan", unit_id: "2", unit_name: "KG", barcode: null, stock_qty: 12, stock_min: 15, stock_max: 100, cost_price: 18000, selling_price: 25000, is_active: true, created_at: "2026-02-10" },
  { id: "7", sku: "BRG-007", name: "Kopi Bubuk 250g", category_id: "3", category_name: "Minuman", unit_id: "1", unit_name: "PCS", barcode: "8991234567897", stock_qty: 200, stock_min: 30, stock_max: 500, cost_price: 22000, selling_price: 30000, is_active: true, created_at: "2026-03-01" },
  { id: "8", sku: "BRG-008", name: "Teh Celup 25pcs", category_id: "3", category_name: "Minuman", unit_id: "1", unit_name: "BOX", barcode: null, stock_qty: 0, stock_min: 20, stock_max: 200, cost_price: 8000, selling_price: 12000, is_active: true, created_at: "2026-03-05" },
  { id: "9", sku: "BRG-009", name: "Susu UHT 1L", category_id: "3", category_name: "Minuman", unit_id: "1", unit_name: "PCS", barcode: "8991234567899", stock_qty: 35, stock_min: 20, stock_max: 150, cost_price: 15000, selling_price: 19000, is_active: true, created_at: "2026-03-10" },
  { id: "10", sku: "BRG-010", name: "Mie Instan Goreng", category_id: "1", category_name: "Bahan Pokok", unit_id: "1", unit_name: "PCS", barcode: "8991234567810", stock_qty: 500, stock_min: 50, stock_max: 1000, cost_price: 2800, selling_price: 3500, is_active: true, created_at: "2026-03-15" },
];

let mockDb = [...MOCK_PRODUCTS];

export const MOCK_CATEGORIES = [
  { id: "1", name: "Bahan Pokok" },
  { id: "2", name: "Kebersihan" },
  { id: "3", name: "Minuman" },
];

export const MOCK_UNITS = [
  { id: "1", name: "PCS" },
  { id: "2", name: "KG" },
  { id: "3", name: "BOX" },
  { id: "4", name: "LTR" },
];

// --- Mock API Functions ---

interface FetchParams {
  page: number;
  perPage: number;
  search: string;
  categoryId: string;
  stockStatus: string;
  sortField: string;
  sortOrder: "asc" | "desc";
}

async function fetchProducts(params: FetchParams): Promise<ProductListResponse> {
  await new Promise((r) => setTimeout(r, 400));

  let filtered = mockDb.filter((p) => p.is_active);

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }

  if (params.categoryId) {
    filtered = filtered.filter((p) => p.category_id === params.categoryId);
  }

  if (params.stockStatus === "low") {
    filtered = filtered.filter((p) => p.stock_min > 0 && p.stock_qty <= p.stock_min && p.stock_qty > 0);
  } else if (params.stockStatus === "out") {
    filtered = filtered.filter((p) => p.stock_qty === 0);
  }

  filtered.sort((a, b) => {
    const field = params.sortField as keyof Product;
    const aVal = a[field] ?? "";
    const bVal = b[field] ?? "";
    if (aVal < bVal) return params.sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return params.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const start = (params.page - 1) * params.perPage;
  const data = filtered.slice(start, start + params.perPage);

  return {
    success: true,
    data,
    meta: {
      page: params.page,
      per_page: params.perPage,
      total,
      total_pages: Math.ceil(total / params.perPage),
    },
  };
}

async function createProduct(values: CreateProductValues): Promise<Product> {
  await new Promise((r) => setTimeout(r, 500));

  if (mockDb.some((p) => p.sku === values.sku && p.is_active)) {
    throw new Error("SKU sudah digunakan");
  }

  const product: Product = {
    id: String(Date.now()),
    sku: values.sku,
    name: values.name,
    category_id: values.category_id ?? null,
    category_name: MOCK_CATEGORIES.find((c) => c.id === values.category_id)?.name ?? null,
    unit_id: values.unit_id,
    unit_name: MOCK_UNITS.find((u) => u.id === values.unit_id)?.name ?? "",
    barcode: values.barcode ?? null,
    stock_qty: 0,
    stock_min: values.stock_min,
    stock_max: values.stock_max,
    cost_price: values.cost_price,
    selling_price: values.selling_price,
    is_active: true,
    created_at: new Date().toISOString().split("T")[0]!,
  };

  mockDb.push(product);
  return product;
}

async function updateProduct(id: string, values: CreateProductValues): Promise<Product> {
  await new Promise((r) => setTimeout(r, 500));

  const idx = mockDb.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Produk tidak ditemukan");

  if (mockDb.some((p) => p.sku === values.sku && p.id !== id && p.is_active)) {
    throw new Error("SKU sudah digunakan");
  }

  const updated: Product = {
    ...mockDb[idx]!,
    sku: values.sku,
    name: values.name,
    category_id: values.category_id ?? null,
    category_name: MOCK_CATEGORIES.find((c) => c.id === values.category_id)?.name ?? null,
    unit_id: values.unit_id,
    unit_name: MOCK_UNITS.find((u) => u.id === values.unit_id)?.name ?? "",
    barcode: values.barcode ?? null,
    stock_min: values.stock_min,
    stock_max: values.stock_max,
    cost_price: values.cost_price,
    selling_price: values.selling_price,
  };

  mockDb[idx] = updated;
  return updated;
}

async function deleteProduct(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockDb.findIndex((p) => p.id === id);
  if (idx !== -1) mockDb[idx] = { ...mockDb[idx]!, is_active: false };
}

// --- React Query Hooks ---

export function useGetProducts(params: FetchParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateProductValues }) =>
      updateProduct(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); },
  });
}
