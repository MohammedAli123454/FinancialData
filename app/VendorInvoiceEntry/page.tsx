"use client";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceViewDialog from "./components/InvoiceViewDialog";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import StatementInputFields from "./components/StatementInputFields";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import "react-toastify/dist/ReactToastify.css";

// ---------- Validation Schema & Types ----------
const invoiceFormSchema = z.object({
  invoice_no: z.string().min(1, "Invoice number is required"),
  invoice_date: z.date({ required_error: "Invoice date is required" }),
  payment_type: z.enum(["ADVANCE PAYMENT", "ADVANCE SETTLEMENT", "CREDIT"])
    .optional()
    .refine(val => !!val, { message: "Payment type is required" }),
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
  contract_type: z.enum(["GCS Contract"]),
  certified_date: z.date().optional().nullable(),
});
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const BLANK_INVOICE_FORM: InvoiceFormValues = {
  invoice_no: "",
  invoice_date: new Date(),
  payment_type: "ADVANCE PAYMENT", 
  payment_due_date: new Date(),
  invoice_amount: "",
  payable: "",
  supplier_id: "",
  po_number: "",
  contract_type: "GCS Contract",
  certified_date: undefined,
};

// --------- API calls ----------
const PAGE_SIZE = 20;

const fetchInvoices = async ({ pageParam = 0 }) => {
  const res = await fetch(`/api/invoices?limit=${PAGE_SIZE}&offset=${pageParam}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch invoices");
  return json.data;
};

const createInvoice = async (data: any) => {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
};

const editInvoice = async ({ id, data }: { id: number; data: any }) => {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
};

const deleteInvoice = async (id: number) => {
  const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
};

// ------------- Main Component -------------
export default function VendorInvoiceEntry() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editInvoiceData, setEditInvoiceData] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);

  // Confirm Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);

  // RHF form instance
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: BLANK_INVOICE_FORM,
  });

  // ---------- Infinite Query ----------
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["invoices-infinite"],
    queryFn: fetchInvoices,
    initialPageParam: 0, // <-- THIS FIXES THE ERROR!
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });
  
  // Flatten pages for InvoiceTable
  const invoices = data?.pages.flat() || [];

  // ---------- Mutations ----------
  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-infinite"] });
      toast.success("Invoice added!");
      form.reset(BLANK_INVOICE_FORM);
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err.message || "Error saving invoice"),
  });

  const editMutation = useMutation({
    mutationFn: editInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-infinite"] });
      toast.success("Invoice updated!");
      setEditInvoiceData(null);
      form.reset(BLANK_INVOICE_FORM);
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err.message || "Error updating invoice"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-infinite"] });
      toast.success("Invoice deleted!");
    },
    onError: (err: any) => toast.error(err.message || "Error deleting invoice"),
  });

  // ---------- Handlers ----------
  function onEdit(invoice: any) {
    setEditInvoiceData(invoice);
    setShowForm(true);
    form.reset({
      ...invoice,
      invoice_date: invoice.invoice_date ? parseISO(invoice.invoice_date) : new Date(),
      payment_due_date: invoice.payment_due_date ? parseISO(invoice.payment_due_date) : new Date(),
      certified_date: invoice.certified_date ? parseISO(invoice.certified_date) : undefined,
      supplier_id: String(invoice.supplier_id),
      invoice_amount: String(invoice.invoice_amount).replace(/,/g, ""),
      payable: String(invoice.payable).replace(/,/g, ""),
    });
  }

  function handleEditSubmit(values: InvoiceFormValues) {
    const payload = {
      ...values,
      invoice_amount: parseFloat(values.invoice_amount),
      payable: parseFloat(values.payable),
      invoice_date: format(values.invoice_date, "yyyy-MM-dd"),
      payment_due_date: format(values.payment_due_date, "yyyy-MM-dd"),
      supplier_id: parseInt(values.supplier_id, 10),
      contract_type: "GCS Contract",
      certified_date: values.certified_date
        ? format(values.certified_date, "yyyy-MM-dd")
        : null,
    };
    if (editInvoiceData) {
      editMutation.mutate({ id: editInvoiceData.id, data: payload });
    }
  }

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

  function onDelete(invoice: any) {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setInvoiceToDelete(null);
        },
        onError: () => {
          setDeleteDialogOpen(false);
          setInvoiceToDelete(null);
        },
      });
    }
  }

  function handleView(invoice: any) {
    setIsInvoiceLoading(true);
    setViewInvoice(null);
    setTimeout(() => {
      setViewInvoice(invoice);
      setIsInvoiceLoading(false);
    }, 400);
  }

  // ---------- UI ----------
  return (
    <div className="p-6 bg-white shadow rounded mb-8">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Vendor Invoice Entry</h2>
        {!showForm && !editInvoiceData && (
          <Button
            onClick={() => {
              form.reset(BLANK_INVOICE_FORM);
              setEditInvoiceData(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Invoice
          </Button>
        )}
      </div>

      {/* ----------- Add/Edit Form ----------- */}
      {(showForm || editInvoiceData) && (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(editInvoiceData ? handleEditSubmit : onSubmit)}
            className="space-y-4 border-b pb-6 mb-6"
          >
            <StatementInputFields />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditInvoiceData(null);
                  form.reset(BLANK_INVOICE_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || editMutation.isPending}
              >
                {(mutation.isPending || editMutation.isPending) ? (
                  <span className="animate-spin h-4 w-4 mr-2 inline-block" />
                ) : editInvoiceData ? "Update Invoice" : "Save Invoice"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}

      {/* ----------- Invoice Table ----------- */}
      {!showForm && !editInvoiceData && (
        <>
          <h3 className="text-lg font-semibold mb-2">Recent Invoices</h3>
          <InvoiceTable
            invoices={invoices}
            isInvoicesLoading={isLoading && !data}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={handleView}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </>
      )}

      {/* ----------- Dialogs ----------- */}
      <InvoiceViewDialog
        open={!!viewInvoice || isInvoiceLoading}
        onClose={() => {
          setViewInvoice(null);
          setIsInvoiceLoading(false);
        }}
        invoice={viewInvoice}
        loading={isInvoiceLoading}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        invoice={invoiceToDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
