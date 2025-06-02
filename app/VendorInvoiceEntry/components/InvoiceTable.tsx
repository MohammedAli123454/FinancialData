"use client";
import { useState, useMemo } from "react";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  isInvoicesLoading: boolean;
  onEdit: (invoice: any) => void;
  onDelete: (invoice: any) => void;
  onView: (invoice: any) => void;
}

export default function InvoiceTable({
  invoices,
  isInvoicesLoading,
  onEdit,
  onDelete,
  onView,
}: InvoiceTableProps) {
  // Search states
  const [searchInvoiceNo, setSearchInvoiceNo] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");

  // Memoized filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesInvoiceNo =
        !searchInvoiceNo ||
        inv.invoice_no?.toLowerCase().includes(searchInvoiceNo.toLowerCase());
      const matchesSupplier =
        !searchSupplier ||
        (inv.supplier_name
          ? inv.supplier_name.toLowerCase().includes(searchSupplier.toLowerCase())
          : inv.supplier_id?.toString().includes(searchSupplier));
      return matchesInvoiceNo && matchesSupplier;
    });
  }, [invoices, searchInvoiceNo, searchSupplier]);

  return (
    <div className="flex flex-col gap-3">
      {/* --- Search Controls --- */}
      <div className="flex gap-2 items-center p-2 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center gap-1">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by Invoice No"
            className="h-8 w-40 text-xs"
            value={searchInvoiceNo}
            onChange={(e) => setSearchInvoiceNo(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by Supplier"
            className="h-8 w-40 text-xs"
            value={searchSupplier}
            onChange={(e) => setSearchSupplier(e.target.value)}
          />
        </div>
      </div>
      {/* --- Table --- */}
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
            ) : !filteredInvoices?.length ? (
              <tr>
                <td colSpan={10} className="text-center text-muted-foreground py-8 border">
                  No invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv: any, idx: number) => (
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
    </div>
  );
}
