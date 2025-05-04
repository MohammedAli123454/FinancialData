import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvoiceStore } from "@/app/stores/invoice-store";

interface Invoices {
    id: number; mocId: number; 
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

interface PartialInvoiceTableProps {
  data?: Invoices[];
  isLoading?: boolean;
}

export default function PartialInvoiceTable({ data, isLoading }: PartialInvoiceTableProps) {
  const { setSelectedInvoice } = useInvoiceStore();

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <table className="w-full table-fixed border-collapse">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="border-b border-gray-200 px-2 py-2 w-40 text-left text-gray-700">MOC Number</th>
            <th className="border-b border-gray-200 px-2 py-2 w-42 text-left text-gray-700">Short Desc.</th>
            <th className="border-b border-gray-200 px-2 py-2 w-52 text-left text-gray-700">Invoice No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-25 text-center text-gray-700">Inv. Date</th>
            <th className="border-b border-gray-200 px-2 py-2 w-32 text-center text-gray-700">Amount</th>
            <th className="border-b border-gray-200 px-2 py-2 w-30 text-center text-gray-700">Receipt Date</th>
            <th className="border-b border-gray-200 px-2 py-2 w-25 text-center text-gray-700">Status</th>
            <th className="border-b border-gray-200 px-2 py-2 w-30 text-center text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm font-sans">
          {data?.map(invoice => (
            <tr key={invoice.id} className="h-6 even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors duration-150">
              <td className="border-b border-gray-200 px-2 py-2 text-left">
                <div className="truncate">{invoice.mocNo}</div>
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-left">
                <div className="truncate">{invoice.shortDescription || "N/A"}</div>
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-left">
                <div className="truncate">{invoice.invoiceNo}</div>
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-center">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </td>
              <td className="border-b border-gray-200 px-2 py-2 font-medium text-center">
                {invoice.amount.toFixed(2)}
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-center">
                {invoice.receiptDate ? new Date(invoice.receiptDate).toLocaleDateString() : "N/A"}
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-center">
                <div className="truncate">
                  <Badge
                    onClick={() => {
                      useInvoiceStore.getState().setStatusData(
                        invoice.invoiceStatus,
                        invoice.receiptDate ? new Date(invoice.receiptDate) : null,
                        invoice
                      );
                    }}
                    className="cursor-pointer"
                  >
                    {invoice.invoiceStatus}
                  </Badge>
                </div>
              </td>
              <td className="border-b border-gray-200 px-2 py-2 text-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedInvoice(invoice.id, 'edit')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setSelectedInvoice(invoice.id, 'delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}