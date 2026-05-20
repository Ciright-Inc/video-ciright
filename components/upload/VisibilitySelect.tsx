"use client";

import type { LucideIcon } from "lucide-react";
import { GlobeIcon, Link2Icon, LockIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const VISIBILITY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Everyone can see this video",
    icon: GlobeIcon,
  },
  {
    value: "UNLISTED",
    label: "Unlisted",
    description: "Only people with the link can watch",
    icon: Link2Icon,
  },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see this video",
    icon: LockIcon,
  },
] as const;

export type VisibilityValue = (typeof VISIBILITY_OPTIONS)[number]["value"];

function getVisibilityOption(value: string | null | undefined) {
  return VISIBILITY_OPTIONS.find((opt) => opt.value === value);
}

function VisibilityOptionContent({
  icon: Icon,
  label,
  description,
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <span className="flex w-full items-center gap-3">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
          compact ? "size-8" : "size-9"
        )}
      >
        <Icon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className={cn(
            "font-medium text-foreground",
            compact ? "text-sm" : "text-sm leading-none"
          )}
        >
          {label}
        </span>
        {!compact && (
          <span className="text-xs leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </span>
  );
}

type VisibilitySelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function VisibilitySelect({
  id,
  value,
  onValueChange,
  disabled,
}: VisibilitySelectProps) {
  const selected = getVisibilityOption(value);

  return (
    <Select
      value={value}
      onValueChange={(v) => v && onValueChange(v)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="h-11 w-full text-base data-[size=default]:h-11"
      >
        <SelectValue placeholder="Select visibility">
          {selected ? (
            <VisibilityOptionContent
              icon={selected.icon}
              label={selected.label}
              description={selected.description}
              compact
            />
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="p-1">
        <SelectGroup className="flex flex-col gap-0.5 p-0">
          <SelectLabel className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
            Who can watch
          </SelectLabel>
          {VISIBILITY_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="min-h-14 py-2.5 pr-10 pl-2 [&>span]:items-start [&>span]:whitespace-normal"
            >
              <VisibilityOptionContent
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
              />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
