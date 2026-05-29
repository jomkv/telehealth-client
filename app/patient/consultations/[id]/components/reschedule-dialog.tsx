"use client";

import { SelectedSlot } from "@/@types/consultation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDatePHT, formatHour } from "@/lib/helpers/format";

type RescheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName: string;
  selectedSlot: SelectedSlot | null;
  isPending: boolean;
  onConfirm: () => void;
};

export function RescheduleDialog({
  open,
  onOpenChange,
  doctorName,
  selectedSlot,
  isPending,
  onConfirm,
}: RescheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Confirm reschedule</DialogTitle>
          <DialogDescription>
            {doctorName}
            {selectedSlot &&
              ` · ${formatDatePHT(selectedSlot.date)} at ${formatHour(selectedSlot.time)}`}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Your consultation will be moved to the new time above. This cannot be
          undone.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Go back
          </Button>
          <Button
            className="rounded-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            Confirm reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
