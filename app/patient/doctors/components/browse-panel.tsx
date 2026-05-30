import { DoctorCard } from "@/components/cards/doctor-card";
import Empty from "@/components/ui-bits/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorApi } from "@/lib/api/doctor.api";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function BrowsePanel() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [specId, setSpecId] = useState<string>("all");

  const { data: specializations, isPending } = useQuery({
    queryKey: ["specializations"],
    queryFn: doctorApi.getSpecializations,
  });

  const {
    data: doctors = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["doctors", debouncedQ],
    queryFn: () => doctorApi.searchDoctors(debouncedQ),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [q]);

  const filteredDoctors =
    specId === "all"
      ? doctors
      : doctors.filter((doctor) => doctor.specializationId === specId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-full pl-10"
          />
        </div>
        <Select
          value={specId}
          onValueChange={setSpecId}
          disabled={isPending || isLoading || isFetching}
        >
          <SelectTrigger className="w-[220px] rounded-full">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specializations</SelectItem>
            {specializations &&
              specializations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading doctors..." : `${filteredDoctors.length} doctors`}
        {isFetching && !isLoading ? " · Updating..." : null}
      </p>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`doctor-skeleton-${index}`}
              className="h-40 rounded-[2rem] bg-card animate-pulse"
            />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <Empty label="No doctors match your search." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
}
