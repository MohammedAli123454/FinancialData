import { create } from "zustand";

export type DateRange = [Date | null, Date | null];

export interface FilterValues {
  search: string;
  cwo: string;
  moc: string;
  status: string;
  dateRange: DateRange;
}

const INITIAL_FILTERS: FilterValues = {
  search: "",
  cwo: "",
  moc: "all",
  status: "all",
  dateRange: [null, null],
};

interface FiltersStore {
  applied: FilterValues;
  draft: FilterValues;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  updateDraft: (updates: Partial<FilterValues>) => void;
  apply: () => void;
  resetDraft: () => void;
  resetAll: () => void;
}

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  applied: INITIAL_FILTERS,
  draft: INITIAL_FILTERS,
  dialogOpen: false,

  openDialog: () => {
    const { applied } = get();
    set({ dialogOpen: true, draft: { ...applied } });
  },
  closeDialog: () => set({ dialogOpen: false }),
  updateDraft: (updates) =>
    set((state) => ({ draft: { ...state.draft, ...updates } })),
  apply: () => {
    const { draft } = get();
    set({ applied: { ...draft }, dialogOpen: false });
  },
  resetDraft: () => set({ draft: INITIAL_FILTERS }),
  resetAll: () =>
    set({ applied: INITIAL_FILTERS, draft: INITIAL_FILTERS }),
}));
