import { NextResponse } from "next/server";
import type { Density } from "@/components/ResumeDocument";
import { masterResume } from "@/data/resume";
import { BrowserUnavailableError, launchBrowser } from "@/lib/browser";
import { renderResumeHtml } from "@/lib/renderResumeHtml";
import { applyPlan } from "@/lib/tailor";
import type { Resume, TailorPlan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function fileNameFor(resume: Resume, label?: string): string {
  const slug = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const name = slug(resume.basics.name) || "resume";
  // A saved version's name identifies the application better than the headline.
  const subject = label?.trim()
    ? slug(label).slice(0, 50)
    : slug(resume.basics.headline.split(/[|—-]/)[0] ?? "").slice(0, 40);
  return [name, subject, "Resume"].filter(Boolean).join("-") + ".pdf";
}

export async function POST(request: Request) {
  type PdfRequest = { resume?: Resume; plan?: TailorPlan; density?: Density; label?: string };
  let body: PdfRequest;
  try {
    body = (await request.json()) as PdfRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // A caller can send a finished resume, a tailoring plan, or nothing at all
  // and get the full master profile back.
  const resume = body.resume ?? applyPlan(masterResume, body.plan ?? null);

  if (!resume?.basics?.name) {
    return NextResponse.json({ error: "Missing resume payload." }, { status: 400 });
  }

  const html = await renderResumeHtml(
    resume,
    body.density === "compact" ? "compact" : "comfortable",
  );

  let browser;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    await page.emulateMediaType("print");

    // Page size and margins come from the @page rule in the document stylesheet.
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileNameFor(resume, body.label)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof BrowserUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    return NextResponse.json(
      {
        error: `PDF generation failed. ${error instanceof Error ? error.message : "Unknown error."}`,
      },
      { status: 500 },
    );
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
