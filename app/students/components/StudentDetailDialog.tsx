"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Student } from "../types";

export default function StudentDetailDialog({
  open,
  onOpenChange,
  student
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
}) {
  if (!student) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-2">Student Detail</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div><b>Name:</b> {student.firstName} {student.middleName} {student.lastName}</div>
          <div><b>Admission No:</b> {student.admissionNumber}</div>
          <div><b>Class:</b> {student.classEnrolled}</div>
          <div><b>Gender:</b> {student.gender}</div>
          <div><b>Date of Birth:</b> {student.dateOfBirth}</div>
          <div><b>Nationality:</b> {student.nationality}</div>
          {/* Add more fields as needed */}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
