// components/FiltersDialog.tsx
"use client";
import { useFiltersStore, DateRange } from "@/app/stores/filters-store"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";


const STATUS_OPTIONS = ["all", "PMD", "PMT", "FINANCE", "PAID"] as const;

interface MocOption {
  id: number;
  mocNo: string;
  cwo: string;
}

interface Props {
  mocOptions?: MocOption[];
}

export function FiltersDialog({ mocOptions = [] }: Props) {
  const {
    dialogOpen,
    draft,
    openDialog,
    closeDialog,
    updateDraft,
    apply,
    resetDraft,
  } = useFiltersStore();

  const formatRangeLabel = ([from, to]: DateRange) => {
    if (!from) return "Select Date Range";
    const fmt = (d: Date) => format(d, "MMM dd");
    return to ? `${fmt(from)} – ${fmt(to)}` : fmt(from);
  };

  return (
    <>
      <Button onClick={openDialog} variant="outline">
        Filters
      </Button>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filter Invoices</DialogTitle>
            <DialogDescription>
              Search, CWO, MOC, status, or date range.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="search">Search Term</Label>
              <Input
                id="search"
                value={draft.search}
                placeholder="Invoice or MOC #"
                onChange={(e) => updateDraft({ search: e.target.value })}
              />
            </div>

            {/* CWO */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="cwo">CWO Number</Label>
              <Input
                id="cwo"
                value={draft.cwo}
                placeholder="Enter CWO"
                onChange={(e) => updateDraft({ cwo: e.target.value })}
              />
            </div>

            {/* MOC */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="moc">MOC Number</Label>
              <Select
                value={draft.moc}
                onValueChange={(v) => updateDraft({ moc: v })}
              >
                <SelectTrigger id="moc">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {mocOptions.map((m) => (
                    <SelectItem key={m.id} value={m.mocNo}>
                      {m.mocNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => updateDraft({ status: v })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="flex flex-col space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    {formatRangeLabel(draft.dateRange)}
                    <CalendarIcon className="w-5 h-5 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[500px]">  {/* 500px wide popover */}
                  <Calendar
                    className="w-full"
                    mode="range"
                    selected={{
                      from: draft.dateRange[0] ?? undefined,
                      to: draft.dateRange[1] ?? undefined,
                    }}
                    onSelect={(selected) => {
                      const from = selected?.from ?? null;
                      const to = selected?.to ?? null;
                      updateDraft({ dateRange: [from, to] });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetDraft}>
              Clear
            </Button>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={apply}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
