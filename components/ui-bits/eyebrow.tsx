import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("eyebrow", className)} {...props} />;
}
