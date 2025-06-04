"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  invoice,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice?: any;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-red-600">
            Delete Invoice?
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm">
            Are you sure you want to delete invoice{" "}
            <span className="font-semibold">{invoice?.invoice_no}</span>?<br />
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-24"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="w-24 flex items-center justify-center"
            type="button"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
