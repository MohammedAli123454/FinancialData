'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchJson } from "./utils/fetchJson";
import type { Supplier, SupplierForm } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2, Loader2, Plus } from "lucide-react";

// ---- Constants ----
const API_PREFIX = "/api/suppliers";

// ---- Zod Schema ----
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier Name is required"),
  location: z.string().min(1, "Location is required"),
});

// ---- API Client ----
const supplierApi = {
  fetchAll: (): Promise<Supplier[]> =>
    fetchJson<Supplier[]>(API_PREFIX),
  create: (payload: SupplierForm): Promise<Supplier> =>
    fetchJson<Supplier>(API_PREFIX, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  update: ({ id, payload }: { id: number; payload: SupplierForm }): Promise<Supplier> =>
    fetchJson<Supplier>(`${API_PREFIX}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  remove: (id: number): Promise<boolean> =>
    fetchJson<boolean>(`${API_PREFIX}/${id}`, { method: "DELETE" }),
};

// ---- Table Component ----
type SupplierTableProps = {
  data: Supplier[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  filter: string;
};

function SupplierTable({ data, onEdit, onDelete, loading, filter }: SupplierTableProps) {
  const rows = useMemo(() => (
    data.filter(row =>
      row.name.toLowerCase().includes(filter.toLowerCase()) ||
      row.location.toLowerCase().includes(filter.toLowerCase())
    )
  ), [data, filter]);

  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-150px)]">
<table className="min-w-[600px] w-full text-sm table-fixed">
  <thead className="bg-gray-100 sticky top-0 z-10">
    <tr>
      <th className="border px-4 py-2 w-16 text-left">S.No</th>              {/* ~64px */}
      <th className="border px-4 py-2 w-60 text-left">Supplier Name</th>    {/* ~240px */}
      <th className="border px-4 py-2 w-48 text-left">Location</th>         {/* ~192px */}
      <th className="border px-4 py-2 w-48 text-center">Actions</th>        {/* ~192px */}
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr>
        <td colSpan={4} className="text-center py-6 border">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
        </td>
      </tr>
    ) : rows.length === 0 ? (
      <tr>
        <td colSpan={4} className="text-center text-muted-foreground py-6 border">
          No suppliers found.
        </td>
      </tr>
    ) : (
      rows.map((sup, idx) => (
        <tr key={sup.id} className="even:bg-white/50 hover:bg-gray-50 transition">
          <td className="border px-4 py-1 w-16 text-left">{idx + 1}</td>
          <td className="border px-4 py-1 w-60 truncate whitespace-nowrap overflow-hidden">{sup.name}</td>
          <td className="border px-4 py-1 w-48 truncate whitespace-nowrap overflow-hidden">{sup.location}</td>
          <td className="border px-4 py-1 w-48 text-center">
            <div className="flex justify-center gap-2">
              <Button size="icon" variant="outline" onClick={() => onEdit(sup.id)} aria-label="Edit">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => onDelete(sup.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>


    </div>
  );
}


// ---- Main Page Component ----
export default function SupplierCRUD() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const defaultFormValues = { name: "", location: "" };
  const { register, handleSubmit, reset, setValue, formState: { errors }, clearErrors, watch } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultFormValues
  });

  // Fetch all suppliers
  const { data: suppliers = [], isLoading, isError, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierApi.fetchAll,
  });

  // Add Supplier Mutation
  const addMutation = useMutation({
    mutationFn: (payload: SupplierForm) => supplierApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Supplier created successfully");
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

  // Update Supplier Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupplierForm }) =>
      supplierApi.update({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Supplier updated successfully");
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

  // Delete Supplier Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success("Supplier deleted successfully");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  // Set form values when editing
  useEffect(() => {
    if (editId !== null && suppliers.length > 0) {
      const supplier = suppliers.find(s => s.id === editId);
      if (supplier) {
        setValue("name", supplier.name);
        setValue("location", supplier.location);
        setShowForm(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, suppliers]);

  const onSubmit = (data: SupplierForm) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer position="top-center" autoClose={3000} />
      {/* Centered wrapper for both table and form, same width */}
      <div className="flex-grow flex flex-col items-center w-full py-4">
        <div className="w-full max-w-3xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center">
                <Plus className="h-5 w-5 mr-1" />
                Add New Supplier
              </Button>
            )}
          </div>
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg w-full py-8 px-6 mb-4 z-20">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="name" className="w-40 text-sm font-medium">Supplier Name</Label>
                    <div className="flex-1">
                      <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                      {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label htmlFor="location" className="w-40 text-sm font-medium">Location</Label>
                    <div className="flex-1">
                      <Input id="location" {...register("location")} aria-invalid={!!errors.location} />
                      {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
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
                    aria-label={editId !== null ? "Update Supplier" : "Create Supplier"}
                  >
                    {(addMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editId !== null ? "Updating..." : "Creating..."}
                      </>
                    ) : editId !== null ? "Update Supplier" : "Create Supplier"}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {/* Search Input */}
          <div className={`transition-all ${showForm ? "mb-2" : "mb-4"}`}>
            <Input
              placeholder="Search Supplier or Location"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search suppliers"
              className="w-full"
            />
          </div>
          {/* Table, with sticky headers */}
          <div
            className={`flex-1 transition-all duration-300 ${showForm ? "max-h-[calc(100vh-350px)]" : "max-h-[calc(100vh-200px)]"} min-h-[250px]`}
            style={{ width: "100%" }}
          >
            <SupplierTable
              data={suppliers}
              loading={isLoading}
              filter={search}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {isError && (
              <div className="text-red-500 text-center mt-4">
                {error instanceof Error ? error.message : "Failed to load suppliers"}
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
