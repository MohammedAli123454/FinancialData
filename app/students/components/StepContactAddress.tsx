"use client";
import { useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionType } from "../studentFormOptions";

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

export default function StepContactAddress({ countryOptions }: { countryOptions: OptionType[] }) {
  const { register, formState: { errors }, control } = useFormContext();
  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;
  return (
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
  );
}
