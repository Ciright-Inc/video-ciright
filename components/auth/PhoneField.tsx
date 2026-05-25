"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CountryCode } from "libphonenumber-js";
import { CountryFlag } from "@/components/geo/CountryFlag";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
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
import {
  dialMenuHintVariants,
  dialMenuItemVariants,
  dialMenuListVariants,
  dialMenuPanelVariants,
  dialTriggerTap,
} from "@/components/auth/phone-field-motion";
import {
  digitsOnly,
  listPhoneCountryOptions,
  type PhoneCountryOption,
} from "@/lib/geo/phone";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 60;
const DEFAULT_COUNTRY: CountryCode = "US";

/** Shown when the menu opens before the user types */
const POPULAR_DIAL_COUNTRIES: CountryCode[] = [
  "US",
  "GB",
  "IN",
  "CA",
  "AU",
  "DE",
  "FR",
  "AE",
  "SG",
  "BR",
];

function filterPhoneCountries(
  options: PhoneCountryOption[],
  query: string
): PhoneCountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q) ||
      o.dialCode.includes(q.replace(/\s/g, ""))
  );
}

function DialCodeOptionRow({ option }: { option: PhoneCountryOption }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <CountryFlag code={option.code} size="sm" />
      <span className="truncate">{option.label}</span>
      <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
        {option.dialCode}
      </span>
    </span>
  );
}

type PhoneFieldProps = {
  id: string;
  dialCountry: string;
  onDialCountryChange: (code: string) => void;
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  className?: string;
};

export function PhoneField({
  id,
  dialCountry,
  onDialCountryChange,
  nationalNumber,
  onNationalNumberChange,
  required = false,
  invalid = false,
  className,
}: PhoneFieldProps) {
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuWidth, setMenuWidth] = useState<number>();
  const dialAnchorRef = useComboboxAnchor();
  const inputGroupRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => listPhoneCountryOptions(), []);
  const codes = useMemo(() => options.map((o) => o.code), [options]);
  const optionByCode = useMemo(
    () => new Map<CountryCode, PhoneCountryOption>(options.map((o) => [o.code, o])),
    [options]
  );
  const resolvedCountry = (dialCountry || DEFAULT_COUNTRY) as CountryCode;
  const selected =
    optionByCode.get(resolvedCountry) ?? optionByCode.get(DEFAULT_COUNTRY);
  const filteredCodes = useMemo(() => {
    const matches = filterPhoneCountries(options, searchValue);
    return matches.slice(0, MAX_VISIBLE).map((o) => o.code);
  }, [options, searchValue]);
  const trimmedQuery = searchValue.trim();
  const isSearching = trimmedQuery.length > 0;

  const displayCodes = useMemo(() => {
    if (isSearching) return filteredCodes;
    if (!menuOpen) return [];
    return POPULAR_DIAL_COUNTRIES.filter((code) => optionByCode.has(code));
  }, [isSearching, filteredCodes, menuOpen, optionByCode]);

  const menuMode = isSearching
    ? filteredCodes.length > 0
      ? "results"
      : "empty"
    : menuOpen
      ? "popular"
      : "idle";

  useEffect(() => {
    if (!dialCountry) {
      onDialCountryChange(DEFAULT_COUNTRY);
    }
  }, [dialCountry, onDialCountryChange]);

  useEffect(() => {
    const el = inputGroupRef.current;
    if (!el) return;

    const syncWidth = () => setMenuWidth(el.offsetWidth);
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const inputGroupClassName =
    "h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]";

  const motionOff = reducedMotion ?? false;

  return (
    <Field data-invalid={invalid || undefined} className={className}>
      <FieldLabel htmlFor={id} className="text-sm font-bold text-ink">
        Phone
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>

      <Combobox
        items={codes}
        filteredItems={displayCodes}
        filter={null}
        value={resolvedCountry}
        onValueChange={(v) => {
          if (v == null) return;
          onDialCountryChange(String(v));
          setSearchValue("");
          setMenuOpen(false);
        }}
        inputValue={searchValue}
        onInputValueChange={setSearchValue}
        itemToStringLabel={(code) => {
          const o = optionByCode.get(code as CountryCode);
          return o ? `${o.label} ${o.dialCode}` : code;
        }}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) setSearchValue("");
        }}
        autoHighlight
        highlightItemOnHover
        limit={MAX_VISIBLE}
      >
        <InputGroup ref={inputGroupRef} className={inputGroupClassName}>
          <InputGroupAddon
            align="inline-start"
            className="shrink-0 border-r border-hairline-soft py-0 pl-1 pr-0"
          >
            <div
              ref={(node) => {
                dialAnchorRef.current = node;
              }}
            >
              <motion.div whileTap={motionOff ? undefined : dialTriggerTap}>
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="xs"
                  render={<ComboboxTrigger />}
                  className="h-11 min-h-11 min-w-[5.25rem] gap-1.5 px-2 font-medium tabular-nums text-ink hover:bg-primary/5 data-pressed:bg-primary/8"
                  aria-label={`Country code ${selected?.dialCode ?? "+1"}. ${selected?.label ?? "United States"}`}
                >
                  {selected ? (
                    <CountryFlag code={selected.code} size="sm" />
                  ) : null}
                  <span>{selected?.dialCode ?? "+1"}</span>
                </InputGroupButton>
              </motion.div>
            </div>
          </InputGroupAddon>

          <InputGroupInput
            id={id}
            type="tel"
            inputMode="numeric"
            value={nationalNumber}
            onChange={(e) => onNationalNumberChange(digitsOnly(e.target.value))}
            placeholder="Mobile number"
            autoComplete="tel-national"
            required={required}
            aria-invalid={invalid || undefined}
            className="h-13 min-w-0 flex-1 text-base placeholder:text-muted-foreground/65"
          />
        </InputGroup>

        <ComboboxContent
          anchor={dialAnchorRef}
          align="start"
          sideOffset={6}
          className={cn(
            "max-h-80 overflow-hidden rounded-xl border-hairline p-0 shadow-[0_16px_48px_rgba(0,48,135,0.12)] ring-1 ring-foreground/8",
            "data-open:animate-none data-closed:animate-none"
          )}
          style={
            menuWidth ? { width: menuWidth, minWidth: menuWidth } : undefined
          }
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.div
                key="dial-menu-panel"
                className="flex flex-col"
                variants={motionOff ? undefined : dialMenuPanelVariants}
                initial={motionOff ? undefined : "hidden"}
                animate={motionOff ? undefined : "visible"}
                exit={motionOff ? undefined : "exit"}
              >
                <div className="border-b border-hairline-soft p-1.5">
                  <ComboboxInput
                    placeholder="Search country or code"
                    showTrigger={false}
                    className="h-9 w-full rounded-lg border-hairline bg-canvas-soft/80 shadow-none"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {menuMode === "empty" ? (
                    <motion.div
                      key="empty"
                      className="px-2.5 py-6 text-center"
                      variants={motionOff ? undefined : dialMenuHintVariants}
                      initial={motionOff ? undefined : "hidden"}
                      animate={motionOff ? undefined : "visible"}
                      exit={motionOff ? undefined : "exit"}
                    >
                      <p className="text-sm text-muted-foreground">
                        No countries match &ldquo;{trimmedQuery}&rdquo;
                      </p>
                    </motion.div>
                  ) : menuMode === "popular" ? (
                    <motion.div
                      key="popular"
                      className="flex flex-col"
                      variants={motionOff ? undefined : dialMenuHintVariants}
                      initial={motionOff ? undefined : "hidden"}
                      animate={motionOff ? undefined : "visible"}
                      exit={motionOff ? undefined : "exit"}
                    >
                      <p className="px-3 pt-2.5 pb-1 text-xs font-medium text-muted-foreground">
                        Popular codes
                      </p>
                      <motion.div
                        variants={motionOff ? undefined : dialMenuListVariants}
                        initial={motionOff ? undefined : "hidden"}
                        animate={motionOff ? undefined : "visible"}
                        exit={motionOff ? undefined : "hidden"}
                      >
                        <ComboboxList className="max-h-52 p-0 pb-1">
                          {(code) => {
                            const option = optionByCode.get(code as CountryCode);
                            if (!option) return null;
                            return (
                              <motion.div
                                key={code}
                                variants={
                                  motionOff ? undefined : dialMenuItemVariants
                                }
                              >
                                <ComboboxItem
                                  value={code}
                                  className="min-h-11 py-2 pl-2 pr-8"
                                >
                                  <DialCodeOptionRow option={option} />
                                </ComboboxItem>
                              </motion.div>
                            );
                          }}
                        </ComboboxList>
                      </motion.div>
                      <p className="border-t border-hairline-soft px-3 py-2.5 text-center text-xs text-muted-foreground">
                        Or type to search all countries
                      </p>
                    </motion.div>
                  ) : menuMode === "results" ? (
                    <motion.div
                      key="results"
                      className="flex flex-col"
                      variants={motionOff ? undefined : dialMenuListVariants}
                      initial={motionOff ? undefined : "hidden"}
                      animate={motionOff ? undefined : "visible"}
                      exit={motionOff ? undefined : "hidden"}
                    >
                      <ComboboxEmpty className="flex py-6">
                        No countries match &ldquo;{trimmedQuery}&rdquo;
                      </ComboboxEmpty>
                      <ComboboxList className="max-h-60 p-0 pb-1">
                        {(code) => {
                          const option = optionByCode.get(code as CountryCode);
                          if (!option) return null;
                          return (
                            <motion.div
                              key={code}
                              variants={
                                motionOff ? undefined : dialMenuItemVariants
                              }
                            >
                              <ComboboxItem
                                value={code}
                                className="min-h-11 py-2 pl-2 pr-8"
                              >
                                <DialCodeOptionRow option={option} />
                              </ComboboxItem>
                            </motion.div>
                          );
                        }}
                      </ComboboxList>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
