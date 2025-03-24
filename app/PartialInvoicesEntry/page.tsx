"use client";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import {
  addPartialInvoice,
  updatePartialInvoice,
  deletePartialInvoice,
  getMocOptions,
  getPartialInvoices,
} from "../actions/partialInvoiceCURD";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, CalendarIcon, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  mocId: z.string().min(1, "MOC is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.date(),
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  vat: z.string(),
  retention: z.string(),
  invoiceStatus: z.string().min(1, "Status is required"),
  receiptDate: z.date().optional().nullable(),
});
type FormValues = z.infer<typeof formSchema>;

interface MocOption {
  id: number;
  mocNo: string;
  cwo: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PartialInvoice {
  id: number;
  mocId: number;
  mocNo: string;
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
  dateRange: [Date | null, Date | null];
}

const defaultFilters: FilterValues = {
  search: "",
  cwo: "",
  moc: "all",
  status: "all",
  dateRange: [null, null],
};

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  initialFilters: FilterValues;
  mocOptions: MocOption[];
  onApply: (filters: FilterValues) => void;
}

function FilterDialog({ open, onClose, initialFilters, mocOptions, onApply }: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(initialFilters);
  const { search, cwo, moc, status, dateRange } = localFilters;
  const [startDate, endDate] = dateRange;

  const clearLocalFilters = () => {
    setLocalFilters(defaultFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Invoices</DialogTitle>
          <DialogDescription>
            Enter filter criteria including search term, CWO, MOC number, status and a date range.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Search Term</Label>
            <Input
              placeholder="Search by invoice or MOC number..."
              value={search}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">CWO Number</Label>
            <Input
              placeholder="Enter CWO number..."
              value={cwo}
              onChange={(e) => setLocalFilters({ ...localFilters, cwo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">MOC Number</Label>
            <Select
              value={moc}
              onValueChange={(value) => setLocalFilters({ ...localFilters, moc: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select MOC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {mocOptions.map((mocOption) => (
                  <SelectItem key={mocOption.id} value={mocOption.mocNo}>
                    {mocOption.mocNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Invoice Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["PMD", "PMT", "FINANCE", "PAID"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {startDate
                    ? endDate
                      ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                      : format(startDate, "MMM dd")
                    : "Select Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={{ from: startDate || undefined, to: endDate || undefined }}
                  onSelect={(range) =>
                    setLocalFilters({
                      ...localFilters,
                      dateRange: [range?.from || null, range?.to || null],
                    })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={clearLocalFilters}>
            Clear Filters
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => { onApply(localFilters); onClose(); }}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PartialInvoicesEntry() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [statusDialogInvoice, setStatusDialogInvoice] = useState<PartialInvoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<PartialInvoice | null>(null);
  const [newStatus, setNewStatus] = useState("PMD");
  const [newReceiptDate, setNewReceiptDate] = useState<Date | null>(null);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [isAddingNewInvoice, setIsAddingNewInvoice] = useState(false);
  const [startDate, endDate] = filters.dateRange;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mocId: "",
      invoiceNo: "",
      invoiceDate: new Date(),
      amount: "",
      vat: "",
      retention: "",
      invoiceStatus: "",
      receiptDate: null,
    },
  });

  const { data: mocOptions, isLoading: mocLoading } = useQuery<ApiResponse<MocOption[]>>({
    queryKey: ["mocOptions"],
    queryFn: getMocOptions,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<ApiResponse<PartialInvoice[]>>({
    queryKey: ["partialInvoices"],
    queryFn: getPartialInvoices,
  });

  const addMutation = useMutation({
    mutationFn: addPartialInvoice,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
        toast.success("Invoice added successfully!");
        form.reset();
        setIsAddingNewInvoice(false);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; values: any }) => updatePartialInvoice(data.id, data.values),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
        toast.success("Invoice updated successfully!");
        form.reset();
        setEditId(null);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartialInvoice,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
        toast.success("Invoice deleted successfully!");
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string; date?: Date }) =>
      updatePartialInvoice(data.id, {
        invoiceStatus: data.status,
        receiptDate: data.date ? format(data.date, "yyyy-MM-dd") : null,
      }),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
        toast.success("Status updated successfully!");
        setStatusDialogInvoice(null);
      }
    },
  });

  const calculateValues = useCallback((amount: number) => ({
    vat: amount * 0.15,
    retention: amount * 0.1,
  }), []);

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      const { vat, retention } = calculateValues(amount);
      form.setValue("vat", vat.toFixed(2), { shouldValidate: true });
      form.setValue("retention", retention.toFixed(2), { shouldValidate: true });
    }
  };

  const generateInvoiceNumber = useCallback(
    async (mocId: string) => {
      if (!mocOptions?.success) return;
      const moc = mocOptions.data?.find((m) => m.id.toString() === mocId);
      if (!moc) return;
      const existingInvoices = await queryClient.getQueryData<ApiResponse<PartialInvoice[]>>(["partialInvoices"]);
      const maxNumber = Math.max(
        ...((existingInvoices?.data || [])
          .filter((i) => i.mocId === parseInt(mocId))
          .map((i) => parseInt(i.invoiceNo.match(/INV-C-(\d+)$/)?.[1] || "0"))
          .concat(0))
      );
      form.setValue("invoiceNo", `${moc.cwo} INV-C-${(maxNumber + 1).toString().padStart(3, "0")}`, { shouldValidate: true });
    },
    [mocOptions, queryClient, form]
  );

  const onSubmit = async (values: FormValues) => {
    // If adding a new invoice (not editing) check for duplicate invoice number
    if (!editId) {
      const duplicate = invoices?.data?.find(
        (inv) => inv.invoiceNo === values.invoiceNo
      );
      if (duplicate) {
        toast.error("Invoice cannot be saved as the current invoice number is already available in the database");
        return;
      }
    }

    const invoiceData = {
      ...values,
      mocId: parseInt(values.mocId),
      amount: parseFloat(values.amount),
      vat: parseFloat(values.vat),
      retention: parseFloat(values.retention),
      invoiceDate: format(values.invoiceDate, "yyyy-MM-dd"),
      receiptDate: values.receiptDate ? format(values.receiptDate, "yyyy-MM-dd") : null,
    };
    editId 
      ? updateMutation.mutate({ id: editId, values: invoiceData })
      : addMutation.mutate(invoiceData);
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
  };

  const clearFilters = () => setFilters(defaultFilters);

  const filteredInvoices = (invoices?.data ?? []).filter((invoice) => {
    const searchLower = filters.search.toLowerCase();
    const cwoLower = filters.cwo.toLowerCase();
    const invoiceDate = new Date(invoice.invoiceDate);
    const dateInRange = !startDate || !endDate ? true : invoiceDate >= startDate && invoiceDate <= endDate;
    return dateInRange &&
      (invoice.invoiceNo.toLowerCase().includes(searchLower) ||
      invoice.mocNo.toLowerCase().includes(searchLower)) &&
      (cwoLower === "" || invoice.invoiceNo.toLowerCase().includes(cwoLower)) &&
      (filters.moc === "all" || invoice.mocNo === filters.moc) &&
      (filters.status === "all" || invoice.invoiceStatus === filters.status);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-2 h-full flex flex-col">
          {/* Top Add New Invoice Button (visible when not adding or editing) */}
          {!isAddingNewInvoice && !editId && (
            <div className="mb-4">
              <Button onClick={() => {
                form.reset();
                setIsAddingNewInvoice(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add New Invoice
              </Button>
            </div>
          )}

          {/* Show form only if adding new invoice or editing an invoice */}
          {(isAddingNewInvoice || editId) && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {editId ? "Edit Partial Invoice" : "Add Partial Invoice"}
              </h3>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select MOC Number</Label>
                    <Select
                      value={form.watch("mocId")}
                      onValueChange={(value) => {
                        form.setValue("mocId", value, { shouldValidate: true });
                        if (!editId) generateInvoiceNumber(value);
                      }}
                      required
                      disabled={mocLoading}
                    >
                      <SelectTrigger className="h-9 text-gray-700">
                        <SelectValue placeholder={
                          mocLoading ? "Loading MOCs..." : 
                          mocOptions?.success ? "Select MOC" : "Error loading MOCs"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {mocLoading && (
                          <SelectItem disabled value="loading">
                            Loading MOC options...
                          </SelectItem>
                        )}
                        {!mocLoading && !mocOptions?.success && (
                          <SelectItem disabled value="error" className="text-red-500">
                            {mocOptions?.message || "Error loading MOC options"}
                          </SelectItem>
                        )}
                        {mocOptions?.success && mocOptions.data?.map((moc: MocOption) => (
                          <SelectItem key={moc.id} value={moc.id.toString()} className="text-sm text-gray-700">
                            {moc.mocNo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Invoice Number</Label>
                    <Input
                      {...form.register("invoiceNo")}
                      readOnly
                      className="bg-gray-100 text-gray-700"
                      placeholder={form.watch("mocId") ? "Generating..." : "Select MOC first"}
                    />
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full text-gray-700">
                          {form.watch("invoiceDate")
                            ? format(form.watch("invoiceDate"), "yyyy-MM-dd")
                            : "Select Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch("invoiceDate")}
                          onSelect={(date) => date && form.setValue("invoiceDate", date, { shouldValidate: true })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-700"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Enter Invoice Amount</Label>
                    <Input
                      {...form.register("amount")}
                      type="number"
                      step="0.01"
                      onChange={(e) => handleAmountChange(e.target.value)}
                      required
                      className="text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Value Added Tax(VAT)</Label>
                    <Input
                      {...form.register("vat")}
                      type="number"
                      step="0.01"
                      disabled
                      className="bg-gray-100 text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Retention Value</Label>
                    <Input
                      {...form.register("retention")}
                      type="number"
                      step="0.01"
                      disabled
                      className="bg-gray-100 text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-gray-700">Select Invoice Status</Label>
                    <Select
                      value={form.watch("invoiceStatus")}
                      onValueChange={(value) => form.setValue("invoiceStatus", value, { shouldValidate: true })}
                      required
                    >
                      <SelectTrigger className="h-9 text-gray-700">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["PMD", "PMT", "FINANCE", "PAID"].map((status) => (
                          <SelectItem key={status} value={status} className="text-sm text-gray-700">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset({
                          mocId: "",
                          invoiceNo: "",
                          invoiceDate: new Date(),
                          amount: "",
                          vat: "",
                          retention: "",
                          invoiceStatus: "",
                          receiptDate: null,
                        });
                        form.trigger();
                        setEditId(null);
                        setIsAddingNewInvoice(false);
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
                      {addMutation.isPending || updateMutation.isPending ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save Invoice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Partial Invoices</h4>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  type="button"
                  disabled={JSON.stringify(filters) === JSON.stringify(defaultFilters)}
                >
                  Clear Filters
                </Button>
                <Button variant="outline" onClick={() => setFiltersDialogOpen(true)}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-auto flex-1">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>MOC Number</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Inv. Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="h-8 hover:bg-gray-50">
                      <TableCell>{invoice.mocNo}</TableCell>
                      <TableCell>{invoice.invoiceNo}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {invoice.receiptDate
                          ? new Date(invoice.receiptDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          onClick={() => {
                            setStatusDialogInvoice(invoice);
                            setNewStatus(invoice.invoiceStatus);
                            setNewReceiptDate(invoice.receiptDate ? new Date(invoice.receiptDate) : null);
                          }}
                          className="cursor-pointer"
                        >
                          {invoice.invoiceStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(invoice)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setInvoiceToDelete(invoice)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {mocOptions?.data && (
        <FilterDialog
          open={filtersDialogOpen}
          onClose={() => setFiltersDialogOpen(false)}
          initialFilters={filters}
          mocOptions={mocOptions.data}
          onApply={setFilters}
        />
      )}

      {statusDialogInvoice && (
        <Dialog open onOpenChange={() => setStatusDialogInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>
                {newStatus === "PAID" && "Select receipt date for PAID status"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {["PMD", "PMT", "FINANCE", "PAID"].map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newStatus === "PAID" && (
                <Calendar
                  mode="single"
                  selected={newReceiptDate || undefined}
                  onSelect={(date) => date && setNewReceiptDate(date)}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogInvoice(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newStatus === "PAID" && !newReceiptDate) {
                    toast.error("Receipt date required");
                    return;
                  }
                  updateStatusMutation.mutate({
                    id: statusDialogInvoice.id,
                    status: newStatus,
                    date: newStatus === "PAID" ? newReceiptDate || new Date() : undefined,
                  });
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {invoiceToDelete && (
        <Dialog open onOpenChange={() => setInvoiceToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this invoice?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvoiceToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(invoiceToDelete.id, {
                    onSettled: () => setInvoiceToDelete(null),
                  });
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
