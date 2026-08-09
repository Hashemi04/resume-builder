# Resume Tailor

One master profile, a different resume for every job ad, exported as a real
text-based PDF.

Paste a job description, press **Tailor resume**, and the app rebuilds the CV
from your master profile: it picks the most relevant bullets, reorders your
skills so the matching ones come first, and tells you which requirements your
profile does not cover. Then press **Download PDF**.

The preview is paginated exactly like the printed document, so you can see
which content lands on page one before you export, and every application you
send can be saved as a named version you can reload or re-download later.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

The core idea is that **you never edit a finished resume**. You maintain one
master profile in `src/data/resume.ts` that contains everything you have ever
done, and each application is a *selection* from it.

```
src/data/resume.ts       Master profile. Every bullet has tags and a priority.
src/lib/types.ts         Resume and TailorPlan shapes.
src/lib/keywords.ts      Maps job-ad phrasing ("SSR", "design system") onto tags.
src/lib/tailor.ts        Scores bullets against a job ad and applies a plan.
src/lib/ai.ts            Prompt, provider call, and validation of the AI response.
src/lib/versions.ts      Saved-version model, backup export and import.
src/components/          UI plus the printable ResumeDocument.
src/components/PaginatedPreview.tsx  Measures the document and splits it into pages.
src/styles/resumeCss.ts  The document stylesheet, in millimetres, A4.
src/lib/renderResumeHtml.tsx  Renders the resume as standalone HTML for the PDF.
src/lib/browser.ts       Launches local Chrome, or bundled Chromium when deployed.
src/app/api/tailor       POST a job description, get a TailorPlan back.
src/app/api/pdf          POST a resume, get a PDF back.
```

A **TailorPlan** never contains new experience. It only holds: which bullet ids
to keep, optional rewordings of those bullets, a skill ordering, and a headline
and summary. Anything the AI returns that does not correspond to a real bullet
id or a real skill is discarded before it reaches the document.

## Adding to your master profile

After every meaningful piece of work, add a bullet:

```ts
{
  id: "ubaar-b8",                       // must be unique and stable
  text: "Cut the order form's time to interactive from 4.1s to 1.8s by …",
  tags: ["performance", "optimization", "core-web-vitals"],
  priority: 4,                          // 5 = always keep, 1 = nice to have
}
```

Tags are matched against job descriptions, so use the vocabulary in
`src/lib/keywords.ts` and extend that map when you meet a term it does not know.

## Turning on AI

Copy `.env.example` to `.env.local` and set `AI_API_KEY`, or paste a key into
the **AI rewriting** panel (that stays in your browser's local storage and is
never committed). Any OpenAI-compatible endpoint works — change `AI_BASE_URL`
and `AI_MODEL` for OpenRouter, Groq, or a local model.

With a key, the AI also rewrites the summary and rewords bullets to mirror the
job ad. Without one, the app falls back to keyword matching, and it also falls
back automatically if the AI call fails.

## Page-accurate preview

The preview is not one long scroll: the document is measured off-screen and cut
into real A4 pages with the printed margins, and each page is labelled. Page
breaks are computed with the same rules the print stylesheet applies — a
`[data-block]` element is never split, and a `[data-keep-with-next]` heading
moves to the next page along with the content below it. If you change those
attributes in `ResumeDocument`, change the matching rules in `resumeCss.ts` too,
or the preview and the PDF will drift apart.

Page geometry comes from `@page` (print) and `.resume-page-frame` (screen),
never from padding on the document, because padding is applied once and would
leave page two starting flush against the paper edge.

## Editing the skills block

The skills section is fully editable from the sidebar, because it is the block
recruiters scan first and the one keyword filters read. You can rename the
section heading, rename any group, edit its items as comma-separated text,
reorder groups, add groups and remove them. A group with no items is left out
of the export, so you can park one while you decide.

Editing a group clears the ordering that a tailoring run gave *that* group, so
your manual order is what prints until you tailor again. Other groups keep
their job-optimised order. **Reset** restores the groups from
`src/data/resume.ts`.

Skills you change here are saved with the version, so an old application still
shows the exact skills list you sent. For a permanent change, edit
`src/data/resume.ts` as well, otherwise Reset will undo it.

## Saved versions

Every application can be saved under a name like "Snapp — Senior Frontend".
Each version stores the tailoring plan, the job description, your contact
details and the density — not rendered text — so reloading it restores the exact
resume you sent, while still picking up any later fixes to the master profile.

From the list you can load a version back into the editor, download its PDF
directly (the file is named after the version), rename it, or delete it.

Versions live in your browser's local storage. Use **Export backup** to write
the whole library to a JSON file, and **Import backup** to restore it on
another machine or browser; importing merges by id, so re-importing the same
file is safe.

## PDF export

**Download PDF** renders the resume in headless Chrome and downloads a real A4
PDF with selectable text, which is what applicant tracking systems need to parse
it. Locally it reuses the Chrome already installed on your machine; set
`PUPPETEER_EXECUTABLE_PATH` if it lives somewhere unusual. **Print** opens the
browser print dialog as a fallback.

The document is rendered to standalone HTML in the same request and handed to
Chrome directly, so nothing depends on a second HTTP round trip back into the
app. That is what makes the export work unchanged on a serverless host.

Use the **spacing** button to switch to compact if a resume spills onto an
almost-empty extra page.

## Deploying

The app is deployable as-is; the only host-specific part is the browser. When
`VERCEL`, `NETLIFY` or `AWS_LAMBDA_FUNCTION_NAME` is set, `src/lib/browser.ts`
loads a Chromium build packaged for those runtimes (`@sparticuz/chromium`)
instead of looking for a local install.

```bash
npx vercel        # preview deployment
npx vercel --prod # production
```

Or import the GitHub repository at vercel.com/new, which then redeploys on every
push. No environment variables are required — set `AI_API_KEY` only if you want
AI rewriting to work without pasting a key into the UI.

Two settings matter for the export and are already in the repo: the PDF route
declares `maxDuration = 60` because a cold Chromium start costs a few seconds,
and `next.config.ts` lists `puppeteer-core` and `@sparticuz/chromium` as
external so they are required from `node_modules` rather than bundled.

## Profile checklist

Things that would strengthen the resume and that only you can supply:

- **Numbers on outcomes.** "Improved Lighthouse scores" is weaker than "raised
  Lighthouse performance from 62 to 94". Same for bundle size, load time, and
  the order-creation time that Similar Orders saved.
- **GitHub and portfolio links.** Both fields are in the Contact panel and are
  hidden from the export while empty.
- **Team and scope.** How many engineers on the team, how many developers you
  mentor, how many components in the design system.
- **English level.** B1+ is stated honestly; retest and update once it moves,
  since it is the most common filter for remote roles.
