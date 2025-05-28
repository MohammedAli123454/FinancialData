"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Type for invoice record
type InvoiceRecord = {
  certified_date: string;
  invoice_no: string;
  invoice_date: string;
  payment_type: string;
  payment_due_date: string;
  invoice_amount: number;
  payable: number;
  supplier_id: number;
  po_number: string;
  contract_type: string;
  certified: boolean;
};

const excelColumns = [
  { name: "certified_date", type: "YYYY-MM-DD", required: true },
  { name: "invoice_no", type: "String", required: true },
  { name: "invoice_date", type: "YYYY-MM-DD", required: true },
  { name: "payment_type", type: "String", required: true },
  { name: "payment_due_date", type: "YYYY-MM-DD", required: true },
  { name: "invoice_amount", type: "Number (e.g. 12345.67)", required: true },
  { name: "payable", type: "Number (e.g. 12345.67)", required: true },
  { name: "supplier_id", type: "Number (Supplier Table ID)", required: true },
  { name: "po_number", type: "String", required: true },
  { name: "contract_type", type: "String", required: true },
  { name: "certified", type: "Boolean (TRUE/FALSE or 1/0)", required: true },
];

const headerMap = {
    certified_date: ["certified_date", "certifiedDate"],
    invoice_no: ["invoice_no", "invoiceNo"],
    invoice_date: ["invoice_date", "INVOICE DATE", "invoiceDate"],
    payment_type: ["payment_type", "PAYMENT TYPE", "paymentType"],
    payment_due_date: ["payment_due_date", "paymentDueDate"],
    invoice_amount: ["invoice_amount", "invoiceAmount"],
    payable: ["payable", "Payable"],
    supplier_id: ["supplier_id", "supplierId"],
    po_number: ["po_number", "poNumber"],
    contract_type: ["contract_type", "Contract Type", "contractType"],
    certified: ["certified", "Certified"],
  };
  
  function getValue(row: Record<string, any>, possible: string[]): any {
    for (let k of possible) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
    }
    return "";
  }

export default function InvoicesUploadPage() {
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openFormat, setOpenFormat] = useState(false);

  // Handle Excel File Upload
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    // Map Excel to InvoiceRecord (snake_case!)
    const cleaned: InvoiceRecord[] = json.map((row) => ({
        certified_date: String(getValue(row, headerMap.certified_date)).trim(),
        invoice_no: String(getValue(row, headerMap.invoice_no)).trim(),
        invoice_date: String(getValue(row, headerMap.invoice_date)).trim(),
        payment_type: String(getValue(row, headerMap.payment_type)).trim(),
        payment_due_date: String(getValue(row, headerMap.payment_due_date)).trim(),
        invoice_amount:
          parseFloat(String(getValue(row, headerMap.invoice_amount)).replace(/[, ]/g, "")) || 0,
        payable:
          parseFloat(String(getValue(row, headerMap.payable)).replace(/[, ]/g, "")) || 0,
        supplier_id: parseInt(String(getValue(row, headerMap.supplier_id)).replace(/[^\d]/g, ""), 10) || 0,
        po_number: String(getValue(row, headerMap.po_number)).trim(),
        contract_type: String(getValue(row, headerMap.contract_type)).trim(),
        certified: (() => {
          const val = String(getValue(row, headerMap.certified)).toLowerCase();
          return val === "yes" || val === "true" || val === "1" || val === "t";
        })(),
      }));
      setRecords(cleaned);
    }; // <--- CLOSE handleFile here!

  // Post to API (batching and progress)
 const postToDatabase = async () => {
    setUploading(true);
    setProgress(0);
    let success = true;
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      try {
        const res = await fetch("/api/invoices-upload", {
          method: "POST",
          body: JSON.stringify(batch),
          headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        if (!res.ok) {
          alert("Error posting batch: " + (result?.error || res.statusText));
          success = false;
          break;
        }
        setProgress(Math.round(((i + batch.length) / records.length) * 100));
      } catch (err) {
        alert("Network error: " + (err as any).message);
        success = false;
        break;
      }
    }
    setUploading(false);
    if (success) {
      alert("All records posted successfully!");
    }
  };
  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Invoices (Excel)</h1>
      <div className="flex gap-4 mb-2">
        <Dialog open={openFormat} onOpenChange={setOpenFormat}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-dashed"
              onClick={() => setOpenFormat(true)}
            >
              View Required Excel Format
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Required Excel Format for Invoices Upload</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-xs">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 w-44">Column</th>
                    <th className="border px-2 py-1 w-36">Type/Format</th>
                    <th className="border px-2 py-1 w-20">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {excelColumns.map((col) => (
                    <tr key={col.name}>
                      <td className="border px-2 py-1 font-mono">{col.name}</td>
                      <td className="border px-2 py-1">{col.type}</td>
                      <td className="border px-2 py-1 text-center">{col.required ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" onClick={() => setOpenFormat(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFile}
          disabled={uploading}
        />
      </div>
      {records.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-96 border rounded-lg">
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  <th className="border px-3 py-2 w-36">Certified Date</th>
                  <th className="border px-3 py-2 w-44">Invoice No</th>
                  <th className="border px-3 py-2 w-36">Invoice Date</th>
                  <th className="border px-3 py-2 w-40">Payment Type</th>
                  <th className="border px-3 py-2 w-36">Payment Due Date</th>
                  <th className="border px-3 py-2 w-32 text-right">Invoice Amount</th>
                  <th className="border px-3 py-2 w-32 text-right">Payable</th>
                  <th className="border px-3 py-2 w-32">Supplier ID</th>
                  <th className="border px-3 py-2 w-40">PO Number</th>
                  <th className="border px-3 py-2 w-44">Contract Type</th>
                  <th className="border px-3 py-2 w-28">Certified</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{rec.certified_date}</td>
                    <td className="border px-2 py-1 truncate">{rec.invoice_no}</td>
                    <td className="border px-2 py-1">{rec.invoice_date}</td>
                    <td className="border px-2 py-1">{rec.payment_type}</td>
                    <td className="border px-2 py-1">{rec.payment_due_date}</td>
                    <td className="border px-2 py-1 text-right">{rec.invoice_amount.toLocaleString()}</td>
                    <td className="border px-2 py-1 text-right">{rec.payable.toLocaleString()}</td>
                    <td className="border px-2 py-1">{rec.supplier_id}</td>
                    <td className="border px-2 py-1 truncate">{rec.po_number}</td>
                    <td className="border px-2 py-1">{rec.contract_type}</td>
                    <td className="border px-2 py-1 text-center">{rec.certified ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={postToDatabase} disabled={uploading} className="mt-4">
            Post to Database
          </Button>
        </>
      )}
      {uploading && (
        <div>
          <Progress value={progress} />
          <div className="text-sm mt-2">{progress}% complete</div>
        </div>
      )}
    </div>
  );
}
