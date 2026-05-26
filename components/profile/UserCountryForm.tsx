"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { patchProfileChannelCache } from "@/lib/queries/profile-cache";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { CountrySelect } from "@/components/auth/CountrySelect";
import { Button } from "@/components/ui/button";

export function UserCountryForm({
  initialCountryCode,
}: {
  initialCountryCode: string | null;
}) {
  const queryClient = useQueryClient();
  const [countryCode, setCountryCode] = useState(initialCountryCode ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!countryCode) {
      setError("Please select your country");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/user/country", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Failed to save country");
      return;
    }

    patchProfileChannelCache(queryClient, { countryCode });
    toast.success("Country updated");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-border bg-surface p-4"
    >
      <h2 className="text-sm font-semibold text-ink">Your country</h2>
      <p className="mt-1 text-xs text-secondary-foreground">
        Used for audience analytics when you watch, like, or subscribe. Leave
        unset to estimate location from IP until you choose one.
      </p>
      <div className="mt-4 max-w-md">
        <CountrySelect
          id="profile-country"
          value={countryCode}
          onChange={setCountryCode}
          invalid={!!error}
        />
      </div>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={saving} className="mt-4">
        {saving ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save country"
        )}
      </Button>
    </form>
  );
}
