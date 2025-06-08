"use client";
import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function InvoiceForm({ customers, items }: { customers: any[], items: any[] }) {
  const { control, register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      customer_id: "",
      invoice_date: format(new Date(), "yyyy-MM-dd"),
      invoice_type: "cash",
      payment_terms: "",
      invoice_term: "",
      notes: "",
      details: [],
    },
  });

  const [rowData, setRowData] = useState<any[]>([
    { sr_no: 1, item_id: "", code: "", description: "", unit: "", qty: 1, price: 0, total: 0 },
  ]);

  // React Select options
  const customerOptions = customers.map((c: any) => ({ value: c.id, label: c.name }));
  const itemOptions = items.map((i: any) => ({ value: i.id, label: `${i.code} - ${i.description}` }));

  // AG Grid columns
  const columnDefs = useMemo(() => [
    { headerName: "Sr No", field: "sr_no", width: 70, editable: false },
    {
      headerName: "Item Code",
      field: "item_id",
      width: 220,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: items.map(i => i.id.toString()),
      },
      valueFormatter: (params: any) => {
        const item = items.find(i => i.id === Number(params.value));
        return item ? item.code : "";
      },
      editable: true,
      singleClickEdit: true,
    },
    {
      headerName: "Description",
      field: "description",
      width: 200,
      editable: false,
      valueGetter: (params: any) => {
        const item = items.find(i => i.id === Number(params.data.item_id));
        return item ? item.description : "";
      }
    },
    {
      headerName: "Unit",
      field: "unit",
      width: 80,
      editable: false,
      valueGetter: (params: any) => {
        const item = items.find(i => i.id === Number(params.data.item_id));
        return item ? item.unit : "";
      }
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 90,
      editable: true,
      valueParser: (params: any) => Number(params.newValue) || 0,
    },
    {
      headerName: "Price",
      field: "price",
      width: 120,
      editable: true,
      valueParser: (params: any) => Number(params.newValue) || 0,
      valueGetter: (params: any) => {
        const item = items.find(i => i.id === Number(params.data.item_id));
        return params.data.price || (item ? Number(item.price) : 0);
      }
    },
    {
      headerName: "Total",
      field: "total",
      width: 120,
      valueGetter: (params: any) => Number(params.data.qty) * Number(params.data.price),
      editable: false,
    },
    {
      headerName: "",
      field: "delete",
      width: 50,
      cellRenderer: (params: any) =>
        rowData.length > 1 ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteRow(params.node.rowIndex)}
          >
            X
          </Button>
        ) : null,
    }
  ], [items, rowData]);

  // Handle cell edits
  function onCellValueChanged(params: any) {
    const data = params.data;
    if (params.colDef.field === "item_id") {
      const item = items.find(i => i.id === Number(data.item_id));
      if (item) {
        data.code = item.code;
        data.description = item.description;
        data.unit = item.unit;
        data.price = Number(item.price);
      }
    }
    data.total = Number(data.qty) * Number(data.price);
    setRowData([...rowData]);
  }

  // Add row
  function handleAddRow() {
    setRowData([
      ...rowData,
      { sr_no: rowData.length + 1, item_id: "", code: "", description: "", unit: "", qty: 1, price: 0, total: 0 }
    ]);
  }

  // Delete row
  function handleDeleteRow(idx: number) {
    const newRows = rowData.filter((_, i) => i !== idx).map((row, i) => ({ ...row, sr_no: i + 1 }));
    setRowData(newRows);
  }

  // Overall totals
  const overallQty = rowData.reduce((sum, row) => sum + Number(row.qty), 0);
  const overallPrice = rowData.reduce((sum, row) => sum + Number(row.total), 0);

  // Handle form submission
  async function onSubmit(formData: any) {
    formData.details = rowData.map(row => ({
      ...row,
      item_id: Number(row.item_id),
      qty: Number(row.qty),
      price: Number(row.price),
      total: Number(row.qty) * Number(row.price),
    }));
    // Call your API route to save the invoice
    const res = await fetch("/api/invoices1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert("Invoice saved!");
      // Reset logic here if needed
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <label className="block font-medium mb-1">Customer</label>
          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <Select
                {...field}
                options={customerOptions}
                onChange={opt => field.onChange(opt?.value)}
                value={customerOptions.find(opt => opt.value === field.value)}
                placeholder="Select customer"
              />
            )}
          />
        </div>
        <div className="w-40">
          <label className="block font-medium mb-1">Invoice Date</label>
          <input type="date" className="input" {...register("invoice_date")} />
        </div>
        <div className="w-32">
          <label className="block font-medium mb-1">Type</label>
          <select className="input" {...register("invoice_type")}>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="w-52">
          <label className="block font-medium mb-1">Invoice Term</label>
          <input className="input" {...register("invoice_term")} placeholder="e.g. 30 days" />
        </div>
        <div className="w-52">
          <label className="block font-medium mb-1">Payment Terms</label>
          <input className="input" {...register("payment_terms")} placeholder="Payment Terms" />
        </div>
      </div>
      {/* Invoice Items Table */}
      <div className="ag-theme-alpine" style={{ height: 250, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          stopEditingWhenCellsLoseFocus
          domLayout="autoHeight"
          singleClickEdit
          editType="fullRow"
          suppressRowClickSelection
        />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Button type="button" variant="outline" onClick={handleAddRow}>+ Add Row</Button>
      </div>
      {/* Totals */}
      <div className="flex justify-end gap-12 text-lg mt-4">
        <div><b>Total Qty:</b> {overallQty}</div>
        <div><b>Total Price:</b> {overallPrice.toFixed(2)}</div>
      </div>
      {/* Footer */}
      <div>
        <label className="block font-medium mb-1">Notes</label>
        <textarea className="input w-full" {...register("notes")} rows={2} />
      </div>
      <Button type="submit" className="mt-4">Save Invoice</Button>
    </form>
  );
}
