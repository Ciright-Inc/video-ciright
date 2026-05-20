"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function tagKey(tag: string): string {
  return tag.toLowerCase();
}

export type TagsInputProps = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  className?: string;
  "aria-invalid"?: boolean;
};

export function TagsInput({
  id,
  value,
  onChange,
  placeholder = "Type a tag and press Enter",
  disabled,
  maxTags,
  className,
  "aria-invalid": ariaInvalid,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  function focusInput() {
    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  const atLimit = maxTags !== undefined && value.length >= maxTags;

  function addTag(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag || atLimit) return;
    if (value.some((t) => tagKey(t) === tagKey(tag))) return;
    onChange([...value, tag]);
    setInputValue("");
  }

  function addTagsFromText(text: string) {
    const parts = text.split(/[,;\n]+/);
    let next = [...value];
    for (const part of parts) {
      const tag = normalizeTag(part);
      if (!tag) continue;
      if (maxTags !== undefined && next.length >= maxTags) break;
      if (next.some((t) => tagKey(t) === tagKey(tag))) continue;
      next = [...next, tag];
    }
    onChange(next);
    setInputValue("");
  }

  function removeTag(tagToRemove: string) {
    onChange(value.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handlePaste(text: string) {
    if (/[,;\n]/.test(text)) {
      addTagsFromText(text);
    }
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        ariaInvalid &&
          "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
        className
      )}
      onClick={focusInput}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="shrink-0 gap-1 bg-primary/10 pr-1 text-primary"
        >
          <span className="max-w-48 truncate">{tag}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-5 shrink-0 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            disabled={disabled}
            aria-label={`Remove tag ${tag}`}
          >
            <XIcon />
          </Button>
        </Badge>
      ))}

      <Input
        id={id}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue);
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[,;\n]/.test(text)) {
            e.preventDefault();
            handlePaste(text);
          }
        }}
        placeholder={atLimit ? "Tag limit reached" : placeholder}
        disabled={disabled || atLimit}
        aria-invalid={ariaInvalid}
        className="h-7 min-w-32 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent"
      />
    </div>
  );
}
