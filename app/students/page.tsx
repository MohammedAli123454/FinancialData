'use client';

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import StudentTable from "./components/StudentTable";
import StudentStepperForm from "./components/StudentStepperForm";
import type { Student, StudentForm } from "./types";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";

// ----------- Zod validation schema, all fields -----------
const studentSchema = z.object({
  admissionNumber: z.string().min(1, "Admission Number is required"),
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  category: z.string().optional(),
  bloodGroup: z.string().optional(),
  motherTongue: z.string().optional(),
  photoUrl: z.string().optional(),
  admissionDate: z.string().min(1, "Admission Date is required"),
  classEnrolled: z.string().min(1, "Class is required"),
  section: z.string().optional(),
  previousSchool: z.string().optional(),
  transferCertificateNo: z.string().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  contactPhonePrimary: z.string().min(1, "Contact Phone is required"),
  contactPhoneSecondary: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  aadharNumber: z.string().optional(),
  healthIssues: z.string().optional(),
  specialNeeds: z.string().optional(),
  transportMode: z.string().optional(),
  remarks: z.string().optional(),
});

const PAGE_SIZE = 25;

// ----------- Paginated Fetch ----------
async function fetchPaginatedStudents({ pageParam = 0, queryKey }: any) {
  const [, search] = queryKey;
  const url = `/api/students?page=${pageParam}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

// ----------- API wrappers ----------
const studentApi = {
  create: (payload: StudentForm): Promise<Student> =>
    fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(r => r.json()),
  update: ({ id, payload }: { id: number; payload: StudentForm }): Promise<Student> =>
    fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(r => r.json()),
  remove: (id: number): Promise<boolean> =>
    fetch(`/api/students/${id}`, { method: "DELETE" }).then(r => r.json()),
};

export default function StudentCRUD() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const defaultFormValues: StudentForm = {
    admissionNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    religion: "",
    category: "",
    bloodGroup: "",
    motherTongue: "",
    photoUrl: "",
    admissionDate: "",
    classEnrolled: "",
    section: "",
    previousSchool: "",
    transferCertificateNo: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    guardianName: "",
    guardianRelation: "",
    contactPhonePrimary: "",
    contactPhoneSecondary: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    aadharNumber: "",
    healthIssues: "",
    specialNeeds: "",
    transportMode: "",
    remarks: "",
  };

  const methods = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: defaultFormValues
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    clearErrors,
  } = methods;

  // Infinite Query
  const {
    data: studentsPages,
    isLoading: loadingStudents,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['students', search],
    queryFn: fetchPaginatedStudents,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // ----------- Mutations -----------
  const addMutation = useMutation({
    mutationFn: (payload: StudentForm) => studentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Student created successfully");
      reset(defaultFormValues);
      setEditId(null);
      setShowForm(false);
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to create");
      reset(defaultFormValues);
      clearErrors();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StudentForm }) =>
      studentApi.update({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Student updated successfully");
      reset(defaultFormValues);
      setEditId(null);
      setShowForm(false);
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to update");
      reset(defaultFormValues);
      clearErrors();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Student deleted successfully");
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete")
  });

  // Set form values on edit
  useEffect(() => {
    if (editId !== null && studentsPages?.pages) {
      const flatStudents = studentsPages.pages.flatMap(page => page.items);
      const stu = flatStudents.find(s => s.id === editId);
      if (stu) {
        Object.entries(defaultFormValues).forEach(([key, def]) => {
          // @ts-ignore
          setValue(key, stu[key] ?? def);
        });
        setShowForm(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, studentsPages]);

  const onSubmit = (data: StudentForm) => {
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
      <div className="flex-grow flex flex-col items-center w-full py-4">
        <div className="w-full max-w-7xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Students</h1>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center">
                <Plus className="h-5 w-5 mr-1" />
                Add New Student
              </Button>
            )}
          </div>
          {/* Stepper dialog for Add/Edit */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg w-full py-8 px-6 mb-4 z-20">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <StudentStepperForm
                    onCancel={handleCancelForm}
                    isSubmitting={addMutation.isPending || updateMutation.isPending}
                    isEdit={editId !== null}
                  />
                </form>
              </FormProvider>
            </div>
          )}
          <div className={`transition-all ${showForm ? "mb-2" : "mb-4"}`}>
            <Input
              placeholder="Search by name or admission number"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search students"
              className="w-full"
            />
          </div>
          <div
            className={`flex-1 transition-all duration-300 ${showForm ? "max-h-[calc(100vh-350px)]" : "max-h-[calc(100vh-200px)]"} min-h-[250px]`}
            style={{ width: "100%" }}
          >
            <StudentTable
              pages={studentsPages?.pages?.map(p => p.items) || []}
              loading={loadingStudents}
              filter={search}
              onEdit={handleEdit}
              onDelete={handleDelete}
              hasNextPage={!!hasNextPage}
              fetchNextPage={fetchNextPage}
              loadingMore={isFetchingNextPage}
            />
            {isError && (
              <div className="text-red-500 text-center mt-4">
                {error instanceof Error ? error.message : "Failed to load students"}
              </div>
            )}
          </div>
        </div>
        {/* Delete Dialog */}
        <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <div>Are you sure you want to delete this student?</div>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
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
