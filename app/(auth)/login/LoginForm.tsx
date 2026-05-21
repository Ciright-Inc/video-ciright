"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircleIcon, MailIcon, ShieldCheckIcon } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

type LoginFormProps = {
  callbackUrl?: string;
  googleAuthEnabled?: boolean;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginForm({
  callbackUrl = "/",
  googleAuthEnabled = false,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup className="gap-5">
          <Field data-invalid={!!error || undefined}>
            <FieldLabel
              htmlFor="login-email"
              className="text-sm font-bold text-ink"
            >
              Email address
            </FieldLabel>
            <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
              <InputGroupAddon align="inline-start">
                <MailIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
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

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            invalid={!!error}
          />
        </FieldGroup>

        {error ? (
          <div
            className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm leading-6 text-destructive"
            role="alert"
          >
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{error}. Check your details and try again.</span>
          </div>
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {googleAuthEnabled ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-2xl border-hairline bg-surface-card text-sm font-bold shadow-sm transition duration-200 hover:border-primary/30 hover:bg-primary/5"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl })}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </>
      ) : null}

      <div className="rounded-3xl border border-hairline-soft bg-canvas-soft/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ShieldCheckIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Protected workspace</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your uploads, subscriptions, and channel tools stay connected to
              your account.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-text-link transition hover:opacity-80"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
