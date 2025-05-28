"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import Select from "react-select";
import { BarLoader } from "react-spinners";
import "react-day-picker/dist/style.css";

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
  filterByDate: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// --- FieldRow Component ---
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
    <div className="grid grid-cols-[160px,1fr] items-center mb-3 gap-2">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <div>
        {children}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
}

// --- Main Component ---
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
      filterByDate: false,
      startDate: "",
      endDate: "",
    },
  });

  // State
  const [suppliers, setSuppliers] = useState<OptionType[]>([]);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const filterByDate = watch("filterByDate");
  const supplierId = watch("supplierId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Fetch suppliers on mount
  useEffect(() => {
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((response) => {
        const data = response.data || [];
        setSuppliers(data.map((s: any) => ({ value: s.id, label: s.name })));
      });
  }, []);

  // Form submit
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setStatement(null);
    try {
      const params = new URLSearchParams();
      params.append("supplierId", String(data.supplierId));
      if (data.filterByDate && data.startDate && data.endDate) {
        params.append("startDate", data.startDate);
        params.append("endDate", data.endDate);
      }
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

  // PO Numbers list
  const poNumbers = statement?.invoices
    ?.map((inv) => inv.po_number)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ") || "";

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Show the form only if statement is NOT present */}
      {!statement && (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white shadow-sm rounded-lg p-6 space-y-3 border"
          >
            <FieldRow label="Supplier" error={errors.supplierId?.message}>
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
            </FieldRow>
            <FieldRow label="Filter by Date">
              <Controller
                name="filterByDate"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="accent-blue-600"
                    aria-label="Filter by date"
                  />
                )}
              />
            </FieldRow>
            {filterByDate && (
              <div className="flex gap-6">
                {/* Start Date */}
                <div className="relative w-40">
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
                          value={field.value}
                          placeholder="Start Date"
                          className="w-full px-3 py-2 border rounded cursor-pointer bg-white"
                          onClick={() => setIsStartOpen((prev) => !prev)}
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
                  {errors.startDate && (
                    <div className="text-xs text-red-500">{errors.startDate.message}</div>
                  )}
                </div>
                {/* End Date */}
                <div className="relative w-40">
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
                          value={field.value}
                          placeholder="End Date"
                          className="w-full px-3 py-2 border rounded cursor-pointer bg-white"
                          onClick={() => setIsEndOpen((prev) => !prev)}
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
                  {errors.endDate && (
                    <div className="text-xs text-red-500">{errors.endDate.message}</div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-6">
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
          </form>

          {/* Loader appears below the input controls, at full width */}
          {loading && (
            <div className="w-full flex justify-center py-6">
              <BarLoader width={"100%"} color="#2563eb" height={4} speedMultiplier={1.2} />
            </div>
          )}
        </>
      )}

      {/* Show the statement only if present */}
      {statement && (
        <section className="border rounded-lg p-6 mt-2 bg-gray-50 space-y-3 shadow-sm animate-fade-in">
          {/* Statement Header: Details and Close Button side by side */}
          <div className="grid grid-cols-[1fr,auto] items-start gap-4 mb-4">
            {/* Details block */}
            <div className="grid md:grid-cols-3 gap-3">
              <div><b>Supplier:</b> {statement.supplier}</div>
              <div><b>Total POs:</b> {statement.totalPOs}</div>
              <div><b>PO Numbers:</b> <span className="break-words">{poNumbers}</span></div>
              <div><b>Total PO Value:</b> {Number(statement.totalPOValue).toLocaleString()}</div>
              <div><b>Total Certified:</b> {Number(statement.totalCertified).toLocaleString()}</div>
              <div><b>Balance Remaining:</b> {Number(statement.balance).toLocaleString()}</div>
            </div>
            {/* Close button block */}
            <div className="flex justify-end">
              <button
                className="px-4 py-1 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition whitespace-nowrap"
                onClick={() => {
                  setStatement(null);
                  reset();
                }}
                aria-label="Close Statement"
              >
                Close
              </button>
            </div>
          </div>

          <h3 className="mt-4 font-bold text-gray-800">Statement of Account For Certified Invoices</h3>
          <div className="overflow-x-auto border rounded bg-white max-h-[65vh]">
            <table className="min-w-[900px] w-full text-sm table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border-b px-2 py-2 w-10">S.No</th>
                  <th className="border-b px-2 py-2 w-28">Date</th>
                  <th className="border-b px-2 py-2 w-50">Invoice No</th>
                  <th className="border-b px-2 py-2 w-30">Particulars</th>
                  <th className="border-b px-2 py-2 w-20 text-center">Debit</th>
                  <th className="border-b px-2 py-2 w-25 text-center">Credit</th>
                  <th className="border-b px-2 py-2 w-25 text-center">Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr className="font-bold bg-green-50">
                  <td className="border-b px-2 py-2"></td> {/* S.No */}
                  <td className="border-b px-2 py-2"></td> {/* Date */}
                  <td className="border-b px-2 py-2"></td> {/* Invoice No */}
                  <td className="border-b px-2 py-2">Opening Balance</td> {/* Particulars */}
                  <td className="border-b px-2 py-2 text-center"></td> {/* Debit */}
                  <td className="border-b px-2 py-2 text-center">{Number(statement.totalPOValue).toLocaleString()}</td> {/* Credit */}
                  <td className="border-b px-2 py-2 text-center">{Number(statement.totalPOValue).toLocaleString()}</td> {/* Balance */}
                </tr>
                {/* Statement Rows */}
                {(() => {
                  let runningBalance = Number(statement.totalPOValue);
                  return statement.invoices.map((inv, idx) => {
                    const debit = Number(inv.payable);
                    runningBalance -= debit;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border-b px-2 py-2">{idx + 1}</td>
                        <td className="border-b px-2 py-2">{inv.certified_date}</td>
                        <td className="border-b px-2 py-2">{inv.invoice_no}</td>
                        <td className="border-b px-2 py-2">{inv.payment_type}</td>
                        <td className="border-b px-2 py-2 text-center">{debit ? debit.toLocaleString() : ""}</td>
                        <td className="border-b px-2 py-2 text-center"></td>
                        <td className="border-b px-2 py-2 text-center">{runningBalance.toLocaleString()}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            {statement.invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">No certified invoices found for the selected period.</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
