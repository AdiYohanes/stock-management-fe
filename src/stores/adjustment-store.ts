import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockAdjustment, AdjustmentStatus } from "@/lib/types/adjustment";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ApprovePayload {
  id: string;
  approved_by: string;
}

interface RejectPayload {
  id: string;
  approved_by: string;
  rejection_reason: string;
}

interface AdjustmentStore {
  adjustments: StockAdjustment[];

  /** Add a new adjustment with PENDING status */
  addAdjustment: (adjustment: StockAdjustment) => void;

  /** Transition status from PENDING → APPROVED */
  approveAdjustment: (payload: ApprovePayload) => void;

  /** Transition status from PENDING → REJECTED */
  rejectAdjustment: (payload: RejectPayload) => void;

  /** Get a single adjustment by ID */
  getAdjustmentById: (id: string) => StockAdjustment | undefined;

  /** Get all adjustments sorted by date descending */
  getAllAdjustments: () => StockAdjustment[];

  /** Get adjustments filtered by status */
  getAdjustmentsByStatus: (status: AdjustmentStatus) => StockAdjustment[];
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

/** Validate that a value is a valid StockAdjustment shape (runtime guard) */
function isValidAdjustment(value: unknown): value is StockAdjustment {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.adj_number === "string" &&
    typeof obj.date === "string" &&
    typeof obj.product_id === "string" &&
    typeof obj.product_name === "string" &&
    typeof obj.sku === "string" &&
    typeof obj.reason === "string" &&
    typeof obj.qty_before === "number" &&
    typeof obj.qty_after === "number" &&
    typeof obj.status === "string" &&
    typeof obj.created_by === "string" &&
    typeof obj.created_at === "string"
  );
}

/** Validate that a status is a valid AdjustmentStatus */
function isValidStatus(status: unknown): status is AdjustmentStatus {
  return status === "PENDING" || status === "APPROVED" || status === "REJECTED";
}

// ─── Store ───────────────────────────────────────────────────────────────────

// TODO: Replace with backend API integration using TanStack Query
// - addAdjustment → POST /api/v1/adjustments
// - approveAdjustment → POST /api/v1/adjustments/:id/approve
// - rejectAdjustment → POST /api/v1/adjustments/:id/reject
// - getAdjustmentById → GET /api/v1/adjustments/:id
// - getAllAdjustments → GET /api/v1/adjustments (paginated)
// - getAdjustmentsByStatus → GET /api/v1/adjustments?status=PENDING

export const useAdjustmentStore = create<AdjustmentStore>()(
  persist(
    (set, get) => ({
      adjustments: [],

      addAdjustment: (adjustment) => {
        // Type guard: ensure valid adjustment before adding
        if (!isValidAdjustment(adjustment)) {
          console.warn(
            "[AdjustmentStore] Invalid adjustment data, skipping add.",
          );
          return;
        }
        set((state) => ({
          adjustments: [adjustment, ...state.adjustments],
        }));
      },

      approveAdjustment: ({ id, approved_by }) => {
        if (!id || !approved_by) {
          console.warn(
            "[AdjustmentStore] Missing id or approved_by for approval.",
          );
          return;
        }
        set((state) => ({
          adjustments: state.adjustments.map((adj) =>
            adj.id === id && adj.status === "PENDING"
              ? {
                  ...adj,
                  status: "APPROVED" as const,
                  approved_by,
                  approved_at: new Date().toISOString(),
                }
              : adj,
          ),
        }));
      },

      rejectAdjustment: ({ id, approved_by, rejection_reason }) => {
        if (!id || !approved_by || !rejection_reason) {
          console.warn(
            "[AdjustmentStore] Missing required fields for rejection.",
          );
          return;
        }
        set((state) => ({
          adjustments: state.adjustments.map((adj) =>
            adj.id === id && adj.status === "PENDING"
              ? {
                  ...adj,
                  status: "REJECTED" as const,
                  approved_by,
                  approved_at: new Date().toISOString(),
                  rejection_reason,
                }
              : adj,
          ),
        }));
      },

      getAdjustmentById: (id) => {
        if (!id) return undefined;
        return get().adjustments.find((adj) => adj.id === id);
      },

      getAllAdjustments: () => {
        return [...get().adjustments].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
      },

      getAdjustmentsByStatus: (status) => {
        if (!isValidStatus(status)) return [];
        return get().adjustments.filter((adj) => adj.status === status);
      },
    }),
    {
      name: "adjustments:local",
      // TODO: Replace localStorage persistence with server-side state
      // once backend API is integrated. This persist middleware will be removed.
    },
  ),
);
