// components/InvoiceTable.tsx
"use client";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  isInvoicesLoading: boolean;
  onEdit: (invoice: any) => void;
  onDelete: (invoice: any) => void;
  onView: (invoice: any) => void;    // <-- Add this prop
}

export default function InvoiceTable({
  invoices,
  isInvoicesLoading,
  onEdit,
  onDelete,
  onView,
}: InvoiceTableProps) {
  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-180px)] bg-white">
      <table className="min-w-[1000px] w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border-b border-gray-200 px-2 py-2 w-12">#</th>
            <th className="border-b border-gray-200 px-2 py-2 w-36">Invoice No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-32">Date</th>
            <th className="border-b border-gray-200 px-2 py-2 w-40">Supplier</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28 text-right">Amount</th>
            <th className="border-b border-gray-200 px-2 py-2 w-32">Certified Date</th>
            <th className="border-b border-gray-200 px-2 py-2 w-32 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isInvoicesLoading ? (
            <tr>
              <td colSpan={10} className="text-center py-8">
                <Loader2 className="animate-spin inline h-6 w-6" />
              </td>
            </tr>
          ) : !invoices?.length ? (
            <tr>
              <td colSpan={10} className="text-center text-muted-foreground py-8 border">
                No invoices found.
              </td>
            </tr>
          ) : (
            invoices.map((inv: any, idx: number) => (
              <tr key={inv.id} className="even:bg-white/60 hover:bg-gray-50 transition">
                <td className="border-b border-gray-200 px-2 py-2 w-12">{idx + 1}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-36 truncate">{inv.invoice_no}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-32">{inv.invoice_date}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-40 truncate">{inv.supplier_name || inv.supplier_id}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-28 text-right">{inv.invoice_amount}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-32">{inv.certified_date ? inv.certified_date : "-"}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-32 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onView(inv)}
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onEdit(inv)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete(inv)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
