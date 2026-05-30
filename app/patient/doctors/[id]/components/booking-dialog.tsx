"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDatePHT, formatHour } from "@/lib/helpers/format";
import { SelectedSlot } from "@/@types/consultation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  patientNotes: z
    .string()
    .min(4, "Use at least 4 characters.")
    .max(400, "Keep notes under 400 characters."),
});

type BookingFormValues = z.infer<typeof schema>;

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName: string;
  selectedSlot: SelectedSlot | null;
  isPending: boolean;
  onConfirm: (notes: string) => void;
};

export function BookingDialog({
  open,
  onOpenChange,
  doctorName,
  selectedSlot,
  isPending,
  onConfirm,
}: BookingDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientNotes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ patientNotes: "" });
    }
  }, [open, selectedSlot, reset]);

  const onSubmit = (values: BookingFormValues) => {
    onConfirm(values.patientNotes.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book consultation</DialogTitle>
          <DialogDescription>
            {doctorName}
            {selectedSlot &&
              ` · ${formatDatePHT(selectedSlot.date)} at ${formatHour(selectedSlot.time)}`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 min-w-0" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Symptoms or concerns</label>
            <Textarea
              rows={4}
              placeholder="What would you like to discuss?"
              className="resize-none w-full break-words"
              {...register("patientNotes")}
            />
            {errors.patientNotes ? (
              <p className="text-xs text-destructive">
                {errors.patientNotes.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add a short note to confirm your booking.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="rounded-full"
              disabled={isSubmitting || isPending}
            >
              Confirm booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
