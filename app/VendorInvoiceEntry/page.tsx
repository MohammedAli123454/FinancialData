"use client";

import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import * as z from "zod";
import CalendarField from "./components/CalendarField";
import InvoiceTable from "./components/InvoiceTable"; // <-- Import the new table

const invoiceFormSchema = z.object({
    invoice_no: z.string().min(1, "Invoice number is required"),
    invoice_date: z.date({ required_error: "Invoice date is required" }),
    payment_type: z.enum(["ADVANCE PAYMENT", "ADVANCE SETTLEMENT", "CREDIT"], {
        errorMap: () => ({ message: "Payment type is required" }),
    }),
    payment_due_date: z.date({ required_error: "Payment due date is required" }),
    invoice_amount: z
        .string()
        .min(1, "Amount is required")
        .refine(val => parseFloat(val) > 0, "Amount must be greater than 0"),
    payable: z
        .string()
        .min(1, "Payable is required")
        .refine(val => parseFloat(val) > 0, "Payable must be greater than 0"),
    supplier_id: z.string().min(1, "Supplier is required"),
    po_number: z.string().min(1, "PO Number is required"),
    contract_type: z.enum(["GCS Contract"], { errorMap: () => ({ message: "Contract type is required" }) }),
    certified_date: z.date().optional().nullable(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers-list");
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    const json = await res.json();
    return json.data;
};

const fetchPONumbers = async () => {
    const res = await fetch("/api/po-list");
    if (!res.ok) throw new Error("Failed to fetch PO numbers");
    const json = await res.json();
    return json.data; // [{ po_number: '4001' }, ...]
};

const fetchInvoices = async () => {
    const res = await fetch("/api/invoices");
    if (!res.ok) throw new Error("Failed to fetch invoices");
    const json = await res.json();
    return json.data; // <- this is important!
};

const createInvoice = async (data: any) => {
    const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
};

export default function VendorInvoiceEntry() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const { data: suppliers, isLoading: isSuppliersLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: fetchSuppliers,
    });

    const { data: poNumbers, isLoading: isPONumbersLoading } = useQuery({
        queryKey: ["poNumbers"],
        queryFn: fetchPONumbers,
    });

    const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: fetchInvoices,
    });

    const mutation = useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice added!");
            form.reset();
            setShowForm(false);
        },
        onError: (err: any) => toast.error(err.message || "Error saving invoice"),
    });

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            invoice_no: "",
            invoice_date: new Date(),
            payment_type: undefined,
            payment_due_date: new Date(),
            invoice_amount: "",
            payable: "",
            supplier_id: "",
            po_number: "",
            contract_type: "GCS Contract",
            certified_date: undefined,
        },
    });

    function onSubmit(values: InvoiceFormValues) {
        const payload = {
            ...values,
            invoice_amount: parseFloat(values.invoice_amount),
            payable: parseFloat(values.payable),
            invoice_date: format(values.invoice_date, "yyyy-MM-dd"),
            payment_due_date: format(values.payment_due_date, "yyyy-MM-dd"),
            supplier_id: parseInt(values.supplier_id, 10),
            contract_type: "GCS Contract",
            certified: false,
            certified_date: values.certified_date
                ? format(values.certified_date, "yyyy-MM-dd")
                : null,
        };
        mutation.mutate(payload);
    }

    return (
        <div className="p-6 bg-white shadow rounded mb-8">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Vendor Invoice Entry</h2>
                {/* Show only if form is not visible */}
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Invoice
                    </Button>
                )}
            </div>

            {showForm ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-b pb-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ...your input fields remain unchanged... */}
                        <div>
                            <Label>Invoice Number</Label>
                            <Input {...form.register("invoice_no")} />
                            <p className="text-xs text-red-500">{form.formState.errors.invoice_no?.message}</p>
                        </div>
                        <CalendarField
                            label="Invoice Date"
                            value={form.watch("invoice_date")}
                            onChange={(date) => date && form.setValue("invoice_date", date)}
                            error={form.formState.errors.invoice_date?.message}
                        />
                        <div>
                            <Label>Payment Type</Label>
                            <Select
                                value={form.watch("payment_type")}
                                onValueChange={(value) =>
                                    form.setValue("payment_type", value as InvoiceFormValues["payment_type"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADVANCE PAYMENT">ADVANCE PAYMENT</SelectItem>
                                    <SelectItem value="ADVANCE SETTLEMENT">ADVANCE SETTLEMENT</SelectItem>
                                    <SelectItem value="CREDIT">CREDIT</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {form.formState.errors.payment_type?.message}
                            </p>
                        </div>
                        <CalendarField
                            label="Payment Due Date"
                            value={form.watch("payment_due_date")}
                            onChange={(date) => date && form.setValue("payment_due_date", date)}
                            error={form.formState.errors.payment_due_date?.message}
                        />
                        <div>
                            <Label>Invoice Amount</Label>
                            <Input
                                {...form.register("invoice_amount")}
                                type="number"
                                step="0.01"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    form.setValue("payable", val, { shouldValidate: true });
                                }}
                            />
                            <p className="text-xs text-red-500">
                                {form.formState.errors.invoice_amount?.message}
                            </p>
                        </div>
                        <div>
                            <Label>Payable Amount</Label>
                            <Input
                                {...form.register("payable")}
                                type="number"
                                step="0.01"
                            />
                            <p className="text-xs text-red-500">
                                {form.formState.errors.payable?.message}
                            </p>
                        </div>
                        <div>
                            <Label>Supplier</Label>
                            <Select
                                value={form.watch("supplier_id")}
                                onValueChange={(value) => form.setValue("supplier_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isSuppliersLoading && (
                                        <SelectItem value="" disabled>
                                            Loading...
                                        </SelectItem>
                                    )}
                                    {suppliers?.map((sup: any) => (
                                        <SelectItem value={sup.id.toString()} key={sup.id}>
                                            {sup.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {form.formState.errors.supplier_id?.message}
                            </p>
                        </div>
                        <div>
                            <Label>PO Number</Label>
                            <Select
                                value={form.watch("po_number")}
                                onValueChange={(value) => form.setValue("po_number", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {poNumbers?.map((po: any) => (
                                        <SelectItem value={po.po_number} key={po.po_number}>
                                            {po.po_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {form.formState.errors.po_number?.message}
                            </p>
                        </div>
                        <div>
                            <Label>Contract Type</Label>
                            <Select
                                value={form.watch("contract_type")}
                                onValueChange={(value) =>
                                    form.setValue("contract_type", value as "GCS Contract")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Contract Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GCS Contract">GCS Contract</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {form.formState.errors.contract_type?.message}
                            </p>
                        </div>
                        <div>
                            <CalendarField
                                label="Certified Date"
                                value={form.watch("certified_date") ?? undefined}
                                onChange={(date) => form.setValue("certified_date", date)}
                                error={form.formState.errors.certified_date?.message}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                "Save Invoice"
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <>
                    <h3 className="text-lg font-semibold mb-2">Recent Invoices</h3>
                    <InvoiceTable invoices={invoices || []} isInvoicesLoading={isInvoicesLoading} />
                </>
            )}
        </div>
    );
}
