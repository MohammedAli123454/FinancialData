"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

// Define the expected Excel columns, with sample and hints for download format
const EXCEL_COLUMNS = [
  { label: "purchaseOrderId", hint: "Number (REQUIRED, purchase_orders.id)" },
  { label: "supplierId", hint: "Number (REQUIRED, Supplier's DB ID)" },
  { label: "poNumber", hint: "Text (for reference, optional)" },
  { label: "masterPo", hint: "Text (for reference, optional)" },
  { label: "lineNo", hint: "Number (1, 2, ...)" },
  { label: "MOC", hint: "Text" },
  { label: "description", hint: "Text" },
  { label: "Unit", hint: "Text (e.g., Each, KG)" },
  { label: "totalQty", hint: "Number" },
  { label: "ratePerUnit", hint: "Number" },
  { label: "totalValueSar", hint: "Number" },
];

type LineItem = {
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
};

export default function POLineItemUploadPage() {
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState<LineItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mutation for batch upload
  const mutation = useMutation({
    mutationFn: async (data: LineItem[]) => {
      const res = await fetch("/api/polineitems-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Failed to upload");
      }
      return res.json();
    },
    onMutate: () => setUploading(true),
    // No alert here
    onSuccess: () => {
      setUploading(false);
    },
    onError: (err: any) => {
      setUploading(false);
      alert("Upload failed: " + (err?.message || err));
    },
  });
  
  

  // Parse Excel file, clean headers, and map data robustly
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

      // Extract normalized headers
      const headers = Object.keys(raw[0] || {}).map((k) =>
        k.trim().toLowerCase()
      );

      // Build a map of normalized header to original header
      const headerMap: Record<string, string> = {};
      Object.keys(raw[0] || {}).forEach((k) => {
        headerMap[k.trim().toLowerCase()] = k;
      });

      // Now parse each row using normalized headers
      const mapped: LineItem[] = raw.map((r: any) => ({
        purchaseOrderId: Number(
          r[headerMap["purchaseorderid"]] || r["purchaseOrderId"] || r["PurchaseOrderId"] || r["purchaseOrderId"]
        ),
        supplierId: Number(
          r[headerMap["supplierid"]] || r["supplierId"] || r["SupplierId"] || r["supplierId"]
        ),
        poNumber:
          r[headerMap["ponumber"]] !== undefined
            ? String(r[headerMap["ponumber"]]).trim()
            : undefined,
        masterPo:
          r[headerMap["masterpo"]] !== undefined
            ? String(r[headerMap["masterpo"]]).trim()
            : undefined,
        lineNo: Number(r[headerMap["lineno"]] ?? r["lineNo"] ?? r["LineNo"] ?? 1),
        moc: String(
          r[headerMap["moc"]] ?? r["MOC"] ?? r["moc"] ?? ""
        ).trim(),
        description: String(
          r[headerMap["description"]] ?? r["description"] ?? r["Description"] ?? ""
        ).trim(),
        unit: String(
          r[headerMap["unit"]] ?? r["Unit"] ?? r["unit"] ?? ""
        ).trim(),
        totalQty: Number(
          String(r[headerMap["totalqty"]] ?? r["totalQty"] ?? r["TotalQty"] ?? "0")
            .replace(/,/g, "")
        ),
        ratePerUnit: Number(
          String(
            r[headerMap["rateperunit"]] ?? r["ratePerUnit"] ?? r["RatePerUnit"] ?? "0"
          ).replace(/,/g, "")
        ),
        totalValueSar: Number(
          String(
            r[headerMap["totalvaluesar"]] ??
              r["totalValueSar"] ??
              r["TotalValueSar"] ??
              "0"
          ).replace(/,/g, "")
        ),
      }));

      setRecords(mapped);
      setProgress(0);
    };
    reader.readAsArrayBuffer(file);
  };

  // Download sample Excel format
  const handleDownloadFormat = () => {
    const ws = XLSX.utils.json_to_sheet([
      Object.fromEntries(EXCEL_COLUMNS.map((col) => [col.label, col.hint])),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Format");
    XLSX.writeFile(wb, "PO_Line_Item_Format.xlsx");
  };

  // Batch upload with progress bar
  const handleUpload = async () => {
    setProgress(0);
    const batchSize = 20;
    let uploaded = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await mutation.mutateAsync(batch);
      uploaded += batch.length;
      setProgress(Math.min(100, Math.round((uploaded / records.length) * 100)));
    }
    // Alert only after ALL batches finish
    alert("Upload successful!");
  };
  

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Purchase Order Line Items</h1>
      <div className="flex gap-3 mb-4">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFile}
          className="block"
        />
        <Button
          variant="outline"
          type="button"
          onClick={() => setShowFormat((v) => !v)}
        >
          {showFormat ? "Hide Excel File Format" : "Show Excel File Format"}
        </Button>
        <Button variant="secondary" type="button" onClick={handleDownloadFormat}>
          Download Format
        </Button>
      </div>

      {showFormat && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="font-semibold mb-2">Excel File Format Required</h2>
          <table className="border w-full text-xs">
            <thead>
              <tr>
                {EXCEL_COLUMNS.map((col) => (
                  <th key={col.label} className="border px-3 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {EXCEL_COLUMNS.map((col) => (
                  <td key={col.label} className="border px-3 py-2 text-gray-500">
                    {col.hint}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {records.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-96 border rounded-lg mb-4">
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  <th className="border px-3 py-2 w-32">Purchase Order ID</th>
                  <th className="border px-3 py-2 w-28">Supplier ID</th>
                  <th className="border px-3 py-2 w-32">PO Number</th>
                  <th className="border px-3 py-2 w-32">Master PO</th>
                  <th className="border px-3 py-2 w-20">Line No</th>
                  <th className="border px-3 py-2 w-36">MOC</th>
                  <th className="border px-3 py-2 w-56">Description</th>
                  <th className="border px-3 py-2 w-20">Unit</th>
                  <th className="border px-3 py-2 w-24 text-right">Total Qty</th>
                  <th className="border px-3 py-2 w-28 text-right">Rate/Unit</th>
                  <th className="border px-3 py-2 w-28 text-right">Total Value SAR</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{rec.purchaseOrderId}</td>
                    <td className="border px-2 py-1">{rec.supplierId}</td>
                    <td className="border px-2 py-1">{rec.poNumber}</td>
                    <td className="border px-2 py-1">{rec.masterPo}</td>
                    <td className="border px-2 py-1">{rec.lineNo}</td>
                    <td className="border px-2 py-1">{rec.moc}</td>
                    <td className="border px-2 py-1 truncate">{rec.description}</td>
                    <td className="border px-2 py-1">{rec.unit}</td>
                    <td className="border px-2 py-1 text-right">{rec.totalQty}</td>
                    <td className="border px-2 py-1 text-right">{rec.ratePerUnit.toLocaleString()}</td>
                    <td className="border px-2 py-1 text-right">{rec.totalValueSar.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="mb-4">
            {uploading ? "Uploading..." : "Upload to Database"}
          </Button>
          <Progress value={progress} className="h-2" />
        </>
      )}
    </div>
  );
}
