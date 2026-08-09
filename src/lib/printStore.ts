import type { Resume } from "@/lib/types";

/**
 * Headless Chrome renders the resume by visiting /print/<id> in this same
 * process, so the payload only needs to survive that single round trip.
 */
const TTL_MS = 60_000;

type Entry = { resume: Resume; expiresAt: number };

/**
 * Next bundles route handlers and pages into separate module graphs, so a
 * plain module-level Map would give each of them its own copy. The store is
 * pinned to globalThis so both sides see the same jobs.
 */
const globalStore = globalThis as typeof globalThis & {
  __resumePrintStore?: Map<string, Entry>;
};
const store = (globalStore.__resumePrintStore ??= new Map<string, Entry>());

function sweep() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt <= now) store.delete(id);
  }
}

export function putPrintJob(resume: Resume): string {
  sweep();
  const id = crypto.randomUUID();
  store.set(id, { resume, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function getPrintJob(id: string): Resume | null {
  sweep();
  return store.get(id)?.resume ?? null;
}

export function dropPrintJob(id: string) {
  store.delete(id);
}
