import { ResumeDocument, type Density } from "@/components/ResumeDocument";
import { RESUME_CSS } from "@/styles/resumeCss";
import type { Resume } from "@/lib/types";

/*
 * A route handler is compiled under React's "react-server" condition, where
 * every react-dom/server export is replaced by a stub that throws. The ignore
 * comments keep the bundlers out of this import so Node resolves the real
 * server build at runtime instead.
 */
async function loadRenderer(): Promise<(node: React.ReactElement) => string> {
  const server: { renderToStaticMarkup: (node: React.ReactElement) => string } = await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ "react-dom/server.node"
  );
  return server.renderToStaticMarkup;
}

/**
 * Renders the resume as one self-contained HTML document: markup and stylesheet
 * inlined, no external requests.
 *
 * The PDF route hands this straight to headless Chrome via setContent instead of
 * pointing the browser at a route on the running server. That matters on
 * serverless hosts, where the browser's request would land in a different
 * function instance than the one holding the resume data.
 */
export async function renderResumeHtml(
  resume: Resume,
  density: Density = "comfortable",
): Promise<string> {
  const renderToStaticMarkup = await loadRenderer();
  const body = renderToStaticMarkup(<ResumeDocument resume={resume} density={density} />);
  const title = `${resume.basics.name} — Resume`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
</style>
<style>${RESUME_CSS}</style>
</head>
<body>${body}</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
