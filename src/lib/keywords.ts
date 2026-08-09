/**
 * Maps the phrasing job ads use onto the tags used in the master profile.
 * Keys are matched case-insensitively against the raw job description text,
 * so multi-word phrases are allowed.
 */
export const KEYWORD_MAP: Record<string, string[]> = {
  vue: ["vue"],
  "vue.js": ["vue"],
  vuejs: ["vue"],
  vue3: ["vue"],
  nuxt: ["nuxt", "ssr"],
  "nuxt.js": ["nuxt", "ssr"],
  react: ["react"],
  "react.js": ["react"],
  reactjs: ["react"],
  next: ["next"],
  "next.js": ["next", "ssr"],
  nextjs: ["next", "ssr"],
  angular: ["angular"],
  svelte: ["svelte"],
  typescript: ["typescript"],
  javascript: ["javascript"],
  es6: ["javascript"],
  ssr: ["ssr"],
  "server-side rendering": ["ssr"],
  ssg: ["ssg"],
  "static site": ["ssg"],
  seo: ["seo"],
  "search engine": ["seo"],
  lighthouse: ["lighthouse", "performance"],
  "core web vitals": ["core-web-vitals", "performance"],
  performance: ["performance", "optimization"],
  optimization: ["optimization", "performance"],
  "bundle size": ["bundle", "performance"],
  "design system": ["design-system"],
  "component library": ["component-library", "design-system"],
  "reusable component": ["reusable", "component-library"],
  storybook: ["design-system", "component-library"],
  architecture: ["architecture"],
  scalable: ["scalability", "architecture"],
  scalability: ["scalability", "architecture"],
  maintainable: ["maintainability"],
  "state management": ["state-management"],
  pinia: ["pinia", "state-management"],
  vuex: ["state-management"],
  redux: ["redux", "state-management"],
  zustand: ["state-management"],
  "react query": ["state-management", "api"],
  tanstack: ["state-management", "api"],
  tailwind: ["tailwind", "css"],
  css: ["css"],
  scss: ["css"],
  sass: ["css"],
  "styled-components": ["css"],
  shadcn: ["tailwind", "ui"],
  responsive: ["responsive"],
  "mobile-first": ["mobile-first", "responsive"],
  mobile: ["mobile-first", "responsive"],
  accessibility: ["accessibility"],
  a11y: ["accessibility"],
  wcag: ["accessibility"],
  figma: ["figma", "design"],
  "pixel perfect": ["figma", "design"],
  ui: ["ui"],
  ux: ["ux"],
  test: ["testing"],
  testing: ["testing"],
  jest: ["testing"],
  vitest: ["testing"],
  cypress: ["testing"],
  playwright: ["testing"],
  "unit test": ["testing"],
  "e2e": ["testing"],
  tdd: ["testing"],
  api: ["api", "rest"],
  rest: ["rest", "api"],
  restful: ["rest", "api"],
  graphql: ["graphql", "api"],
  websocket: ["websocket", "realtime"],
  "real-time": ["realtime"],
  realtime: ["realtime"],
  "real time": ["realtime"],
  authentication: ["auth", "security"],
  authorization: ["authorization", "auth", "security"],
  oauth: ["auth", "security"],
  jwt: ["auth", "security"],
  rbac: ["rbac", "authorization"],
  "role-based": ["rbac", "authorization"],
  security: ["security"],
  dashboard: ["dashboard", "internal-tools"],
  "admin panel": ["dashboard", "admin", "internal-tools"],
  "internal tool": ["internal-tools"],
  "back office": ["dashboard", "internal-tools"],
  chart: ["charts", "data-visualization"],
  "data visualization": ["data-visualization", "charts"],
  analytics: ["data-visualization", "reporting"],
  reporting: ["reporting", "dashboard"],
  table: ["table", "data"],
  "data grid": ["table", "data"],
  pagination: ["pagination", "data"],
  filter: ["filtering", "data"],
  search: ["search", "data"],
  form: ["forms", "validation"],
  validation: ["validation", "forms"],
  pwa: ["pwa", "mobile-first"],
  "progressive web": ["pwa"],
  offline: ["offline", "pwa"],
  "service worker": ["service-worker", "pwa"],
  map: ["maps", "geolocation"],
  maps: ["maps", "geolocation"],
  geolocation: ["geolocation", "maps"],
  tracking: ["tracking"],
  logistics: ["logistics"],
  marketplace: ["marketplace", "e-commerce"],
  "e-commerce": ["e-commerce", "marketplace"],
  ecommerce: ["e-commerce", "marketplace"],
  checkout: ["e-commerce", "payments"],
  payment: ["payments", "fintech"],
  fintech: ["fintech", "payments"],
  wallet: ["wallet", "payments"],
  saas: ["b2b", "product"],
  b2b: ["b2b"],
  landing: ["landing-page", "marketing"],
  marketing: ["marketing"],
  git: ["git"],
  gitlab: ["gitlab", "git"],
  github: ["git"],
  "ci/cd": ["gitlab", "git"],
  docker: ["docker"],
  "code review": ["code-review", "quality"],
  "merge request": ["code-review", "git"],
  "pull request": ["code-review", "git"],
  refactor: ["refactoring", "maintainability"],
  debug: ["debugging"],
  troubleshoot: ["debugging", "support"],
  monitoring: ["monitoring", "production"],
  production: ["production"],
  incident: ["incident", "production"],
  mentor: ["mentoring", "leadership"],
  mentoring: ["mentoring", "leadership"],
  coaching: ["coaching", "mentoring"],
  lead: ["leadership"],
  leadership: ["leadership"],
  senior: ["senior", "leadership"],
  ownership: ["ownership"],
  "cross-functional": ["cross-functional", "collaboration"],
  collaborate: ["collaboration"],
  stakeholder: ["stakeholders", "communication"],
  communication: ["communication"],
  agile: ["agile"],
  scrum: ["agile"],
  jira: ["agile"],
  "product manager": ["product", "cross-functional"],
  startup: ["ownership", "product"],
};

const STOP_WORDS = new Set([
  "a","about","above","after","again","all","also","am","an","and","any","are","as","at","be","because","been",
  "before","being","below","between","both","but","by","can","did","do","does","doing","down","during","each",
  "few","for","from","further","had","has","have","having","he","her","here","hers","him","his","how","i","if",
  "in","into","is","it","its","itself","just","me","more","most","my","no","nor","not","now","of","off","on",
  "once","only","or","other","our","ours","out","over","own","same","she","should","so","some","such","than",
  "that","the","their","them","then","there","these","they","this","those","through","to","too","under","until",
  "up","very","was","we","were","what","when","where","which","while","who","whom","why","will","with","you",
  "your","yours","years","year","experience","team","teams","work","working","strong","good","great","plus",
  "must","need","needed","looking","role","job","company","position","ability","skills","knowledge","using",
  "use","used","well","new","other","across","within","etc","you'll","we're","our","join","help","build",
]);

/** Tags found in the job description, ranked by how often they were implied. */
export function extractTags(jobDescription: string): { tag: string; hits: number }[] {
  const text = ` ${jobDescription.toLowerCase()} `;
  const counts = new Map<string, number>();

  for (const [phrase, tags] of Object.entries(KEYWORD_MAP)) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9+#.-])${escaped}([^a-z0-9+#-]|$)`, "g");
    const hits = text.match(pattern)?.length ?? 0;
    if (hits === 0) continue;
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + hits);
    }
  }

  return [...counts.entries()]
    .map(([tag, hits]) => ({ tag, hits }))
    .sort((a, b) => b.hits - a.hits);
}

/** Meaningful free-text words from the job description, for secondary scoring. */
export function extractWords(jobDescription: string): Set<string> {
  return new Set(
    jobDescription
      .toLowerCase()
      .split(/[^a-z0-9+#.-]+/)
      .map((word) => word.replace(/^[.-]+|[.-]+$/g, ""))
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

/** The named technologies a job ad asks for, whether or not the profile has them. */
export function extractRequestedPhrases(jobDescription: string): string[] {
  const text = ` ${jobDescription.toLowerCase()} `;
  const found: string[] = [];
  for (const phrase of Object.keys(KEYWORD_MAP)) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z0-9+#.-])${escaped}([^a-z0-9+#-]|$)`).test(text)) {
      found.push(phrase);
    }
  }
  return found;
}
