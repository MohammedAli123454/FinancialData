"use client";
import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { Calendar } from "@/components/ui/calendar";
import "react-datepicker/dist/react-datepicker.css";
import {
  addPartialInvoice,
  updatePartialInvoice,
  deletePartialInvoice,
  getMocOptions,
  getPartialInvoices
} from "../actions/partialInvoiceCURD"
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
import { Edit, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Zod Schema
const formSchema = z.object({
  mocId: z.string().min(1, "MOC is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.date(),
  amount: z.string().min(1, "Amount is required"),
  vat: z.string(),
  retention: z.string(),
  invoiceStatus: z.string().min(1, "Status is required"),
  receiptDate: z.date().optional().nullable()
});

type FormValues = z.infer<typeof formSchema>;

interface MocOption {
  id: number;
  mocNo: string;
  cwo: string;
}

// Interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Interfaces
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

// Constants
const STATUS_COLORS: Record<string, string> = {
  PMD: "bg-blue-100 text-blue-800",
  PMT: "bg-yellow-100 text-yellow-800",
  FINANCE: "bg-green-100 text-green-800",
  PAID: "bg-purple-100 text-purple-800",
};

// Helper Components
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
);

const SkeletonRow = () => (
  <TableRow className="h-8">
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
  </TableRow>
);

export default function PartialInvoicesEntry() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [originalStatus, setOriginalStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, endDate] = dateRange;

  // React Hook Form
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
      receiptDate: null
    }
  });

  // TanStack Queries
  const { data: mocOptions } = useQuery<ApiResponse<MocOption[]>>({
    queryKey: ['mocOptions'],
    queryFn: getMocOptions
  });

  const { data: invoices, isLoading } = useQuery<ApiResponse<PartialInvoice[]>>({
    queryKey: ['partialInvoices'],
    queryFn: getPartialInvoices
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addPartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partialInvoices'] });
      toast.success("Invoice added successfully!");
      form.reset();
    },
    onError: () => toast.error("Error adding invoice")
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, values: any }) =>
      updatePartialInvoice(data.id, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partialInvoices'] });
      toast.success("Invoice updated successfully!");
      form.reset();
      setEditId(null);
    },
    onError: () => toast.error("Error updating invoice")
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartialInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partialInvoices'] });
      toast.success("Invoice deleted successfully!");
    },
    onError: () => toast.error("Error deleting invoice")
  });

  // Business Logic
  const calculateValues = useCallback((amount: number) => ({
    vat: amount * 0.15,
    retention: amount * 0.1,
  }), []);

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      const { vat, retention } = calculateValues(amount);
      form.setValue('vat', vat.toFixed(2));
      form.setValue('retention', retention.toFixed(2));
    }
  };

  const generateInvoiceNumber = useCallback(async (mocId: string) => {
    const moc = (mocOptions as ApiResponse<MocOption[]>)?.data?.find((m) =>
      m.id.toString() === mocId
    );

    if (!moc) return;

    const existingInvoices = await queryClient.getQueryData(['partialInvoices']) as
      ApiResponse<PartialInvoice[]>;

    const maxNumber = Math.max(...(
      (existingInvoices?.data || [])
        .filter(i => i.mocId === parseInt(mocId))
        .map(i => parseInt(i.invoiceNo.match(/INV-C-(\d+)$/)?.[1] || "0"))
        .concat(0)
    ));

    const nextNumber = maxNumber + 1;
    const newInvoiceNo = `${moc.cwo} INV-C-${nextNumber.toString().padStart(3, "0")}`;
    form.setValue('invoiceNo', newInvoiceNo);
  }, [mocOptions, queryClient]);

  // Form Handlers
  const onSubmit = async (values: FormValues) => {
    const invoiceData = {
      ...values,
      mocId: parseInt(values.mocId),
      amount: parseFloat(values.amount),
      vat: parseFloat(values.vat),
      retention: parseFloat(values.retention),
      invoiceDate: format(values.invoiceDate, "yyyy-MM-dd"),
      receiptDate: values.receiptDate ? format(values.receiptDate, "yyyy-MM-dd") : null
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
      receiptDate: invoice.receiptDate ? new Date(invoice.receiptDate) : null
    });
    setOriginalStatus(invoice.invoiceStatus);
    setEditId(invoice.id);
  };

  const handleStatusChange = (value: string) => {
    if (value === 'PAID') {
      setTempStatus(value);
      setShowReceiptDialog(true);
    } else {
      form.setValue('invoiceStatus', value);
      if (editId) form.setValue('receiptDate', null);
    }
  };

  const confirmReceiptDate = (date: Date) => {
    form.setValue('invoiceStatus', tempStatus);
    form.setValue('receiptDate', date);
    setShowReceiptDialog(false);
  };

  // Filtering
  const filteredInvoices = (invoices?.data ?? []).filter((invoice) => {
    const searchLower = searchQuery.toLowerCase();
    const invoiceDate = new Date(invoice.invoiceDate);
    const dateInRange = !startDate || !endDate ? true :
      invoiceDate >= startDate && invoiceDate <= endDate;

    return dateInRange && (
      invoice.invoiceNo.toLowerCase().includes(searchLower) ||
      invoice.mocNo.toLowerCase().includes(searchLower)
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">MOC Number *</Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch('mocId')}
                    onValueChange={(value) => {
                      form.setValue('mocId', value);
                      if (!editId) generateInvoiceNumber(value);
                    }}
                    required
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select MOC" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mocOptions?.data ?? []).map((moc: MocOption) => (
                        <SelectItem key={moc.id} value={moc.id.toString()} className="text-sm">
                          {moc.mocNo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Invoice Number */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Invoice Number *</Label>
                <div className="col-span-3">
                  <Input
                    {...form.register('invoiceNo')}
                    readOnly
                    className="bg-gray-100"
                    placeholder={form.watch('mocId') ? "Generating..." : "Select MOC first"}
                  />
                </div>
              </div>

              {/* Invoice Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Invoice Date *</Label>
                <div className="col-span-3">
                  <DatePicker
                    selected={form.watch('invoiceDate')}
                    onChange={(date) => date && form.setValue('invoiceDate', date)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Amount (SAR) *</Label>
                <div className="col-span-3">
                  <Input
                    {...form.register('amount')}
                    type="number"
                    step="0.01"
                    onChange={(e) => handleAmountChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* VAT */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">VAT (SAR) *</Label>
                <div className="col-span-3">
                  <Input
                    {...form.register('vat')}
                    type="number"
                    step="0.01"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              {/* Retention */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Retention (SAR) *</Label>
                <div className="col-span-3">
                  <Input
                    {...form.register('retention')}
                    type="number"
                    step="0.01"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Status *</Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch('invoiceStatus')}
                    onValueChange={handleStatusChange}
                    required
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <SelectItem key={status} value={status} className={`text-sm ${color}`}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ReceiptDateDialog
                    open={showReceiptDialog}
                    onOpenChange={setShowReceiptDialog}
                    onConfirm={confirmReceiptDate}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 justify-end">
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setEditId(null);
                    }}
                    disabled={addMutation.isPending || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {(addMutation.isPending || updateMutation.isPending) ? (
                    <Spinner />
                  ) : editId ? "Update Invoice" : "Add Invoice"}
                </Button>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {startDate ?
                          (endDate ?
                            `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}` :
                            format(startDate, 'MMM dd')) :
                          "Select Date Range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={{ from: startDate || undefined, to: endDate || undefined }}
                        onSelect={(range) => setDateRange([range?.from || null, range?.to || null])}
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
                        Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <InvoiceRow
                            key={invoice.id}
                            invoice={invoice}
                            onEdit={handleEdit}
                            onDelete={deleteMutation.mutate}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {(addMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Invoice Row Component
const InvoiceRow = ({
  invoice,
  onEdit,
  onDelete
}: {
  invoice: PartialInvoice;
  onEdit: (invoice: PartialInvoice) => void;
  onDelete: (id: number) => void;
}) => {
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (data: { id: number, status: string, date?: Date }) =>
      updatePartialInvoice(data.id, {
        invoiceStatus: data.status,
        receiptDate: data.date ? format(data.date, "yyyy-MM-dd") : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partialInvoices'] });
      toast.success("Status updated successfully!");
    }
  });

  const handleStatusSelect = (newStatus: string) => {
    if (newStatus === 'PAID') {
      setSelectedStatus(newStatus);
      setShowDateDialog(true);
    } else {
      updateStatus.mutate({ id: invoice.id, status: newStatus });
    }
  };

  return (
    <>
      <TableRow className="h-8 hover:bg-gray-50">
        <TableCell>{invoice.mocNo}</TableCell>
        <TableCell>{invoice.invoiceNo}</TableCell>
        <TableCell>
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </TableCell>
        <TableCell className="font-medium">
          {invoice.amount.toFixed(2)}
        </TableCell>
        <TableCell>
          {invoice.receiptDate ?
            new Date(invoice.receiptDate).toLocaleDateString() : "N/A"}
        </TableCell>
        <TableCell>
          <Select
            value={invoice.invoiceStatus}
            onValueChange={handleStatusSelect}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <SelectItem key={status} value={status} className={color}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="space-x-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(invoice)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(invoice.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </TableCell>
      </TableRow>

      <ReceiptDateDialog
        open={showDateDialog}
        onOpenChange={setShowDateDialog}
        onConfirm={(date) => updateStatus.mutate({
          id: invoice.id,
          status: selectedStatus,
          date
        })}
        isLoading={updateStatus.isPending}
      />
    </>
  );
};

// Receipt Date Dialog
const ReceiptDateDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  isLoading?: boolean;
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Receipt Date</DialogTitle>
          <DialogDescription>
            Please select the receipt date for marking as PAID
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => date && onConfirm(date)}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};