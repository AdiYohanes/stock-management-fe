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

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAdjustmentStore = create<AdjustmentStore>()(
  persist(
    (set, get) => ({
      adjustments: [],

      addAdjustment: (adjustment) => {
        set((state) => ({
          adjustments: [adjustment, ...state.adjustments],
        }));
      },

      approveAdjustment: ({ id, approved_by }) => {
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
        return get().adjustments.find((adj) => adj.id === id);
      },

      getAllAdjustments: () => {
        return [...get().adjustments].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      },

      getAdjustmentsByStatus: (status) => {
        return get().adjustments.filter((adj) => adj.status === status);
      },
    }),
    {
      name: "adjustments:local",
    },
  ),
);
