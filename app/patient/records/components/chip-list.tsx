import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ChipList({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = Array.from(
      new Set([
        ...items,
        ...trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ]),
    );
    onChange(next);
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-sm"
          >
            {it}
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange(items.filter((x) => x !== it))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="rounded-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="h-10 rounded-full border border-foreground/20 px-4 text-sm"
          onClick={add}
        >
          Add
        </button>
      </div>
    </div>
  );
}
