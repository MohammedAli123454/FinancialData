// app/purchase-order/types.ts
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
    supplierName?: string;
  };
  
  export type PurchaseOrderForm = {
    supplierId: number;
    poNumber: string;
    currency: string;
    poValue: number;
    poValueWithVAT: number;
  };
  