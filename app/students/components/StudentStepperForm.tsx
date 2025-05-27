"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";

import StepPersonalInfo from "./StepPersonalInfo";
import StudentPhotoStep from "./StudentPhotoStep";
import StepFamilyGuardian from "./StepFamilyGuardian";
import StepAdmissionPrevious from "./StepAdmissionPrevious";
import StepContactAddress from "./StepContactAddress";
import StepMedicalOther from "./StepMedicalOther";

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
  const { watch } = useFormContext();
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

        {/* Step Components */}
        {step === 0 && (
          <StepPersonalInfo
            countryOptions={countryOptions}
            motherTongueOptions={motherTongueOptions}
          />
        )}
        {step === 1 && <StudentPhotoStep />}
        {step === 2 && <StepFamilyGuardian />}
        {step === 3 && <StepAdmissionPrevious />}
        {step === 4 && (
          <StepContactAddress countryOptions={countryOptions} />
        )}
        {step === 5 && <StepMedicalOther />}

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
