"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AvailabilityRow, DayOfWeek, WeekState } from "@/@types/availability";
import { useUserStore } from "@/app/store";
import { availabilityApi } from "@/lib/api/availability.api";
import { buildInitialState, slotCount } from "@/lib/helpers/availability-slots";
import { PageHeader } from "@/components/nav/page-header";
import { DAYS, HOURS } from "@/lib/constants";

export default function AvailabilityPage() {
  const user = useUserStore((s) => s.user);
  const doctorId = user?.doctor?.id as string;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["availability", doctorId],
    queryFn: () => availabilityApi.getAvailabilityTemplate(doctorId),
  });

  const [week, setWeek] = useState<WeekState | null>(null);

  // Once data loads, seed local state (only on first load)
  if (data && !week) {
    setWeek(buildInitialState(data));
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: availabilityApi.updatedAvailabilityTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", doctorId] });
      toast.success("Schedule saved");
    },
    onError: () => {
      toast.error("Failed to save schedule");
    },
  });

  const handleToggle = (day: DayOfWeek, enabled: boolean) => {
    setWeek((prev) => prev && { ...prev, [day]: { ...prev[day], enabled } });
  };

  const handleTime = (
    day: DayOfWeek,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setWeek(
      (prev) => prev && { ...prev, [day]: { ...prev[day], [field]: value } },
    );
  };

  const handleSave = () => {
    if (!week) return;

    // Collect only enabled days
    const rows: AvailabilityRow[] = DAYS.filter(
      ({ key }) => week[key].enabled,
    ).map(({ key }) => ({
      dayOfWeek: key,
      startTime: week[key].startTime,
      endTime: week[key].endTime,
    }));

    // Client-side guard: endTime must be after startTime
    for (const row of rows) {
      const start = parseInt(row.startTime, 10);
      const end = parseInt(row.endTime, 10);
      if (end <= start) {
        toast.error(
          `${DAYS.find((d) => d.key === row.dayOfWeek)?.label}: end time must be after start time`,
        );
        return;
      }
    }

    save(rows);
  };

  if (isLoading || !week) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledCount = DAYS.filter(({ key }) => week[key].enabled).length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your calendar"
        title="Weekly Schedule"
        description="Set your recurring availability. Changes apply immediately and indefinitely until you update them again."
      />

      {/* Schedule grid */}
      <div className="rounded-[2rem] bg-card">
        {DAYS.map(({ key, label }, index) => {
          const row = week[key];
          const slots = row.enabled ? slotCount(row.startTime, row.endTime) : 0;
          const isLast = index === DAYS.length - 1;

          return (
            <div
              key={key}
              className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 ${
                !isLast ? "border-b border-border" : ""
              }`}
            >
              {/* Day label + toggle */}
              <div className="flex w-36 shrink-0 items-center gap-3">
                <Switch
                  checked={row.enabled}
                  onCheckedChange={(v) => handleToggle(key, v)}
                  id={`toggle-${key}`}
                />
                <Label
                  htmlFor={`toggle-${key}`}
                  className={`font-medium ${
                    row.enabled ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </Label>
              </div>

              {/* Time pickers */}
              {row.enabled ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <Select
                    value={row.startTime}
                    onValueChange={(v) => handleTime(key, "startTime", v)}
                  >
                    <SelectTrigger className="w-28 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-sm text-muted-foreground">to</span>

                  <Select
                    value={row.endTime}
                    onValueChange={(v) => handleTime(key, "endTime", v)}
                  >
                    <SelectTrigger className="w-28 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Slot count badge */}
                  {slots > 0 && (
                    <span className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                      {slots} slot{slots === 1 ? "" : "s"}
                    </span>
                  )}

                  {/* Invalid range warning */}
                  {slots <= 0 && (
                    <span className="text-xs text-destructive">
                      End time must be after start time
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {enabledCount === 0
            ? "No days selected — patients won't be able to book."
            : `Available ${enabledCount} day${enabledCount === 1 ? "" : "s"} per week`}
        </p>
        <Button
          className="rounded-full"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save schedule
        </Button>
      </div>
    </div>
  );
}
