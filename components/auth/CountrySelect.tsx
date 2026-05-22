"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { GlobeIcon } from "lucide-react";
import { CountryFlag } from "@/components/geo/CountryFlag";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { listCountryOptions } from "@/lib/geo/validCountryCode";

const MAX_VISIBLE = 60;

function CountryOptionRow({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <CountryFlag code={code} size="sm" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function filterCountryCodes(
  codes: string[],
  labelByCode: Map<string, string>,
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return codes.filter((code) => {
    const label = labelByCode.get(code) ?? "";
    return (
      label.toLowerCase().includes(q) || code.toLowerCase().includes(q)
    );
  });
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [menuWidth, setMenuWidth] = useState<number>();
  const anchorRef = useComboboxAnchor();
  const inputGroupRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => listCountryOptions(), []);
  const codes = useMemo(() => options.map((o) => o.code), [options]);
  const labelByCode = useMemo(
    () => new Map(options.map((o) => [o.code, o.label])),
    [options]
  );
  const filteredCodes = useMemo(
    () =>
      filterCountryCodes(codes, labelByCode, inputValue).slice(0, MAX_VISIBLE),
    [codes, labelByCode, inputValue]
  );
  const trimmedQuery = inputValue.trim();
  const showList = trimmedQuery.length > 0;

  useEffect(() => {
    if (menuOpen) return;
    setInputValue(value ? (labelByCode.get(value) ?? "") : "");
  }, [value, labelByCode, menuOpen]);

  useEffect(() => {
    const el = inputGroupRef.current;
    if (!el) return;

    const syncWidth = () => setMenuWidth(el.offsetWidth);
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

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
      <Combobox
        items={codes}
        filteredItems={showList ? filteredCodes : []}
        filter={null}
        value={value || null}
        onValueChange={(v) => {
          if (v == null) return;
          const code = String(v);
          onChange(code);
          setInputValue(labelByCode.get(code) ?? "");
        }}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        itemToStringLabel={(code) => labelByCode.get(code) ?? code}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) {
            setInputValue("");
          } else if (value) {
            setInputValue(labelByCode.get(value) ?? "");
          }
        }}
        autoHighlight
        highlightItemOnHover
        required={required}
        limit={MAX_VISIBLE}
      >
        <InputGroup
          ref={(node) => {
            inputGroupRef.current = node;
            anchorRef.current = node;
          }}
          className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-colors has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]"
        >
          <InputGroupAddon align="inline-start" className="pl-3">
            {value ? (
              <CountryFlag code={value} size="sm" />
            ) : (
              <GlobeIcon className="text-muted-foreground" aria-hidden />
            )}
          </InputGroupAddon>
          <ComboboxPrimitive.Input
            id={id}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            placeholder="Select your country"
            autoComplete="off"
            render={
              <InputGroupInput className="h-13 min-w-0 flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0" />
            }
          />
          <InputGroupAddon align="inline-end" className="pr-2">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              render={<ComboboxTrigger />}
              data-slot="input-group-button"
              className="data-pressed:bg-transparent"
            />
          </InputGroupAddon>
        </InputGroup>
        <ComboboxContent
          anchor={anchorRef}
          align="start"
          sideOffset={4}
          className="max-h-80 p-0"
          style={
            menuWidth
              ? { width: menuWidth, minWidth: menuWidth }
              : undefined
          }
        >
          {showList ? (
            <>
              <ComboboxEmpty className="flex py-6">
                No countries match &ldquo;{trimmedQuery}&rdquo;
              </ComboboxEmpty>
              <ComboboxList className="p-0">
                {(code) => (
                  <ComboboxItem
                    key={code}
                    value={code}
                    className="min-h-11 py-2 pl-2 pr-8"
                  >
                    <CountryOptionRow
                      code={code}
                      label={labelByCode.get(code) ?? code}
                    />
                  </ComboboxItem>
                )}
              </ComboboxList>
            </>
          ) : (
            <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
              Type to search {options.length} countries
            </p>
          )}
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
