"use client";

import { Button, Card, Chip, Field, TextArea, TextInput, Toggle } from "@/components/ui";
import type { TailorOptions } from "@/lib/tailor";
import type { TailorPlan } from "@/lib/types";

export function TailorPanel({
  jobDescription,
  onJobDescriptionChange,
  options,
  onOptionsChange,
  onTailor,
  onReset,
  isTailoring,
  status,
  plan,
  source,
}: {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  options: TailorOptions;
  onOptionsChange: (options: TailorOptions) => void;
  onTailor: () => void;
  onReset: () => void;
  isTailoring: boolean;
  status: { tone: "info" | "error"; message: string } | null;
  plan: TailorPlan | null;
  source: "ai" | "local" | null;
}) {
  return (
    <Card
      title="Target job"
      description="Paste the job ad. The resume is rebuilt from your master profile to match it."
      action={
        source ? (
          <Chip tone={source === "ai" ? "good" : "neutral"}>
            {source === "ai" ? "AI tailored" : "Keyword tailored"}
          </Chip>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Job description">
          {(id) => (
            <TextArea
              id={id}
              rows={9}
              value={jobDescription}
              placeholder="Paste the full job description here, including the requirements and nice-to-haves…"
              onChange={(event) => onJobDescriptionChange(event.target.value)}
            />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Max bullets per role">
            {(id) => (
              <TextInput
                id={id}
                type="number"
                min={2}
                max={10}
                value={options.maxBulletsPerRole}
                onChange={(event) =>
                  onOptionsChange({ ...options, maxBulletsPerRole: Number(event.target.value) })
                }
              />
            )}
          </Field>
          <Field label="Max bullets per project">
            {(id) => (
              <TextInput
                id={id}
                type="number"
                min={1}
                max={10}
                value={options.maxBulletsPerProject}
                onChange={(event) =>
                  onOptionsChange({ ...options, maxBulletsPerProject: Number(event.target.value) })
                }
              />
            )}
          </Field>
        </div>

        <Toggle
          checked={options.includeLeadership}
          onChange={(value) => onOptionsChange({ ...options, includeLeadership: value })}
          label="Include the leadership and community section"
        />

        <div className="flex gap-2">
          <Button variant="primary" onClick={onTailor} disabled={isTailoring} className="flex-1">
            {isTailoring ? "Tailoring…" : "Tailor resume"}
          </Button>
          <Button onClick={onReset} disabled={isTailoring}>
            Reset
          </Button>
        </div>

        {status ? (
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              status.tone === "error" ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-600"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        {plan?.notes?.length ? (
          <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
            {plan.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}

        {plan?.matchedKeywords?.length || plan?.missingKeywords?.length ? (
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            {plan.matchedKeywords?.length ? (
              <div className="flex flex-wrap gap-1">
                <span className="mr-1 text-[11px] font-semibold text-slate-700">Covered:</span>
                {plan.matchedKeywords.map((keyword) => (
                  <Chip key={keyword} tone="good">
                    {keyword}
                  </Chip>
                ))}
              </div>
            ) : null}
            {plan.missingKeywords?.length ? (
              <div className="flex flex-wrap gap-1">
                <span className="mr-1 text-[11px] font-semibold text-slate-700">Not in profile:</span>
                {plan.missingKeywords.map((keyword) => (
                  <Chip key={keyword} tone="warn">
                    {keyword}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
