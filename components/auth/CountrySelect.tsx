"use client";

import { useMemo } from "react";
import { GlobeIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { listCountryOptions } from "@/lib/geo/validCountryCode";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  id: string;
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
  invalid?: boolean;
  className?: string;
};

export function CountrySelect({
  id,
  value,
  onChange,
  required = false,
  invalid = false,
  className,
}: CountrySelectProps) {
  const options = useMemo(() => listCountryOptions(), []);

  return (
    <Field data-invalid={invalid || undefined} className={className}>
      <FieldLabel htmlFor={id} className="text-sm font-bold text-ink">
        Country / region
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>
      <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=select-trigger]:focus-visible]:border-primary/50 has-[[data-slot=select-trigger]:focus-visible]:bg-surface-card has-[[data-slot=select-trigger]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
        <InputGroupAddon align="inline-start" className="pl-3">
          <GlobeIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <Select
          value={value || undefined}
          onValueChange={(v) => v && onChange(v)}
          required={required}
        >
          <SelectTrigger
            id={id}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            className={cn(
              "h-13 min-w-0 flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
            )}
          >
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {options.map(({ code, label }) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </InputGroup>
    </Field>
  );
}
