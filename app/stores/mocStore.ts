import { create } from 'zustand';

interface MocState {
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  editId: number | null;
  setEditId: (id: number | null) => void;
}

export const useMocStore = create<MocState>((set) => ({
  deleteId: null,
  setDeleteId: (id) => set({ deleteId: id }),
  editId: null,
  setEditId: (id) => set({ editId: id }),
}));

