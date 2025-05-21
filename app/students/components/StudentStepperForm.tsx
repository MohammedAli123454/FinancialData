'use client';
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const steps = [
  "Personal Info",
  "Family/Guardian",
  "Admission & Previous",
  "Contact & Address",
  "Medical & Other"
];

export default function StudentStepperForm({
  onCancel,
  isSubmitting,
  isEdit
}: {
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  const [step, setStep] = useState(0);
  const { register, formState: { errors } } = useFormContext();

  // Utility for error rendering
  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;

  return (
    <>
      {/* Stepper header */}
      <div className="mb-4 flex items-center justify-between">
        {steps.map((label, idx) => (
          <div key={label} className={`flex-1 flex flex-col items-center ${idx < step ? "text-green-600" : idx === step ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx === step ? "border-blue-600 bg-blue-100" : idx < step ? "border-green-600 bg-green-100" : "border-gray-300 bg-gray-100"}`}>
              {idx + 1}
            </div>
            <span className="text-xs mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Personal Info */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
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
            <Input {...register("gender")} />
            {errorMsg(errors.gender)}
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" {...register("dateOfBirth")} />
            {errorMsg(errors.dateOfBirth)}
          </div>
          <div>
            <Label>Nationality</Label>
            <Input {...register("nationality")} />
            {errorMsg(errors.nationality)}
          </div>
          <div>
            <Label>Religion</Label>
            <Input {...register("religion")} />
            {errorMsg(errors.religion)}
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category")} />
            {errorMsg(errors.category)}
          </div>
          <div>
            <Label>Blood Group</Label>
            <Input {...register("bloodGroup")} />
            {errorMsg(errors.bloodGroup)}
          </div>
          <div>
            <Label>Mother Tongue</Label>
            <Input {...register("motherTongue")} />
            {errorMsg(errors.motherTongue)}
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input {...register("photoUrl")} />
            {errorMsg(errors.photoUrl)}
          </div>
        </div>
      )}

      {/* Step 1: Family/Guardian */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
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

      {/* Step 2: Admission & Previous */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Admission Date</Label>
            <Input type="date" {...register("admissionDate")} />
            {errorMsg(errors.admissionDate)}
          </div>
          <div>
            <Label>Class Enrolled</Label>
            <Input {...register("classEnrolled")} />
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

      {/* Step 3: Contact & Address */}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
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
            <Input {...register("country")} />
            {errorMsg(errors.country)}
          </div>
          <div>
            <Label>Aadhar Number</Label>
            <Input {...register("aadharNumber")} />
            {errorMsg(errors.aadharNumber)}
          </div>
        </div>
      )}

      {/* Step 4: Medical & Other */}
      {step === 4 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Health Issues</Label>
            <Input {...register("healthIssues")} />
            {errorMsg(errors.healthIssues)}
          </div>
          <div>
            <Label>Special Needs</Label>
            <Input {...register("specialNeeds")} />
            {errorMsg(errors.specialNeeds)}
          </div>
          <div>
            <Label>Transport Mode</Label>
            <Input {...register("transportMode")} />
            {errorMsg(errors.transportMode)}
          </div>
          <div>
            <Label>Remarks</Label>
            <Input {...register("remarks")} />
            {errorMsg(errors.remarks)}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <div>
          {step > 0 && (
            <Button type="button" variant="outline" className="mr-2" onClick={() => setStep(step - 1)}>Previous</Button>
          )}
          {step < steps.length - 1 && (
            <Button type="button" onClick={() => setStep(step + 1)}>Next</Button>
          )}
          {step === steps.length - 1 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Student" : "Create Student"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
