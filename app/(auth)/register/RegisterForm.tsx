"use client";

import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MailIcon, UserIcon } from "lucide-react";
import { CountrySelect } from "@/components/auth/CountrySelect";
import { PasswordField } from "@/components/auth/PasswordField";
import { PhoneField } from "@/components/auth/PhoneField";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { formatPhoneE164 } from "@/lib/geo/phone";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDialCountry, setPhoneDialCountry] = useState("US");
  const [phoneNational, setPhoneNational] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const nameStr = name.trim();
    if (!nameStr) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!countryCode) {
      setError("Please select your country");
      setLoading(false);
      return;
    }

    const phoneE164 = formatPhoneE164(phoneDialCountry, phoneNational);
    if (!phoneE164) {
      setError("Enter a valid mobile number for your country");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameStr,
        email,
        phone: phoneE164,
        password,
        countryCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      username: nameStr,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    const session = await getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!error || undefined}>
            <FieldLabel
              htmlFor="register-name"
              className="text-sm font-bold text-ink"
            >
              Name
            </FieldLabel>
            <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
              <InputGroupAddon align="inline-start">
                <UserIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                aria-invalid={!!error || undefined}
                className="h-13 text-base placeholder:text-muted-foreground/65"
              />
            </InputGroup>
          </Field>

          <Field data-invalid={!!error || undefined}>
            <FieldLabel
              htmlFor="register-email"
              className="text-sm font-bold text-ink"
            >
              Email address
            </FieldLabel>
            <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
              <InputGroupAddon align="inline-start">
                <MailIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-invalid={!!error || undefined}
                className="h-13 text-base placeholder:text-muted-foreground/65"
              />
            </InputGroup>
          </Field>

          <PhoneField
            id="register-phone"
            dialCountry={phoneDialCountry}
            onDialCountryChange={setPhoneDialCountry}
            nationalNumber={phoneNational}
            onNationalNumberChange={setPhoneNational}
            required
            invalid={!!error}
          />

          <PasswordField
            id="register-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            minLength={6}
            invalid={!!error}
          />

          <CountrySelect
            id="register-country"
            value={countryCode}
            onChange={setCountryCode}
            required
            invalid={!!error}
          />
        </FieldGroup>

        {error ? (
          <p
            className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm leading-6 text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-13 w-full rounded-2xl bg-primary text-[15px] font-black shadow-[0_18px_38px_rgba(0,48,135,0.28)] transition duration-200 hover:bg-primary-hover hover:shadow-[0_22px_46px_rgba(0,48,135,0.34)] active:translate-y-px"
        >
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-text-link transition hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
