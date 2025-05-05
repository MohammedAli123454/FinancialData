"use client";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarLoader } from "react-spinners";
import * as z from "zod";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

import { Calendar } from "@/components/ui/calendar";
import { Loader2, Plus } from "lucide-react";

import { useFiltersStore } from "@/app/stores/filters-store";
import { FiltersDialog } from "@/components/FiltersDialog";
import PartialInvoiceTable from "@/components/PartialInvoiceTable";
import { useInvoiceStore } from "@/app/stores/invoice-store";

import "react-toastify/dist/ReactToastify.css";
import { StatusDialog } from "@/components/StatusDialog";
import { DeleteDialog } from "@/components/DeleteDialog";

// -- Form schema and types --
const formSchema = z.object({
  mocId: z.string().min(1, "MOC is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.date(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  vat: z.string(),
  retention: z.string(),
  invoiceStatus: z.string().min(1, "Status is required"),
  receiptDate: z.date().optional().nullable(),
});
type FormValues = z.infer<typeof formSchema>;

interface MocOption { id: number; mocNo: string; cwo: string; }
interface ApiResponse<T> { success: boolean; data?: T; message?: string; }
interface PartialInvoice {
  id: number;
  mocId: number;
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

interface UpdateInvoiceParams {
  id: number;
  data: Partial<{
    mocId: number;
    invoiceNo: string;
    invoiceDate: string;
    amount: string;
    vat: string;
    retention: string;
    payable: string;
    invoiceStatus: string;
    receiptDate: string | null;
  }>;
}

const formDefaults = {
  mocId: "",
  invoiceNo: "",
  invoiceDate: new Date(),
  amount: "",
  vat: "",
  retention: "",
  invoiceStatus: "",
  receiptDate: null,
};

// -- API Client Functions --
const fetchMocOptions = async () => {
  const response = await fetch('/api/mocs');
  if (!response.ok) throw new Error('Failed to fetch MOC options');
  return response.json();
};

const fetchPartialInvoices = async () => {
  const response = await fetch('/api/partial-invoices');
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
};

const createPartialInvoice = async (data: any) => {
  const response = await fetch('/api/partial-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorPayload = await response.json();
    throw new Error(errorPayload.message);
  }
};

const updatePartialInvoice = async ({ id, data }: UpdateInvoiceParams) => {
  const response = await fetch(`/api/partial-invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorPayload = await response.json();
    throw new Error(errorPayload.message);
  }
};

const deletePartialInvoice = async (id: number) => {
  const response = await fetch(`/api/partial-invoices/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorPayload = await response.json();
    throw new Error(errorPayload.message);
  }
};

// -- Component --
export default function PartialInvoicesEntry() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  // Filters store
  const applied = useFiltersStore((s) => s.applied);
  const resetAll = useFiltersStore((s) => s.resetAll);
  const [startDate, endDate] = applied.dateRange;

  // Invoice store
  const {
    selectedInvoiceId,
    actionType,
    statusInvoice,
    newStatus,
    newReceiptDate,
    setSelectedInvoice,
    setStatusData,
    clearSelection,
  } = useInvoiceStore();

  // Local UI state
  const [isAddingNewInvoice, setIsAddingNewInvoice] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaults,
  });

  // Queries
  const { data: mocOptions, isLoading: mocLoading } = useQuery<ApiResponse<MocOption[]>>({
    queryKey: ["mocOptions"],
    queryFn: fetchMocOptions,
  });
  const { data: invoicesResp, isLoading: invoicesLoading } = useQuery<ApiResponse<PartialInvoice[]>>({
    queryKey: ["partialInvoices"],
    queryFn: fetchPartialInvoices,
  });
  const invoices = invoicesResp?.data || [];

  // Mutations
  const addMutation = useMutation({
    mutationFn: createPartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice added successfully!");
      form.reset(formDefaults);
      setIsAddingNewInvoice(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: (params: UpdateInvoiceParams) => updatePartialInvoice(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice updated successfully!");
      form.reset(formDefaults);
      setEditId(null);
      setIsAddingNewInvoice(false);
      clearSelection();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePartialInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice deleted successfully!");
      clearSelection();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, date }: { id: number; status: string; date?: Date }) =>
      updatePartialInvoice({
        id,
        data: {
          invoiceStatus: status,
          receiptDate: date ? format(date, "yyyy-MM-dd") : null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Status updated successfully!");
      clearSelection();
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Helpers
  const calculateValues = useCallback((amount: number) => ({
    vat: amount * 0.15,
    retention: amount * 0.1,
  }), []);
  const handleAmountChange = (val: string) => {
    const amt = parseFloat(val);
    if (!isNaN(amt)) {
      const { vat, retention } = calculateValues(amt);
      form.setValue("vat", vat.toFixed(2), { shouldValidate: true });
      form.setValue("retention", retention.toFixed(2), { shouldValidate: true });
    }
  };
  const generateInvoiceNumber = useCallback(async (mocId: string) => {
    if (!mocOptions?.success) return;
    const moc = mocOptions.data?.find(m => m.id.toString() === mocId);
    if (!moc) return;
    const existing = queryClient.getQueryData<ApiResponse<PartialInvoice[]>>(["partialInvoices"]);
    const maxNumber = Math.max(
      0,
      ...(existing?.data || [])
        .filter(i => i.mocId === parseInt(mocId))
        .map(i => parseInt(i.invoiceNo.match(/INV-C-(\d+)$/)?.[1] || "0"))
    );
    form.setValue(
      "invoiceNo",
      `${moc.cwo} INV-C-${(maxNumber + 1).toString().padStart(3, "0")}`,
      { shouldValidate: true }
    );
  }, [mocOptions, queryClient, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      mocId: parseInt(values.mocId),
      invoiceDate: format(values.invoiceDate, "yyyy-MM-dd"),
      amount: parseFloat(values.amount).toFixed(2),
      vat: parseFloat(values.vat).toFixed(2),
      retention: parseFloat(values.retention).toFixed(2),
      payable: (
        parseFloat(values.amount) +
        parseFloat(values.vat) -
        parseFloat(values.retention)
      ).toFixed(2),
      receiptDate: values.receiptDate
        ? format(values.receiptDate, "yyyy-MM-dd")
        : null,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleEdit = (inv: PartialInvoice) => {
    form.reset({
      ...inv,
      mocId: inv.mocId.toString(),
      invoiceNo: inv.invoiceNo,
      invoiceDate: new Date(inv.invoiceDate),
      amount: inv.amount.toString(),
      vat: inv.vat.toString(),
      retention: inv.retention.toString(),
      receiptDate: inv.receiptDate ? new Date(inv.receiptDate) : null,
    });
    setEditId(inv.id);
    setIsAddingNewInvoice(true);
    setSelectedInvoice(inv.id, "edit");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Filtering
  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.invoiceDate);
    const inDateRange =
      (!startDate || !endDate) ||
      (invDate >= (startDate!) && invDate <= (endDate!));
    return (
      inDateRange &&
      (applied.search === "" ||
        inv.invoiceNo.toLowerCase().includes(applied.search.toLowerCase()) ||
        inv.mocNo.toLowerCase().includes(applied.search.toLowerCase())) &&
      (applied.cwo === "" ||
        inv.invoiceNo.toLowerCase().includes(applied.cwo.toLowerCase())) &&
      (applied.moc === "all" || inv.mocNo === applied.moc) &&
      (applied.status === "all" || inv.invoiceStatus === applied.status)
    );
  });

  // Dialog side‑effects
  useEffect(() => {
    // nothing extra needed here for now
  }, [actionType, selectedInvoiceId, statusInvoice]);

  // Handle "edit" action from the InvoiceStore
  useEffect(() => {
    if (actionType === 'edit' && selectedInvoiceId != null) {
      const inv = invoices.find(i => i.id === selectedInvoiceId);
      if (inv) {
        handleEdit(inv);
        clearSelection(); // reset the store so we don’t re-trigger
      }
    }
  }, [actionType, selectedInvoiceId, invoices, handleEdit, clearSelection]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-2 h-full flex flex-col">
          {/* Add / Edit Form */}
          {!isAddingNewInvoice && !editId && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  form.reset(formDefaults);
                  setEditId(null);
                  setIsAddingNewInvoice(true);
                  clearSelection();
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Invoice
              </Button>
            </div>
          )}
          {(isAddingNewInvoice || editId) && (
            <div ref={formRef}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {editId ? "Edit Partial Invoice" : "Add Partial Invoice"}
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select MOC Number</Label>
                    <Select value={form.watch("mocId")} onValueChange={value => { form.setValue("mocId", value, { shouldValidate: true }); if (!editId) generateInvoiceNumber(value); }} required disabled={mocLoading}>
                      <SelectTrigger className="h-9 text-gray-700">
                        <SelectValue placeholder={mocLoading ? "Loading MOCs..." : mocOptions?.success ? "Select MOC" : "Error loading MOCs"} />
                      </SelectTrigger>
                      <SelectContent>
                        {mocLoading && <SelectItem disabled value="loading">Loading MOC options...</SelectItem>}
                        {!mocLoading && !mocOptions?.success && <SelectItem disabled value="error" className="text-red-500">{mocOptions?.message || "Error loading MOC options"}</SelectItem>}
                        {mocOptions?.success && mocOptions.data?.map((moc: MocOption) => (
                          <SelectItem key={moc.id} value={moc.id.toString()} className="text-sm text-gray-700">{moc.mocNo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Invoice Number</Label>
                    <Input {...form.register("invoiceNo")} readOnly className="bg-gray-100 text-gray-700" placeholder={form.watch("mocId") ? "Generating..." : "Select MOC first"} />
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full text-gray-700">
                          {form.watch("invoiceDate") ? format(form.watch("invoiceDate"), "yyyy-MM-dd") : "Select Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar mode="single" selected={form.watch("invoiceDate")} onSelect={date => date && form.setValue("invoiceDate", date, { shouldValidate: true })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-700" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Enter Invoice Amount</Label>
                    <Input {...form.register("amount")} type="number" step="0.01" onChange={e => handleAmountChange(e.target.value)} required className="text-gray-700" />
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Value Added Tax(VAT)</Label>
                    <Input {...form.register("vat")} type="number" step="0.01" disabled className="bg-gray-100 text-gray-700" />
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Retention Value</Label>
                    <Input {...form.register("retention")} type="number" step="0.01" disabled className="bg-gray-100 text-gray-700" />
                  </div>
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select Invoice Status</Label>
                    <Select value={form.watch("invoiceStatus")} onValueChange={value => form.setValue("invoiceStatus", value, { shouldValidate: true })} required>
                      <SelectTrigger className="h-9 text-gray-700">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["PMD", "PMT", "FINANCE", "PAID"].map(status => (
                          <SelectItem key={status} value={status} className="text-sm text-gray-700">{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset(formDefaults);
                        setEditId(null);
                        setIsAddingNewInvoice(false);
                        clearSelection();
                      }}
                      disabled={addMutation.isPending || updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        addMutation.isPending ||
                        updateMutation.isPending ||
                        !form.formState.isValid
                      }
                    >
                      {(addMutation.isPending || updateMutation.isPending) ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" /> Save Invoice
                        </>
                      )}
                    </Button>
                  </div>
                  </div>
              </form>
            </div>
          )}

          {/* List & Filters */}
          <div className="mt-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="gradient-title text-2xl">
                Partial Invoices List
              </h4>
              <div className="space-x-2">
                <Button variant="outline" onClick={resetAll}>
                  Clear Filters
                </Button>
                <FiltersDialog mocOptions={mocOptions?.data || []} />
              </div>
            </div>
            <div className="mt-2 flex-1 flex flex-col">
              <PartialInvoiceTable
                data={filteredInvoices}
                isLoading={invoicesLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Dialog */}
      {actionType === "status" && statusInvoice && (
        <StatusDialog
          saving={updateStatusMutation.isPending}
          onCancel={clearSelection}
          onSave={(st, dt) => updateStatusMutation.mutate({ id: statusInvoice.id, status: st, date: dt })}
        />
      )}

      {/* Delete Dialog */}
      {actionType === "delete" && selectedInvoiceId != null && (
        <DeleteDialog
          confirming={deleteMutation.isPending}
          onCancel={clearSelection}
          onConfirm={() => deleteMutation.mutate(selectedInvoiceId)}
        />
      )}
    </div>
  );
}
