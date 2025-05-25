"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import Select from "react-select";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from 'browser-image-compression';

// --- Types ---
type OptionType = { value: string; label: string };

// --- Dropdown Options ---
const genderOptions: OptionType[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const transportModeOptions: OptionType[] = [
  { value: "School Provided", label: "School Provided" },
  { value: "Personal", label: "Personal" },
  { value: "Private", label: "Private" }
];

const religionOptions: OptionType[] = [
  { value: "Christianity", label: "Christianity" },
  { value: "Islam", label: "Islam" },
  { value: "Hinduism", label: "Hinduism" },
  { value: "Buddhism", label: "Buddhism" },
  { value: "Judaism", label: "Judaism" },
  { value: "Sikhism", label: "Sikhism" },
  { value: "Traditional/Indigenous Religions", label: "Traditional/Indigenous Religions" },
  { value: "Baháʼí Faith", label: "Baháʼí Faith" },
  { value: "Jainism", label: "Jainism" },
  { value: "Shinto", label: "Shinto" },
  { value: "Taoism", label: "Taoism" },
  { value: "Zoroastrianism", label: "Zoroastrianism" },
  { value: "No Religion / Atheist / Agnostic", label: "No Religion / Atheist / Agnostic" }
];

const bloodGroupOptions: OptionType[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" }
];

const classEnrolledOptions: OptionType[] = [
  { value: "Nursery / Pre-Nursery / Playgroup", label: "Nursery / Pre-Nursery / Playgroup" },
  { value: "LKG / KG1", label: "LKG / KG1" },
  { value: "UKG / KG2", label: "UKG / KG2" },
  { value: "Grade 1 / Class 1", label: "Grade 1 / Class 1" },
  { value: "Grade 2 / Class 2", label: "Grade 2 / Class 2" },
  { value: "Grade 3 / Class 3", label: "Grade 3 / Class 3" },
  { value: "Grade 4 / Class 4", label: "Grade 4 / Class 4" },
  { value: "Grade 5 / Class 5", label: "Grade 5 / Class 5" },
  { value: "Grade 6 / Class 6", label: "Grade 6 / Class 6" },
  { value: "Grade 7 / Class 7", label: "Grade 7 / Class 7" },
  { value: "Grade 8 / Class 8", label: "Grade 8 / Class 8" },
  { value: "Grade 9 / Class 9", label: "Grade 9 / Class 9" },
  { value: "Grade 10 / Class 10", label: "Grade 10 / Class 10" },
  { value: "Grade 11 / Class 11", label: "Grade 11 / Class 11" },
  { value: "Grade 12 / Class 12", label: "Grade 12 / Class 12" }
];

const healthIssuesOptions: OptionType[] = [
  { value: "None", label: "None" },
  { value: "Asthma", label: "Asthma" },
  { value: "Diabetes", label: "Diabetes" },
  { value: "Epilepsy", label: "Epilepsy" },
  { value: "Allergies", label: "Allergies" },
  { value: "Heart Condition", label: "Heart Condition" },
  { value: "Vision Impairment", label: "Vision Impairment" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Physical Disability", label: "Physical Disability" },
  { value: "Other (please specify)", label: "Other (please specify)" }
];

const specialNeedsOptions: OptionType[] = [
  { value: "None", label: "None" },
  { value: "Autism Spectrum Disorder (ASD)", label: "Autism Spectrum Disorder (ASD)" },
  { value: "Attention Deficit Hyperactivity Disorder (ADHD)", label: "Attention Deficit Hyperactivity Disorder (ADHD)" },
  { value: "Dyslexia", label: "Dyslexia" },
  { value: "Speech/Language Disorder", label: "Speech/Language Disorder" },
  { value: "Learning Disability", label: "Learning Disability" },
  { value: "Intellectual Disability", label: "Intellectual Disability" },
  { value: "Emotional/Behavioral Disorder", label: "Emotional/Behavioral Disorder" },
  { value: "Physical Disability", label: "Physical Disability" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Visual Impairment", label: "Visual Impairment" },
  { value: "Developmental Delay", label: "Developmental Delay" },
  { value: "Gifted/Talented", label: "Gifted/Talented" },
  { value: "Other", label: "Other" }
];

const steps = [
  "Personal Info",
  "Student Photo",
  "Family/Guardian",
  "Admission & Previous",
  "Contact & Address",
  "Medical & Other"
];

// --- Main Component ---
export default function StudentStepperForm({
  onCancel,
  isSubmitting,
  isEdit,
}: {
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  // --- Local State ---
  const [step, setStep] = useState(0);
  const [countryOptions, setCountryOptions] = useState<OptionType[]>([]);
  const [motherTongueOptions, setMotherTongueOptions] = useState<OptionType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // --- Form Context ---
  const { register, formState: { errors }, control, setValue, watch } = useFormContext();
  const photoUrl = watch("photoUrl");

  // --- Load Country/Mother Tongue Options on Mount ---
  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all")
      .then(res => {
        const countries: OptionType[] = res.data
          .map((c: any) => ({
            value: c.name.common,
            label: c.name.common
          }))
          .sort((a: OptionType, b: OptionType) => a.label.localeCompare(b.label));
        setCountryOptions(countries);

        const tongues: OptionType[] = res.data
          .map((c: any) => ({
            value: c.demonyms?.eng?.m || c.demonym || c.name.common,
            label: c.demonyms?.eng?.m || c.demonym || c.name.common
          }))
          .filter((v: OptionType, i: number, arr: OptionType[]) => v.value && arr.findIndex(x => x.value === v.value) === i)
          .sort((a: OptionType, b: OptionType) => a.label.localeCompare(b.label));
        setMotherTongueOptions(tongues);
      });
  }, []);

  // --- Error Message Helper ---
  const errorMsg = (err: any) =>
    typeof err?.message === "string"
      ? <span className="text-xs text-red-500">{err.message}</span>
      : null;

  const gridClass = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4";

  // --- File Upload (for image drag/drop) ---
 
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadError("");
    let file = acceptedFiles[0];
  
    // Try more aggressive compression if needed
    let compressedFile = file;
    let maxTries = 3;
    let targetSize = 200 * 1024; // 200 KB
    let maxWidthOrHeight = 1024;
    let lastError = "";
  
    for (let i = 0; i < maxTries; i++) {
      const options = {
        maxSizeMB: 0.19, // always a little under 0.2
        maxWidthOrHeight,
        useWebWorker: true,
        initialQuality: 0.6 // try a lower quality
      };
  
      try {
        compressedFile = await imageCompression(compressedFile, options);
        if (compressedFile.size <= targetSize) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Compression error";
        break;
      }
      // Each retry, shrink even more
      maxWidthOrHeight = Math.floor(maxWidthOrHeight * 0.75);
    }
  
    if (compressedFile.size > targetSize) {
      setUploadError("File could not be compressed below 200KB. Please choose a smaller image or crop it.");
      setUploading(false);
      return;
    }
  
    // Proceed to upload
    try {
      const form = new FormData();
      form.append("file", compressedFile);
      const res = await fetch("/api/upload-stud-image", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setValue("photoUrl", data.url, { shouldValidate: true, shouldDirty: true });
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err) {
      setUploadError("Upload failed. Try again.");
    }
    setUploading(false);
  }, [setValue]);

  // --- React Dropzone Config ---
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    noClick: true, // We'll use our own button
    noKeyboard: true,
  });

  // --- Render ---
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-4xl">
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
          <div className={gridClass}>
            <div>
              <Label>Admission Number</Label>
              <Input {...register("admissionNumber")} />
              {errorMsg(errors.admissionNumber)}
            </div>
            <div>
              <Label>First Name</Label>
              <Input {...register("firstName")} />
              {errorMsg(errors.firstName)}
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input {...register("middleName")} />
              {errorMsg(errors.middleName)}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register("lastName")} />
              {errorMsg(errors.lastName)}
            </div>
            <div>
              <Label>Gender</Label>
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
              {errorMsg(errors.gender)}
            </div>
            <div>
              <Label>Date of Birth</Label>
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
              {errorMsg(errors.dateOfBirth)}
            </div>
            <div>
              <Label>Nationality</Label>
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
              {errorMsg(errors.nationality)}
            </div>
            <div>
              <Label>Religion</Label>
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
              {errorMsg(errors.religion)}
            </div>
            <div>
              <Label>Category</Label>
              <Input {...register("category")} />
              {errorMsg(errors.category)}
            </div>
            <div>
              <Label>Blood Group</Label>
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
              {errorMsg(errors.bloodGroup)}
            </div>
            <div>
              <Label>Mother Tongue</Label>
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
              {errorMsg(errors.motherTongue)}
            </div>
          </div>
        )}

        {/* Step 1: Student Photo Upload */}
        {step === 1 && (
          <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[320px] p-6 bg-white rounded-lg shadow-md">
            <Label className="mb-2 text-lg font-semibold text-blue-700">
              Student Photo Upload
            </Label>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Student Photo"
                className="rounded-full border-4 border-blue-100 shadow-md mb-4 object-cover"
                style={{ width: 120, height: 120 }}
              />
            )}
            <div
              {...getRootProps()}
              className={[
                "flex flex-col items-center justify-center w-full h-36",
                "bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg",
                "transition-all duration-200 cursor-pointer",
                isDragActive ? "bg-blue-100 border-blue-600" : "hover:bg-blue-100",
                uploading ? "opacity-50 pointer-events-none" : ""
              ].join(" ")}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 mb-2 text-blue-400" />
              <span className="text-base font-medium mb-1 text-blue-700">
                {photoUrl ? "Change Photo" : isDragActive ? "Drop here…" : "Drag & Drop or Click to Upload"}
              </span>
              <span className="text-xs text-blue-400">
                Supported: JPG, PNG, JPEG — Max 2MB
              </span>
              <button
                type="button"
                onClick={open}
                className="mt-3 px-4 py-1 rounded bg-blue-500 text-white text-sm shadow hover:bg-blue-600"
                disabled={uploading}
              >
                {photoUrl ? "Change Photo" : "Select Photo"}
              </button>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-blue-500 mt-4 text-sm">
                <Loader2 className="animate-spin w-5 h-5" />
                Uploading...
              </div>
            )}
            {uploadError && (
              <div className="text-xs text-red-500 mt-2">{uploadError}</div>
            )}
            {!photoUrl && !uploading && !uploadError && (
              <div className="text-gray-400 text-xs mt-4">No photo uploaded yet.</div>
            )}
          </div>
        )}

        {/* Step 2: Family/Guardian */}
        {step === 2 && (
          <div className={gridClass}>
            <div>
              <Label>Father Name</Label>
              <Input {...register("fatherName")} />
              {errorMsg(errors.fatherName)}
            </div>
            <div>
              <Label>Father Occupation</Label>
              <Input {...register("fatherOccupation")} />
              {errorMsg(errors.fatherOccupation)}
            </div>
            <div>
              <Label>Mother Name</Label>
              <Input {...register("motherName")} />
              {errorMsg(errors.motherName)}
            </div>
            <div>
              <Label>Mother Occupation</Label>
              <Input {...register("motherOccupation")} />
              {errorMsg(errors.motherOccupation)}
            </div>
            <div>
              <Label>Guardian Name</Label>
              <Input {...register("guardianName")} />
              {errorMsg(errors.guardianName)}
            </div>
            <div>
              <Label>Guardian Relation</Label>
              <Input {...register("guardianRelation")} />
              {errorMsg(errors.guardianRelation)}
            </div>
          </div>
        )}

        {/* Step 3: Admission & Previous */}
        {step === 3 && (
          <div className={gridClass}>
            <div>
              <Label>Admission Date</Label>
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
              {errorMsg(errors.admissionDate)}
            </div>
            <div>
              <Label>Class Enrolled</Label>
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
              {errorMsg(errors.classEnrolled)}
            </div>
            <div>
              <Label>Section</Label>
              <Input {...register("section")} />
              {errorMsg(errors.section)}
            </div>
            <div>
              <Label>Previous School</Label>
              <Input {...register("previousSchool")} />
              {errorMsg(errors.previousSchool)}
            </div>
            <div>
              <Label>Transfer Certificate No</Label>
              <Input {...register("transferCertificateNo")} />
              {errorMsg(errors.transferCertificateNo)}
            </div>
          </div>
        )}

        {/* Step 4: Contact & Address */}
        {step === 4 && (
          <div className={gridClass}>
            <div>
              <Label>Contact Phone (Primary)</Label>
              <Input {...register("contactPhonePrimary")} />
              {errorMsg(errors.contactPhonePrimary)}
            </div>
            <div>
              <Label>Contact Phone (Secondary)</Label>
              <Input {...register("contactPhoneSecondary")} />
              {errorMsg(errors.contactPhoneSecondary)}
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register("email")} />
              {errorMsg(errors.email)}
            </div>
            <div>
              <Label>Address Line 1</Label>
              <Input {...register("addressLine1")} />
              {errorMsg(errors.addressLine1)}
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input {...register("addressLine2")} />
              {errorMsg(errors.addressLine2)}
            </div>
            <div>
              <Label>City</Label>
              <Input {...register("city")} />
              {errorMsg(errors.city)}
            </div>
            <div>
              <Label>State</Label>
              <Input {...register("state")} />
              {errorMsg(errors.state)}
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input {...register("postalCode")} />
              {errorMsg(errors.postalCode)}
            </div>
            <div>
              <Label>Country</Label>
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
              {errorMsg(errors.country)}
            </div>
            <div>
              <Label>Aadhar Number</Label>
              <Input {...register("aadharNumber")} />
              {errorMsg(errors.aadharNumber)}
            </div>
          </div>
        )}

        {/* Step 5: Medical & Other */}
        {step === 5 && (
          <div className={gridClass}>
            <div>
              <Label>Health Issues</Label>
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
              {errorMsg(errors.healthIssues)}
            </div>
            <div>
              <Label>Special Needs</Label>
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
              {errorMsg(errors.specialNeeds)}
            </div>
            <div>
              <Label>Transport Mode</Label>
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
              {errorMsg(errors.transportMode)}
            </div>
            <div>
              <Label>Remarks</Label>
              <Input {...register("remarks")} />
              {errorMsg(errors.remarks)}
            </div>
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
