// types.ts

export type Supplier = {
  id: number;
  name: string;
};

export type PurchaseOrder = {
  id: number;
  supplierId: number;
  poNumber: string;
  currency: string;
  poValue: number;
  poValueWithVAT: number;
  masterPo?: string;
  supplierName?: string;
};

export type PurchaseOrderForm = {
  supplierId: number;
  poNumber: string;
  currency: string;
  poValue: number;
  poValueWithVAT: number;
  masterPo?: string;
  lineItems: PurchaseOrderLineItemForm[];
};

export type PurchaseOrderLineItem = {
  id: number;
  purchaseOrderId: number;
  supplierId: number;
  poNumber?: string;
  masterPo?: string;
  lineNo: number;
  moc: string;
  description: string;
  unit: string;
  totalQty: number;
  ratePerUnit: number;
  totalValueSar: number;
  dateAdd: string;
  dateEdit: string;
};

export type PurchaseOrderLineItemForm = {
  lineNo: number;
  moc: string;
  description: string;
  unit: string;
  totalQty: number;
  ratePerUnit: number;
  totalValueSar: number;
};

export type PurchaseOrderWithLineItems = PurchaseOrder & {
  lineItems: PurchaseOrderLineItem[];
};
