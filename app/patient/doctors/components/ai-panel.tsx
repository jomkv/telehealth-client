import { DoctorCard, DoctorCardDoctor } from "@/components/cards/doctor-card";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DOCTORS } from "@/lib/mock-data/doctor";
import { Sparkles } from "lucide-react";
import { useState } from "react";

const AI_MATCHES: DoctorCardDoctor[] = [DOCTORS[0], DOCTORS[2]];

export default function AIPanel() {
  const [symptoms, setSymptoms] = useState("");
  const [showResults, setShowResults] = useState(false);

  function handleFind() {
    if (symptoms.trim().length >= 8) setShowResults(true);
  }

  function handleReset() {
    setShowResults(false);
    setSymptoms("");
  }

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
            onClick={handleFind}
            disabled={symptoms.trim().length < 8}
            className="rounded-full"
          >
            <Sparkles className="mr-1.5 h-4 w-4" /> Find specialists
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
          <div className="grid gap-6 md:grid-cols-2">
            {AI_MATCHES.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
