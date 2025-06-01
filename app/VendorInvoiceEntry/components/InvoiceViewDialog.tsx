"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function InvoiceViewDialog({ open, onClose, invoice }: { open: boolean, onClose: () => void, invoice: any }) {
  if (!invoice) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Invoice No: <b>{invoice.invoice_no}</b>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 my-2 text-sm">
          <div><span className="font-medium">Supplier:</span> {invoice.supplier_name || invoice.supplier_id}</div>
          <div><span className="font-medium">PO No:</span> {invoice.po_number}</div>
          <div><span className="font-medium">Invoice Date:</span> {invoice.invoice_date}</div>
          <div><span className="font-medium">Certified Date:</span> {invoice.certified_date || "-"}</div>
          <div><span className="font-medium">Amount:</span> {invoice.invoice_amount}</div>
          <div><span className="font-medium">Payable:</span> {invoice.payable}</div>
          <div><span className="font-medium">Payment Type:</span> {invoice.payment_type}</div>
          <div><span className="font-medium">Payment Due:</span> {invoice.payment_due_date}</div>
          <div><span className="font-medium">Contract Type:</span> {invoice.contract_type}</div>
          <div><span className="font-medium">Certified?</span> {invoice.certified ? "Yes" : "No"}</div>
          {/* Add more fields as needed */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
