import type { Density } from "@/components/ResumeDocument";
import type { Basics, SkillGroup, TailorPlan } from "@/lib/types";

export const VERSIONS_STORAGE_KEY = "resume:versions";
const BACKUP_FORMAT = "resume-tailor.versions.v1";

/**
 * A saved application. Storing the plan rather than rendered text means an
 * old version still benefits from later fixes to the master profile, while the
 * selection and wording chosen for that job stay exactly as they were.
 */
export type ResumeVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  jobDescription: string;
  plan: TailorPlan;
  basics: Basics;
  density: Density;
  source: "ai" | "local" | "manual" | null;
  /** Absent on versions saved before skills became editable. */
  skills?: SkillGroup[];
  skillsTitle?: string;
};

export function createVersion(
  name: string,
  snapshot: Omit<ResumeVersion, "id" | "name" | "createdAt" | "updatedAt">,
): ResumeVersion {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
    name: name.trim() || `Version ${new Date().toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    ...snapshot,
  };
}

export function formatVersionDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "unknown date"
    : date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

/** A short label so a saved version is recognisable without opening it. */
export function versionSubtitle(version: ResumeVersion): string {
  const bullets = `${version.plan.keepBulletIds.length} bullets`;
  const origin =
    version.source === "ai" ? "AI" : version.source === "local" ? "keyword" : "manual";
  return `${formatVersionDate(version.updatedAt)} · ${bullets} · ${origin}`;
}

export function serializeLibrary(versions: ResumeVersion[]): string {
  return JSON.stringify({ format: BACKUP_FORMAT, exportedAt: new Date().toISOString(), versions }, null, 2);
}

function isVersion(value: unknown): value is ResumeVersion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ResumeVersion>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    !!candidate.plan &&
    Array.isArray(candidate.plan.keepBulletIds) &&
    !!candidate.basics &&
    typeof candidate.basics.name === "string"
  );
}

/** Parses a backup file, keeping only entries that are actually usable. */
export function parseLibrary(raw: string): ResumeVersion[] {
  const data = JSON.parse(raw) as unknown;
  const list = Array.isArray(data)
    ? data
    : ((data as { versions?: unknown }).versions as unknown[] | undefined);

  if (!Array.isArray(list)) throw new Error("That file does not contain a version list.");

  const versions = list.filter(isVersion).map((version) => ({
    ...version,
    density: version.density === "compact" ? ("compact" as const) : ("comfortable" as const),
    createdAt: version.createdAt ?? new Date().toISOString(),
    updatedAt: version.updatedAt ?? version.createdAt ?? new Date().toISOString(),
    jobDescription: version.jobDescription ?? "",
    source: version.source ?? null,
  }));

  if (versions.length === 0) throw new Error("No valid versions were found in that file.");
  return versions;
}

/** Imported entries win on id collisions, so re-importing a backup is safe. */
export function mergeLibraries(
  current: ResumeVersion[],
  incoming: ResumeVersion[],
): ResumeVersion[] {
  const byId = new Map(current.map((version) => [version.id, version]));
  for (const version of incoming) byId.set(version.id, version);
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
