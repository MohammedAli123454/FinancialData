"use client";

import { useState, useCallback } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PurchaseOrderTable from "./components/PurchaseOrderTable";
import PurchaseOrderFormDialog from "./components/PurchaseOrderFormDialog"
import { fetchJson } from "@/app/utils/fetchJson";
import type { Supplier, PurchaseOrderWithLineItems, PurchaseOrderForm } from "./types";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// API wrappers
const poApi = {
  fetchPaginated: async ({ pageParam = 0 }) => {
    const response = await fetchJson<{ data?: PurchaseOrderWithLineItems[] }>("/api/purchase-orders");
    const all = Array.isArray(response?.data) ? response.data : [];
    const PAGE_SIZE = 25;
    const start = pageParam * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = all.slice(start, end);
    return { items, nextCursor: end < all.length ? pageParam + 1 : null };
  },
  create: (payload: any) =>
    fetchJson("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  update: ({ id, payload }: { id: number; payload: any }) =>
    fetchJson(`/api/purchase-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    fetchJson(`/api/purchase-orders/${id}`, { method: "DELETE" }),
};

const supplierApi = {
  fetchAll: (): Promise<Supplier[]> =>
    fetchJson<Supplier[]>("/api/suppliers"),
};

export default function PurchaseOrderCRUD() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPO, setEditPO] = useState<PurchaseOrderWithLineItems | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: posPages,
    isLoading: loadingPOs,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["purchaseOrders", search],
    queryFn: poApi.fetchPaginated,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierApi.fetchAll,
  });

  const addMutation = useMutation({
    mutationFn: (payload: any) => poApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase order created successfully");
      setEditPO(null);
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => poApi.update({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase order updated successfully");
      setEditPO(null);
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => poApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase order deleted successfully");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEdit = useCallback(
    (po: PurchaseOrderWithLineItems) => {
      setEditPO(po);
      setShowForm(true);
    },
    []
  );
  const handleDelete = useCallback((id: number) => setDeleteId(id), []);
  const handleCancelForm = () => {
    setEditPO(null);
    setShowForm(false);
  };

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
            <PurchaseOrderFormDialog
              open={showForm}
              onClose={handleCancelForm}
              suppliers={suppliers}
              initial={editPO}
              onSubmit={(data) => {
                if (editPO) {
                  updateMutation.mutate({ id: editPO.id, payload: data });
                } else {
                  addMutation.mutate(data);
                }
              }}
              loading={addMutation.isPending || updateMutation.isPending}
            />
          )}
          <div className={`transition-all ${showForm ? "mb-2" : "mb-4"}`}>
            <Input
              placeholder="Search PO or Supplier"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search purchase orders"
              className="w-full"
            />
          </div>
          <div
            className={`flex-1 transition-all duration-300 ${showForm ? "max-h-[calc(100vh-350px)]" : "max-h-[calc(100vh-200px)]"} min-h-[250px]`}
            style={{ width: "100%" }}
          >
            <PurchaseOrderTable
              pages={posPages?.pages?.map((p) => p.items) || []}
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
            <div className="text-lg font-medium mb-2">Confirm Delete</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                aria-label="Confirm delete"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
