"use client";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CalendarField from "./CalendarField";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Select from "react-select";
import { PulseLoader } from "react-spinners";

// Types for select options
type OptionType = { value: string; label: string };
type Supplier = { id: number; name: string };
type PO = { po_number: string };

const PAYMENT_TYPE_OPTIONS: OptionType[] = [
  { value: "ADVANCE PAYMENT", label: "ADVANCE PAYMENT" },
  { value: "ADVANCE SETTLEMENT", label: "ADVANCE SETTLEMENT" },
  { value: "CREDIT", label: "CREDIT" },
];
const CONTRACT_TYPE_OPTIONS: OptionType[] = [
  { value: "GCS Contract", label: "GCS Contract" },
];

export default function StatementInputFields() {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  // Fetch suppliers
  const {
    data: suppliersRes,
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
  } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch("/api/suppliers-list");
      const data = await res.json();
      return data.data || [];
    },
  });

  // Supplier options for react-select
  const supplierOptions: OptionType[] = suppliersRes
    ? suppliersRes.map((sup) => ({
        value: sup.id.toString(),
        label: sup.name,
      }))
    : [];

  // Watch the supplier_id (from RHF)
  const supplierId = watch("supplier_id");

  // Fetch PO numbers by supplier
  const {
    data: poNumbersRes,
    isLoading: isPoLoading,
    isError: isPoError,
  } = useQuery<PO[]>({
    queryKey: ["poNumbers", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const res = await fetch(`/api/polist-bysupplier?supplier_id=${supplierId}`);
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!supplierId,
  });

  // PO options for react-select
  const poOptions: OptionType[] = poNumbersRes
    ? poNumbersRes.map((po) => ({
        value: po.po_number,
        label: po.po_number,
      }))
    : [];

  // Reset PO number when supplier changes
  React.useEffect(() => {
    setValue("po_number", "");
  }, [supplierId, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Invoice Number */}
      <div>
        <Label>Invoice Number</Label>
        <Input {...register("invoice_no")} />
        <p className="text-xs text-red-500">{errors.invoice_no?.message as string}</p>
      </div>
      {/* Invoice Date */}
      <Controller
        name="invoice_date"
        control={control}
        render={({ field, fieldState }) => (
          <CalendarField
            label="Invoice Date"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      {/* Payment Type */}
      <div>
        <Label>Payment Type</Label>
        <Controller
          name="payment_type"
          control={control}
          render={({ field }) => (
            <Select
              options={PAYMENT_TYPE_OPTIONS}
              value={PAYMENT_TYPE_OPTIONS.find(option => option.value === field.value) || null}
              onChange={selected => field.onChange(selected?.value)}
              isClearable
              placeholder="Select Payment Type"
              aria-label="Select Payment Type"
              styles={{ menu: (provided) => ({ ...provided, zIndex: 100 }) }}
            />
          )}
        />
        {errors.payment_type && (
          <span className="text-xs text-red-500">{errors.payment_type.message as string}</span>
        )}
      </div>
      {/* Payment Due Date */}
      <Controller
        name="payment_due_date"
        control={control}
        render={({ field, fieldState }) => (
          <CalendarField
            label="Payment Due Date"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      {/* Invoice Amount */}
      <Controller
        name="invoice_amount"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <Label>Invoice Amount</Label>
            <Input
              {...field}
              type="number"
              step="0.01"
              onChange={e => {
                field.onChange(e);
                setValue("payable", e.target.value, { shouldValidate: true });
              }}
            />
            <p className="text-xs text-red-500">{fieldState.error?.message}</p>
          </div>
        )}
      />
      {/* Payable Amount */}
      <div>
        <Label>Payable Amount</Label>
        <Input
          {...register("payable")}
          type="number"
          step="0.01"
        />
        <p className="text-xs text-red-500">{errors.payable?.message as string}</p>
      </div>
      {/* Supplier */}
      <div>
        <Label>Supplier</Label>
        <Controller
          name="supplier_id"
          control={control}
          render={({ field }) => (
            <Select
              options={supplierOptions}
              value={supplierOptions.find(option => option.value === field.value) || null}
              onChange={selected => field.onChange(selected?.value)}
              isLoading={isSuppliersLoading}
              isClearable
              placeholder={
                isSuppliersLoading ? (
                  <span className="flex items-center">
                    <PulseLoader size={6} color="#3b82f6" />
                  </span>
                ) : "Select Supplier"
              }
              noOptionsMessage={() =>
                isSuppliersError
                  ? "Failed to load suppliers"
                  : supplierOptions.length === 0
                  ? "No suppliers found"
                  : "No options"
              }
              aria-label="Select Supplier"
              styles={{ menu: (provided) => ({ ...provided, zIndex: 100 }) }}
            />
          )}
        />
        {errors.supplier_id && (
          <span className="text-xs text-red-500">{errors.supplier_id.message as string}</span>
        )}
      </div>
      {/* PO Number */}
      <div>
        <Label>PO Number</Label>
        <Controller
          name="po_number"
          control={control}
          render={({ field }) => (
            <Select
              key={supplierId || "no-supplier"}
              options={poOptions}
              value={poOptions.find(option => option.value === field.value) || null}
              onChange={selected => field.onChange(selected?.value)}
              isLoading={isPoLoading}
              isClearable
              isDisabled={!supplierId || isPoLoading}
              placeholder={
                !supplierId ? "Select supplier first"
                : isPoLoading ? (
                  <span className="flex items-center">
                    <PulseLoader size={6} color="#3b82f6" />
                  </span>
                ) : "Select PO"
              }
              noOptionsMessage={() =>
                !supplierId ? "Select supplier first"
                : isPoError ? "Failed to load POs"
                : poOptions.length === 0 ? "No PO Numbers found"
                : "No options"
              }
              aria-label="Select PO Number"
              styles={{ menu: (provided) => ({ ...provided, zIndex: 100 }) }}
            />
          )}
        />
        {errors.po_number && (
          <span className="text-xs text-red-500">{errors.po_number.message as string}</span>
        )}
      </div>
      {/* Contract Type */}
      <div>
        <Label>Contract Type</Label>
        <Controller
          name="contract_type"
          control={control}
          render={({ field }) => (
            <Select
              options={CONTRACT_TYPE_OPTIONS}
              value={CONTRACT_TYPE_OPTIONS.find(option => option.value === field.value) || null}
              onChange={selected => field.onChange(selected?.value)}
              isClearable
              placeholder="Select Contract Type"
              aria-label="Select Contract Type"
              styles={{ menu: (provided) => ({ ...provided, zIndex: 100 }) }}
            />
          )}
        />
        {errors.contract_type && (
          <span className="text-xs text-red-500">{errors.contract_type.message as string}</span>
        )}
      </div>
      {/* Certified Date */}
      <Controller
        name="certified_date"
        control={control}
        render={({ field, fieldState }) => (
          <CalendarField
            label="Certified Date"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
