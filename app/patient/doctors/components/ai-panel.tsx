import { DoctorCard } from "@/components/cards/doctor-card";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { doctorApi } from "@/lib/api/doctor.api";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import type { SymptomSearchResult } from "@/@types/doctor";

export default function AIPanel() {
  const [symptoms, setSymptoms] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function handleReset() {
    setShowResults(false);
    setSymptoms("");
  }

  const { data, isLoading, isFetching, refetch, error } =
    useQuery<SymptomSearchResult>({
      queryKey: ["symptom-search", symptoms],
      queryFn: () => doctorApi.searchSymptom(symptoms.trim()),
      enabled: false,
    });

  const handleSubmit = async () => {
    const trimmed = symptoms.trim();

    if (trimmed.length === 0) {
      setFetchError("Please describe your symptoms.");
      return;
    }

    if (trimmed.length > 200) {
      setFetchError("Please keep symptoms under 200 characters.");
      return;
    }

    setFetchError(null);

    try {
      const result = await refetch();
      if (result.error) {
        setFetchError(extractErrorMessage(result.error));
      }

      setShowResults(true);
    } catch (err) {
      setFetchError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-card p-8">
        <Eyebrow>Describe symptoms</Eyebrow>
        <h3 className="mt-3 text-2xl">What&rsquo;s bothering you?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Be specific — duration, severity, anything you&rsquo;ve tried.
          We&rsquo;ll match you to the right specialist.
        </p>
        <Textarea
          rows={4}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. Sharp chest pain when exercising, started 3 days ago. No history of heart issues."
          className="mt-4"
        />
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={symptoms.trim().length < 8 || isFetching}
            className="rounded-full"
          >
            {isFetching ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" />
            )}
            {isFetching ? "Finding..." : "Find specialists"}
          </Button>

          {showResults && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-full"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="space-y-4">
          <Eyebrow>Top matches</Eyebrow>

          {/* specializations */}
          {data?.specializations && data.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.specializations.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="rounded-full bg-background px-3 py-1 font-normal"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {isLoading || isFetching ? (
              <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching for
                matches
              </div>
            ) : Array.isArray(data?.doctors) && data!.doctors.length > 0 ? (
              data!.doctors.map((d: any) => (
                <DoctorCard key={d.id} doctor={d} />
              ))
            ) : (
              <div className="col-span-full rounded-[1rem] bg-muted p-6 text-sm text-muted-foreground">
                {fetchError
                  ? fetchError
                  : error
                    ? extractErrorMessage(error)
                    : "No matches found. Try adding more detail or changing symptoms."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
