"use client";
import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, DownloadIcon } from "lucide-react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { SettingsIcon, CheckIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getGroupedMOCs, PartialInvoices } from "@/app/actions/invoiceActions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell, // Add this import
  LabelList // Add this if missing
} from "recharts";

// Utility Functions
const formatMillions = (value: number, showInMillions: boolean) => {
  if (showInMillions) {
    const millions = value / 1_000_000;
    return `${millions.toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const safeString = (value: string | null) => value || "N/A";
const safeNumber = (value: number | null) => value ?? 0;

interface ExcelColumnConfig {
  header: string;
  key: string;
  width: number;
  style?: Partial<ExcelJS.Style>;
  numFmt?: string;
}

// MergedCard Component
type MergedCardProps = {
  title: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
  onClick: () => void;
  isSelected: boolean;
  rightIsPercentage?: boolean;
  showInMillions: boolean;
};

const MergedCard: React.FC<MergedCardProps> = ({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftColor = "text-gray-900",
  rightColor = "text-gray-900",
  onClick,
  isSelected,
  rightIsPercentage = false,
  showInMillions,
}) => {
  const formatValue = (value: number, isPercentage: boolean) => {
    if (isPercentage) {
      return value.toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 1,
      });
    }
    return formatMillions(value, showInMillions);
  };

  return (
    <Card
      onClick={onClick}
      className={`p-0 cursor-pointer transition-all ${isSelected ? "border-2 border-blue-500" : "hover:border-gray-300"
        }`}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={`text-center text-[15px] font-medium text-blue-900/90 py-1.5 px-3.5
        border-b border-blue-200/30 bg-gradient-to-r from-blue-100/70 to-blue-100/30
        backdrop-blur-sm rounded-t-xl transition-all duration-300 ${isSelected
              ? "bg-blue-100/50 border-b-blue-300/30"
              : "hover:bg-blue-100/40"
            }`}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Left Metric Row */}
          <div className="grid grid-cols-5 items-center gap-x-1">
            <span className="col-span-3 text-sm text-gray-600 truncate">{leftLabel}</span>
            <span className={`col-span-2 text-xl font-normal ${leftColor} text-right`}>
              {formatValue(leftValue, false)}
            </span>
          </div>

          {/* Right Metric Row */}
          <div className="grid grid-cols-5 items-center gap-x-1">
            <span className="col-span-3 text-sm text-gray-600 truncate">{rightLabel}</span>
            <span className={`col-span-2 text-xl font-normal ${rightColor} text-right`}>
              {formatValue(rightValue, rightIsPercentage)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



export default function InvoicesStatus() {
  const [selectedCard, setSelectedCard] = useState<string | null>("awarded");
  const [selectedType, setSelectedType] = useState<string>("Overall");
  const [selectedMoc, setSelectedMoc] = useState<PartialInvoices | null>(null);
  const [showInMillions, setShowInMillions] = useState(true); // Add this state
  const [showIncludingVAT, setShowIncludingVAT] = useState(true);

 
  // Fetch Data Using TanStack Query
  const {
    data: groupedMOCs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["groupedMOCs", selectedType],
    queryFn: () => getGroupedMOCs(),
    retry: 2, // Retry failed requests up to 2 times
  });

  const exportToExcel = useCallback(async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('INVOICE STATUS');
  
    // Column definitions
    const columns: ExcelColumnConfig[] = [
      { header: 'SL. NO', key: 'slNo', width: 8, style: { alignment: { horizontal: 'center' } }},
      { header: 'MOC NO.', key: 'mocNo', width: 18 },
      { header: 'CWO', key: 'cwo', width: 12 },
      { header: 'PO', key: 'po', width: 15 },
      { header: 'PROPOSAL#', key: 'proposal', width: 25 },
      { header: 'Contract Value (SAR)\nExcl. VAT', key: 'contractValue', width: 20, numFmt: '#,##0.00' },
      { header: 'INVOICE #', key: 'invoiceNo', width: 20 },
      { header: 'DATE', key: 'date', width: 18, numFmt: 'yyyy-mm-dd' },
      { header: 'AMOUNT', key: 'amount', width: 15, numFmt: '#,##0.00' },
      { header: 'VAT', key: 'vat', width: 12, numFmt: '#,##0.00' },
      { header: 'Retention', key: 'retention', width: 12, numFmt: '#,##0.00' },
      { header: 'Payable', key: 'payable', width: 15, numFmt: '#,##0.00' },
      { header: 'Payment Recd. Date', key: 'paymentDate', width: 18, numFmt: 'yyyy-mm-dd' },
      { header: 'INVOICE STATUS', key: 'status', width: 18 },
      { header: 'INVOICE COPY SEND TO HO', key: 'copySent', width: 22, numFmt: 'yyyy-mm-dd' },
    ];
  
    worksheet.columns = columns;
  
    // Header styling
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = { 
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true 
      };
    });
  
    let rowNumber = 1;
    let currentRow = 2;
    const mergeRanges: { start: number; end: number }[] = [];
  
    data.forEach((moc, mocIndex) => {
      const invoices = moc.invoices || [];
      const groupStartRow = currentRow;
  
      invoices.forEach((invoice, invIndex) => {
        const isFirstRow = invIndex === 0;
        
        const row = worksheet.addRow({
          slNo: isFirstRow ? mocIndex + 1 : '',
          mocNo: isFirstRow ? moc.mocNo : '',
          cwo: isFirstRow ? moc.cwo : '',
          po: isFirstRow ? moc.po : '',
          proposal: isFirstRow ? moc.proposal : '',
          contractValue: isFirstRow ? moc.contractValue : '',
          invoiceNo: invoice.invoiceNo,
          date: invoice.invoiceDate,
          amount: invoice.amount,
          vat: invoice.vat,
          retention: invoice.retention,
          payable: invoice.amount + invoice.vat - invoice.retention,
          paymentDate: invoice.invoiceDate || '',
          status: invoice.invoiceStatus,
          copySent: invoice.invoiceDate || ''
        });
  
        // Set row height and formatting
        row.height = 25;
        row.eachCell(cell => {
          cell.font = { size: 11 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
          };
        });
  
        // Alternate row coloring
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F8F8' }
          };
        }
        
        rowNumber++;
        currentRow++; // Critical: Increment current row counter
      });
  
      // Add merge range if multiple rows exist for this MOC
      if (invoices.length > 0) {
        mergeRanges.push({
          start: groupStartRow,
          end: currentRow - 1 // Subtract 1 because currentRow was incremented
        });
      }
    });
  
    // Merge cells for columns A-F (SL.NO to Contract Value)
    mergeRanges.forEach(range => {
      if (range.start !== range.end) { // Only merge if multiple rows
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          worksheet.mergeCells(`${col}${range.start}:${col}${range.end}`);
          // Center align merged cells
          worksheet.getCell(`${col}${range.start}`).alignment = { 
            vertical: 'middle', 
            horizontal: 'center' 
          };
        });
      }
    });
  
    // Add totals row
    const totalsRow = worksheet.addRow({
      contractValue: data.reduce((sum, moc) => sum + (moc.contractValue || 0), 0),
      amount: data.flatMap(moc => moc.invoices).reduce((sum, inv) => sum + (inv?.amount || 0), 0),
      vat: data.flatMap(moc => moc.invoices).reduce((sum, inv) => sum + (inv?.vat || 0), 0),
      retention: data.flatMap(moc => moc.invoices).reduce((sum, inv) => sum + (inv?.retention || 0), 0),
      payable: data.flatMap(moc => moc.invoices).reduce((sum, inv) => 
        sum + ((inv?.amount || 0) + (inv?.vat || 0) - (inv?.retention || 0)), 0),
    });
  
    // Format totals row
    totalsRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.numFmt = '#,##0.00';
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Invoice_Status_Report.xlsx');
  }, [groupedMOCs]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError)
    return (
      <div className="p-6 text-red-500">
        Error: {error instanceof Error ? error.message : "Failed to load data"}
      </div>
    );

  // Check if groupedMOCs is successful and has data
  if (!groupedMOCs || !groupedMOCs.success) {
    return (
      <div className="p-6 text-red-500">
        Error: {groupedMOCs?.message || "Failed to load data"}
      </div>
    );
  }

  const data = groupedMOCs.data;


  



  // Status Mapping for Invoice Statuses
  const statusMapping = {
    PAID: { label: "Total Amount Collected", color: "text-green-600" },
    FINANCE: { label: "Invoices Under Finance", color: "text-purple-600" },
    PMD: { label: "Invoices Under Supply Chain", color: "text-orange-600" },
    PMT: { label: "Invoices Under PMT", color: "text-blue-600" },
  } as const;

  type StatusKey = keyof typeof statusMapping;

  // Extract Unique Project Types
  const projectTypes = Array.from(new Set(data.map((moc) => moc.type)))
    .filter(Boolean)
    .map(String);

  // Filter MOCs Based on Selected Project Type
  const filteredMOCsByProjectType = data.filter(
    (moc) => selectedType === "Overall" || moc.type === selectedType
  );

  // Extract All Invoices for Aggregation
  const allInvoicesForAggregation = filteredMOCsByProjectType.flatMap(
    (moc) => moc.invoices
  );

  // Aggregate Sums for Financial Metrics
  const aggregatedSums = {
    totalAwardedAmountExcludingVAT: filteredMOCsByProjectType.reduce(
      (sum, moc) => sum + safeNumber(moc.contractValue),
      0
    ),
    totalAwardedAmountIncludingVAT: filteredMOCsByProjectType.reduce(
      (sum, moc) => sum + safeNumber(moc.contractValue) * 1.15,
      0
    ),
    totalSubmittedInvoicesWithoutVAT: allInvoicesForAggregation.reduce(
      (sum, row) =>
        sum +
        (row?.amount ?? 0),
      0
    ),
    totalSubmittedInvoicesWithVAT: allInvoicesForAggregation.reduce(
      (sum, row) =>
        sum +
        ((row?.amount ?? 0) + (row?.vat ?? 0)),
      0
    ),
    totalSubmittedInvoicesWithVATMinusRetention: allInvoicesForAggregation.reduce(
      (sum, row) =>
        sum +
        ((row?.amount ?? 0) + (row?.vat ?? 0) - (row?.retention ?? 0)),
      0
    ),
    totalPaidInvoicesExcludingVATAndRetention: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PAID")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) - (row?.retention ?? 0)),
        0
      ),
    totalPaidInvoicesIncludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PAID")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) + (row?.vat ?? 0) - (row?.retention ?? 0)),
        0
      ),
    totalPaidInvoicesWithVATMinusRetention: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PAID")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) + (row?.vat ?? 0) - (row?.retention ?? 0)),
        0
      ),
    invoicesUnderFinanceIncludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "FINANCE")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) + (row?.vat ?? 0)),
        0
      ),
    invoicesUnderFinanceExcludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "FINANCE")
      .reduce(
        (sum, row) =>
          sum +
          (row?.amount ?? 0),
        0
      ),
    invoicesUnderPMDIncludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PMD")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) + (row?.vat ?? 0)),
        0
      ),
    invoicesUnderPMDExcludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PMD")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0)),
        0
      ),
    invoicesUnderPMTIncludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PMT")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0) + (row?.vat ?? 0)),
        0
      ),
    invoicesUnderPMTExcludingVAT: allInvoicesForAggregation
      .filter((row) => row?.invoiceStatus === "PMT")
      .reduce(
        (sum, row) =>
          sum +
          ((row?.amount ?? 0)),
        0
      ),
  };

  const OverallRetentionValue = allInvoicesForAggregation
    .filter((row) => row?.invoiceStatus === "PAID")
    .reduce((sum, row) => sum + (row?.retention ?? 0), 0);

  const paymentPercentage =
    aggregatedSums.totalPaidInvoicesWithVATMinusRetention /
    (aggregatedSums.totalSubmittedInvoicesWithVATMinusRetention || 1);


  const filteredMOCsWithSelectedCriteria = data
    .filter((moc) => selectedType === "Overall" || moc.type === selectedType)
    .map((moc) => ({
      ...moc,
      invoices: Object.keys(statusMapping).includes(selectedCard || "")
        ? (moc.invoices ?? []).filter(
          (invoice) => invoice.invoiceStatus === selectedCard
        )
        : moc.invoices ?? [],
    }))
    .filter((moc) => (moc.invoices ?? []).length > 0);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">

      <div className="mb-4 flex items-center justify-between gap-4">
  {/* Settings Dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="gap-1.5">
        <SettingsIcon className="h-4 w-4" />
        Display Settings
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-64">
      {/* Amount Format Section */}
      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
        Change Amount Format
      </DropdownMenuLabel>
      <DropdownMenuItem 
        onClick={() => setShowInMillions(true)}
        className="cursor-pointer"
      >
        <CheckIcon className={`mr-2 h-4 w-4 ${showInMillions ? "opacity-100" : "opacity-0"}`} />
        Show Figures in Millions
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => setShowInMillions(false)}
        className="cursor-pointer"
      >
        <CheckIcon className={`mr-2 h-4 w-4 ${!showInMillions ? "opacity-100" : "opacity-0"}`} />
        Show Figures In Full Numbers
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {/* VAT Display Section */}
      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
        VAT Options
      </DropdownMenuLabel>
      <DropdownMenuItem 
        onClick={() => setShowIncludingVAT(true)}
        className="cursor-pointer"
      >
        <CheckIcon className={`mr-2 h-4 w-4 ${showIncludingVAT ? "opacity-100" : "opacity-0"}`} />
       Show Figures Include VAT
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => setShowIncludingVAT(false)}
        className="cursor-pointer"
      >
        <CheckIcon className={`mr-2 h-4 w-4 ${!showIncludingVAT ? "opacity-100" : "opacity-0"}`} />
        Show Figures Excluding VAT
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>


  <Button onClick={exportToExcel} variant="outline" className="gap-1.5">
        <DownloadIcon className="h-4 w-4" />
        Export to Excel
      </Button>


  {/* Project Type Dropdown */}
  <div className="flex items-center gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          {selectedType}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSelectedType("Overall")}>
          <span className="min-w-[120px]">Overall</span>
        </DropdownMenuItem>
        {projectTypes.map((type) => (
          <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
            <span className="min-w-[120px]">{type}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>


      {/* Merged Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
        <MergedCard
          title={showIncludingVAT ?
            "Awarded PO & Invoices (Incl. VAT)" :
            "Awarded PO & Invoices (Excl. VAT)"
          }
          leftLabel="Awarded PO Value"
          // leftValue={aggregatedSums.totalAwardedAmountExcludingVAT}

          leftValue={showIncludingVAT ?
            aggregatedSums.totalAwardedAmountIncludingVAT :
            aggregatedSums.totalAwardedAmountExcludingVAT
          }

          rightLabel="Invoices Submitted Value"
          rightValue={showIncludingVAT ?
            aggregatedSums.totalSubmittedInvoicesWithVAT :
            aggregatedSums.totalSubmittedInvoicesWithoutVAT
          }
          onClick={() =>
            setSelectedCard((prev) =>
              prev === "awarded" ? "submitted" : "awarded"
            )
          }
          isSelected={selectedCard === "awarded" || selectedCard === "submitted"}
          showInMillions={showInMillions}
        />
        <MergedCard
          // title="Collection Exc. VAT & Retention(SR)"
          title={showIncludingVAT ?
            "Collection (Incl. VAT)" :
            "Collection (Excl. VAT)"
          }
          leftLabel={statusMapping.PAID.label}
          // leftValue={aggregatedSums.totalPaidInvoicesExcludingVATAndRetention}
          leftValue={showIncludingVAT ?
            aggregatedSums.totalPaidInvoicesIncludingVAT :
            aggregatedSums.totalPaidInvoicesExcludingVATAndRetention
          }
          rightLabel="Coll. % vs Submitted Inv."
          rightValue={paymentPercentage}
          leftColor={statusMapping.PAID.color}
          rightIsPercentage={true}
          onClick={() =>
            setSelectedCard((prev) =>
              prev === "PAID" ? "percentage" : "PAID"
            )
          }
          isSelected={selectedCard === "PAID" || selectedCard === "percentage"}
          showInMillions={showInMillions} // Add this line
        />
        <MergedCard
          title={showIncludingVAT ?
            "Invoices Transfererd To (Incl. VAT)" :
            "Invoices Transfererd To (Excl. VAT)"
          }
          leftLabel={statusMapping.FINANCE.label}
          leftValue={showIncludingVAT ?
            aggregatedSums.invoicesUnderFinanceIncludingVAT :
            aggregatedSums.invoicesUnderFinanceExcludingVAT
          }
          rightLabel={statusMapping.PMD.label}
          rightValue={showIncludingVAT ?
            aggregatedSums.invoicesUnderPMDIncludingVAT :
            aggregatedSums.invoicesUnderPMDExcludingVAT
          }
          leftColor={statusMapping.FINANCE.color}
          rightColor={statusMapping.PMT.color}
          onClick={() =>
            setSelectedCard((prev) =>
              prev === "FINANCE" ? "PMT" : "FINANCE"
            )
          }
          isSelected={selectedCard === "FINANCE" || selectedCard === "PMT"}
          showInMillions={showInMillions}
        />
        <MergedCard
          // title="Invoices Under PMT Review(SR)"
          title={showIncludingVAT ?
            "Invoices Under PMT (Incl. VAT)" :
            "Invoices Under PMT (Excl. VAT)"
          }
          leftLabel={statusMapping.PMT.label}
          leftValue={showIncludingVAT ?
            aggregatedSums.invoicesUnderPMTIncludingVAT :
            aggregatedSums.invoicesUnderPMTExcludingVAT
          }
          rightLabel="Retention Held"
          rightValue={OverallRetentionValue}
          leftColor={statusMapping.PMD.color}
          rightColor="text-amber-600"
          onClick={() =>
            setSelectedCard((prev) =>
              prev === "PMD" ? "retention" : "PMD"
            )
          }
          isSelected={selectedCard === "PMD" || selectedCard === "retention"}
          showInMillions={showInMillions}
        />
      </div>


      {/* MOC Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full table-fixed">
            <thead className="bg-blue-50">
              <tr>
                <th className="sticky top-0 bg-blue-50 z-10 w-[50px] px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Sr. No
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[150px] px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  MOC/Project No
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[200px] px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Description
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[120px] px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  CWO No
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[150px] px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Awarded (SR)
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[180px] px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Awarded inc. VAT(SR)
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[180px] px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Submitted inc. VAT(SR)
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[180px] px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Received inc. VAT(SR)
                </th>
                <th className="sticky top-0 bg-blue-50 z-10 w-[180px] px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-100">
                  Balance inc. VAT(SR)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMOCsWithSelectedCriteria.map((moc, index) => {
                const awardedValue = safeNumber(moc.contractValue);
                const awardedValueWithVAT = awardedValue * 1.15;
                const totalPayable = moc.invoices?.reduce(
                  (sum, inv) =>
                    sum +
                    ((inv?.amount ?? 0) +
                      (inv?.vat ?? 0) -
                      (inv?.retention ?? 0)),
                  0
                ) ?? 0;
                const receivedValue = moc.invoices
                  ?.filter((inv) => inv?.invoiceStatus === "PAID")
                  ?.reduce(
                    (sum, inv) =>
                      sum +
                      ((inv?.amount ?? 0) +
                        (inv?.vat ?? 0) -
                        (inv?.retention ?? 0)),
                    0
                  ) ?? 0;
                const balanceAmount = awardedValueWithVAT - receivedValue;
                return (
                  <tr
                    key={moc.mocId}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 cursor-pointer`}
                    onClick={() => setSelectedMoc(moc)}
                  >
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td
                      className="px-3 py-3 text-sm font-medium text-gray-900 truncate"
                      title={safeString(moc.mocNo)}
                    >
                      {safeString(moc.mocNo)}
                    </td>
                    <td
                      className="px-3 py-3 text-sm text-gray-600 truncate"
                      title={safeString(moc.shortDescription)}
                    >
                      {safeString(moc.shortDescription)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 truncate">
                      {safeString(moc.cwo)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-center font-mono">
                      {formatMillions(awardedValue, showInMillions)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-center font-mono font-medium">
                      {formatMillions(awardedValueWithVAT, showInMillions)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-center font-mono">
                      {formatMillions(totalPayable, showInMillions)}
                    </td>
                    <td className="px-3 py-3 text-sm text-green-600 text-center font-mono font-semibold">
                      {formatMillions(receivedValue, showInMillions)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-center font-mono">
                      {formatMillions(balanceAmount, showInMillions)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Dialog */}
      <Dialog
        open={!!selectedMoc}
        onOpenChange={(open) => !open && setSelectedMoc(null)}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              MOC {selectedMoc?.mocNo} - Invoice Management
            </DialogTitle>
            <div className="text-sm text-gray-500 mt-1">
              {selectedMoc?.shortDescription}
            </div>
          </DialogHeader>
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Contract Value Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Contract Value inc. VAT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-blue-800">
                    {/* {formatMillions(
                      (selectedMoc?.contractValue || 0) * 1.15
                    )} */}
                    {formatMillions((selectedMoc?.contractValue || 0) * 1.15, showInMillions)}
                  </div>
                </CardContent>
              </Card>
              {/* Total Invoiced Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Invoiced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-purple-800">
                    {formatMillions(
                      selectedMoc?.invoices.reduce(
                        (sum, inv) => sum + inv.amount + inv.vat,
                        0
                      ) || 0, showInMillions
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Total Received Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-green-800">
                    {formatMillions(
                      selectedMoc?.invoices
                        .filter((inv) => inv.invoiceStatus === "PAID")
                        .reduce(
                          (sum, inv) => sum + inv.amount + inv.vat,
                          0
                        ) || 0, showInMillions
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Retention Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Retention Held
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-amber-800">
                    {formatMillions(
                      selectedMoc?.invoices
                        .filter((inv) => inv.invoiceStatus === "PAID")
                        .reduce(
                          (sum, inv) => sum + (inv.amount + inv.vat) * 0.1,
                          0
                        ) || 0, showInMillions
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Invoices Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Amount (SR)
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      VAT (SR)
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Retention (SR)
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Net Payable (SR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedMoc?.invoices.map((invoice) => {
                    const totalAmount = invoice.amount + invoice.vat;
                    const retention = totalAmount * 0.1;
                    const netPayable = totalAmount - retention;
                    const statusConfig =
                      statusMapping[invoice.invoiceStatus as StatusKey];
                    return (
                      <tr
                        key={invoice.invoiceId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {invoice.invoiceNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`${statusConfig.color} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-gray-900">
                          {formatMillions(invoice.amount, showInMillions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-gray-900">
                          {formatMillions(invoice.vat, showInMillions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-red-600">
                          {formatMillions(retention, showInMillions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-green-700">
                          {formatMillions(netPayable, showInMillions)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                    >
                      Totals
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-gray-900">
                      {formatMillions(
                        selectedMoc?.invoices.reduce(
                          (sum, inv) => sum + inv.amount,
                          0
                        ) || 0, showInMillions
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-gray-900">
                      {formatMillions(
                        selectedMoc?.invoices.reduce(
                          (sum, inv) => sum + inv.vat,
                          0
                        ) || 0, showInMillions
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-red-700">
                      {formatMillions(
                        selectedMoc?.invoices.reduce(
                          (sum, inv) => sum + (inv.amount + inv.vat) * 0.1,
                          0
                        ) || 0, showInMillions
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-green-700">
                      {formatMillions(
                        selectedMoc?.invoices.reduce(
                          (sum, inv) =>
                            sum +
                            (inv.amount +
                              inv.vat -
                              (inv.amount + inv.vat) * 0.1),
                          0
                        ) || 0, showInMillions
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <Card className="bg-blue-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    PSSR(Pre-Startup Safety Review) Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-gray-700">
                    {selectedMoc?.pssrStatus || "Pending Review"}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    PRB(Project Record Books) Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-gray-700">
                    {selectedMoc?.prbStatus || "In Progress"}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-800">
                    Project Remarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {selectedMoc?.remarks || "No special remarks"}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Added Calculations and Visualization */}
            {selectedMoc && (() => {
              const contractValue = selectedMoc.contractValue || 0;
              const totalInvoicesSubmitted = selectedMoc.invoices.reduce((sum, inv) => sum + inv.amount, 0);
              const totalPaymentReceived = selectedMoc.invoices
                .filter(inv => inv.invoiceStatus === "PAID")
                .reduce((sum, inv) => sum + inv.amount, 0);
              const retentionValue = selectedMoc.invoices
                .filter(inv => inv.invoiceStatus === "PAID")
                .reduce((sum, inv) => sum + (inv.amount + inv.vat) * 0.1, 0);
              const submittedPercentage = contractValue
                ? (totalInvoicesSubmitted / contractValue) * 100
                : 0;

              const chartData = [
                { name: 'Contract Value', value: contractValue },
                { name: 'Invoices Submitted', value: totalInvoicesSubmitted },
                { name: 'Payment Received', value: totalPaymentReceived },
                { name: 'Retention Value', value: retentionValue },
              ];

              return (
                <div className="mt-6 space-y-6">
                  {/* Bar Chart */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-4 px-6 rounded-t-xl border-b border-blue-200 shadow-sm mb-6">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 text-center tracking-wide drop-shadow-sm">
                        Contractual Payment Performance Breakdown
                      </h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          {/* Remove CartesianGrid to eliminate grid lines */}
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280' }}
                          />
                          <YAxis
                            tickFormatter={(value: number) => `${(value / 1e6).toFixed(1)}M`}
                            tick={{ fill: '#6b7280' }}
                          />
                          <Tooltip
                            formatter={(value: number) => `${(value / 1e6).toFixed(1)}M`}
                            contentStyle={{ backgroundColor: '#ffffff', border: 'none' }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Value (SR)"
                            barSize={60} // Reduced bar width
                            fill="#4f46e5" // Base color (will be overridden by individual colors)
                          >
                            {/* Custom colors for each bar with labels */}
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={[
                                  '#2563eb',  // Blue-600
                                  '#16a34a',  // Green-600
                                  '#9333ea',  // Purple-600
                                  '#ea580c'   // Orange-600
                                ][index % 4]}
                              />
                            ))}

                            {/* Center-aligned labels */}
                            <LabelList
                              dataKey="value"
                              position="center"
                              fill="#ffffff"
                              formatter={(value: number) => `${(value / 1e6).toFixed(1)}M`}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Invoices Submitted ({submittedPercentage.toFixed(1)}%)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative h-8 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${submittedPercentage}%` }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                              {submittedPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="p-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Remaining ({(100 - submittedPercentage).toFixed(1)}%)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative h-8 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-full bg-gray-600 rounded-full transition-all duration-500"
                            style={{ width: `${100 - submittedPercentage}%` }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                              {(100 - submittedPercentage).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
