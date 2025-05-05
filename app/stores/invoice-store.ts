import { create } from "zustand";

export type ActionType = "edit" | "delete" | "status" | null;

export interface Invoice {
  id: number;
  mocId: number;
  mocNo: string;
  shortDescription: string | null;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  vat: number;
  retention: number;
  invoiceStatus: string;
  receiptDate: string | null;
}

interface InvoiceStore {
  selectedInvoiceId: number | null;
  actionType: ActionType;
  statusInvoice: Invoice | null;
  newStatus: string;
  newReceiptDate: Date | null;
  setSelectedInvoice: (id: number | null, action: ActionType) => void;
  setStatusData: (
    status: string,
    receiptDate: Date | null,
    invoice: Invoice
  ) => void;
  clearSelection: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  selectedInvoiceId: null,
  actionType: null,
  statusInvoice: null,
  newStatus: "PMD",
  newReceiptDate: null,

  setSelectedInvoice: (id, actionType) =>
    set({ selectedInvoiceId: id, actionType }),

  setStatusData: (newStatus, newReceiptDate, statusInvoice) =>
    set({
      newStatus,
      newReceiptDate,
      statusInvoice,
      actionType: "status",
      selectedInvoiceId: statusInvoice.id,
    }),

  clearSelection: () =>
    set({
      selectedInvoiceId: null,
      actionType: null,
      statusInvoice: null,
      newStatus: "PMD",
      newReceiptDate: null,
    }),
}));
