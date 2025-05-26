"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import Select from "react-select";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import StudentPhotoStep from "./StudentPhotoStep";
import {
  genderOptions,
  transportModeOptions,
  religionOptions,
  bloodGroupOptions,
  classEnrolledOptions,
  healthIssuesOptions,
  specialNeedsOptions,
  steps,
  OptionType,
} from "../studentFormOptions";

export default function StudentStepperForm({
  onCancel,
  isSubmitting,
  isEdit,
}: {
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  const [step, setStep] = useState(0);
  const [countryOptions, setCountryOptions] = useState<OptionType[]>([]);
  const [motherTongueOptions, setMotherTongueOptions] = useState<OptionType[]>([]);
  const { register, formState: { errors }, control, watch } = useFormContext();
  const photoUrl = watch("photoUrl");

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then(res => {
      const countries: OptionType[] = res.data
        .map((c: any) => ({
          value: c.name.common,
          label: c.name.common,
        }))
        .sort((a: OptionType, b: OptionType) => a.label.localeCompare(b.label));
      setCountryOptions(countries);

      const tongues: OptionType[] = res.data
        .map((c: any) => ({
          value: c.demonyms?.eng?.m || c.demonym || c.name.common,
          label: c.demonym?.eng?.m || c.demonym || c.name.common,
        }))
        .filter(
          (v: OptionType, i: number, arr: OptionType[]) =>
            v.value && arr.findIndex((x) => x.value === v.value) === i
        )
        .sort((a: OptionType, b: OptionType) => a.label.localeCompare(b.label));
      setMotherTongueOptions(tongues);
    });
  }, []);

  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;

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
      <div className="grid grid-cols-[150px,1fr] items-center">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="m-0 p-0">
          {children}
          {error && <div>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-6xl">
        {/* Stepper Header */}
        <div className="mb-6 flex items-center justify-between w-full">
          {steps.map((label, idx) => (
            <div
              key={label}
              className={`flex-1 flex flex-col items-center ${
                idx < step ? "text-green-600"
                : idx === step ? "text-blue-600"
                : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  idx === step
                    ? "border-blue-600 bg-blue-100"
                    : idx < step
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 bg-gray-100"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Personal Info */}
        {step === 0 && (
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
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={date =>
                      field.onChange(date ? date.toISOString().slice(0, 10) : "")
                    }
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select Date of Birth"
                    className="w-full border rounded px-3 py-2"
                    maxDate={new Date()}
                    isClearable
                  />
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
        )}

        {/* Step 1: Student Photo Upload */}
        {step === 1 && <StudentPhotoStep />}

        {/* Step 2: Family/Guardian */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow label="Father Name" error={errorMsg(errors.fatherName)}>
              <Input {...register("fatherName")} />
            </FieldRow>
            <FieldRow label="Father Occupation" error={errorMsg(errors.fatherOccupation)}>
              <Input {...register("fatherOccupation")} />
            </FieldRow>
            <FieldRow label="Mother Name" error={errorMsg(errors.motherName)}>
              <Input {...register("motherName")} />
            </FieldRow>
            <FieldRow label="Mother Occupation" error={errorMsg(errors.motherOccupation)}>
              <Input {...register("motherOccupation")} />
            </FieldRow>
            <FieldRow label="Guardian Name" error={errorMsg(errors.guardianName)}>
              <Input {...register("guardianName")} />
            </FieldRow>
            <FieldRow label="Guardian Relation" error={errorMsg(errors.guardianRelation)}>
              <Input {...register("guardianRelation")} />
            </FieldRow>
          </div>
        )}

        {/* Step 3: Admission & Previous */}
        {step === 3 && (
            <div className="grid grid-cols-1 gap-6">
            <FieldRow label="Admission Date" error={errorMsg(errors.admissionDate)}>
              <Controller
                name="admissionDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={date =>
                      field.onChange(date ? date.toISOString().slice(0, 10) : "")
                    }
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select Admission Date"
                    className="w-full border rounded px-3 py-2"
                    isClearable
                  />
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
        )}

        {/* Step 4: Contact & Address */}
        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow label="Contact Phone (Primary)" error={errorMsg(errors.contactPhonePrimary)}>
              <Input {...register("contactPhonePrimary")} />
            </FieldRow>
            <FieldRow label="Contact Phone (Secondary)" error={errorMsg(errors.contactPhoneSecondary)}>
              <Input {...register("contactPhoneSecondary")} />
            </FieldRow>
            <FieldRow label="Email" error={errorMsg(errors.email)}>
              <Input {...register("email")} />
            </FieldRow>
            <FieldRow label="Address Line 1" error={errorMsg(errors.addressLine1)}>
              <Input {...register("addressLine1")} />
            </FieldRow>
            <FieldRow label="Address Line 2" error={errorMsg(errors.addressLine2)}>
              <Input {...register("addressLine2")} />
            </FieldRow>
            <FieldRow label="City" error={errorMsg(errors.city)}>
              <Input {...register("city")} />
            </FieldRow>
            <FieldRow label="State" error={errorMsg(errors.state)}>
              <Input {...register("state")} />
            </FieldRow>
            <FieldRow label="Postal Code" error={errorMsg(errors.postalCode)}>
              <Input {...register("postalCode")} />
            </FieldRow>
            <FieldRow label="Country" error={errorMsg(errors.country)}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select<OptionType>
                    {...field}
                    options={countryOptions}
                    onChange={val => field.onChange(val?.value)}
                    value={countryOptions.find(opt => opt.value === field.value)}
                    placeholder="Select Country"
                    isClearable
                  />
                )}
              />
            </FieldRow>
            <FieldRow label="Aadhar Number" error={errorMsg(errors.aadharNumber)}>
              <Input {...register("aadharNumber")} />
            </FieldRow>
          </div>
        )}

      {/* Step 5: Medical & Other -- ONE COLUMN */}
        {step === 5 && (
           <div className="grid grid-cols-1 gap-6">
            <FieldRow label="Health Issues" error={errorMsg(errors.healthIssues)}>
              <Controller
                name="healthIssues"
                control={control}
                render={({ field }) => (
                  <Select<OptionType>
                    {...field}
                    options={healthIssuesOptions}
                    onChange={val => field.onChange(val?.value)}
                    value={healthIssuesOptions.find(opt => opt.value === field.value)}
                    placeholder="Select Health Issue"
                    isClearable
                  />
                )}
              />
            </FieldRow>
            <FieldRow label="Special Needs" error={errorMsg(errors.specialNeeds)}>
              <Controller
                name="specialNeeds"
                control={control}
                render={({ field }) => (
                  <Select<OptionType>
                    {...field}
                    options={specialNeedsOptions}
                    onChange={val => field.onChange(val?.value)}
                    value={specialNeedsOptions.find(opt => opt.value === field.value)}
                    placeholder="Select Special Need"
                    isClearable
                  />
                )}
              />
            </FieldRow>
            <FieldRow label="Transport Mode" error={errorMsg(errors.transportMode)}>
              <Controller
                name="transportMode"
                control={control}
                render={({ field }) => (
                  <Select<OptionType>
                    {...field}
                    options={transportModeOptions}
                    onChange={val => field.onChange(val?.value)}
                    value={transportModeOptions.find(opt => opt.value === field.value)}
                    placeholder="Select Transport Mode"
                    isClearable
                  />
                )}
              />
            </FieldRow>
            <FieldRow label="Remarks" error={errorMsg(errors.remarks)}>
              <Input {...register("remarks")} />
            </FieldRow>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 w-full">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div>
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !photoUrl}
              >
                Next
              </Button>
            )}
            {step === steps.length - 1 && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? (isEdit ? "Updating..." : "Creating...")
                  : isEdit
                  ? "Update Student"
                  : "Create Student"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}