import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateGRValues } from "@/lib/validators/receiving";

interface ReceivingDraftState {
  formData: CreateGRValues | null;
  lastSaved: string | null;

  saveDraft: (data: CreateGRValues) => void;
  clearDraft: () => void;
}

export const useReceivingDraftStore = create<ReceivingDraftState>()(
  persist(
    (set) => ({
      formData: null,
      lastSaved: null,

      saveDraft: (data) =>
        set({ formData: data, lastSaved: new Date().toISOString() }),

      clearDraft: () => set({ formData: null, lastSaved: null }),
    }),
    { name: "gr-draft:local" }
  )
);
