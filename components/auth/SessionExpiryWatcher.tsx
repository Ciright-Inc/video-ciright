"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { SessionExpiredModal } from "./SessionExpiredModal";
import { SessionExpiredProvider, useSessionExpired } from "./SessionExpiredContext";

function SessionExpiryWatcherInner() {
  const { data: session, status } = useSession();
  const { triggerSessionExpired } = useSessionExpired();
  const fetchPatched = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef(status);
  const hadAuthenticatedRef = useRef(false);
  const authenticatedAtRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
    if (status === "authenticated") {
      if (!hadAuthenticatedRef.current) {
        authenticatedAtRef.current = Date.now();
      }
      hadAuthenticatedRef.current = true;
    }
  }, [status]);

  useEffect(() => {
    if (fetchPatched.current || typeof window === "undefined") return;
    fetchPatched.current = true;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await originalFetch(...args);
      try {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof Request
              ? args[0].url
              : "";
        if (
          res.status === 401 &&
          url.startsWith(window.location.origin) &&
          url.includes("/api/")
        ) {
          // Ignore auth endpoint responses and pre-auth transition races.
          if (url.includes("/api/auth/")) {
            return res;
          }
          if (!hadAuthenticatedRef.current || statusRef.current !== "authenticated") {
            return res;
          }
          if (
            authenticatedAtRef.current &&
            Date.now() - authenticatedAtRef.current < 10000
          ) {
            return res;
          }
          triggerSessionExpired();
        }
      } catch {
        // ignore URL parse issues
      }
      return res;
    };

    return () => {
      window.fetch = originalFetch;
      fetchPatched.current = false;
    };
  }, [triggerSessionExpired]);

  const expiresAt = session?.expires
    ? new Date(session.expires).getTime()
    : session?.expiresAt ?? null;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (status !== "authenticated" || !expiresAt || Number.isNaN(expiresAt)) {
      return;
    }

    // setTimeout uses a signed 32-bit int internally, so delays larger than
    // ~24.8 days overflow and fire immediately. Chain timeouts for long sessions.
    const MAX_DELAY = 2_147_483_000;

    function schedule() {
      const remaining = expiresAt! - Date.now();
      if (remaining <= 0) {
        void signOut({ redirect: false }).then(() => triggerSessionExpired());
        return;
      }
      timerRef.current = setTimeout(schedule, Math.min(remaining, MAX_DELAY));
    }

    schedule();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, expiresAt, triggerSessionExpired]);

  return <SessionExpiredModal />;
}

export function SessionExpiryWatcher() {
  return (
    <SessionExpiredProvider>
      <SessionExpiryWatcherInner />
    </SessionExpiredProvider>
  );
}
