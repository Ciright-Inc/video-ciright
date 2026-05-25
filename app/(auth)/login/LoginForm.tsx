"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircleIcon, UserIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";

type LoginFormProps = {
  callbackUrl?: string;
};

export default function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
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
              htmlFor="login-username"
              className="text-sm font-bold text-ink"
            >
              Username
            </FieldLabel>
            <InputGroup className="h-13 rounded-2xl border-hairline bg-canvas-soft/80 px-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:bg-surface-card has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_10px_30px_rgba(0,48,135,0.09)]">
              <InputGroupAddon align="inline-start">
                <UserIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Ciright username"
                autoComplete="username"
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

      <div className="rounded-3xl border border-hairline-soft bg-canvas-soft/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <UserIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Ciright account</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Sign in with your Ciright username and password. Your uploads,
              subscriptions, and channel tools stay connected to your account.
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
