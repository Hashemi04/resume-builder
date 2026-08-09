import type { Bullet, Resume, TailorPlan } from "@/lib/types";
import { extractRequestedPhrases, extractTags, extractWords, KEYWORD_MAP } from "@/lib/keywords";

export type TailorOptions = {
  maxBulletsPerRole: number;
  maxBulletsPerProject: number;
  includeLeadership: boolean;
};

export const DEFAULT_TAILOR_OPTIONS: TailorOptions = {
  maxBulletsPerRole: 5,
  maxBulletsPerProject: 4,
  includeLeadership: true,
};

type ScoredBullet = { bullet: Bullet; score: number };

function scoreBullet(bullet: Bullet, tagWeights: Map<string, number>, words: Set<string>): number {
  // Baseline priority is weighted heavily enough that a career-defining bullet
  // survives even when a narrower one happens to match more keywords.
  let score = bullet.priority * 2.2;

  for (const tag of bullet.tags) {
    const weight = tagWeights.get(tag);
    if (weight) score += 3 + Math.min(weight, 3);
  }

  const bulletWords = bullet.text.toLowerCase().split(/[^a-z0-9+#.-]+/);
  let overlap = 0;
  for (const word of bulletWords) {
    if (word.length > 3 && words.has(word)) overlap += 1;
  }
  score += Math.min(overlap, 6) * 0.4;

  return score;
}

function pickBullets(
  bullets: Bullet[],
  limit: number,
  tagWeights: Map<string, number>,
  words: Set<string>,
): Bullet[] {
  const scored: ScoredBullet[] = bullets.map((bullet) => ({
    bullet,
    score: scoreBullet(bullet, tagWeights, words),
  }));

  const kept = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(limit, 1))
    .map((entry) => entry.bullet.id);

  // Preserve the author's original ordering, which reads better than score order.
  return bullets.filter((bullet) => kept.includes(bullet.id));
}

function resumeText(resume: Resume): string {
  const parts: string[] = [resume.summary, resume.basics.headline];
  for (const group of resume.skills) parts.push(group.label, ...group.items);
  for (const job of resume.experience) {
    parts.push(job.company, job.role, job.companyNote ?? "");
    for (const bullet of job.bullets) parts.push(bullet.text, ...bullet.tags);
    for (const project of job.projects) {
      parts.push(project.name, project.summary ?? "");
      for (const bullet of project.bullets) parts.push(bullet.text, ...bullet.tags);
    }
  }
  return parts.join(" ").toLowerCase();
}

function profileTags(resume: Resume): Set<string> {
  const tags = new Set<string>();
  for (const job of resume.experience) {
    for (const bullet of job.bullets) bullet.tags.forEach((tag) => tags.add(tag));
    for (const project of job.projects) {
      for (const bullet of project.bullets) bullet.tags.forEach((tag) => tags.add(tag));
    }
  }
  for (const entry of resume.leadership) {
    for (const role of entry.roles) {
      for (const bullet of role.bullets) bullet.tags.forEach((tag) => tags.add(tag));
    }
  }
  return tags;
}

export function analyzeCoverage(resume: Resume, jobDescription: string) {
  const text = resumeText(resume);
  const tags = profileTags(resume);

  // Several phrasings ("next", "next.js") share a canonical tag; report the
  // most specific one only, so the keyword lists stay readable.
  const byCanonicalTag = new Map<string, string>();
  for (const phrase of extractRequestedPhrases(jobDescription)) {
    const canonical = KEYWORD_MAP[phrase]?.[0] ?? phrase;
    const current = byCanonicalTag.get(canonical);
    if (!current || phrase.length > current.length) byCanonicalTag.set(canonical, phrase);
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const [canonical, phrase] of byCanonicalTag) {
    // Only the canonical tag counts: "graphql" also maps to "api", and the
    // profile having API work does not mean it has GraphQL work.
    const supported = tags.has(canonical) || text.includes(phrase) || text.includes(canonical);
    (supported ? matched : missing).push(phrase);
  }

  return { matched, missing };
}

/**
 * Heuristic tailoring used when no AI key is configured. It never invents
 * content: it only selects, reorders and reprioritises what already exists.
 */
export function buildLocalPlan(
  resume: Resume,
  jobDescription: string,
  options: TailorOptions = DEFAULT_TAILOR_OPTIONS,
): TailorPlan {
  const tagHits = extractTags(jobDescription);
  const tagWeights = new Map(tagHits.map(({ tag, hits }) => [tag, hits]));
  const words = extractWords(jobDescription);

  const keepBulletIds: string[] = [];
  for (const job of resume.experience) {
    keepBulletIds.push(
      ...pickBullets(job.bullets, options.maxBulletsPerRole, tagWeights, words).map((b) => b.id),
    );
    for (const project of job.projects) {
      keepBulletIds.push(
        ...pickBullets(project.bullets, options.maxBulletsPerProject, tagWeights, words).map(
          (b) => b.id,
        ),
      );
    }
  }
  if (options.includeLeadership) {
    for (const entry of resume.leadership) {
      for (const role of entry.roles) {
        keepBulletIds.push(...pickBullets(role.bullets, 3, tagWeights, words).map((b) => b.id));
      }
    }
  }

  const skillOrder: Record<string, string[]> = {};
  for (const group of resume.skills) {
    skillOrder[group.label] = [...group.items].sort((a, b) => {
      const rank = (item: string) => {
        const lower = item.toLowerCase();
        const hit = tagHits.find(
          ({ tag }) => lower.includes(tag.replace(/-/g, " ")) || lower.includes(tag),
        );
        return hit ? -hit.hits : 0;
      };
      return rank(a) - rank(b);
    });
  }

  const { matched, missing } = analyzeCoverage(resume, jobDescription);
  const topTags = tagHits.slice(0, 6).map(({ tag }) => tag);

  return {
    headline: resume.basics.headline,
    summary: resume.summary,
    keepBulletIds,
    skillOrder,
    matchedKeywords: matched,
    missingKeywords: missing,
    notes: [
      topTags.length
        ? `Prioritised bullets covering: ${topTags.join(", ")}.`
        : "No recognised keywords in the job description, so baseline priorities were used.",
      "Keyword matching only. Add an AI key to also rewrite the summary and bullet wording.",
    ],
  };
}

/** Turns a plan into a concrete resume that the template can render. */
export function applyPlan(resume: Resume, plan: TailorPlan | null): Resume {
  if (!plan) return resume;

  const keep = new Set(plan.keepBulletIds);
  const rewrites = plan.rewrites ?? {};
  const mapBullet = (bullet: Bullet): Bullet => ({
    ...bullet,
    text: rewrites[bullet.id]?.trim() || bullet.text,
  });
  const filterBullets = (bullets: Bullet[]) => bullets.filter((b) => keep.has(b.id)).map(mapBullet);

  return {
    ...resume,
    basics: { ...resume.basics, headline: plan.headline || resume.basics.headline },
    summary: plan.summary || resume.summary,
    experience: resume.experience.map((job) => ({
      ...job,
      bullets: filterBullets(job.bullets),
      projects: job.projects
        .map((project) => ({ ...project, bullets: filterBullets(project.bullets) }))
        .filter((project) => project.bullets.length > 0),
    })),
    leadership: resume.leadership
      .map((entry) => ({
        ...entry,
        roles: entry.roles
          .map((role) => ({ ...role, bullets: filterBullets(role.bullets) }))
          .filter((role) => role.bullets.length > 0),
      }))
      .filter((entry) => entry.roles.length > 0),
    skills: resume.skills.map((group) => {
      const order = plan.skillOrder?.[group.label];
      if (!order) return group;
      const known = order.filter((item) => group.items.includes(item));
      const rest = group.items.filter((item) => !known.includes(item));
      return { ...group, items: [...known, ...rest] };
    }),
  };
}

export function allBulletIds(resume: Resume): string[] {
  const ids: string[] = [];
  for (const job of resume.experience) {
    ids.push(...job.bullets.map((b) => b.id));
    for (const project of job.projects) ids.push(...project.bullets.map((b) => b.id));
  }
  for (const entry of resume.leadership) {
    for (const role of entry.roles) ids.push(...role.bullets.map((b) => b.id));
  }
  return ids;
}

export function fullPlan(resume: Resume): TailorPlan {
  return {
    headline: resume.basics.headline,
    summary: resume.summary,
    keepBulletIds: allBulletIds(resume),
  };
}
