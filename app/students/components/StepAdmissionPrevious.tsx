"use client";
import { useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { classEnrolledOptions, OptionType } from "../studentFormOptions";
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

function FieldRow({ label, children, error }: {
  label: string;
  children: React.ReactNode;
  error?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[150px,1fr] items-center">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="m-0 p-0">
        {children}
        {error && <div>{error}</div>}
      </div>
    </div>
  );
}

export default function StepAdmissionPrevious() {
  const { register, formState: { errors }, control } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;
  return (
    <div className="grid grid-cols-1 gap-6">
      <FieldRow label="Admission Date" error={errorMsg(errors.admissionDate)}>
      <Controller
     name="admissionDate"
  control={control}
  render={({ field }) => (
    <>
      <input
        type="text"
        readOnly
        value={field.value ? field.value : ""} // Now storing as string
        placeholder="Select Date of Birth"
        className="w-full px-3 py-2 border rounded cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg">
          <DayPicker
            mode="single"
            selected={field.value ? new Date(field.value) : undefined} // Convert string to Date
            onSelect={(date) => {
              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
              setIsOpen(false);
            }}
            showOutsideDays
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
          />
        </div>
      )}
    </>
  )}
/>
      </FieldRow>
      <FieldRow label="Class Enrolled" error={errorMsg(errors.classEnrolled)}>
        <Controller
          name="classEnrolled"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={classEnrolledOptions}
              onChange={val => field.onChange(val?.value)}
              value={classEnrolledOptions.find(opt => opt.value === field.value)}
              placeholder="Select Class"
              isClearable
            />
          )}
        />
      </FieldRow>
      <FieldRow label="Section" error={errorMsg(errors.section)}>
        <Input {...register("section")} />
      </FieldRow>
      <FieldRow label="Previous School" error={errorMsg(errors.previousSchool)}>
        <Input {...register("previousSchool")} />
      </FieldRow>
      <FieldRow label="Transfer Certificate No" error={errorMsg(errors.transferCertificateNo)}>
        <Input {...register("transferCertificateNo")} />
      </FieldRow>
    </div>
  );
}
