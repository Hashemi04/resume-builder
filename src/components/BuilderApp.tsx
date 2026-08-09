"use client";

import { useMemo, useState } from "react";
import { PreviewFrame } from "@/components/PreviewFrame";
import { ResumeDocument } from "@/components/ResumeDocument";
import { AiPanel, DEFAULT_AI_CONFIG, type AiConfig } from "@/components/panels/AiPanel";
import { BasicsPanel } from "@/components/panels/BasicsPanel";
import { ContentPanel } from "@/components/panels/ContentPanel";
import { TailorPanel } from "@/components/panels/TailorPanel";
import { Button, Card, Field, TextArea, TextInput } from "@/components/ui";
import { masterResume } from "@/data/resume";
import { useIsClient, usePersistentState } from "@/lib/usePersistentState";
import { applyPlan, DEFAULT_TAILOR_OPTIONS, fullPlan, type TailorOptions } from "@/lib/tailor";
import type { Basics, TailorPlan } from "@/lib/types";

type Status = { tone: "info" | "error"; message: string } | null;

const basePlan = fullPlan(masterResume);

export function BuilderApp() {
  const isClient = useIsClient();
  const [basics, setBasics] = usePersistentState<Basics>("resume:basics", masterResume.basics);
  const [plan, setPlan] = usePersistentState<TailorPlan>("resume:plan", basePlan);
  const [jobDescription, setJobDescription] = usePersistentState("resume:jd", "");
  const [options, setOptions] = usePersistentState<TailorOptions>(
    "resume:options",
    DEFAULT_TAILOR_OPTIONS,
  );
  const [aiConfig, setAiConfig] = usePersistentState<AiConfig>("resume:ai", DEFAULT_AI_CONFIG);
  const [source, setSource] = useState<"ai" | "local" | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(1);

  const master = useMemo(() => ({ ...masterResume, basics }), [basics]);
  const resume = useMemo(() => applyPlan(master, plan), [master, plan]);

  const bulletCount = useMemo(() => plan.keepBulletIds.length, [plan.keepBulletIds]);

  async function handleTailor() {
    setIsTailoring(true);
    setStatus(null);
    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume: master,
          options,
          useAi: aiConfig.enabled,
          ai: aiConfig.enabled
            ? { apiKey: aiConfig.apiKey, baseUrl: aiConfig.baseUrl, model: aiConfig.model }
            : undefined,
        }),
      });

      const data = (await response.json()) as {
        plan?: TailorPlan;
        source?: "ai" | "local";
        warning?: string;
        error?: string;
      };

      if (!response.ok || !data.plan) {
        setStatus({ tone: "error", message: data.error ?? "Tailoring failed." });
        return;
      }

      setPlan(data.plan);
      setSource(data.source ?? "local");
      setStatus(
        data.warning
          ? { tone: "info", message: data.warning }
          : { tone: "info", message: "Resume updated for this job description." },
      );
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Tailoring request failed.",
      });
    } finally {
      setIsTailoring(false);
    }
  }

  function handleReset() {
    setPlan(basePlan);
    setSource(null);
    setStatus({ tone: "info", message: "Restored the full master profile." });
  }

  async function handleDownload() {
    setIsExporting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setStatus({
          tone: "error",
          message: `${data.error ?? "PDF export failed."} Falling back to the print dialog.`,
        });
        handlePrint();
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus({ tone: "info", message: "PDF downloaded." });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "PDF export failed.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handlePrint() {
    const previousTitle = document.title;
    document.title = `${basics.name} — Resume`;
    window.print();
    document.title = previousTitle;
  }

  if (!isClient) {
    return (
      <div className="p-6 text-sm text-slate-500">Loading your resume workspace…</div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
      <aside className="no-print flex w-full flex-col gap-4 lg:w-[420px] lg:shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Resume tailor</h1>
          <p className="mt-1 text-sm text-slate-600">
            One master profile, a different resume for every job ad.
          </p>
        </div>

        <TailorPanel
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          options={options}
          onOptionsChange={setOptions}
          onTailor={handleTailor}
          onReset={handleReset}
          isTailoring={isTailoring}
          status={status}
          plan={plan}
          source={source}
        />

        <Card title="Headline & summary" description="Edit the wording before exporting.">
          <div className="flex flex-col gap-3">
            <Field label="Headline">
              {(id) => (
                <TextInput
                  id={id}
                  value={plan.headline}
                  onChange={(event) => setPlan({ ...plan, headline: event.target.value })}
                />
              )}
            </Field>
            <Field label="Professional summary" hint="Three sentences is the sweet spot.">
              {(id) => (
                <TextArea
                  id={id}
                  rows={6}
                  value={plan.summary}
                  onChange={(event) => setPlan({ ...plan, summary: event.target.value })}
                />
              )}
            </Field>
          </div>
        </Card>

        <ContentPanel
          master={master}
          keptIds={plan.keepBulletIds}
          rewrites={plan.rewrites ?? {}}
          onChange={(keepBulletIds) => setPlan({ ...plan, keepBulletIds })}
        />

        <BasicsPanel basics={basics} onChange={setBasics} />
        <AiPanel config={aiConfig} onChange={setAiConfig} />
      </aside>

      <main className="min-w-0 flex-1">
        <div className="no-print mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Button variant="primary" onClick={handleDownload} disabled={isExporting}>
            {isExporting ? "Generating…" : "Download PDF"}
          </Button>
          <Button onClick={handlePrint}>Print</Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span>{bulletCount} bullets</span>
            <span className="text-slate-300">|</span>
            <Button variant="ghost" className="px-2 py-1" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
              −
            </Button>
            <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" className="px-2 py-1" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
              +
            </Button>
          </div>
        </div>

        <PreviewFrame zoom={zoom}>
          <ResumeDocument resume={resume} />
        </PreviewFrame>
      </main>
    </div>
  );
}
