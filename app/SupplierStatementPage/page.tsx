"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, compareAsc } from "date-fns";
import { DayPicker } from "react-day-picker";
import Select from "react-select";
import { BarLoader, PulseLoader } from "react-spinners";
import "react-day-picker/dist/style.css";

// Shadcn UI Accordion
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// --- Types ---
type OptionType = { value: number; label: string };
type Invoice = {
  certified_date: string;
  invoice_no: string;
  payment_type: string;
  po_number: string;
  invoice_amount: string;
  payable: string;
};
type Statement = {
  supplier: string;
  totalPOs: number;
  totalPOValue: number;
  totalCertified: number;
  balance: number;
  invoices: Invoice[];
};

// --- Form Schema ---
const formSchema = z.object({
  supplierId: z.number({ invalid_type_error: "Supplier is required" }),
  statementMode: z.enum(["full", "range"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// --- FieldRow Helper ---
function FieldRow({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div>{children}</div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

export default function SupplierStatementPage() {
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: undefined,
      statementMode: "full",
      startDate: "",
      endDate: "",
    },
  });

  // State
  const [suppliers, setSuppliers] = useState<OptionType[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Watch fields
  const statementMode = watch("statementMode");
  const filterByDate = statementMode === "range";
  const supplierId = watch("supplierId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Fetch suppliers on mount
  useEffect(() => {
    setSuppliersLoading(true);
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((response) => {
        const data = response.data || [];
        setSuppliers(data.map((s: any) => ({ value: s.id, label: s.name })));
      })
      .finally(() => setSuppliersLoading(false));
  }, []);

  // Form submit
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setStatement(null);
    try {
      const params = new URLSearchParams();
      params.append("supplierId", String(data.supplierId));
      // Always fetch all certified invoices for the supplier, filter in frontend
      const res = await fetch(`/api/supplier-statement?${params.toString()}`);
      if (!res.ok) throw new Error("Could not fetch statement");
      const json = await res.json();
      setStatement(json);
    } catch (err) {
      setStatement(null);
      alert("Failed to fetch statement. Please try again.");
    }
    setLoading(false);
  };

  // --- Statement Processing (Frontend Date Filtering + Running Balance) ---
  let filteredInvoices: Invoice[] = [];
  let openingCertifiedTotal = 0;

  if (statement) {
    const allInvoices = statement.invoices
      .slice()
      .sort((a, b) => a.certified_date.localeCompare(b.certified_date));

    if (
      statementMode === "range" &&
      startDate &&
      endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
      /^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      filteredInvoices = allInvoices.filter((inv) => {
        try {
          const d = parseISO(inv.certified_date);
          return d >= start && d <= end;
        } catch {
          return false;
        }
      });

      openingCertifiedTotal = allInvoices
        .filter((inv) => {
          try {
            return parseISO(inv.certified_date) < start;
          } catch {
            return false;
          }
        })
        .reduce((sum, inv) => sum + Number(inv.payable), 0);
    } else {
      filteredInvoices = allInvoices;
      openingCertifiedTotal = 0;
    }
  }

  // PO Numbers list
  const poNumbers =
    statement?.invoices
      ?.map((inv) => inv.po_number)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .join(", ") || "";

  // --- Calculate statement period ---
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (statement && statement.invoices.length > 0) {
    const allDates = statement.invoices
      .map((inv) => inv.certified_date)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
    if (statementMode === "full") {
      periodStart = allDates[0] || null;
      periodEnd = allDates[allDates.length - 1] || null;
    } else if (statementMode === "range" && startDate && endDate) {
      periodStart = startDate;
      periodEnd = endDate;
    }
  }

  // --- UI ---
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Show the form only if statement is NOT present */}
      {!statement && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow rounded-lg p-6 border space-y-4"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {/* Supplier */}
            <div>
              <FieldRow label="Supplier" error={errors.supplierId?.message}>
                {suppliersLoading ? (
                  <div className="flex items-center gap-2">
                    <PulseLoader size={10} color="#2563eb" />
                    <span className="text-gray-500">Loading suppliers...</span>
                  </div>
                ) : (
                  <Controller
                    name="supplierId"
                    control={control}
                    rules={{ required: "Supplier is required" }}
                    render={({ field }) => (
                      <Select<OptionType>
                        {...field}
                        options={suppliers}
                        onChange={(val) => field.onChange(val?.value)}
                        value={suppliers.find((opt) => opt.value === field.value) || null}
                        placeholder="Select Supplier"
                        isClearable
                        aria-label="Supplier"
                      />
                    )}
                  />
                )}
              </FieldRow>
            </div>
            {/* Statement Mode */}
            <div>
              <FieldRow label="Statement Type">
                <Controller
                  name="statementMode"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "full"}
                          onChange={() => field.onChange("full")}
                        />
                        <span>Full Statement</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={field.value === "range"}
                          onChange={() => field.onChange("range")}
                        />
                        <span>Date Range</span>
                      </label>
                    </div>
                  )}
                />
              </FieldRow>
            </div>
            {/* Date Pickers */}
            <div className="flex gap-3">
              {/* Start Date */}
              <div className="relative w-36">
                <FieldRow label="Start Date">
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{
                      required: filterByDate ? "Start date required" : undefined,
                    }}
                    render={({ field }) => (
                      <>
                        <input
                          type="text"
                          readOnly
                          disabled={!filterByDate}
                          value={field.value}
                          placeholder="Start Date"
                          className="w-full px-3 py-2 border rounded cursor-pointer bg-white"
                          onClick={() => filterByDate && setIsStartOpen((prev) => !prev)}
                        />
                        {isStartOpen && (
                          <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg">
                            <DayPicker
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                setIsStartOpen(false);
                              }}
                              showOutsideDays
                              captionLayout="dropdown-buttons"
                              fromYear={2020}
                              toYear={new Date().getFullYear()}
                            />
                          </div>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </div>
              {/* End Date */}
              <div className="relative w-36">
                <FieldRow label="End Date">
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{
                      required: filterByDate ? "End date required" : undefined,
                    }}
                    render={({ field }) => (
                      <>
                        <input
                          type="text"
                          readOnly
                          disabled={!filterByDate}
                          value={field.value}
                          placeholder="End Date"
                          className="w-full px-3 py-2 border rounded cursor-pointer bg-white"
                          onClick={() => filterByDate && setIsEndOpen((prev) => !prev)}
                        />
                        {isEndOpen && (
                          <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg">
                            <DayPicker
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                setIsEndOpen(false);
                              }}
                              showOutsideDays
                              captionLayout="dropdown-buttons"
                              fromYear={2020}
                              toYear={new Date().getFullYear()}
                            />
                          </div>
                        )}
                      </>
                    )}
                  />
                </FieldRow>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded font-semibold transition hover:bg-blue-700 disabled:bg-blue-300"
              disabled={
                loading ||
                !supplierId ||
                (filterByDate && (!startDate || !endDate))
              }
            >
              Get Statement
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              onClick={() => {
                reset();
                setStatement(null);
              }}
              disabled={loading}
            >
              Reset
            </button>
          </div>
          {loading && (
            <div className="w-full flex justify-center py-6">
              <BarLoader width={"100%"} color="#2563eb" height={4} speedMultiplier={1.2} />
            </div>
          )}
        </form>
      )}

      {/* --- Statement View --- */}
      {statement && (
        <section className="border rounded-lg p-6 mt-2 bg-gray-50 space-y-5 shadow-sm animate-fade-in">
          {/* Accordion for Top Summary */}
          <Accordion
            type="single"
            defaultValue="" // Closed by default
            collapsible
            className="mb-4"

          >
            <AccordionItem value="summary">
              <AccordionTrigger>
                <span className="font-semibold text-base">Certified Invoices Statement Summary</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-2 px-2 py-2 rounded bg-yellow-50 text-yellow-900 text-sm border border-yellow-200 font-medium">
                  Note: This statement reflects only the certification of vendor invoices. The actual vendor balance will be updated upon payment.
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm py-2">
                  <div><b>Supplier:</b> {statement.supplier}</div>
                  <div><b>Total POs:</b> {statement.totalPOs}</div>
                  <div>
                    <b>PO Numbers:</b>
                    <span className="block break-words">{poNumbers}</span>
                  </div>
                  <div>
                    <b>Total PO Value:</b>
                    {Number(statement.totalPOValue).toLocaleString()}
                  </div>
                  <div>
                    <b>Total Certified:</b>
                    {Number(statement.totalCertified).toLocaleString()}
                  </div>
                  <div>
                    <b>Balance (Certified Invoices):</b>
                    {Number(statement.balance).toLocaleString()}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* One-line header with Title, Period, and Close Button */}
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 mb-4 bg-blue-50 px-4 py-3 rounded">
            <span className="font-bold text-gray-800 text-lg whitespace-nowrap">
              Statement of Account For Certified Invoices
            </span>
            {periodStart && periodEnd ? (
              <span className="text-sm text-blue-700 font-semibold text-center">
                Statement Period:{" "}
                {format(parseISO(periodStart), "dd MMM yyyy")} to {format(parseISO(periodEnd), "dd MMM yyyy")}
              </span>
            ) : (
              <span />
            )}
            <button
              className="px-3 py-1 rounded text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-xs transition justify-self-end"
              onClick={() => {
                setStatement(null);
                reset();
              }}
              aria-label="Close Statement"
            >
              Close
            </button>
          </div>

          <div className="overflow-x-auto border rounded bg-white max-h-[65vh]">
            <table className="min-w-[900px] w-full text-sm table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border-b px-2 py-2 w-10">S.No</th>
                  <th className="border-b px-2 py-2 w-28">Date</th>
                  <th className="border-b px-2 py-2 w-50">Invoice No</th>
                  <th className="border-b px-2 py-2 w-30">Particulars</th>
                  <th className="border-b px-2 py-2 w-20 text-center">Debit (Payment)</th>
                  <th className="border-b px-2 py-2 w-25 text-center">Credit (Certified Invoice)</th>
                  <th className="border-b px-2 py-2 w-25 text-center">Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr className="font-bold bg-green-50">
                  <td className="border-b px-2 py-2"></td>
                  <td className="border-b px-2 py-2"></td>
                  <td className="border-b px-2 py-2"></td>
                  <td className="border-b px-2 py-2">Opening Balance</td>
                  <td className="border-b px-2 py-2 text-center"></td>
                  <td className="border-b px-2 py-2 text-center">{Number(statement.totalPOValue).toLocaleString()}</td>
                  <td className="border-b px-2 py-2 text-center">{(Number(statement.totalPOValue) - openingCertifiedTotal).toLocaleString()}</td>
                </tr>
                {/* Statement Rows */}
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No certified invoices found for the selected period.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let runningBalance = Number(statement.totalPOValue) - openingCertifiedTotal;
                    return filteredInvoices.map((inv, idx) => {
                      const credit = Number(inv.payable);
                      runningBalance -= credit;
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border-b px-2 py-2">{idx + 1}</td>
                          <td className="border-b px-2 py-2">{inv.certified_date}</td>
                          <td className="border-b px-2 py-2">{inv.invoice_no}</td>
                          <td className="border-b px-2 py-2">{inv.payment_type}</td>
                          <td className="border-b px-2 py-2 text-center"></td>
                          <td className="border-b px-2 py-2 text-center">
                            {credit ? credit.toLocaleString() : ""}
                          </td>
                          <td className="border-b px-2 py-2 text-center">
                            {runningBalance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}


