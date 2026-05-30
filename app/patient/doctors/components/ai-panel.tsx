import { DoctorCard } from "@/components/cards/doctor-card";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { doctorApi } from "@/lib/api/doctor.api";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import type { SymptomSearchResult } from "@/@types/doctor";
import Empty from "@/components/ui-bits/empty";

const schema = z.object({
  symptoms: z
    .string()
    .min(8, "Please describe your symptoms (at least 8 characters).")
    .max(200, "Please keep symptoms under 200 characters."),
});

type FormValues = z.infer<typeof schema>;

export default function AIPanel() {
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { symptoms: "" },
  });

  const { data, isLoading, isFetching, error, isSuccess } =
    useQuery<SymptomSearchResult>({
      queryKey: ["symptom-search", submittedQuery],
      queryFn: () => doctorApi.searchSymptom(submittedQuery!),
      enabled: !!submittedQuery,
    });

  const onSubmit = ({ symptoms }: FormValues) => {
    setSubmittedQuery(symptoms.trim());
  };

  const handleReset = () => {
    setSubmittedQuery(null);
    reset();
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea
            rows={4}
            placeholder="e.g. Sharp chest pain when exercising, started 3 days ago. No history of heart issues."
            className="mt-4"
            {...register("symptoms")}
          />
          {errors.symptoms && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.symptoms.message}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              type="submit"
              disabled={isFetching}
              className="rounded-full"
            >
              {isFetching ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              {isFetching ? "Finding..." : "Find specialists"}
            </Button>
            {!isLoading && isSuccess && submittedQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="rounded-full"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {submittedQuery && (
        <div className="space-y-4">
          <Eyebrow>Top matches</Eyebrow>
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {isLoading || isFetching ? (
              <Empty label="Looking for doctors..." />
            ) : Array.isArray(data?.doctors) && data!.doctors.length > 0 ? (
              data!.doctors.map((d: any) => (
                <DoctorCard key={d.id} doctor={d} />
              ))
            ) : (
              <Empty
                label={
                  error
                    ? extractErrorMessage(error)
                    : "No matches found. Try adding more detail or changing symptoms."
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
