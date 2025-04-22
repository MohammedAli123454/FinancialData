"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogDescription} from "@/components/ui/dialog";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { Edit, Trash2, Loader2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { useMocStore } from "@/app/stores/mocStore";
interface ClientMOC {
  id: number;
  mocNo: string;
  cwo: string;
  po: string;
  proposal: string;
  contractValue: string;
  description: string;
  shortDescription: string;
  type: string;
  category: string;
  issuedDate: string;
  signedDate: string;
}

const mocSchema = z.object({
  mocNo: z.string().min(1, "MOC Number is required"),
  cwo: z.string().min(1, "CWO Number is required"),
  po: z.string().min(1, "PO Number is required"),
  proposal: z.string().min(1, "Proposal is required"),
  contractValue: z.string()
    .min(1, "Contract Value is required")
    .refine(val => !isNaN(parseFloat(val)), "Must be a valid number"),
  description: z.string(),
  shortDescription: z.string().max(255, "Max 255 characters"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  issuedDate: z.string().min(1, "Issued Date is required"),
  signedDate: z.string().min(1, "Signed Date is required"),
});

type MocFormValues = z.infer<typeof mocSchema>;

const categoryOptions = [
  { value: "MOC", label: "MOC" },
  { value: "Project", label: "Project" },
  { value: "Change Order", label: "Change Order" },
];

const MocTable = ({ data, loading, filter }: {data: ClientMOC[];loading: boolean;filter: string}) => {
  const setDeleteId = useMocStore((s) => s.setDeleteId);
  const setEditId = useMocStore((s) => s.setEditId);

  const rows = data
    .filter(({ mocNo, cwo }) => {
      const q = filter.toLowerCase();
      return mocNo.toLowerCase().includes(q) || cwo.toLowerCase().includes(q);
    })
    .sort((a, b) => a.cwo.localeCompare(b.cwo));

  return (
    <Table className="border-collapse w-full">
      <TableHeader className="sticky top-0 bg-gray-50 shadow-sm z-10">
        <TableRow className="h-8">
          <TableHead>MOC Number</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Short Description</TableHead>
          <TableHead>CWO</TableHead>
          <TableHead>PO</TableHead>
          <TableHead>Contract Value</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {loading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
            </TableCell>
          </TableRow>
        ) : (
          rows.map((moc) => (
            <TableRow key={moc.id} className="h-8">
              <TableCell className="py-1">{moc.mocNo}</TableCell>
              <TableCell className="py-1">{moc.category}</TableCell>
              <TableCell className="py-1">{moc.type}</TableCell>
              <TableCell className="py-1">{moc.shortDescription}</TableCell>
              <TableCell className="py-1">{moc.cwo}</TableCell>
              <TableCell className="py-1">{moc.po}</TableCell>
              <TableCell className="py-1">
                {parseFloat(moc.contractValue).toFixed(2)} SAR
              </TableCell>
              <TableCell className="py-1">
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => setEditId(moc.id)}
                    aria-label="Edit MOC"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    onClick={() => setDeleteId(moc.id)}
                    aria-label="Delete MOC"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default function MOCForm() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deleteId = useMocStore((s) => s.deleteId);
  const editId = useMocStore((s) => s.editId);
  const setEditId = useMocStore((s) => s.setEditId);
  const setDeleteId = useMocStore((s) => s.setDeleteId);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<MocFormValues>({
    resolver: zodResolver(mocSchema),
    defaultValues: {
      mocNo: "",
      cwo: "",
      po: "",
      proposal: "",
      contractValue: "",
      description: "",
      shortDescription: "",
      type: "",
      category: "",
      issuedDate: "",
      signedDate: "",
    }
  });

  const mocApi = {
    fetchAll: async (): Promise<ClientMOC[]> => {
      const res = await fetch("/api/mocs");
      if (!res.ok) throw new Error("Failed to fetch MOCs");
      return (await res.json()).data;
    },
    create: async (payload: MocFormValues): Promise<ClientMOC> => {
      const res = await fetch("/api/mocs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create MOC");
      return json.data;
    },
    update: async (id: number, payload: Partial<MocFormValues>): Promise<ClientMOC> => {
      const res = await fetch(`/api/mocs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update MOC");
      return json.data;
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`/api/mocs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete MOC");
    },
  };

  const { data: mocs = [], isLoading } = useQuery<ClientMOC[]>({
    queryKey: ['mocs'],
    queryFn: mocApi.fetchAll
  });

  const addMutation = useMutation({
    mutationFn: mocApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mocs'] });
      toast.success("MOC created successfully");
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateMutation = useMutation<ClientMOC, Error, { id: number; values: MocFormValues }>({
    mutationFn: ({ id, values }) => mocApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mocs'] });
      toast.success("MOC updated successfully");
      reset();
      setEditId(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: mocApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mocs'] });
      toast.success("MOC deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  useEffect(() => {
    if (editId) {
      const mocToEdit = mocs.find((moc) => moc.id === editId);
      if (mocToEdit) {
        setValue("mocNo", mocToEdit.mocNo);
        setValue("cwo", mocToEdit.cwo);
        setValue("po", mocToEdit.po);
        setValue("proposal", mocToEdit.proposal);
        setValue("contractValue", mocToEdit.contractValue);
        setValue("description", mocToEdit.description);
        setValue("shortDescription", mocToEdit.shortDescription);
        setValue("type", mocToEdit.type);
        setValue("category", mocToEdit.category);
        setValue("issuedDate", mocToEdit.issuedDate);
        setValue("signedDate", mocToEdit.signedDate);
      }
    }
  }, [editId, mocs, setValue]);

  const resetForm = () => {
    reset();
    setEditId(null);
  };

  const onSubmit = (data: MocFormValues) => {
    if (editId) {
      updateMutation.mutate({ id: editId, values: data });
    } else {
      addMutation.mutate(data);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="mocNo">MOC Number</Label>
                  <div>
                    <Input
                      id="mocNo"
                      {...register("mocNo")}
                      aria-invalid={!!errors.mocNo}
                    />
                    {errors.mocNo && (
                      <span className="text-red-500 text-sm">{errors.mocNo.message}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="type">Type</Label>
                  <div>
                    <select
                      id="type"
                      {...register("type")}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      aria-invalid={!!errors.type}
                    >
                      <option value="">Select Type</option>
                      <option value="Turnaround">Turnaround</option>
                      <option value="Non-TA">Non-TA</option>
                    </select>
                    {errors.type && (
                      <span className="text-red-500 text-sm">{errors.type.message}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="po">PO Number</Label>
                  <div>
                    <Input
                      id="po"
                      {...register("po")}
                      aria-invalid={!!errors.po}
                    />
                    {errors.po && (
                      <span className="text-red-500 text-sm">{errors.po.message}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="cwo">CWO Number</Label>
                  <div>
                    <Input
                      id="cwo"
                      {...register("cwo")}
                      aria-invalid={!!errors.cwo}
                    />
                    {errors.cwo && (
                      <span className="text-red-500 text-sm">{errors.cwo.message}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="category">Category</Label>
                  <div>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          id="category"
                          options={categoryOptions}
                          value={categoryOptions.find(option => option.value === field.value)}
                          onChange={(selected) => field.onChange(selected?.value)}
                          aria-label="Select category"
                        />
                      )}
                    />
                    {errors.category && (
                      <span className="text-red-500 text-sm">{errors.category.message}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input 
                    id="shortDescription"
                    {...register("shortDescription")} 
                    maxLength={255} 
                    aria-invalid={!!errors.shortDescription}
                  />
                  {errors.shortDescription && (
                    <span className="text-red-500 text-sm">{errors.shortDescription.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                <Label htmlFor="description">Full Description</Label>
                <Input 
                  id="description"
                  {...register("description")} 
                  aria-invalid={!!errors.description}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="contractValue">Contract Value (SAR)</Label>
                  <div>
                    <Input
                      id="contractValue"
                      type="number"
                      step="0.01"
                      {...register("contractValue")}
                      aria-invalid={!!errors.contractValue}
                    />
                    {errors.contractValue && (
                      <span className="text-red-500 text-sm">{errors.contractValue.message}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="proposal">Proposal</Label>
                  <div>
                    <Input
                      id="proposal"
                      {...register("proposal")}
                      aria-invalid={!!errors.proposal}
                    />
                    {errors.proposal && (
                      <span className="text-red-500 text-sm">{errors.proposal.message}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="issuedDate">Issued Date</Label>
                  <div>
                    <Controller
                      name="issuedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="issuedDate"
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select date"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          aria-label="Issued date"
                        />
                      )}
                    />
                    {errors.issuedDate && (
                      <span className="text-red-500 text-sm">{errors.issuedDate.message}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[150px,1fr] items-center gap-4">
                  <Label htmlFor="signedDate">Signed Date</Label>
                  <div>
                    <Controller
                      name="signedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="signedDate"
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select date"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          aria-label="Signed date"
                        />
                      )}
                    />
                    {errors.signedDate && (
                      <span className="text-red-500 text-sm">{errors.signedDate.message}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {editId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={addMutation.isPending || updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={addMutation.isPending || updateMutation.isPending}
                  >
                    {addMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editId ? "Updating..." : "Creating..."}
                      </>
                    ) : editId ? "Update MOC" : "Create MOC"}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-4">
            <Input 
              placeholder="Search by MOC Number or CWO" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              aria-label="Search MOCs"
            />
          </div>

          <div className="mt-4 flex-1 overflow-auto" style={{ maxHeight: 400 }}>
            <MocTable data={mocs} loading={isLoading} filter={search} />
          </div>

          <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this MOC?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}