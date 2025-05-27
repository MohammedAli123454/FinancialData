"use client";
import { useState } from 'react';
import { useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import {
  genderOptions,
  religionOptions,
  bloodGroupOptions,
  OptionType,
} from "../studentFormOptions";

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

export default function StepPersonalInfo({
  countryOptions,
  motherTongueOptions,
}: {
  countryOptions: OptionType[];
  motherTongueOptions: OptionType[];
}) {
  const { register, formState: { errors }, control } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);

  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FieldRow label="Admission Number" error={errorMsg(errors.admissionNumber)}>
        <Input {...register("admissionNumber")} />
      </FieldRow>
      <FieldRow label="First Name" error={errorMsg(errors.firstName)}>
        <Input {...register("firstName")} />
      </FieldRow>
      <FieldRow label="Middle Name" error={errorMsg(errors.middleName)}>
        <Input {...register("middleName")} />
      </FieldRow>
      <FieldRow label="Last Name" error={errorMsg(errors.lastName)}>
        <Input {...register("lastName")} />
      </FieldRow>
      <FieldRow label="Gender" error={errorMsg(errors.gender)}>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={genderOptions}
              onChange={val => field.onChange(val?.value)}
              value={genderOptions.find(opt => opt.value === field.value)}
              placeholder="Select Gender"
              isClearable
            />
          )}
        />
      </FieldRow>
      <FieldRow label="Date of Birth" error={errorMsg(errors.dateOfBirth)}>
      <Controller
  name="dateOfBirth"
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
      <FieldRow label="Nationality" error={errorMsg(errors.nationality)}>
        <Controller
          name="nationality"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={countryOptions}
              onChange={val => field.onChange(val?.value)}
              value={countryOptions.find(opt => opt.value === field.value)}
              placeholder="Select Nationality"
              isClearable
            />
          )}
        />
      </FieldRow>
      <FieldRow label="Religion" error={errorMsg(errors.religion)}>
        <Controller
          name="religion"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={religionOptions}
              onChange={val => field.onChange(val?.value)}
              value={religionOptions.find(opt => opt.value === field.value)}
              placeholder="Select Religion"
              isClearable
            />
          )}
        />
      </FieldRow>
      <FieldRow label="Category" error={errorMsg(errors.category)}>
        <Input {...register("category")} />
      </FieldRow>
      <FieldRow label="Blood Group" error={errorMsg(errors.bloodGroup)}>
        <Controller
          name="bloodGroup"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={bloodGroupOptions}
              onChange={val => field.onChange(val?.value)}
              value={bloodGroupOptions.find(opt => opt.value === field.value)}
              placeholder="Select Blood Group"
              isClearable
            />
          )}
        />
      </FieldRow>
      <FieldRow label="Mother Tongue" error={errorMsg(errors.motherTongue)}>
        <Controller
          name="motherTongue"
          control={control}
          render={({ field }) => (
            <Select<OptionType>
              {...field}
              options={motherTongueOptions}
              onChange={val => field.onChange(val?.value)}
              value={motherTongueOptions.find(opt => opt.value === field.value)}
              placeholder="Select Mother Tongue"
              isClearable
            />
          )}
        />
      </FieldRow>
    </div>
  );
}
