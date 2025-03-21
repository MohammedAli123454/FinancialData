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
import { Edit, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import "react-toastify/dist/ReactToastify.css";

// Zod Schema
const formSchema = z.object({
  mocId: z.string().min(1, "MOC is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.date(),
  amount: z.string().min(1, "Amount is required"),
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

export default function PartialInvoicesEntry() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDialogInvoice, setStatusDialogInvoice] = useState<PartialInvoice | null>(null);
  const [newStatus, setNewStatus] = useState("PMD");
  const [newReceiptDate, setNewReceiptDate] = useState<Date | null>(null);
  const [startDate, endDate] = dateRange;

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

  const { data: mocOptions } = useQuery<ApiResponse<MocOption[]>>({
    queryKey: ["mocOptions"],
    queryFn: getMocOptions,
  });
  const { data: invoices, isLoading } = useQuery<ApiResponse<PartialInvoice[]>>({
    queryKey: ["partialInvoices"],
    queryFn: getPartialInvoices,
  });

  const addMutation = useMutation({
    mutationFn: addPartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice added successfully!");
      form.reset();
    },
    onError: () => toast.error("Error adding invoice"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; values: any }) =>
      updatePartialInvoice(data.id, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice updated successfully!");
      form.reset();
      setEditId(null);
    },
    onError: () => toast.error("Error updating invoice"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Invoice deleted successfully!");
    },
    onError: () => toast.error("Error deleting invoice"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string; date?: Date }) =>
      updatePartialInvoice(data.id, {
        invoiceStatus: data.status,
        receiptDate: data.date ? format(data.date, "yyyy-MM-dd") : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partialInvoices"] });
      toast.success("Status updated successfully!");
      setStatusDialogInvoice(null);
    },
    onError: () => toast.error("Error updating status"),
  });

  const calculateValues = useCallback((amount: number) => ({
    vat: amount * 0.15,
    retention: amount * 0.1,
  }), []);

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      const { vat, retention } = calculateValues(amount);
      form.setValue("vat", vat.toFixed(2));
      form.setValue("retention", retention.toFixed(2));
    }
  };

  const generateInvoiceNumber = useCallback(
    async (mocId: string) => {
      const moc = (mocOptions as ApiResponse<MocOption[]>)?.data?.find(
        (m) => m.id.toString() === mocId
      );
      if (!moc) return;
      const existingInvoices = (await queryClient.getQueryData([
        "partialInvoices",
      ])) as ApiResponse<PartialInvoice[]>;
      const maxNumber = Math.max(
        ...(
          (existingInvoices?.data || [])
            .filter((i) => i.mocId === parseInt(mocId))
            .map((i) => parseInt(i.invoiceNo.match(/INV-C-(\d+)$/)?.[1] || "0"))
            .concat(0)
        )
      );
      const nextNumber = maxNumber + 1;
      const newInvoiceNo = `${moc.cwo} INV-C-${nextNumber.toString().padStart(3, "0")}`;
      form.setValue("invoiceNo", newInvoiceNo);
    },
    [mocOptions, queryClient]
  );

  const onSubmit = async (values: FormValues) => {
    const invoiceData = {
      ...values,
      mocId: parseInt(values.mocId),
      amount: parseFloat(values.amount),
      vat: parseFloat(values.vat),
      retention: parseFloat(values.retention),
      invoiceDate: format(values.invoiceDate, "yyyy-MM-dd"),
      receiptDate: values.receiptDate ? format(values.receiptDate, "yyyy-MM-dd") : null,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, values: invoiceData });
    } else {
      addMutation.mutate(invoiceData);
    }
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
  };

  // Filtering
  const filteredInvoices = (invoices?.data ?? []).filter((invoice) => {
    const searchLower = searchQuery.toLowerCase();
    const invoiceDate = new Date(invoice.invoiceDate);
    const dateInRange = !startDate || !endDate ? true : invoiceDate >= startDate && invoiceDate <= endDate;
    return (
      dateInRange &&
      (invoice.invoiceNo.toLowerCase().includes(searchLower) ||
        invoice.mocNo.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-2 h-full flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {editId ? "Edit Partial Invoice" : "Add Partial Invoice"}
          </h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOC Number */}
              <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Select MOC Number</Label>
                <Select
                  value={form.watch("mocId")}
                  onValueChange={(value) => {
                    form.setValue("mocId", value);
                    if (!editId) generateInvoiceNumber(value);
                  }}
                  required
                >
                  <SelectTrigger className="h-9 text-gray-700">
                    <SelectValue placeholder="Select MOC" />
                  </SelectTrigger>
                  <SelectContent>
                    {(mocOptions?.data ?? []).map((moc: MocOption) => (
                      <SelectItem key={moc.id} value={moc.id.toString()} className="text-sm text-gray-700">
                        {moc.mocNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Invoice Number */}
              <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Invoice Number</Label>
                <Input
                  {...form.register("invoiceNo")}
                  readOnly
                  className="bg-gray-100 text-gray-700"
                  placeholder={form.watch("mocId") ? "Generating..." : "Select MOC first"}
                />
              </div>
            {/* Invoice Date */}  
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
                      onSelect={(date) => date && form.setValue("invoiceDate", date)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Amount */}
              <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Enter Invoive Amount</Label>
                <Input
                  {...form.register("amount")}
                  type="number"
                  step="0.01"
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                  className="text-gray-700"
                />
              </div>
              {/* VAT */}
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
              {/* Retention */}
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

              {/* Status */}
              <div className="grid grid-cols-[175px,1fr] items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Select Invoice Status</Label>
                <Select
                  value={form.watch("invoiceStatus")}
                  onValueChange={(value) => form.setValue("invoiceStatus", value)}
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
                 {/* Actions */}
            <div className="flex items-center space-x-2 justify-end mb-4">
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setEditId(null);
                  }}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="text-gray-700"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : editId ? (
                  "Update Invoice"
                ) : (
                  "Add Invoice"
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 text-gray-700"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="text-gray-700">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {startDate ? (
                        endDate ? (
                          `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                        ) : (
                          format(startDate, "MMM dd")
                        )
                      ) : (
                        "Select Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={{
                        from: startDate || undefined,
                        to: endDate || undefined,
                      }}
                      onSelect={(range) =>
                        setDateRange([range?.from || null, range?.to || null])
                      }
                      numberOfMonths={2}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            </div>
         
          </form>

          {/* Invoice Table */}
          <div className="mt-8 flex-1 flex flex-col">
            <div className="border rounded-lg overflow-hidden flex-1">
              <div className="relative h-full">
                <div className="absolute inset-0 overflow-auto">
                  <Table className="border-collapse">
                    <TableHeader className="sticky top-0 bg-gray-50 shadow-sm z-10">
                      <TableRow className="h-8">
                        <TableHead className="font-semibold text-gray-700 py-2">MOC Number</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Invoice No</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Inv. Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Receipt Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="p-4 flex justify-center">
                            <Loader2 className="animate-spin h-6 w-6 text-gray-700" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => (
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
                              <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(invoice.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {(addMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Status Update Dialog for Invoice Rows */}
      {statusDialogInvoice && (
        <Dialog open={true} onOpenChange={() => setStatusDialogInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Invoice Status</DialogTitle>
              <DialogDescription>
                Select the new status. If "PAID" is chosen, please pick a receipt date.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val)}>
                  <SelectTrigger className="w-full text-gray-700">
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
              {newStatus === "PAID" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Receipt Date</Label>
                  <Calendar
                    mode="single"
                    selected={newReceiptDate || undefined}
                    onSelect={(date) => date && setNewReceiptDate(date)}
                    className="rounded-md border"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="space-x-2">
              <Button variant="outline" onClick={() => setStatusDialogInvoice(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: statusDialogInvoice.id,
                    status: newStatus,
                    date: newStatus === "PAID" ? newReceiptDate || new Date() : undefined,
                  })
                }
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

