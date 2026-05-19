import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";

interface LabeledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function LabeledInput({
  className,
  label,
  error,
  id,
  ...props
}: LabeledInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn("h-10", className)}
        {...props}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
