import type { Resume } from "@/lib/types";

/**
 * The master profile: a superset of everything worth saying. Tailoring picks a
 * subset of these bullets, so keep adding to it over time instead of editing a
 * finished resume. A bullet that is not here can never appear in an export.
 */
export const masterResume: Resume = {
  basics: {
    name: "Seyed Mahdi Hashemi",
    headline: "Frontend Engineer | Vue.js, Nuxt.js, React & Next.js",
    location: "Iran",
    phone: "09361007380",
    email: "smhashemi.dev@gmail.com",
    links: [
      { label: "LinkedIn", url: "linkedin.com/in/s-m-hashemi" },
      { label: "GitHub", url: "" },
      { label: "Portfolio", url: "" },
    ],
  },

  summary:
    "Frontend Engineer building large-scale logistics platforms, operational dashboards and reusable component systems with Vue.js, Nuxt.js, React and Next.js. Contributed to products serving 300,000+ customers and 200,000+ registered drivers, owning features end to end from Figma to production. Comfortable across frontend architecture, design-system implementation, performance and SEO work, and mentoring other developers as a working-group lead.",

  experience: [
    {
      id: "ubaar",
      company: "Ubaar",
      role: "Frontend Developer",
      location: "Iran",
      start: "August 2025",
      end: "Present",
      duration: "1 year",
      companyNote: "Technology-driven logistics and transportation company.",
      bullets: [
        {
          id: "ubaar-b1",
          text: "Build and maintain scalable frontend applications supporting nationwide logistics and transportation operations.",
          tags: ["vue", "nuxt", "architecture", "scalability", "logistics"],
          priority: 5,
        },
        {
          id: "ubaar-b2",
          text: "Develop and maintain a reusable component system shared across multiple products and business units, cutting duplicated UI work between teams.",
          tags: ["design-system", "component-library", "reusable", "ui", "consistency"],
          priority: 5,
        },
        {
          id: "ubaar-b3",
          text: "Drive frontend architecture decisions covering state management, component standards, naming conventions and long-term maintainability.",
          tags: ["architecture", "state-management", "pinia", "standards", "maintainability", "senior"],
          priority: 5,
        },
        {
          id: "ubaar-b4",
          text: "Partner with Product Managers, Designers, Design Leadership and Backend Engineers to turn business requirements into shippable technical solutions.",
          tags: ["collaboration", "cross-functional", "product", "communication", "agile"],
          priority: 4,
        },
        {
          id: "ubaar-b5",
          text: "Improve frontend performance through rendering strategy, bundle optimization, SEO and responsive design practices.",
          tags: ["performance", "seo", "optimization", "bundle", "responsive", "core-web-vitals"],
          priority: 4,
        },
        {
          id: "ubaar-b6",
          text: "Investigate production incidents, debug API integrations and coordinate fixes with backend teams.",
          tags: ["debugging", "production", "api", "incident", "monitoring", "support"],
          priority: 3,
        },
        {
          id: "ubaar-b7",
          text: "Review peers' merge requests and share frontend patterns to raise code quality across the team.",
          tags: ["code-review", "mentoring", "quality", "collaboration", "git", "gitlab"],
          priority: 3,
        },
      ],
      projects: [
        {
          id: "ubaar-platform",
          name: "Customer Logistics Platform",
          summary:
            "Large-scale logistics product serving 300,000+ customers and 200,000+ registered drivers.",
          bullets: [
            {
              id: "ubaar-p1-b1",
              text: "Built end-to-end order submission workflows covering complex, multi-step business rules and validation.",
              tags: ["forms", "workflow", "validation", "business-logic", "ux"],
              priority: 5,
            },
            {
              id: "ubaar-p1-b2",
              text: "Implemented marketplace-style driver offers letting customers receive, compare and accept transportation bids.",
              tags: ["marketplace", "bidding", "realtime", "product", "e-commerce"],
              priority: 4,
            },
            {
              id: "ubaar-p1-b3",
              text: "Delivered real-time shipment tracking showing live driver location, shipment status and sender, receiver and cargo details.",
              tags: ["realtime", "maps", "tracking", "websocket", "geolocation", "data"],
              priority: 4,
            },
            {
              id: "ubaar-p1-b4",
              text: "Developed order management with server-side filtering, search, editing and status tracking over large datasets.",
              tags: ["data", "table", "filtering", "search", "pagination", "dashboard"],
              priority: 4,
            },
            {
              id: "ubaar-p1-b5",
              text: "Shipped Favorite Addresses and Similar Orders features that let customers reuse previous shipment data and measurably shorten order creation time.",
              tags: ["ux", "product", "conversion", "optimization", "feature"],
              priority: 3,
            },
            {
              id: "ubaar-p1-b6",
              text: "Built wallet management, pricing visibility and transaction interfaces handling money-sensitive flows.",
              tags: ["payments", "wallet", "fintech", "transactions", "pricing"],
              priority: 3,
            },
            {
              id: "ubaar-p1-b7",
              text: "Developed profile management and account settings experiences.",
              tags: ["auth", "account", "settings", "profile"],
              priority: 2,
            },
            {
              id: "ubaar-p1-b8",
              text: "Translated Figma designs into pixel-accurate responsive desktop and mobile interfaces alongside the design team.",
              tags: ["figma", "responsive", "mobile-first", "design", "css", "tailwind"],
              priority: 3,
            },
            {
              id: "ubaar-p1-b9",
              text: "Worked directly with stakeholders and end customers to refine workflows based on real usage feedback.",
              tags: ["stakeholders", "user-research", "communication", "product"],
              priority: 2,
            },
            {
              id: "ubaar-p1-b10",
              text: "Integrated and maintained complex API-driven business workflows across many backend services.",
              tags: ["api", "rest", "integration", "backend"],
              priority: 3,
            },
          ],
        },
        {
          id: "ubaar-website",
          name: "Ubaar Corporate Website",
          summary: "Public marketing site and primary acquisition channel.",
          bullets: [
            {
              id: "ubaar-p2-b1",
              text: "Led frontend development of the company website end to end.",
              tags: ["ownership", "leadership", "nuxt", "next", "marketing"],
              priority: 4,
            },
            {
              id: "ubaar-p2-b2",
              text: "Implemented an SEO-focused rendering architecture and performance budget that lifted Lighthouse scores and search visibility.",
              tags: ["seo", "ssr", "ssg", "performance", "lighthouse", "core-web-vitals", "nuxt", "next"],
              priority: 5,
            },
            {
              id: "ubaar-p2-b3",
              text: "Built a Fleet Guide tool that helps visitors identify the right transportation service for their cargo.",
              tags: ["product", "feature", "ux", "conversion"],
              priority: 2,
            },
            {
              id: "ubaar-p2-b4",
              text: "Created responsive marketing pages and app download journeys for both customers and drivers.",
              tags: ["responsive", "marketing", "landing-page", "mobile-first", "conversion"],
              priority: 3,
            },
            {
              id: "ubaar-p2-b5",
              text: "Developed lead-capture forms for corporate customers, freight owners and individual users.",
              tags: ["forms", "lead-generation", "validation", "marketing"],
              priority: 2,
            },
          ],
        },
      ],
    },
    {
      id: "achareh",
      company: "Achareh",
      role: "Frontend Developer",
      location: "Iran",
      start: "December 2024",
      end: "August 2025",
      duration: "8 months",
      companyNote: "Home and technical services marketplace.",
      bullets: [
        {
          id: "achareh-b1",
          text: "Built and maintained operational dashboard applications supporting core internal business processes.",
          tags: ["dashboard", "internal-tools", "react", "admin", "b2b"],
          priority: 5,
        },
        {
          id: "achareh-b2",
          text: "Created reusable UI components adopted across several products, speeding up delivery of new screens.",
          tags: ["design-system", "component-library", "reusable", "ui", "consistency"],
          priority: 4,
        },
        {
          id: "achareh-b3",
          text: "Worked with backend engineers to integrate REST APIs and encode business workflows in the UI.",
          tags: ["api", "rest", "integration", "collaboration", "backend"],
          priority: 3,
        },
        {
          id: "achareh-b4",
          text: "Contributed to frontend architecture and state-management decisions on new applications.",
          tags: ["architecture", "state-management", "redux", "standards"],
          priority: 4,
        },
        {
          id: "achareh-b5",
          text: "Implemented scalable design-system components in close collaboration with designers.",
          tags: ["design-system", "figma", "design", "css", "tailwind"],
          priority: 3,
        },
        {
          id: "achareh-b6",
          text: "Drove code-quality initiatives including refactoring, review standards and maintainability improvements.",
          tags: ["code-review", "quality", "refactoring", "testing", "maintainability"],
          priority: 3,
        },
      ],
      projects: [
        {
          id: "achareh-maintenance",
          name: "Maintenance Management Platform",
          bullets: [
            {
              id: "achareh-p1-b1",
              text: "Developed operational dashboards for attendance tracking, leave management and workflow automation.",
              tags: ["dashboard", "workflow", "automation", "internal-tools", "b2b"],
              priority: 4,
            },
            {
              id: "achareh-p1-b2",
              text: "Designed reusable UI patterns that improved development speed and visual consistency across the platform.",
              tags: ["design-system", "reusable", "consistency", "ui"],
              priority: 3,
            },
          ],
        },
        {
          id: "achareh-pwa",
          name: "Technician Service PWA",
          bullets: [
            {
              id: "achareh-p2-b1",
              text: "Built a Progressive Web App supporting technician field workflows on low-end mobile devices.",
              tags: ["pwa", "mobile-first", "offline", "performance", "service-worker"],
              priority: 4,
            },
            {
              id: "achareh-p2-b2",
              text: "Implemented authentication, API integration, media uploads and responsive interfaces.",
              tags: ["auth", "api", "upload", "responsive", "security"],
              priority: 3,
            },
          ],
        },
        {
          id: "achareh-finance",
          name: "Executive Financial Dashboard",
          bullets: [
            {
              id: "achareh-p3-b1",
              text: "Built financial reporting dashboards aggregating data from multiple backend services.",
              tags: ["dashboard", "data-visualization", "charts", "reporting", "fintech"],
              priority: 4,
            },
            {
              id: "achareh-p3-b2",
              text: "Implemented role-based access control and reusable charting and reporting components.",
              tags: ["rbac", "auth", "authorization", "charts", "data-visualization", "security"],
              priority: 3,
            },
          ],
        },
      ],
    },
  ],

  leadership: [
    {
      id: "sace",
      organization: "Scientific Association of Computer Engineering",
      institution: "Islamic Azad University of Karaj",
      roles: [
        {
          id: "sace-lead",
          title: "Frontend Working Group Lead",
          period: "2024 - Present",
          duration: "2 years",
          bullets: [
            {
              id: "sace-lead-b1",
              text: "Promoted from Frontend Developer to Frontend Working Group Lead.",
              tags: ["leadership", "promotion", "growth"],
              priority: 4,
            },
            {
              id: "sace-lead-b2",
              text: "Run weekly technical sessions on software engineering principles, frontend architecture and industry best practices.",
              tags: ["mentoring", "teaching", "architecture", "leadership", "communication"],
              priority: 4,
            },
            {
              id: "sace-lead-b3",
              text: "Mentor aspiring frontend developers through structured learning programs, assignments and technical feedback.",
              tags: ["mentoring", "coaching", "code-review", "leadership"],
              priority: 3,
            },
            {
              id: "sace-lead-b4",
              text: "Guide members through project implementation and career development while fostering knowledge sharing.",
              tags: ["mentoring", "leadership", "collaboration", "culture"],
              priority: 2,
            },
          ],
        },
        {
          id: "sace-dev",
          title: "Frontend Developer",
          period: "2022 - 2024",
          duration: "2 years",
          bullets: [
            {
              id: "sace-dev-b1",
              text: "Contributed to collaborative frontend projects and technical workshops supporting engineering education.",
              tags: ["community", "teaching", "collaboration"],
              priority: 2,
            },
          ],
        },
      ],
    },
  ],

  education: [
    {
      id: "edu-bsc",
      degree: "B.Sc. in Computer Engineering",
      institution: "Islamic Azad University of Karaj",
      period: "2022 - Present",
      note: "Pursuing the degree while working full-time as a Frontend Engineer.",
    },
  ],

  skills: [
    {
      id: "skills-frontend",
      label: "Frontend",
      items: ["Vue.js", "Nuxt.js", "React", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5"],
    },
    {
      id: "skills-state",
      label: "State & Data",
      items: ["Pinia", "Vuex", "Redux Toolkit", "REST APIs", "Authentication & Authorization"],
    },
    {
      id: "skills-styling",
      label: "Styling & UI",
      items: ["Tailwind CSS", "SCSS", "CSS3", "Bootstrap", "shadcn/ui", "Responsive & Mobile-First Design"],
    },
    {
      id: "skills-architecture",
      label: "Architecture",
      items: [
        "Frontend Architecture",
        "Design Systems",
        "Component Libraries",
        "SSR / SSG",
        "SEO",
        "Web Performance",
      ],
    },
    {
      id: "skills-testing",
      label: "Testing",
      items: ["Vitest", "Jest", "Cypress"],
    },
    {
      id: "skills-tools",
      label: "Tools",
      items: ["Git", "GitLab CI", "Docker", "Jira", "Trello", "Vercel", "Netlify", "Figma"],
    },
    {
      id: "skills-soft",
      label: "Ways of Working",
      items: [
        "Mentoring",
        "Code Reviews",
        "Technical Training",
        "Cross-Functional Collaboration",
        "Agile / Scrum",
      ],
    },
  ],

  languages: [
    { name: "Persian", level: "Native" },
    { name: "English", level: "Professional working proficiency (B1+, actively improving)" },
  ],
};
