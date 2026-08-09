import type { Resume, TailorPlan } from "@/lib/types";
import { analyzeCoverage, allBulletIds } from "@/lib/tailor";

export type AiSettings = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export function resolveAiSettings(overrides: AiSettings = {}): Required<AiSettings> | null {
  const apiKey = overrides.apiKey?.trim() || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (overrides.baseUrl?.trim() || process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
      /\/$/,
      "",
    ),
    model: overrides.model?.trim() || process.env.AI_MODEL || "gpt-4o-mini",
  };
}

type BulletCatalogEntry = { id: string; where: string; text: string; tags: string[] };

function bulletCatalog(resume: Resume): BulletCatalogEntry[] {
  const entries: BulletCatalogEntry[] = [];
  for (const job of resume.experience) {
    for (const bullet of job.bullets) {
      entries.push({ id: bullet.id, where: `${job.company} (role)`, text: bullet.text, tags: bullet.tags });
    }
    for (const project of job.projects) {
      for (const bullet of project.bullets) {
        entries.push({
          id: bullet.id,
          where: `${job.company} / ${project.name}`,
          text: bullet.text,
          tags: bullet.tags,
        });
      }
    }
  }
  for (const entry of resume.leadership) {
    for (const role of entry.roles) {
      for (const bullet of role.bullets) {
        entries.push({
          id: bullet.id,
          where: `${entry.organization} / ${role.title}`,
          text: bullet.text,
          tags: bullet.tags,
        });
      }
    }
  }
  return entries;
}

const SYSTEM_PROMPT = `You are a senior frontend engineering hiring manager and a professional resume writer.
You tailor an existing candidate profile to one specific job description.

Hard rules:
1. NEVER invent experience, employers, dates, metrics, technologies or achievements. You may only work with the bullets provided.
2. You select which existing bullet ids to keep, and you may rewrite the wording of kept bullets to mirror the job ad's vocabulary — but the underlying fact must stay identical and truthful.
3. If the job asks for something the candidate has not done, do not fake it. Report it in missingKeywords instead.
4. Keep the resume to roughly two A4 pages: about 4-6 bullets per role and 3-4 per project, dropping the least relevant ones.
5. Every bullet should read as: strong action verb + what was built + scope or impact. No first person, no "responsible for", no filler adjectives.
6. The summary is 3 sentences maximum, written in third person without pronouns, and must front-load the seniority, the stack the job asks for, and the candidate's real, verifiable scale figures.
7. The headline is a short job title line that mirrors the target role, using only technologies the candidate actually knows.

Answer with strict JSON only, no markdown fences, matching this shape:
{
  "headline": string,
  "summary": string,
  "keepBulletIds": string[],
  "rewrites": { "<bulletId>": "<rewritten text>" },
  "skillOrder": { "<skill group label>": string[] },
  "notes": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[]
}`;

function buildUserPrompt(resume: Resume, jobDescription: string): string {
  const catalog = bulletCatalog(resume)
    .map((entry) => `- ${entry.id} [${entry.where}] ${entry.text} (tags: ${entry.tags.join(", ")})`)
    .join("\n");

  const skills = resume.skills
    .map((group) => `- ${group.label}: ${group.items.join(", ")}`)
    .join("\n");

  return `CANDIDATE
Name: ${resume.basics.name}
Current headline: ${resume.basics.headline}
Current summary: ${resume.summary}

SKILL GROUPS (reorder items within a group; do not add items)
${skills}

AVAILABLE BULLETS (choose ids from this list only)
${catalog}

TARGET JOB DESCRIPTION
${jobDescription}

Return the JSON plan now.`;
}

function coerceStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function coerceRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "string") result[key] = item;
  }
  return result;
}

/** Drops anything the model made up so a bad response can never corrupt the resume. */
export function validatePlan(raw: unknown, resume: Resume, jobDescription: string): TailorPlan {
  const data = (raw ?? {}) as Record<string, unknown>;
  const validIds = new Set(allBulletIds(resume));
  const validLabels = new Set(resume.skills.map((group) => group.label));

  const keepBulletIds = coerceStringArray(data.keepBulletIds).filter((id) => validIds.has(id));

  const rewrites: Record<string, string> = {};
  for (const [id, text] of Object.entries(coerceRecord(data.rewrites))) {
    if (validIds.has(id) && text.trim().length > 0) rewrites[id] = text.trim();
  }

  const skillOrder: Record<string, string[]> = {};
  const rawSkillOrder = (data.skillOrder ?? {}) as Record<string, unknown>;
  for (const [label, items] of Object.entries(rawSkillOrder)) {
    if (!validLabels.has(label)) continue;
    const group = resume.skills.find((entry) => entry.label === label);
    skillOrder[label] = coerceStringArray(items).filter((item) => group?.items.includes(item));
  }

  const coverage = analyzeCoverage(resume, jobDescription);

  return {
    headline: typeof data.headline === "string" && data.headline.trim() ? data.headline.trim() : resume.basics.headline,
    summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : resume.summary,
    keepBulletIds: keepBulletIds.length > 0 ? keepBulletIds : allBulletIds(resume),
    rewrites,
    skillOrder,
    notes: coerceStringArray(data.notes),
    matchedKeywords: coerceStringArray(data.matchedKeywords).length
      ? coerceStringArray(data.matchedKeywords)
      : coverage.matched,
    missingKeywords: coerceStringArray(data.missingKeywords).length
      ? coerceStringArray(data.missingKeywords)
      : coverage.missing,
  };
}

function parseJsonLoosely(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("The model did not return JSON.");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

export async function requestAiPlan(
  resume: Resume,
  jobDescription: string,
  settings: Required<AiSettings>,
): Promise<TailorPlan> {
  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(resume, jobDescription) },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI request failed (${response.status}). ${detail.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The AI response was empty.");

  return validatePlan(parseJsonLoosely(content), resume, jobDescription);
}
