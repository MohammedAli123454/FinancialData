"use client";
import { useRef, useEffect } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "../types";

type Props = {
  pages: Student[][];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  loading: boolean;
  filter: string;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loadingMore: boolean;
};

export default function StudentTable({
  pages,
  onEdit,
  onDelete,
  onView,
  loading,
  filter,
  hasNextPage,
  fetchNextPage,
  loadingMore
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

  // Flatten paginated student arrays
  const data: Student[] = (pages ?? []).flat();

  // Filter logic
  const rows = filter.trim()
    ? data.filter(row =>
        (row.firstName?.toLowerCase().includes(filter.toLowerCase()) ||
         row.lastName?.toLowerCase().includes(filter.toLowerCase()) ||
         row.admissionNumber?.toLowerCase().includes(filter.toLowerCase()))
      )
    : data;

  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-200px)] bg-white">
      <table className="min-w-[900px] w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border-b border-gray-200 px-2 py-2 w-12">S.No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-40">Student Name</th>
            <th className="border-b border-gray-200 px-2 py-2 w-32">Admission No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28">Class</th>
            <th className="border-b border-gray-200 px-2 py-2 w-24">Gender</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28">DOB</th>
            <th className="border-b border-gray-200 px-2 py-2 w-36">Nationality</th>
            <th className="border-b border-gray-200 px-2 py-2 w-36 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center py-6 border">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted-foreground py-6 border">
                No students found.
              </td>
            </tr>
          ) : (
            rows.map((stu, idx) => (
              <tr key={stu.id} className="even:bg-white/50 hover:bg-gray-50 transition">
                <td className="border-b border-gray-200 px-2 py-2 w-12">{idx + 1}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-40 truncate">
                  {stu.firstName} {stu.middleName} {stu.lastName}
                </td>
                <td className="border-b border-gray-200 px-2 py-2 w-32 truncate">{stu.admissionNumber}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-28 truncate">{stu.classEnrolled}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-24">{stu.gender}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-28">{stu.dateOfBirth}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-36 truncate">{stu.nationality}</td>
                <td className="border-b border-gray-200 px-2 py-2 w-36 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => onView(stu.id)} aria-label="View">
                      <Eye className="h-4 w-4" />
                    </Button>
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
              <td colSpan={8} className="text-center py-4 border bg-white">
                {loadingMore ? (
                  <span>Loading more...</span>
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
