"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import Select from "react-select";
import "react-day-picker/dist/style.css";

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
    <div className="grid grid-cols-[150px,1fr] items-center mb-3 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div>
        {children}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
}

type Supplier = { id: number; name: string };
type OptionType = { value: number; label: string };
type Statement = {
  supplier: string;
  totalPOs: number;
  totalPOValue: number;
  totalCertified: number;
  balance: number;
  invoices: {
    certified_date: string;
    invoice_no: string;
    payment_type: string;
    po_number: string;
    invoice_amount: string;
    payable: string;
  }[];
};

export default function SupplierStatementPage() {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplierId: null as number | null,
      filterByDate: false,
      startDate: "",
      endDate: "",
    },
  });

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<OptionType[]>([]);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(false);

  const supplierId = watch("supplierId");
  const filterByDate = watch("filterByDate");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Load suppliers (as react-select options)
  useEffect(() => {
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((response) => {
        const data = response.data || [];
        setSuppliers(data.map((s: any) => ({ value: s.id, label: s.name })));
      });
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setStatement(null);
    const params = new URLSearchParams();
    params.append("supplierId", data.supplierId?.toString());
    if (data.filterByDate && data.startDate && data.endDate) {
      params.append("startDate", data.startDate);
      params.append("endDate", data.endDate);
    }
    const res = await fetch(`/api/supplier-statement?${params.toString()}`);
    const json = await res.json();
    setStatement(json);
    setLoading(false);
  };

  // Extract unique PO numbers from invoices
  const poNumbers =
    statement?.invoices
      .map((inv) => inv.po_number)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .join(", ") || "";

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Supplier Statement of Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FieldRow label="Supplier" error={errors.supplierId?.message as string}>
          <Controller
            name="supplierId"
            control={control}
            rules={{ required: "Select a supplier" }}
            render={({ field }) => (
              <Select<OptionType>
                {...field}
                options={suppliers}
                onChange={val => field.onChange(val?.value ?? null)}
                value={suppliers.find(opt => opt.value === field.value) || null}
                placeholder="Select Supplier"
                isClearable
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
                onChange={field.onChange}
              />
            )}
          />
        </FieldRow>
        {filterByDate && (
          <div className="flex gap-6 mb-2">
            <div className="relative w-40">
              <Controller
                name="startDate"
                control={control}
                rules={{
                  required: filterByDate ? "Start date required" : false,
                }}
                render={({ field }) => (
                  <>
                    <input
                      type="text"
                      readOnly
                      value={field.value}
                      placeholder="Start Date"
                      className="w-full px-3 py-2 border rounded cursor-pointer"
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
                <div className="text-xs text-red-500">{errors.startDate.message as string}</div>
              )}
            </div>
            <div className="relative w-40">
              <Controller
                name="endDate"
                control={control}
                rules={{
                  required: filterByDate ? "End date required" : false,
                }}
                render={({ field }) => (
                  <>
                    <input
                      type="text"
                      readOnly
                      value={field.value}
                      placeholder="End Date"
                      className="w-full px-3 py-2 border rounded cursor-pointer"
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
                <div className="text-xs text-red-500">{errors.endDate.message as string}</div>
              )}
            </div>
          </div>
        )}
        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={
            !supplierId ||
            (filterByDate && (!startDate || !endDate)) ||
            loading
          }
        >
          {loading ? "Loading..." : "Get Statement"}
        </button>
      </form>

      {/* Results */}
      {statement && (
        <div className="border rounded p-4 mt-6 bg-gray-50 space-y-2">
          <div><b>Supplier:</b> {statement.supplier}</div>
          <div><b>Total POs:</b> {statement.totalPOs}</div>
          <div><b>PO Numbers:</b> {poNumbers}</div>
          <div><b>Total PO Value:</b> {Number(statement.totalPOValue).toLocaleString()}</div>
          <div><b>Total Certified Invoices:</b> {Number(statement.totalCertified).toLocaleString()}</div>
          <div><b>Balance Remaining:</b> {Number(statement.balance).toLocaleString()}</div>
          <h3 className="mt-3 font-bold">Statement of Account</h3>
          <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-300px)] bg-white">
      <table className="min-w-[900px] w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border-b border-gray-200 px-2 py-2 w-10">S.No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28">Date</th>
            <th className="border-b border-gray-200 px-2 py-2 w-36">Invoice No</th>
            <th className="border-b border-gray-200 px-2 py-2 w-44">Particulars<br/>(Payment Type)</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28">Debit<br/>(Certified)</th>
            <th className="border-b border-gray-200 px-2 py-2 w-28">Credit</th>
            <th className="border-b border-gray-200 px-2 py-2 w-36">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          {/* Opening Balance Row */}
          <tr className="font-bold bg-green-50">
            <td className="border-b border-gray-200 px-2 py-2"></td>
            <td className="border-b border-gray-200 px-2 py-2"></td>
            <td className="border-b border-gray-200 px-2 py-2"></td>
            <td className="border-b border-gray-200 px-2 py-2">Opening Balance</td>
            <td className="border-b border-gray-200 px-2 py-2"></td>
            <td className="border-b border-gray-200 px-2 py-2">{Number(statement.totalPOValue).toLocaleString()}</td>
            <td className="border-b border-gray-200 px-2 py-2">{Number(statement.totalPOValue).toLocaleString()}</td>
          </tr>
          {/* Statement Rows */}
          {(() => {
            let runningBalance = Number(statement.totalPOValue);
            return statement.invoices.map((inv, idx) => {
              const debit = Number(inv.payable);
              runningBalance -= debit;
              return (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                >
                  <td className="border-b border-gray-200 px-2 py-2">{idx + 1}</td>
                  <td className="border-b border-gray-200 px-2 py-2">{inv.certified_date}</td>
                  <td className="border-b border-gray-200 px-2 py-2">{inv.invoice_no}</td>
                  <td className="border-b border-gray-200 px-2 py-2">{inv.payment_type}</td>
                  <td className="border-b border-gray-200 px-2 py-2">{debit ? debit.toLocaleString() : ""}</td>
                  <td className="border-b border-gray-200 px-2 py-2"></td>
                  <td className="border-b border-gray-200 px-2 py-2">{runningBalance.toLocaleString()}</td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
        </div>
      )}
    </div>
  );
}
