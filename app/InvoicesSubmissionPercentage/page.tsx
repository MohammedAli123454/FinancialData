"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMocSummary, getDistinctTypes } from "@/app/actions/invoicePercentage";
import type { TMOCInvoiceSummary } from "@/app/actions/invoicePercentage";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function MocSummaryPage() {
  const [selectedType, setSelectedType] = useState<string>("all");

  const {
    data: mocData,
    isLoading,
    isError,
    error,
  } = useQuery<TMOCInvoiceSummary[]>({
    queryKey: ["moc-summary", selectedType],
    queryFn: () => getMocSummary(selectedType),
  });

  const { data: typesData, isLoading: typesLoading } = useQuery<string[]>({
    queryKey: ["distinct-types"],
    queryFn: getDistinctTypes,
  });

  // Calculate grand totals
  const totalContractValue = mocData?.reduce((acc, item) => acc + item.contractValue, 0) || 0;
  const totalInvoicedAmount = mocData?.reduce((acc, item) => acc + item.totalInvoiceAmount, 0) || 0;
  const totalPercentage = totalContractValue === 0 ? 0 : (totalInvoicedAmount / totalContractValue) * 100;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header row with title and dropdown */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Invoices Submission Analysis
        </h1>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-4 py-2 border rounded bg-white hover:bg-gray-50">
              {selectedType === "all" ? "All Types" : selectedType}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleTypeSelect("all")}>
                All Types
              </DropdownMenuItem>
              {typesLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : (
                typesData?.map((type) => (
                  <DropdownMenuItem key={type} onSelect={() => handleTypeSelect(type)}>
                    {type}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative overflow-x-auto overflow-y-auto" style={{ maxHeight: "550px" }}>
          {isLoading ? (
            <div className="p-4 text-gray-500">Loading MOC summary...</div>
          ) : isError ? (
            <div className="p-4 text-red-500">
              Error loading MOC summary: {error.message}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Sr.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    MOC Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Contract Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Invoiced Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mocData?.map((item, index) => (
                  <tr key={item.mocNo} className="hover:bg-gray-50 even:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 align-top">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium align-top">
                      {item.mocNo}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 align-top">
                      {item.shortDescription}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 align-top">
                      {item.contractValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 align-top">
                      {item.totalInvoiceAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 align-top">
                      {item.percentageOfContractValue}%
                    </td>
                  </tr>
                ))}
                
                {/* Grand Total Row */}
                {mocData && mocData.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      Grand Total
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totalContractValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totalInvoicedAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totalPercentage.toFixed(2)}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}