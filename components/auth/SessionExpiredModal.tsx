"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSessionExpired } from "./SessionExpiredContext";

export function SessionExpiredModal() {
  const { open, setOpen } = useSessionExpired();
  const router = useRouter();
  const pathname = usePathname();

  if (!open) return null;

  const callbackUrl = pathname || "/";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2
          id="session-expired-title"
          className="text-lg font-semibold text-ink"
        >
          Session expired
        </h2>
        <p className="mt-2 text-sm text-body">
          Your session has expired. Please sign in again.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            onClick={() => setOpen(false)}
          >
            Dismiss
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={() => {
              setOpen(false);
              router.push(
                `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
              );
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
