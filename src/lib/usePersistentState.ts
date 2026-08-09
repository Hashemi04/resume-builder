"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

const neverChanges = () => () => {};

/**
 * True only once the component is running in the browser. Callers use it to
 * skip the server render, which is what makes reading localStorage during
 * state initialisation safe.
 */
export function useIsClient() {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

/** State mirrored into localStorage so a tailored resume survives a refresh. */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota and privacy-mode failures.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
