"use client";

import { useQuery } from "@tanstack/react-query";
import { getMocSummary } from "@/app/actions/invoicePercentage";
import type { TMOCInvoiceSummary } from "@/app/actions/invoicePercentage";

export default function MocSummaryPage() {
  const {
    data: mocData,
    isLoading,
    isError,
    error,
  } = useQuery<TMOCInvoiceSummary[]>({
    queryKey: ["moc-summary"],
    queryFn: () => getMocSummary(),
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading MOC summary...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading MOC summary: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Invoices Submission Analysis
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Added a fixed maxHeight and vertical scroll */}
        <div
          className="relative overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "550px" }}
        >
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
                <tr 
                  key={item.mocNo}
                  className="hover:bg-gray-50 even:bg-gray-50"
                >
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
