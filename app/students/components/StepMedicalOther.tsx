"use client";
import { useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  healthIssuesOptions,
  specialNeedsOptions,
  transportModeOptions,
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

export default function StepMedicalOther() {
  const { register, formState: { errors }, control } = useFormContext();
  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;
  return (
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
  );
}
