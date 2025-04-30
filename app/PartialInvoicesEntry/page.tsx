"use client";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useFiltersStore } from "@/app/stores/filters-store";
import { FiltersDialog } from "@/components/FiltersDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit, Trash2, CalendarIcon, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import "react-toastify/dist/ReactToastify.css";

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


interface UpdateInvoiceParams {
  id: number;
  data: Partial<{
    mocId: number;
    invoiceNo: string;
    invoiceDate: string;
    amount: string;  // Changed to string
    vat: string;     // Changed to string
    retention: string; // Changed to string
    payable: string; // Changed to string
    invoiceStatus: string;
    receiptDate: string | null;
  }>;
}

interface PartialInvoice {
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
interface FilterValues { 
  search: string; 
  cwo: string; 
  moc: string; 
  status: string; 
  dateRange: [Date|null, Date|null]; 
}
const defaultFilters: FilterValues = { 
  search: "", 
  cwo: "", 
  moc: "all", 
  status: "all", 
  dateRange: [null, null] 
};
const formDefaults = { 
  mocId: "", 
  invoiceNo: "",
  invoiceDate: new Date(), 
  amount: "", 
  vat: "", 
  retention: "",
  invoiceStatus: "", 
  receiptDate: null 
};

// API Client Functions
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
    const errorPayload = await response.json()
    throw new Error(errorPayload.message)
  }
};




const updatePartialInvoice = async ({ id, data }: UpdateInvoiceParams) => {
  const response = await fetch(`/api/partial-invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorPayload = await response.json()
    throw new Error(errorPayload.message)
  }
};




const deletePartialInvoice = async (id: number) => {
  const response = await fetch(`/api/partial-invoices/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorPayload = await response.json()
    throw new Error(errorPayload.message)
  }
};

export default function PartialInvoicesEntry() {
  const queryClient = useQueryClient();
    // Zustand filters
    const applied = useFiltersStore((s) => s.applied);
    const resetAll = useFiltersStore((s) => s.resetAll);
    const [startDate, endDate] = applied.dateRange;

  const [editId, setEditId] = useState<number|null>(null);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [statusDialogInvoice, setStatusDialogInvoice] = useState<PartialInvoice|null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<PartialInvoice|null>(null);
  const [newStatus, setNewStatus] = useState("PMD");
  const [newReceiptDate, setNewReceiptDate] = useState<Date|null>(null);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [isAddingNewInvoice, setIsAddingNewInvoice] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);
 
  const formRef = useRef<HTMLDivElement>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: formDefaults });
  const router = useRouter();
  // Queries
  const { data: mocOptions, isLoading: mocLoading } = useQuery<ApiResponse<MocOption[]>>({ 
    queryKey: ["mocOptions"], 
    queryFn: fetchMocOptions 
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<ApiResponse<PartialInvoice[]>>({ 
    queryKey: ["partialInvoices"], 
    queryFn: fetchPartialInvoices 
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: createPartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice added successfully!");
      form.reset(formDefaults);
      setIsAddingNewInvoice(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateInvoiceParams) => updatePartialInvoice({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice updated successfully!");
      form.reset(formDefaults);
      setEditId(null);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice deleted successfully!");
    },
    onError: (error: any) => toast.error(error.message)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, date }: { id: number; status: string; date?: Date }) => 
      updatePartialInvoice({ 
        id, 
        data: { 
          invoiceStatus: status,
          receiptDate: date ? format(date, "yyyy-MM-dd") : null
        } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Status updated successfully!");
      setStatusDialogInvoice(null);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const calculateValues = useCallback((amount: number) => ({ vat: amount * 0.15, retention: amount * 0.1 }), []);
  const handleAmountChange = (value: string) => {
    const amt = parseFloat(value);
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
    const existingInvoices = await queryClient.getQueryData<ApiResponse<PartialInvoice[]>>(["partialInvoices"]);
    const maxNumber = Math.max(...((existingInvoices?.data || [])
      .filter(i => i.mocId === parseInt(mocId))
      .map(i => parseInt(i.invoiceNo.match(/INV-C-(\d+)$/)?.[1] || "0"))
      .concat(0)));
    form.setValue("invoiceNo", `${moc.cwo} INV-C-${(maxNumber + 1).toString().padStart(3, "0")}`, { shouldValidate: true });
  }, [mocOptions, queryClient, form]);

  const onSubmit = async (values: FormValues) => {
    if (!editId) {
      const duplicate = invoices?.data?.find(inv => inv.invoiceNo === values.invoiceNo);
      if (duplicate) {
        toast.error("Invoice cannot be saved as the current invoice number is already available in the database");
        return;
      }
    }
    const invoiceData = {
      ...values,
      mocId: parseInt(values.mocId),
      amount: parseFloat(values.amount).toFixed(2), // Explicit conversion
      vat: parseFloat(values.vat).toFixed(2),
      retention: parseFloat(values.retention).toFixed(2),
      payable: (parseFloat(values.amount) + parseFloat(values.vat) - parseFloat(values.retention)).toFixed(2),
      invoiceDate: format(values.invoiceDate, "yyyy-MM-dd"),
      receiptDate: values.receiptDate ? format(values.receiptDate, "yyyy-MM-dd") : null,
    };
  
    editId ? updateMutation.mutate({ id: editId, data: invoiceData }) : addMutation.mutate(invoiceData);
  };
  
  const handleEdit = (invoice: PartialInvoice) => {
    form.reset({
      ...invoice,
      mocId: invoice.mocId.toString(),
      amount: invoice.amount.toString(),
      vat: invoice.vat.toString(),
      retention: invoice.retention.toString(),
      invoiceDate: new Date(invoice.invoiceDate),
      receiptDate: invoice.receiptDate ? new Date(invoice.receiptDate) : null,
    });
    setEditId(invoice.id);
    setIsAddingNewInvoice(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredInvoices = (invoices?.data || []).filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    const inDateRange =
      (!startDate || !endDate) ||
      (invDate >= startDate && invDate <= endDate);

    return (
      inDateRange &&
      (inv.invoiceNo.toLowerCase().includes(applied.search.toLowerCase()) ||
        inv.mocNo.toLowerCase().includes(applied.search.toLowerCase())) &&
      (applied.cwo === "" ||
        inv.invoiceNo.toLowerCase().includes(applied.cwo.toLowerCase())) &&
      (applied.moc === "all" || inv.mocNo === applied.moc) &&
      (applied.status === "all" || inv.invoiceStatus === applied.status)
    );
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-2 h-full flex flex-col">
          {!isAddingNewInvoice && !editId && (
            <div className="mb-4">
              <Button onClick={() => { form.reset(formDefaults); setIsAddingNewInvoice(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add New Invoice
              </Button>
            </div>
          )}
          {(isAddingNewInvoice || editId) && (
            <div ref={formRef}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{editId ? "Edit Partial Invoice" : "Add Partial Invoice"}</h3>
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
                    <Button type="button" variant="outline" onClick={() => { form.reset(formDefaults); form.trigger(); setEditId(null); setIsAddingNewInvoice(false); }} disabled={addMutation.isPending || updateMutation.isPending}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending || !form.formState.isValid}>
                      {addMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : (<><Plus className="h-4 w-4 mr-2" /> Save Invoice</>)}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
          <div className="mt-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="gradient-title text-2xl">Partial Invoices List</h4>
              <div className="space-x-2">
                <Button variant="outline" onClick={resetAll}>
                  Clear Filters
                </Button>
                <FiltersDialog
                  mocOptions={mocOptions?.data ?? []}
                />
              </div>
            </div>
            <div className="mt-2 flex-1 flex flex-col">
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
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-6">
                          <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map(invoice => (
                        <tr key={invoice.id} className="h-6 even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors duration-150">
                          <td className="border-b border-gray-200 px-2 py-2 text-left">
                            <div className="truncate">{invoice.mocNo}</div>
                          </td>
                          <td className="border-b border-gray-200 px-2 py-2 text-left">
                            <div className="truncate">{invoice.shortDescription}</div>
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
                              <Badge onClick={() => { setStatusDialogInvoice(invoice); setNewStatus(invoice.invoiceStatus); setNewReceiptDate(invoice.receiptDate ? new Date(invoice.receiptDate) : null); }} className="cursor-pointer">
                                {invoice.invoiceStatus}
                              </Badge>
                            </div>
                          </td>
                          <td className="border-b border-gray-200 px-2 py-2 text-center space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(invoice)}>
                              <Edit className="h-2 w-2" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setInvoiceToDelete(invoice)}>
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
           {/* This Dialog opens when user tries to chnage the status of the invoice */}
      {statusDialogInvoice && (
        <Dialog open onOpenChange={() => setStatusDialogInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>{newStatus === "PAID" && "Select receipt date for PAID status"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {["PMD", "PMT", "FINANCE", "PAID"].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newStatus === "PAID" && (
                <Calendar mode="single" selected={newReceiptDate || undefined} onSelect={date => date && setNewReceiptDate(date)} />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogInvoice(null)}>Cancel</Button>
              <Button disabled={updateStatusMutation.isPending} onClick={() => {
                if (newStatus === "PAID" && !newReceiptDate) { toast.error("Receipt date required"); return; }
                updateStatusMutation.mutate({ id: statusDialogInvoice.id, status: newStatus, date: newStatus === "PAID" ? newReceiptDate || new Date() : undefined });
              }}>
                {updateStatusMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {invoiceToDelete && (
        <Dialog open onOpenChange={() => setInvoiceToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
              <DialogDescription>Are you sure you want to delete this invoice?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvoiceToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                deleteMutation.mutate(invoiceToDelete.id, {
                  onSettled: () => setInvoiceToDelete(null),
                });
              }} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}