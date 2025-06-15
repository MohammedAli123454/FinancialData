"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Item, WidgetEntry } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  items: Item[];
  onFinish: (entries: WidgetEntry[]) => void;
}

// Utility: check if row is originally from JSON
function isJsonItem(row: WidgetEntry, originalItems: Item[]) {
  return originalItems.some(
    (itm) =>
      itm["Item No."] === row["Item No."] &&
      itm.Description === row.Description &&
      itm.Unit === row.Unit &&
      itm["Unit Rate (SAR)"] === row["Unit Rate (SAR)"]
  );
}

export function WidgetDialog({
  open,
  onOpenChange,
  groupName,
  items,
  onFinish,
}: Props) {
  // Save original items ref for isJsonItem checks
  const originalItems = useRef<Item[]>(items);

  const { control, watch, handleSubmit, setValue } = useForm<{ data: WidgetEntry[] }>({
    defaultValues: {
      data: items.map((item) => ({
        ...item,
        days: 1,
        persons: 1,
        totalHours: 10,
        totalValue: item["Unit Rate (SAR)"] * 10,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "data",
  });

  const data = watch("data");

  // State for the "Set Duration" dialog
  const [durationDialogOpen, setDurationDialogOpen] = useState(false);
  const [durationAllDays, setDurationAllDays] = useState<number>(1);
  const [durationAllPersons, setDurationAllPersons] = useState<number>(1);

  // On duration dialog open, pre-fill with current values (use first row as base)
  const handleOpenDurationDialog = () => {
    setDurationAllDays(data?.[0]?.days ?? 1);
    setDurationAllPersons(data?.[0]?.persons ?? 1);
    setDurationDialogOpen(true);
  };

  // Apply duration to all rows
  const applyDurationToAll = () => {
    data.forEach((row, idx) => {
      setValue(`data.${idx}.days`, durationAllDays, { shouldDirty: true });
      setValue(`data.${idx}.persons`, durationAllPersons, { shouldDirty: true });
    });
    setDurationDialogOpen(false);
  };

  // Auto-calculate totalHours & totalValue when Days or Persons changes, but allow editing of totalHours
  useEffect(() => {
    data?.forEach((row, idx) => {
      const isJson = isJsonItem(row, originalItems.current);
      // Only auto-calc if totalHours wasn't edited (matches persons*10*days or it's a JSON row)
      const shouldAutoCalc =
        isJson || row.totalHours === row.persons * 10 * row.days;
      if (shouldAutoCalc) {
        const totalHours = row.persons * 10 * row.days;
        setValue(`data.${idx}.totalHours`, totalHours, { shouldDirty: true });
        setValue(
          `data.${idx}.totalValue`,
          totalHours * row["Unit Rate (SAR)"],
          { shouldDirty: true }
        );
      } else {
        setValue(
          `data.${idx}.totalValue`,
          row.totalHours * row["Unit Rate (SAR)"],
          { shouldDirty: true }
        );
      }
    });
    // eslint-disable-next-line
  }, [JSON.stringify(data?.map((d) => [d.days, d.persons, d.totalHours]))]);

  // Grand total calculation
  const grandTotal = useMemo(
    () => data?.reduce((sum, row) => sum + (row?.totalValue || 0), 0) ?? 0,
    [data]
  );

  // Handler to add a new blank row (editable)
  const handleAdd = () => {
    append({
      "Item No.": "",
      Description: "",
      Unit: "",
      "Unit Rate (SAR)": 0,
      days: 1,
      persons: 1,
      totalHours: 10,
      totalValue: 0,
    });
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl md:max-w-7xl min-w-[80vw] p-0 overflow-hidden">
          <form
            onSubmit={handleSubmit((formData) => {
              onFinish(formData.data);
              onOpenChange(false);
            })}
          >
            {/* Dialog Header with Group, Grand Total, and Set Duration */}
            <DialogHeader className="sticky top-0 z-20 bg-white/90 p-6 border-b flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* <DialogTitle className="text-2xl font-bold"> */}
                <DialogTitle className="gradient-title text-2xl">
                  {groupName}
                </DialogTitle>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOpenDurationDialog}
                  className="ml-2"
                >
                  Set Duration
                </Button>
              </div>
              <div className="text-lg font-semibold text-blue-700 flex items-center gap-2 whitespace-nowrap">
                Grand Total:&nbsp;
                <span className="text-2xl">
                  {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                </span>
              </div>
            </DialogHeader>

            <div className="overflow-auto max-h-[70vh]">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-white shadow">
                  <tr>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Item No.
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Description
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Unit
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Unit Rate (SAR)
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Days
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100">
                      Persons
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100 text-center">
                      Total Hours
                    </th>
                    <th className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100 text-center">
                      Total Value (SAR)
                    </th>
                    <th
                      className="py-2 px-3 border-b text-xs font-bold text-gray-700 bg-blue-100 text-center"
                      style={{ width: 120 }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((row, idx) => {
                    const isJson = isJsonItem(data?.[idx] ?? {}, originalItems.current);
                    return (
                      <tr key={row.id}>
                        {/* Item No. */}
                        <td className="px-3 py-2 border-b font-mono">
                          {isJson ? (
                            data?.[idx]["Item No."] ?? ""
                          ) : (
                            <Controller
                            control={control}
                            name={`data.${idx}.Item No.`}
                            render={({ field }) => (
                              <input
                                type="text"
                                className="w-20 border border-gray-200 p-1 rounded text-center"
                                {...field}
                                value={field.value ?? ""}
                              />
                            )}
                          />
                          )}
                        </td>
                        {/* Description */}
                        <td className="px-3 py-2 border-b">
                          {isJson ? (
                            data?.[idx].Description ?? ""
                          ) : (
                            <Controller
                              control={control}
                              name={`data.${idx}.Description`}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  className="w-44 border border-gray-200 p-1 rounded"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              )}
                            />
                          )}
                        </td>
                        {/* Unit */}
                        <td className="px-3 py-2 border-b">
                          {isJson ? (
                            data?.[idx].Unit ?? ""
                          ) : (
                            <Controller
                              control={control}
                              name={`data.${idx}.Unit`}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  className="w-16 border border-gray-200 p-1 rounded text-center"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              )}
                            />
                          )}
                        </td>
                        {/* Unit Rate (SAR) */}
                        <td className="px-3 py-2 border-b text-right">
                          {isJson ? (
                            typeof data?.[idx]["Unit Rate (SAR)"] === "number"
                              ? data?.[idx]["Unit Rate (SAR)"].toFixed(2)
                              : ""
                          ) : (
                            <Controller
                            control={control}
                            name={`data.${idx}.Unit Rate (SAR)`} // <-- dot notation, not bracket
                            render={({ field }) => (
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="w-24 border border-gray-200 p-1 rounded text-right"
                                {...field}
                                value={field.value ?? 0}
                              />
                            )}
                          />
                          )}
                        </td>
                        {/* Days */}
                        <td className="px-3 py-2 border-b">
                          <Controller
                            control={control}
                            name={`data.${idx}.days`}
                            render={({ field }) => (
                              <input
                                type="number"
                                min={1}
                                className="w-16 border border-gray-200 p-1 rounded text-center"
                                {...field}
                                value={field.value ?? 1}
                              />
                            )}
                          />
                        </td>
                        {/* Persons */}
                        <td className="px-3 py-2 border-b">
                          <Controller
                            control={control}
                            name={`data.${idx}.persons`}
                            render={({ field }) => (
                              <input
                                type="number"
                                min={1}
                                className="w-16 border border-gray-200 p-1 rounded text-center"
                                {...field}
                                value={field.value ?? 1}
                              />
                            )}
                          />
                        </td>
                        {/* Total Hours */}
                        <td className="px-3 py-2 border-b text-center">
                          <Controller
                            control={control}
                            name={`data.${idx}.totalHours`}
                            render={({ field }) => (
                              <input
                                type="number"
                                min={0}
                                className="w-20 border border-gray-200 p-1 rounded text-center"
                                {...field}
                                value={field.value ?? 0}
                              />
                            )}
                          />
                        </td>
                        {/* Total Value (SAR) */}
                        <td className="px-3 py-2 border-b text-center">
                          {(data?.[idx]?.totalValue ?? 0).toFixed(2)}
                        </td>
                        {/* Action */}
                        <td className="px-3 py-2 border-b text-center" style={{ width: 120 }}>
                          <div className="flex gap-1 justify-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => remove(idx)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 size={18} />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-green-600"
                              onClick={handleAdd}
                            >
                              <Plus size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DialogFooter className="p-4 flex justify-end gap-2 bg-white border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Finish & Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Duration Dialog */}
      <Dialog open={durationDialogOpen} onOpenChange={setDurationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Duration for All Items</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block font-medium mb-1">Set All Days:</label>
              <input
                type="number"
                min={1}
                value={durationAllDays}
                onChange={(e) => setDurationAllDays(Number(e.target.value) || 1)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Set All Persons:</label>
              <input
                type="number"
                min={1}
                value={durationAllPersons}
                onChange={(e) =>
                  setDurationAllPersons(Number(e.target.value) || 1)
                }
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDurationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={applyDurationToAll}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
