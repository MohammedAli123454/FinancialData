import { create } from 'zustand';

interface InvoiceStore {
  selectedInvoiceId: number | null;
  actionType: 'edit' | 'delete' | 'status' | null;
  statusInvoice: any | null;
  newStatus: string;
  newReceiptDate: Date | null;
  setSelectedInvoice: (id: number | null, actionType: 'edit' | 'delete' | null) => void;
  setStatusData: (status: string, receiptDate: Date | null, invoice: any) => void;
  clearSelection: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  selectedInvoiceId: null,
  actionType: null,
  statusInvoice: null,
  newStatus: 'PMD',
  newReceiptDate: null,
  setSelectedInvoice: (id, actionType) => set({ selectedInvoiceId: id, actionType }),
  setStatusData: (status, receiptDate, invoice) => set({ 
    newStatus: status,
    newReceiptDate: receiptDate,
    statusInvoice: invoice,
    actionType: 'status'
  }),
  clearSelection: () => set({ 
    selectedInvoiceId: null, 
    actionType: null,
    statusInvoice: null,
    newStatus: 'PMD',
    newReceiptDate: null
  }),
}));