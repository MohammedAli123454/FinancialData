'use client';

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchJson } from "@/app/utils/fetchJson";
import type { Supplier, PurchaseOrder, PurchaseOrderForm } from "./types";
import PurchaseOrderTable from "./components/PurchaseOrderTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";

// ----------- Validation schema ----------
const poSchema = z.object({
  supplierId: z.number().min(1, "Supplier is required"),
  poNumber: z.string().min(1, "PO Number is required"),
  currency: z.string().min(1, "Currency is required"),
  poValue: z.preprocess(Number, z.number().gt(0, "PO Value must be > 0")),
  poValueWithVAT: z.preprocess(Number, z.number().gt(0, "PO Value With VAT must be > 0")),
});

// ----------- Static currencies fallback ----------
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

const PAGE_SIZE = 25;

// ----------- Simulated paginated API (replace in prod!) ----------
async function fetchPaginatedPOs({ pageParam = 0 }): Promise<{ items: PurchaseOrder[]; nextCursor: number | null }> {
  const all: PurchaseOrder[] = await fetchJson("/api/purchase-orders");
  const start = pageParam * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const items = all.slice(start, end);
  return {
    items,
    nextCursor: end < all.length ? pageParam + 1 : null,
  };
}

// ----------- API wrappers ----------
const poApi = {
  create: (payload: PurchaseOrderForm): Promise<PurchaseOrder> =>
    fetchJson<PurchaseOrder>("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  update: ({ id, payload }: { id: number; payload: PurchaseOrderForm }): Promise<PurchaseOrder> =>
    fetchJson<PurchaseOrder>(`/api/purchase-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  remove: (id: number): Promise<boolean> =>
    fetchJson<boolean>(`/api/purchase-orders/${id}`, { method: "DELETE" }),
};

const supplierApi = {
  fetchAll: (): Promise<Supplier[]> =>
    fetchJson<Supplier[]>("/api/suppliers"),
};

export default function PurchaseOrderCRUD() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const defaultFormValues = {
    supplierId: 0,
    poNumber: "",
    currency: "",
    poValue: 0,
    poValueWithVAT: 0,
  };

  const {
    register, handleSubmit, reset, setValue, formState: { errors }, clearErrors, watch
  } = useForm<PurchaseOrderForm>({
    resolver: zodResolver(poSchema),
    defaultValues: defaultFormValues
  });

  // ----------- Infinite Query -----------
  const {
    data: posPages,
    isLoading: loadingPOs,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['purchaseOrders', search],
    queryFn: fetchPaginatedPOs,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0, // <-- Fixes the error!
  });
  

  // ----------- Suppliers Query -----------
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierApi.fetchAll,
  });

  // ----------- Mutations -----------
  const addMutation = useMutation({
    mutationFn: (payload: PurchaseOrderForm) => poApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success("Purchase order created successfully");
      reset(defaultFormValues);
      setEditId(null);
      setShowForm(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      reset(defaultFormValues);
      clearErrors();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PurchaseOrderForm }) =>
      poApi.update({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success("Purchase order updated successfully");
      reset(defaultFormValues);
      setEditId(null);
      setShowForm(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      reset(defaultFormValues);
      clearErrors();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => poApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success("Purchase order deleted successfully");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  // ----------- Set form values on edit -----------
  useEffect(() => {
    if (editId !== null && posPages?.pages) {
      const flatPOs = posPages.pages.flatMap(page => page.items);
      const po = flatPOs.find(s => s.id === editId);
      if (po) {
        setValue("supplierId", po.supplierId);
        setValue("poNumber", po.poNumber);
        setValue("currency", po.currency);
        setValue("poValue", po.poValue);
        setValue("poValueWithVAT", po.poValueWithVAT);
        setShowForm(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, posPages]);

  const onSubmit = (data: PurchaseOrderForm) => {
    if (editId !== null) {
      updateMutation.mutate({ id: editId, payload: data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = useCallback((id: number) => setEditId(id), []);
  const handleDelete = useCallback((id: number) => setDeleteId(id), []);
  const handleCancelForm = () => {
    reset(defaultFormValues);
    setEditId(null);
    setShowForm(false);
    clearErrors();
  };

  // For controlled select (React Hook Form + Shadcn Select)
  const supplierId = watch("supplierId");
  const currency = watch("currency");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex-grow flex flex-col items-center w-full py-4">
        <div className="w-full max-w-6xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center">
                <Plus className="h-5 w-5 mr-1" />
                Add New PO
              </Button>
            )}
          </div>
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg w-full py-8 px-6 mb-4 z-20">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="supplierId" className="w-40 text-sm font-medium">Supplier</Label>
                    <div className="flex-1">
                      <Select
                        value={supplierId ? String(supplierId) : ""}
                        onValueChange={val => setValue("supplierId", Number(val), { shouldValidate: true })}
                        disabled={suppliers.length === 0}
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
                      {errors.supplierId && <span className="text-red-500 text-xs">{errors.supplierId.message}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="poNumber" className="w-40 text-sm font-medium">PO Number</Label>
                    <div className="flex-1">
                      <Input id="poNumber" {...register("poNumber")} aria-invalid={!!errors.poNumber} />
                      {errors.poNumber && <span className="text-red-500 text-xs">{errors.poNumber.message}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="currency" className="w-40 text-sm font-medium">Currency</Label>
                    <div className="flex-1">
                      <Select
                        value={currency || ""}
                        onValueChange={val => setValue("currency", val, { shouldValidate: true })}
                      >
                        <SelectTrigger className="w-full" id="currency">
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
                      {errors.currency && <span className="text-red-500 text-xs">{errors.currency.message}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="poValue" className="w-40 text-sm font-medium">PO Value</Label>
                    <div className="flex-1">
                      <Input
                        id="poValue"
                        type="number"
                        step="0.01"
                        {...register("poValue", { valueAsNumber: true })}
                        aria-invalid={!!errors.poValue}
                      />
                      {errors.poValue && <span className="text-red-500 text-xs">{errors.poValue.message}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="poValueWithVAT" className="w-40 text-sm font-medium">PO Value With VAT</Label>
                    <div className="flex-1">
                      <Input
                        id="poValueWithVAT"
                        type="number"
                        step="0.01"
                        {...register("poValueWithVAT", { valueAsNumber: true })}
                        aria-invalid={!!errors.poValueWithVAT}
                      />
                      {errors.poValueWithVAT && <span className="text-red-500 text-xs">{errors.poValueWithVAT.message}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addMutation.isPending || updateMutation.isPending}
                    aria-label={editId !== null ? "Update PO" : "Create PO"}
                  >
                    {(addMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editId !== null ? "Updating..." : "Creating..."}
                      </>
                    ) : editId !== null ? "Update PO" : "Create PO"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Search Input */}
          <div className={`transition-all ${showForm ? "mb-2" : "mb-4"}`}>
            <Input
              placeholder="Search PO or Supplier"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search purchase orders"
              className="w-full"
            />
          </div>

          {/* Table with infinite scroll */}
          <div
            className={`flex-1 transition-all duration-300 ${showForm ? "max-h-[calc(100vh-350px)]" : "max-h-[calc(100vh-200px)]"} min-h-[250px]`}
            style={{ width: "100%" }}
          >
            <PurchaseOrderTable
              pages={posPages?.pages?.map(p => p.items) || []}
              loading={loadingPOs}
              suppliers={suppliers}
              filter={search}
              onEdit={handleEdit}
              onDelete={handleDelete}
              hasNextPage={!!hasNextPage}
              fetchNextPage={fetchNextPage}
              loadingMore={isFetchingNextPage}
            />
            {isError && (
              <div className="text-red-500 text-center mt-4">
                {error instanceof Error ? error.message : "Failed to load purchase orders"}
              </div>
            )}
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                aria-label="Confirm delete"
              >
                {deleteMutation.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>) : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
