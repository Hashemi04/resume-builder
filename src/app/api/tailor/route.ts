import { NextResponse } from "next/server";
import { masterResume } from "@/data/resume";
import { requestAiPlan, resolveAiSettings } from "@/lib/ai";
import { buildLocalPlan, DEFAULT_TAILOR_OPTIONS, type TailorOptions } from "@/lib/tailor";
import type { Resume } from "@/lib/types";

export const runtime = "nodejs";

type TailorRequest = {
  jobDescription?: string;
  resume?: Resume;
  options?: Partial<TailorOptions>;
  useAi?: boolean;
  ai?: { apiKey?: string; baseUrl?: string; model?: string };
};

export async function POST(request: Request) {
  let body: TailorRequest;
  try {
    body = (await request.json()) as TailorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jobDescription = body.jobDescription?.trim() ?? "";
  if (jobDescription.length < 30) {
    return NextResponse.json(
      { error: "Paste a bit more of the job description (at least 30 characters)." },
      { status: 400 },
    );
  }

  const resume = body.resume ?? masterResume;
  const options: TailorOptions = { ...DEFAULT_TAILOR_OPTIONS, ...body.options };
  const localPlan = buildLocalPlan(resume, jobDescription, options);

  if (body.useAi === false) {
    return NextResponse.json({ plan: localPlan, source: "local" });
  }

  const settings = resolveAiSettings(body.ai);
  if (!settings) {
    return NextResponse.json({
      plan: localPlan,
      source: "local",
      warning: "No AI key configured, so keyword matching was used instead.",
    });
  }

  try {
    const plan = await requestAiPlan(resume, jobDescription, settings);
    return NextResponse.json({ plan, source: "ai" });
  } catch (error) {
    return NextResponse.json({
      plan: localPlan,
      source: "local",
      warning: `AI tailoring failed, fell back to keyword matching. ${
        error instanceof Error ? error.message : "Unknown error."
      }`,
    });
  }
}
