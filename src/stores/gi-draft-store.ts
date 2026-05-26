import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateGIValues } from "@/lib/validators/dispatching";

interface GIDraftState {
  formData: CreateGIValues | null;
  lastSaved: string | null;

  saveDraft: (data: CreateGIValues) => void;
  clearDraft: () => void;
}

export const useGIDraftStore = create<GIDraftState>()(
  persist(
    (set) => ({
      formData: null,
      lastSaved: null,

      saveDraft: (data) =>
        set({ formData: data, lastSaved: new Date().toISOString() }),

      clearDraft: () => set({ formData: null, lastSaved: null }),
    }),
    { name: "gi-draft:local" },
  ),
);
