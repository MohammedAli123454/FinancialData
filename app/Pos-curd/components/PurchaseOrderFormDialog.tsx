"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { Supplier, PurchaseOrderForm, PurchaseOrderLineItemForm, PurchaseOrderWithLineItems } from "../types";

// ---- AG Grid Types ----
import type {
    ColDef,
    ValueGetterParams,
    ICellRendererParams,
    CellValueChangedEvent,
    ValueParserParams,
} from "ag-grid-community";

// ---- Validation Schema ----
const poSchema = z.object({
    supplierId: z.number().min(1, "Supplier is required"),
    poNumber: z.string().min(1, "PO Number is required"),
    currency: z.string().min(1, "Currency is required"),
    poValue: z.preprocess(Number, z.number().gt(0, "PO Value must be > 0")),
    poValueWithVAT: z.preprocess(Number, z.number().gt(0, "PO Value With VAT must be > 0")),
    masterPo: z.string().optional(),
    lineItems: z
        .array(
            z.object({
                lineNo: z.number(),
                moc: z.string(),
                description: z.string(),
                unit: z.string(),
                totalQty: z.preprocess(Number, z.number()),
                ratePerUnit: z.preprocess(Number, z.number()),
                totalValueSar: z.preprocess(Number, z.number()),
            })
        )
        .min(1, "At least one line item is required"),
});

const STATIC_CURRENCIES = [
    { code: "USD", name: "United States Dollar" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "EUR", name: "Euro" },
    { code: "AED", name: "UAE Dirham" },
    { code: "INR", name: "Indian Rupee" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "GBP", name: "British Pound" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "JPY", name: "Japanese Yen" },
];

export default function PurchaseOrderFormDialog({
    open,
    onClose,
    suppliers,
    initial,
    onSubmit,
    loading,
}: {
    open: boolean;
    onClose: () => void;
    suppliers: Supplier[];
    initial?: PurchaseOrderWithLineItems | null;
    onSubmit: (data: any) => void;
    loading?: boolean;
}) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch,
    } = useForm<any>({
        resolver: zodResolver(poSchema),
        defaultValues: {
            supplierId: initial?.supplierId ?? "",
            poNumber: initial?.poNumber ?? "",
            currency: initial?.currency ?? "",
            poValue: initial?.poValue ?? "",
            poValueWithVAT: initial?.poValueWithVAT ?? "",
            masterPo: initial?.masterPo ?? "",
            lineItems: initial?.lineItems?.length
                ? initial.lineItems
                : [
                    {
                        lineNo: 1,
                        moc: "",
                        description: "",
                        unit: "",
                        totalQty: 0,
                        ratePerUnit: 0,
                        totalValueSar: 0,
                    },
                ],
        },
    });

    const [rowData, setRowData] = useState<PurchaseOrderLineItemForm[]>(
        initial?.lineItems?.length
            ? initial.lineItems
            : [
                {
                    lineNo: 1,
                    moc: "",
                    description: "",
                    unit: "",
                    totalQty: 0,
                    ratePerUnit: 0,
                    totalValueSar: 0,
                },
            ]
    );
    const gridRef = useRef<AgGridReact<PurchaseOrderLineItemForm>>(null);

    useEffect(() => {
        setValue("lineItems", rowData);
    }, [rowData, setValue]);

    useEffect(() => {
        if (initial?.lineItems) setRowData(initial.lineItems);
    }, [initial]);

    // ---- AG Grid Columns with types ----
    const columnDefs: ColDef[] = [
        {
            headerName: "Line No",
            field: "lineNo",
            editable: true,
            width: 90,
            cellEditor: "agNumberCellEditor",
        },
        {
            headerName: "MOC",
            field: "moc",
            editable: true,
            width: 120,
        },
        {
            headerName: "Description",
            field: "description",
            editable: true,
            flex: 2,
        },
        {
            headerName: "Unit",
            field: "unit",
            editable: true,
            width: 90,
        },
        {
            headerName: "Total Qty",
            field: "totalQty",
            editable: true,
            width: 110,
            cellEditor: "agNumberCellEditor",
            valueParser: (params: ValueParserParams) => Number(params.newValue),
        },
        {
            headerName: "Rate/Unit",
            field: "ratePerUnit",
            editable: true,
            width: 110,
            cellEditor: "agNumberCellEditor",
            valueParser: (params: ValueParserParams) => Number(params.newValue),
        },
        {
            headerName: "Total Value (SAR)",
            field: "totalValueSar",
            editable: false,
            width: 130,
            valueGetter: (params: ValueGetterParams) =>
                params.data?.totalQty && params.data?.ratePerUnit
                    ? Number(params.data.totalQty) * Number(params.data.ratePerUnit)
                    : 0,
        },
        {
            headerName: "Delete",
            field: "actions",
            width: 90,
            cellRenderer: (params: ICellRendererParams) => (
                <button
                    type="button"
                    className="text-red-600 font-bold"
                    onClick={e => {
                        e.preventDefault();
                        setRowData(d =>
                            d
                                .filter((_, idx) => idx !== params.node.rowIndex)

                                .map((item, i) => ({ ...item, lineNo: i + 1 }))
                        );
                    }}
                >
                    ×
                </button>
            ),
        },
    ];

    function onCellValueChanged(event: CellValueChangedEvent<PurchaseOrderLineItemForm>) {
        setRowData(old =>
            old.map((row, i) =>
                i === event.rowIndex
                    ? {
                        ...row,
                        [event.colDef.field as keyof PurchaseOrderLineItemForm]: event.data[event.colDef.field as keyof PurchaseOrderLineItemForm],
                        totalValueSar:
                            event.colDef.field === "totalQty" || event.colDef.field === "ratePerUnit"
                                ? Number(event.data.totalQty) * Number(event.data.ratePerUnit)
                                : row.totalValueSar,
                    }
                    : row
            )
        );
    }

    function handleAddLine() {
        setRowData(d => [
            ...d,
            {
                lineNo: d.length + 1,
                moc: "",
                description: "",
                unit: "",
                totalQty: 0,
                ratePerUnit: 0,
                totalValueSar: 0,
            },
        ]);
    }

    const submitHandler = (formData: any) => {
        formData.lineItems = rowData.map((row, idx) => ({
            ...row,
            lineNo: idx + 1,
            totalValueSar: Number(row.totalQty) * Number(row.ratePerUnit),
        }));
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-6">
                <DialogHeader>
                    <DialogTitle>{initial ? "Edit PO" : "Create PO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="supplierId">Supplier</Label>
                            <Select
                                value={String(watch("supplierId") || "")}
                                onValueChange={val => setValue("supplierId", Number(val))}
                                disabled={!suppliers.length}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplierId?.message && (
                                <span className="text-red-500 text-xs">
                                    {String(errors.supplierId.message)}
                                </span>
                            )}

                        </div>
                        <div>
                            <Label htmlFor="poNumber">PO Number</Label>
                            <Input id="poNumber" {...register("poNumber")} />
                            {errors.poNumber && (
                                <span className="text-red-500 text-xs">{String(errors.poNumber.message)}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={watch("currency")}
                                onValueChange={val => setValue("currency", val)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATIC_CURRENCIES.map(cur => (
                                        <SelectItem key={cur.code} value={cur.code}>
                                            {cur.code} — {cur.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.currency && (
                                <span className="text-red-500 text-xs">{String(errors.currency.message)}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="masterPo">Master PO</Label>
                            <Input id="masterPo" {...register("masterPo")} />
                        </div>
                        <div>
                            <Label htmlFor="poValue">PO Value</Label>
                            <Input
                                id="poValue"
                                type="number"
                                step="0.01"
                                {...register("poValue", { valueAsNumber: true })}
                            />
                            {errors.poValue && (
                                <span className="text-red-500 text-xs">{String(errors.poValue.message)}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="poValueWithVAT">PO Value With VAT</Label>
                            <Input
                                id="poValueWithVAT"
                                type="number"
                                step="0.01"
                                {...register("poValueWithVAT", { valueAsNumber: true })}
                            />
                            {errors.poValueWithVAT && (
                                <span className="text-red-500 text-xs">{String(errors.poValueWithVAT.message)}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label>PO Line Items</Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={handleAddLine}
                            >
                                + Add Line
                            </Button>
                        </div>
                        <div
                            className="ag-theme-alpine"
                            style={{ height: 240, width: "100%" }}
                        >
                          <AgGridReact
  ref={gridRef}
  rowData={rowData}
  columnDefs={columnDefs}
  domLayout="autoHeight"
  onCellValueChanged={onCellValueChanged}
  stopEditingWhenCellsLoseFocus={true}
  suppressRowClickSelection={true}
  singleClickEdit={true}
  editType="fullRow"
  getRowId={(params: { data: PurchaseOrderLineItemForm }) => String(params.data.lineNo)}
/>


                        </div>
                        {errors.lineItems && (
                            <span className="text-red-500 text-xs">{String(errors.lineItems.message)}</span>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : initial ? "Update PO" : "Create PO"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
