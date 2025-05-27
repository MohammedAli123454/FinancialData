"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function StepFamilyGuardian() {
  const { register, formState: { errors } } = useFormContext();
  const errorMsg = (err: any) =>
    typeof err?.message === "string" ? (
      <span className="text-xs text-red-500">{err.message}</span>
    ) : null;
  return (
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
  );
}
