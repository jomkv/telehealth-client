import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Field({ label, error, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input className="rounded-full" {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
