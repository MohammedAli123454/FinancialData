'use client';
import { useRef, useEffect } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Supplier, PurchaseOrder } from "../types";

type Props = {
  pages: PurchaseOrder[][];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  suppliers: Supplier[];
  filter: string;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loadingMore: boolean;
};

export default function PurchaseOrderTable({
  pages, onEdit, onDelete, loading, suppliers, filter, hasNextPage, fetchNextPage, loadingMore
}: Props) {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLTableRowElement | null>(null);

  // Infinite scroll: When last row comes into view, call fetchNextPage
  useEffect(() => {
    if (loading || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchNextPage();
    });
    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [loading, hasNextPage, fetchNextPage]);

  // flatten the paginated data
  const data = (pages ?? []).flat();

  const rows = data.filter(row =>
    (row.poNumber.toLowerCase().includes(filter.toLowerCase()) ||
      (row.supplierName?.toLowerCase().includes(filter.toLowerCase()) ?? false))
  );

  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-150px)]">
      <table className="min-w-[800px] w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-4 py-2 w-16 text-left">S.No</th>
            <th className="border px-4 py-2 w-40 text-left">PO Number</th>
            <th className="border px-4 py-2 w-56 text-left">Supplier</th>
            <th className="border px-4 py-2 w-28 text-left">Currency</th>
            <th className="border px-4 py-2 w-36 text-right">PO Value</th>
            <th className="border px-4 py-2 w-44 text-right">PO Value With VAT</th>
            <th className="border px-4 py-2 w-32 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-6 border">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted-foreground py-6 border">
                No purchase orders found.
              </td>
            </tr>
          ) : (
            rows.map((po, idx) => (
              <tr key={po.id} className="even:bg-white/50 hover:bg-gray-50 transition">
                <td className="border px-4 py-1 w-16 text-left">{idx + 1}</td>
                <td className="border px-4 py-1 w-40 truncate whitespace-nowrap overflow-hidden">{po.poNumber}</td>
                <td className="border px-4 py-1 w-56 truncate whitespace-nowrap overflow-hidden">
                  {po.supplierName ||
                    suppliers.find(s => s.id === po.supplierId)?.name ||
                    po.supplierId}
                </td>
                <td className="border px-4 py-1 w-28">{po.currency}</td>
                <td className="border px-4 py-1 w-36 text-right">{po.poValue}</td>
                <td className="border px-4 py-1 w-44 text-right">{po.poValueWithVAT}</td>
                <td className="border px-4 py-1 w-32 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => onEdit(po.id)} aria-label="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete(po.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
          {hasNextPage && (
            <tr ref={loadMoreRef}>
              <td colSpan={7} className="text-center py-4 border bg-white">
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
