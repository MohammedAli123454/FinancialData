"use client";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CalendarField from "./CalendarField";

interface StatementInputFieldsProps {
    suppliers: any[];
    isSuppliersLoading: boolean;
    poNumbers: any[];
}

export default function StatementInputFields({
    suppliers,
    isSuppliersLoading,
    poNumbers,
}: StatementInputFieldsProps) {
    const {
        register,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useFormContext();

    // Optional: Sync payable with invoice_amount (mirroring your original logic)
    // If you want this auto-update while typing, use the effect below:
    // useEffect(() => { setValue("payable", watch("invoice_amount")); }, [watch("invoice_amount")]);

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
            <Controller
                name="payment_type"
                control={control}
                render={({ field, fieldState }) => (
                    <div>
                        <Label>Payment Type</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Payment Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADVANCE PAYMENT">ADVANCE PAYMENT</SelectItem>
                                <SelectItem value="ADVANCE SETTLEMENT">ADVANCE SETTLEMENT</SelectItem>
                                <SelectItem value="CREDIT">CREDIT</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{fieldState.error?.message}</p>
                    </div>
                )}
            />
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
            <Controller
                name="supplier_id"
                control={control}
                render={({ field, fieldState }) => (
                    <div>
                        <Label>Supplier</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {isSuppliersLoading && (
                                    <SelectItem value="" disabled>
                                        Loading...
                                    </SelectItem>
                                )}
                                {suppliers?.map((sup: any) => (
                                    <SelectItem value={sup.id.toString()} key={sup.id}>
                                        {sup.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{fieldState.error?.message}</p>
                    </div>
                )}
            />
            {/* PO Number */}
            <Controller
                name="po_number"
                control={control}
                render={({ field, fieldState }) => (
                    <div>
                        <Label>PO Number</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select PO" />
                            </SelectTrigger>
                            <SelectContent>
                                {poNumbers?.map((po: any) => (
                                    <SelectItem value={po.po_number} key={po.po_number}>
                                        {po.po_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{fieldState.error?.message}</p>
                    </div>
                )}
            />
            {/* Contract Type */}
            <Controller
                name="contract_type"
                control={control}
                render={({ field, fieldState }) => (
                    <div>
                        <Label>Contract Type</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Contract Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GCS Contract">GCS Contract</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-red-500">{fieldState.error?.message}</p>
                    </div>
                )}
            />
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
