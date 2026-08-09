export type Bullet = {
  id: string;
  text: string;
  /** Lowercase keywords used to score this bullet against a job description. */
  tags: string[];
  /** Baseline importance, 1 (nice to have) to 5 (always keep). */
  priority: number;
};

export type Project = {
  id: string;
  name: string;
  summary?: string;
  bullets: Bullet[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location?: string;
  start: string;
  end: string;
  companyNote?: string;
  bullets: Bullet[];
  projects: Project[];
};

export type LeadershipRole = {
  id: string;
  title: string;
  period: string;
  bullets: Bullet[];
};

export type Leadership = {
  id: string;
  organization: string;
  institution?: string;
  roles: LeadershipRole[];
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  period: string;
  note?: string;
};

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export type Language = {
  name: string;
  level: string;
};

export type Basics = {
  name: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  links: { label: string; url: string }[];
};

export type Resume = {
  basics: Basics;
  summary: string;
  experience: Experience[];
  leadership: Leadership[];
  education: Education[];
  skills: SkillGroup[];
  /** Heading for the skills section. Defaults to "Technical Skills". */
  skillsTitle?: string;
  languages: Language[];
};

/**
 * The instructions a tailoring pass produces. Content is only ever selected,
 * reordered or rephrased from the master profile, never invented, so the
 * resume cannot drift away from the truth.
 */
export type TailorPlan = {
  headline: string;
  summary: string;
  /** Bullet ids to keep, across every experience and project. */
  keepBulletIds: string[];
  /** Optional rewrites keyed by bullet id, for wording closer to the job ad. */
  rewrites?: Record<string, string>;
  /** Skill group label -> ordered items, so matching skills surface first. */
  skillOrder?: Record<string, string[]>;
  /** Short note shown in the UI explaining the choices. */
  notes?: string[];
  /** Keywords found in the job description that the resume now covers. */
  matchedKeywords?: string[];
  /** Keywords found in the job description with no support in the profile. */
  missingKeywords?: string[];
};
