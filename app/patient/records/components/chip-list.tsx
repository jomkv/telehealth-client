import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ChipList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };

  return (
    <div className="rounded-[2rem] bg-card p-6">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-sm text-muted-foreground">None added.</span>
        )}
        {items.map((it) => (
          <Badge
            key={it}
            variant="outline"
            className="cursor-pointer rounded-full bg-background px-3 py-1 font-normal"
            onClick={() => onChange(items.filter((x) => x !== it))}
          >
            {it} ×
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add ${label.toLowerCase().slice(0, -1)}`}
          className="rounded-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
      </div>
    </div>
  );
}
