"use client";

import { useEffect, useMemo } from "react";

/** Object URL for a `File`, revoked when the file changes or the component unmounts. */
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
}
