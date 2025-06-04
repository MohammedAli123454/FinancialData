"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PulseLoader } from "react-spinners";

export default function InvoiceViewDialog({
  open,
  onClose,
  invoice,
  loading = false, // pass this prop from parent
}: {
  open: boolean;
  onClose: () => void;
  invoice: any;
  loading?: boolean;
}) {
  // Loader view
  if (loading || !invoice) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full flex flex-col items-center justify-center min-h-[200px]">
          <PulseLoader color="#2563eb" size={12} />
          <span className="mt-5 text-blue-900 font-medium">Loading invoice details...</span>
        </DialogContent>
      </Dialog>
    );
  }

  const certifiedBadge = invoice.certified ? (
    <Badge className="bg-green-600 text-white px-3 py-1 text-base rounded-full shadow-sm">
      Certified
    </Badge>
  ) : (
    <Badge className="bg-gray-300 text-gray-800 px-3 py-1 text-base rounded-full shadow-sm">
      Not Certified
    </Badge>
  );

  function formatAmount(amount: any) {
    if (amount === null || amount === undefined || amount === "") return "-";
    const str = String(amount).replace(/,/g, "").trim();
    if (!str || isNaN(Number(str))) return "-";
    return Number(str).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-8 shadow-2xl rounded-2xl border bg-gradient-to-tr from-white via-gray-50 to-blue-50">
        <DialogHeader>
          <div className="flex justify-between items-center mb-1">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <span className="text-blue-900">Certified Invoice Detail</span>
              {certifiedBadge}
            </DialogTitle>
            <DialogClose asChild>
              <Button size="icon" variant="ghost" className="hover:bg-gray-100">
                <X className="h-6 w-6" />
              </Button>
            </DialogClose>
          </div>
          <p className="text-gray-500 text-sm ml-0.5">
            Invoice No: <span className="font-semibold text-black">{invoice.invoice_no}</span>
          </p>
        </DialogHeader>

        {/* Supplier & Dates */}
        <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 my-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Supplier</div>
              <div className="font-semibold">{invoice.supplier_name || invoice.supplier_id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">PO Number</div>
              <div>{invoice.po_number}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Invoice Date</div>
              <div>{invoice.invoice_date}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Certified Date</div>
              <div>{invoice.certified_date || "-"}</div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-2">
          <hr className="flex-grow border-gray-300"/>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 bg-white/90">Financial</span>
          <hr className="flex-grow border-gray-300"/>
        </div>

        {/* Amounts */}
        <div className="rounded-xl border border-gray-200 bg-blue-50/70 backdrop-blur-md p-5 my-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Amount</div>
              <div className="font-bold text-2xl text-blue-900">SAR {formatAmount(invoice.invoice_amount)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Payable</div>
              <div className="font-bold text-2xl text-blue-900">SAR {formatAmount(invoice.payable)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Payment Type</div>
              <div>{invoice.payment_type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Payment Due Date</div>
              <div>{invoice.payment_due_date}</div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-2">
          <hr className="flex-grow border-gray-300"/>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 bg-white/90">Other Info</span>
          <hr className="flex-grow border-gray-300"/>
        </div>

        {/* Contract & Status */}
        <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Contract Type</div>
              <div>{invoice.contract_type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Certified?</div>
              <div>{certifiedBadge}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="outline" className="w-32 text-base font-medium">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}