import { create } from "zustand";

interface ProductFilterState {
  page: number;
  perPage: number;
  search: string;
  categoryId: string;
  stockStatus: string;
  sortField: string;
  sortOrder: "asc" | "desc";

  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearch: (search: string) => void;
  setCategoryId: (id: string) => void;
  setStockStatus: (status: string) => void;
  toggleSort: (field: string) => void;
  reset: () => void;
}

const INITIAL = {
  page: 1,
  perPage: 20,
  search: "",
  categoryId: "",
  stockStatus: "",
  sortField: "name",
  sortOrder: "asc" as const,
};

export const useProductFilterStore = create<ProductFilterState>()((set, get) => ({
  ...INITIAL,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setCategoryId: (categoryId) => set({ categoryId, page: 1 }),
  setStockStatus: (stockStatus) => set({ stockStatus, page: 1 }),
  toggleSort: (field) => {
    const { sortField, sortOrder } = get();
    if (sortField === field) {
      set({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      set({ sortField: field, sortOrder: "asc" });
    }
  },
  reset: () => set(INITIAL),
}));
