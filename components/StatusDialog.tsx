"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";

interface Props {
  onSave: (status: string, date?: Date) => void;
  onCancel: () => void;
  saving: boolean;
}

export function StatusDialog({ onSave, onCancel, saving }: Props) {
  // Local state for status and receipt date
  const [status, setStatus] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<Date | undefined>(undefined);

  // Handle status changes, resetting receipt date if not PAID
  const handleStatusChange = (value: string) => {
    setStatus(value);
    if (value !== "PAID") {
      setReceiptDate(undefined);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            {status === "PAID" && "Select receipt date for PAID status"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {["PMD", "PMT", "FINANCE", "PAID"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {status === "PAID" && (
            <Calendar
              mode="single"
              selected={receiptDate}
              onSelect={(date) => date && setReceiptDate(date)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={saving || status === ""}
            onClick={() => onSave(status, status === "PAID" ? receiptDate : undefined)}
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
