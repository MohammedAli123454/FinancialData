"use client";
import { Loader2 } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  isInvoicesLoading: boolean;
}

export default function InvoiceTable({ invoices, isInvoicesLoading }: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Invoice No</th>
            <th className="p-2">Date</th>
            <th className="p-2">Supplier</th>
            <th className="p-2">PO</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Payable</th>
            <th className="p-2">Certified?</th>
            <th className="p-2">Certified Date</th>
          </tr>
        </thead>
        <tbody>
          {isInvoicesLoading ? (
            <tr>
              <td colSpan={8} className="text-center py-6">
                <Loader2 className="animate-spin inline h-6 w-6" />
              </td>
            </tr>
          ) : invoices?.length ? (
            invoices.map((inv: any) => (
              <tr key={inv.id}>
                <td className="p-2">{inv.invoice_no}</td>
                <td className="p-2">{inv.invoice_date}</td>
                <td className="p-2">{inv.supplier_name || inv.supplier_id}</td>
                <td className="p-2">{inv.po_number}</td>
                <td className="p-2">{inv.invoice_amount}</td>
                <td className="p-2">{inv.payable}</td>
                <td className="p-2">{inv.certified ? "✅" : "❌"}</td>
                <td className="p-2">{inv.certified_date ? inv.certified_date : "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-gray-400 py-4">
                No invoices yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
