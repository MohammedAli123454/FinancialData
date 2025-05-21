'use client';
import { useRef, useEffect } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "../types";

type Props = {
  pages: Student[][];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  filter: string;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loadingMore: boolean;
};

export default function StudentTable({
  pages, onEdit, onDelete, loading, filter, hasNextPage, fetchNextPage, loadingMore
}: Props) {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (loading || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchNextPage();
    });
    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [loading, hasNextPage, fetchNextPage]);

  const data = (pages ?? []).flat();
  // The API already filters, so optionally just use: const rows = data;
  const rows = data.filter(row =>
    (row.firstName?.toLowerCase().includes(filter.toLowerCase()) ||
      row.lastName?.toLowerCase().includes(filter.toLowerCase()) ||
      row.admissionNumber?.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-150px)]">
      <table className="min-w-[1400px] w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-2 py-2 w-14">S.No</th>
            <th className="border px-2 py-2 w-32">Admission No</th>
            <th className="border px-2 py-2 w-52">Name</th>
            <th className="border px-2 py-2 w-20">Gender</th>
            <th className="border px-2 py-2 w-28">DOB</th>
            <th className="border px-2 py-2 w-20">Class</th>
            <th className="border px-2 py-2 w-32">Contact</th>
            <th className="border px-2 py-2 w-52">Father</th>
            <th className="border px-2 py-2 w-52">Mother</th>
            <th className="border px-2 py-2 w-40">Address</th>
            <th className="border px-2 py-2 w-32 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="text-center py-6 border">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center text-muted-foreground py-6 border">
                No students found.
              </td>
            </tr>
          ) : (
            rows.map((stu, idx) => (
              <tr key={stu.id} className="even:bg-white/50 hover:bg-gray-50 transition">
                <td className="border px-2 py-1 w-14">{idx + 1}</td>
                <td className="border px-2 py-1 w-32 truncate">{stu.admissionNumber}</td>
                <td className="border px-2 py-1 w-52 truncate">{stu.firstName} {stu.middleName} {stu.lastName}</td>
                <td className="border px-2 py-1 w-20">{stu.gender}</td>
                <td className="border px-2 py-1 w-28">{stu.dateOfBirth}</td>
                <td className="border px-2 py-1 w-20">{stu.classEnrolled} {stu.section}</td>
                <td className="border px-2 py-1 w-32">{stu.contactPhonePrimary}</td>
                <td className="border px-2 py-1 w-52 truncate">{stu.fatherName}</td>
                <td className="border px-2 py-1 w-52 truncate">{stu.motherName}</td>
                <td className="border px-2 py-1 w-40 truncate">{stu.addressLine1}</td>
                <td className="border px-2 py-1 w-32 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => onEdit(stu.id)} aria-label="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete(stu.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
          {hasNextPage && (
            <tr ref={loadMoreRef}>
              <td colSpan={11} className="text-center py-4 border bg-white">
                {loadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400 mx-auto" />
                ) : (
                  <span className="text-xs text-gray-500">Loading more...</span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
