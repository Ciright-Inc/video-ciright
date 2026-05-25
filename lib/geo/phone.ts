import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountryOption = {
  code: CountryCode;
  label: string;
  dialCode: string;
};

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

let cachedOptions: PhoneCountryOption[] | null = null;

export function listPhoneCountryOptions(): PhoneCountryOption[] {
  if (cachedOptions) return cachedOptions;

  cachedOptions = getCountries()
    .map((code) => ({
      code,
      label: displayNames.of(code) ?? code,
      dialCode: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

  return cachedOptions;
}

export function getPhoneDialCode(countryCode: string): string | null {
  try {
    return `+${getCountryCallingCode(countryCode as CountryCode)}`;
  } catch {
    return null;
  }
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhoneE164(
  countryCode: string,
  nationalNumber: string
): string | null {
  const digits = digitsOnly(nationalNumber);
  if (!digits) return null;

  const parsed = parsePhoneNumberFromString(digits, countryCode as CountryCode);
  if (!parsed?.isValid()) return null;

  return parsed.format("E.164");
}

export function parsePhoneE164(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed?.isValid()) return null;

  return parsed.format("E.164");
}

export function isValidNationalPhone(
  countryCode: string,
  nationalNumber: string
): boolean {
  return formatPhoneE164(countryCode, nationalNumber) !== null;
}
