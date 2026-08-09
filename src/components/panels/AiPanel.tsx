"use client";

import { Card, Field, TextInput, Toggle } from "@/components/ui";

export type AiConfig = {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  model: string;
};

export const DEFAULT_AI_CONFIG: AiConfig = {
  enabled: true,
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
};

export function AiPanel({
  config,
  onChange,
}: {
  config: AiConfig;
  onChange: (config: AiConfig) => void;
}) {
  const set = <K extends keyof AiConfig>(key: K, value: AiConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <Card
      title="AI rewriting"
      description="Optional. Without a key the app still tailors the resume by keyword matching."
    >
      <div className="flex flex-col gap-3">
        <Toggle
          checked={config.enabled}
          onChange={(value) => set("enabled", value)}
          label="Use AI to rewrite the summary and bullet wording"
        />

        <Field
          label="API key"
          hint="Stored only in this browser. Leave empty to use the AI_API_KEY value from .env.local."
        >
          {(id) => (
            <TextInput
              id={id}
              type="password"
              autoComplete="off"
              placeholder="sk-…"
              value={config.apiKey}
              onChange={(event) => set("apiKey", event.target.value)}
            />
          )}
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Base URL" hint="Any OpenAI-compatible endpoint.">
            {(id) => (
              <TextInput
                id={id}
                value={config.baseUrl}
                onChange={(event) => set("baseUrl", event.target.value)}
              />
            )}
          </Field>
          <Field label="Model">
            {(id) => (
              <TextInput
                id={id}
                value={config.model}
                onChange={(event) => set("model", event.target.value)}
              />
            )}
          </Field>
        </div>
      </div>
    </Card>
  );
}
