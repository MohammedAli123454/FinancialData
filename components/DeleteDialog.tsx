"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  confirming: boolean;
}

export function DeleteDialog({ onConfirm, onCancel, confirming }: Props) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this invoice?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={confirming} onClick={onConfirm}>
            {confirming ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
