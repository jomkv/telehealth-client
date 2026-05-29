import { Patient } from "@/@types/patient";
import { useState } from "react";
import ChipList from "./chip-list";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileHealth({ patient }: { patient: Patient }) {
  const [weight, setWeight] = useState(patient.weight?.toString() ?? "");
  const [height, setHeight] = useState(patient.height?.toString() ?? "");
  const [conditions, setConditions] = useState(patient.conditions);
  const [allergies, setAllergies] = useState(patient.allergies);
  const [medications, setMedications] = useState(patient.medications);
  const [notes, setNotes] = useState(patient.notes ?? "");

  const handleSave = () => {
    // update.mutate(...)
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 items-start">
      {/* Weight */}
      <div className="rounded-[2rem] bg-card p-6 space-y-3">
        <Eyebrow>Weight (kg)</Eyebrow>
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="62"
          className="rounded-full"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      {/* Height */}
      <div className="rounded-[2rem] bg-card p-6 space-y-3">
        <Eyebrow>Height (cm)</Eyebrow>
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="168"
          className="rounded-full"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      {/* Chip lists — full width, all three grouped */}
      <div className="sm:col-span-2 rounded-[2rem] bg-card p-6 space-y-6">
        <ChipList
          label="Conditions"
          placeholder="Add condition"
          items={conditions}
          onChange={setConditions}
        />
        <ChipList
          label="Allergies"
          placeholder="Add allergy"
          items={allergies}
          onChange={setAllergies}
        />
        <ChipList
          label="Medications"
          placeholder="Add medication"
          items={medications}
          onChange={setMedications}
        />
      </div>

      {/* Notes — full width */}
      <div className="sm:col-span-2 rounded-[2rem] bg-card p-6 space-y-3">
        <Eyebrow>Notes</Eyebrow>
        <Textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add anything your care team should know."
        />
      </div>

      {/* Apply Changes */}
      <div className="sm:col-span-2 flex justify-end">
        <Button className="rounded-full px-8" onClick={handleSave}>
          Apply Changes
        </Button>
      </div>
    </section>
  );
}
