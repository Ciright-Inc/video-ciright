"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  invalid?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete,
  required,
  minLength,
  invalid,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </FieldLabel>
      <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
        <InputGroupAddon align="inline-start">
          <LockIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-invalid={invalid || undefined}
          className="h-13 text-base placeholder:text-muted-foreground/65"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            variant="ghost"
            className="rounded-xl text-muted-foreground hover:bg-primary/8 hover:text-primary"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
