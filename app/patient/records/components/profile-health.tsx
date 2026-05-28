import { Patient } from "@/@types/patient";
import { useState } from "react";
import { toast } from "sonner";
import ChipList from "./chip-list";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ProfileHealth({ patient }: { patient: Patient }) {
  const [conditions, setConditions] = useState(patient.conditions);
  const [allergies, setAllergies] = useState(patient.allergies);
  const [medications, setMedications] = useState(patient.medications);
  const [notes, setNotes] = useState(patient.notes ?? "");

  // TODO
  const handleSave = () => {
    // update.mutate(
    //   {
    //     patientId: patient.id,
    //     data: { conditions, allergies, medications, notes },
    //   },
    //   { onSuccess: () => toast.success("Records saved") },
    // );
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <ChipList
        label="Conditions"
        items={conditions}
        onChange={setConditions}
      />
      <ChipList label="Allergies" items={allergies} onChange={setAllergies} />
      <ChipList
        label="Medications"
        items={medications}
        onChange={setMedications}
      />

      <div className="rounded-[2rem] bg-card p-6">
        <Eyebrow>Notes</Eyebrow>
        <Textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-3"
        />
        <Button
          className="mt-4 rounded-full"
          onClick={handleSave}
          disabled={false}
        >
          Save
        </Button>
      </div>
    </section>
  );
}
