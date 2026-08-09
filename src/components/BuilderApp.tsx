"use client";

import { useMemo, useState } from "react";
import { PaginatedPreview } from "@/components/PaginatedPreview";
import { ResumeDocument, type Density } from "@/components/ResumeDocument";
import { AiPanel, DEFAULT_AI_CONFIG, type AiConfig } from "@/components/panels/AiPanel";
import { BasicsPanel } from "@/components/panels/BasicsPanel";
import { ContentPanel } from "@/components/panels/ContentPanel";
import { SkillsPanel } from "@/components/panels/SkillsPanel";
import { TailorPanel } from "@/components/panels/TailorPanel";
import { VersionsPanel } from "@/components/panels/VersionsPanel";
import { Button, Card, Field, TextArea, TextInput } from "@/components/ui";
import { masterResume } from "@/data/resume";
import { useIsClient, usePersistentState } from "@/lib/usePersistentState";
import { applyPlan, DEFAULT_TAILOR_OPTIONS, fullPlan, type TailorOptions } from "@/lib/tailor";
import type { Basics, Resume, SkillGroup, TailorPlan } from "@/lib/types";
import {
  createVersion,
  mergeLibraries,
  parseLibrary,
  serializeLibrary,
  VERSIONS_STORAGE_KEY,
  type ResumeVersion,
} from "@/lib/versions";

type Status = { tone: "info" | "error"; message: string } | null;

const basePlan = fullPlan(masterResume);

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function BuilderApp() {
  const isClient = useIsClient();
  const [basics, setBasics] = usePersistentState<Basics>("resume:basics", masterResume.basics);
  const [skills, setSkills] = usePersistentState<SkillGroup[]>("resume:skills", masterResume.skills);
  const [skillsTitle, setSkillsTitle] = usePersistentState("resume:skillsTitle", "Technical Skills");
  const [plan, setPlan] = usePersistentState<TailorPlan>("resume:plan", basePlan);
  const [jobDescription, setJobDescription] = usePersistentState("resume:jd", "");
  const [options, setOptions] = usePersistentState<TailorOptions>(
    "resume:options",
    DEFAULT_TAILOR_OPTIONS,
  );
  const [aiConfig, setAiConfig] = usePersistentState<AiConfig>("resume:ai", DEFAULT_AI_CONFIG);
  const [density, setDensity] = usePersistentState<Density>("resume:density", "comfortable");
  const [versions, setVersions] = usePersistentState<ResumeVersion[]>(VERSIONS_STORAGE_KEY, []);
  const [activeVersionId, setActiveVersionId] = usePersistentState<string | null>(
    "resume:activeVersion",
    null,
  );

  const [source, setSource] = useState<"ai" | "local" | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [versionBusyId, setVersionBusyId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  // Bumped when skills are replaced wholesale, to reset the editor's drafts.
  const [skillsRevision, setSkillsRevision] = useState(0);

  const master = useMemo(
    () => ({ ...masterResume, basics, skills, skillsTitle }),
    [basics, skills, skillsTitle],
  );
  const resume = useMemo(() => applyPlan(master, plan), [master, plan]);

  async function requestPdf(
    target: Resume,
    targetDensity: Density,
    label?: string,
  ): Promise<boolean> {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: target, density: targetDensity, label }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setStatus({ tone: "error", message: data.error ?? "PDF export failed." });
      return false;
    }

    const filename =
      response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "resume.pdf";
    triggerDownload(await response.blob(), filename);
    setStatus({ tone: "info", message: `Downloaded ${filename}.` });
    return true;
  }

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
      setActiveVersionId(null);
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
    setActiveVersionId(null);
    setStatus({ tone: "info", message: "Restored the full master profile." });
  }

  async function handleDownload() {
    setIsExporting(true);
    setStatus(null);
    try {
      const active = versions.find((version) => version.id === activeVersionId);
      const ok = await requestPdf(resume, density, active?.name);
      if (!ok) handlePrint();
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

  /**
   * A group the user just edited loses the ordering a tailoring run gave it,
   * so their own order is what gets printed until they tailor again.
   */
  function handleSkillsChange(next: SkillGroup[]) {
    const previousById = new Map(skills.map((group) => [group.id, group]));
    const nextIds = new Set(next.map((group) => group.id));
    const touched = new Set<string>();

    for (const group of next) {
      const previous = previousById.get(group.id);
      const changed =
        !previous ||
        previous.label !== group.label ||
        previous.items.join("\u0000") !== group.items.join("\u0000");
      if (changed) {
        touched.add(group.label);
        if (previous) touched.add(previous.label);
      }
    }
    for (const group of skills) {
      if (!nextIds.has(group.id)) touched.add(group.label);
    }

    setSkills(next);

    if (touched.size > 0 && plan.skillOrder) {
      setPlan({
        ...plan,
        skillOrder: Object.fromEntries(
          Object.entries(plan.skillOrder).filter(([label]) => !touched.has(label)),
        ),
      });
    }
  }

  function handleResetSkills() {
    setSkills(masterResume.skills);
    setSkillsTitle("Technical Skills");
    setPlan({ ...plan, skillOrder: {} });
    setSkillsRevision((revision) => revision + 1);
    setStatus({ tone: "info", message: "Skills restored to the master profile." });
  }

  function handleSaveVersion(name: string) {
    const version = createVersion(name, {
      jobDescription,
      plan,
      basics,
      density,
      source: source ?? "manual",
      skills,
      skillsTitle,
    });
    setVersions([version, ...versions]);
    setActiveVersionId(version.id);
    setStatus({ tone: "info", message: `Saved “${version.name}”.` });
  }

  function handleLoadVersion(version: ResumeVersion) {
    setPlan(version.plan);
    setBasics(version.basics);
    setSkills(version.skills ?? masterResume.skills);
    setSkillsTitle(version.skillsTitle ?? "Technical Skills");
    setSkillsRevision((revision) => revision + 1);
    setJobDescription(version.jobDescription);
    setDensity(version.density);
    setSource(version.source === "ai" || version.source === "local" ? version.source : null);
    setActiveVersionId(version.id);
    setStatus({ tone: "info", message: `Loaded “${version.name}”.` });
  }

  function handleRenameVersion(id: string, name: string) {
    setVersions(
      versions.map((version) =>
        version.id === id ? { ...version, name, updatedAt: new Date().toISOString() } : version,
      ),
    );
  }

  function handleDeleteVersion(id: string) {
    setVersions(versions.filter((version) => version.id !== id));
    if (activeVersionId === id) setActiveVersionId(null);
  }

  async function handleDownloadVersion(version: ResumeVersion) {
    setVersionBusyId(version.id);
    setStatus(null);
    try {
      const target = applyPlan(
        {
          ...masterResume,
          basics: version.basics,
          skills: version.skills ?? masterResume.skills,
          skillsTitle: version.skillsTitle,
        },
        version.plan,
      );
      await requestPdf(target, version.density, version.name);
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "PDF export failed.",
      });
    } finally {
      setVersionBusyId(null);
    }
  }

  function handleExportLibrary() {
    triggerDownload(
      new Blob([serializeLibrary(versions)], { type: "application/json" }),
      `resume-versions-${new Date().toISOString().slice(0, 10)}.json`,
    );
    setStatus({ tone: "info", message: "Exported a backup of every saved version." });
  }

  async function handleImportLibrary(file: File) {
    try {
      const incoming = parseLibrary(await file.text());
      setVersions(mergeLibraries(versions, incoming));
      setStatus({ tone: "info", message: `Imported ${incoming.length} version(s).` });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "That backup could not be read.",
      });
    }
  }

  if (!isClient) {
    return <div className="p-6 text-sm text-slate-500">Loading your resume workspace…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 lg:flex-row lg:p-6 print:!m-0 print:!block print:!p-0">
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

        <VersionsPanel
          versions={versions}
          activeId={activeVersionId}
          busyId={versionBusyId}
          onSave={handleSaveVersion}
          onLoad={handleLoadVersion}
          onRename={handleRenameVersion}
          onDelete={handleDeleteVersion}
          onDownload={handleDownloadVersion}
          onExport={handleExportLibrary}
          onImport={handleImportLibrary}
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

        <SkillsPanel
          key={skillsRevision}
          title={skillsTitle}
          groups={skills}
          onTitleChange={setSkillsTitle}
          onChange={handleSkillsChange}
          onReset={handleResetSkills}
        />

        <ContentPanel
          master={master}
          keptIds={plan.keepBulletIds}
          rewrites={plan.rewrites ?? {}}
          onChange={(keepBulletIds) => setPlan({ ...plan, keepBulletIds })}
        />

        <BasicsPanel basics={basics} onChange={setBasics} />
        <AiPanel config={aiConfig} onChange={setAiConfig} />
      </aside>

      <main className="screen-only min-w-0 flex-1">
        <div className="no-print mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Button variant="primary" onClick={handleDownload} disabled={isExporting}>
            {isExporting ? "Generating…" : "Download PDF"}
          </Button>
          <Button onClick={handlePrint}>Print</Button>
          <Button
            onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}
            title="Tighten the spacing to fit more on each page"
          >
            {density === "compact" ? "Compact spacing" : "Comfortable spacing"}
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span>
              {pageCount} {pageCount === 1 ? "page" : "pages"} · {plan.keepBulletIds.length} bullets
            </span>
            <span className="text-slate-300">|</span>
            <Button
              variant="ghost"
              className="px-2 py-1"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            >
              −
            </Button>
            <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              className="px-2 py-1"
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            >
              +
            </Button>
          </div>
        </div>

        <PaginatedPreview zoom={zoom} onPageCountChange={setPageCount}>
          <ResumeDocument resume={resume} density={density} />
        </PaginatedPreview>
      </main>

      {/* The preview repeats the document once per page, so printing uses this
          single clean copy instead. */}
      <div className="print-only">
        <ResumeDocument resume={resume} density={density} />
      </div>
    </div>
  );
}
