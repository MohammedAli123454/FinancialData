"use client";

import { Button } from "@/components/ui/button";
import type { Supplier, PurchaseOrderWithLineItems } from "../types";

type Props = {
  pages?: PurchaseOrderWithLineItems[][]; // Optional for extra safety!
  loading: boolean;
  suppliers: Supplier[];
  filter: string;
  onEdit: (po: PurchaseOrderWithLineItems) => void;
  onDelete: (id: number) => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loadingMore: boolean;
};

export default function PurchaseOrderTable({
  pages = [],
  loading,
  suppliers,
  filter,
  onEdit,
  onDelete,
  hasNextPage,
  fetchNextPage,
  loadingMore,
}: Props) {
  // Always flatten safely
  const allPos: PurchaseOrderWithLineItems[] = Array.isArray(pages) ? pages.flat() : [];

  // Filtering (also safe if no supplierName)
  const filtered = filter
    ? allPos.filter(
        po =>
          (po.poNumber?.toLowerCase().includes(filter.toLowerCase()) ?? false) ||
          (po.supplierName?.toLowerCase().includes(filter.toLowerCase()) ?? false)
      )
    : allPos;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-2 py-2 border">#</th>
            <th className="px-2 py-2 border">Supplier</th>
            <th className="px-2 py-2 border">PO Number</th>
            <th className="px-2 py-2 border">Currency</th>
            <th className="px-2 py-2 border">PO Value</th>
            <th className="px-2 py-2 border">With VAT</th>
            <th className="px-2 py-2 border">Line Items</th>
            <th className="px-2 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center py-6">
                Loading...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-6">
                No records found
              </td>
            </tr>
          ) : (
            filtered.map((po, i) => (
              <tr key={po.id} className="border-b">
                <td className="px-2 py-2 border">{i + 1}</td>
                <td className="px-2 py-2 border">{po.supplierName}</td>
                <td className="px-2 py-2 border">{po.poNumber}</td>
                <td className="px-2 py-2 border">{po.currency}</td>
                <td className="px-2 py-2 border">{po.poValue}</td>
                <td className="px-2 py-2 border">{po.poValueWithVAT}</td>
                <td className="px-2 py-2 border">
                  {po.lineItems?.length ?? 0}
                </td>
                <td className="px-2 py-2 border whitespace-nowrap">
                  <Button size="sm" onClick={() => onEdit(po)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-2"
                    onClick={() => onDelete(po.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {hasNextPage && (
        <div className="text-center py-3">
          <Button onClick={fetchNextPage} disabled={loadingMore}>
            {loadingMore ? "Loading more..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
