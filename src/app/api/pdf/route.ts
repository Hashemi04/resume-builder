import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { masterResume } from "@/data/resume";
import { findChromeExecutable } from "@/lib/chrome";
import { dropPrintJob, putPrintJob } from "@/lib/printStore";
import { applyPlan } from "@/lib/tailor";
import type { Resume, TailorPlan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function fileNameFor(resume: Resume): string {
  const slug = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const name = slug(resume.basics.name) || "resume";
  const role = slug(resume.basics.headline.split(/[|—-]/)[0] ?? "").slice(0, 40);
  return [name, role, "Resume"].filter(Boolean).join("-") + ".pdf";
}

export async function POST(request: Request) {
  let body: { resume?: Resume; plan?: TailorPlan };
  try {
    body = (await request.json()) as { resume?: Resume; plan?: TailorPlan };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // A caller can send a finished resume, a tailoring plan, or nothing at all
  // and get the full master profile back.
  const resume = body.resume ?? applyPlan(masterResume, body.plan ?? null);

  if (!resume?.basics?.name) {
    return NextResponse.json({ error: "Missing resume payload." }, { status: 400 });
  }

  const executablePath = findChromeExecutable();
  if (!executablePath) {
    return NextResponse.json(
      {
        error:
          "No Chrome or Chromium binary was found. Install Chrome, or set PUPPETEER_EXECUTABLE_PATH, or use the Print button instead.",
      },
      { status: 501 },
    );
  }

  const jobId = putPrintJob(resume);
  const printUrl = new URL(`/print/${jobId}`, request.url).toString();

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    const navigation = await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30_000 });
    if (!navigation?.ok()) {
      throw new Error(`The print page returned HTTP ${navigation?.status() ?? "no response"}.`);
    }
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileNameFor(resume)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `PDF generation failed. ${error instanceof Error ? error.message : "Unknown error."}`,
      },
      { status: 500 },
    );
  } finally {
    await browser?.close().catch(() => undefined);
    dropPrintJob(jobId);
  }
}
