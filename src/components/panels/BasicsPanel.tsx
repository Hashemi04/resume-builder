"use client";

import { Card, Field, TextInput } from "@/components/ui";
import type { Basics } from "@/lib/types";

export function BasicsPanel({
  basics,
  onChange,
}: {
  basics: Basics;
  onChange: (basics: Basics) => void;
}) {
  const set = <K extends keyof Basics>(key: K, value: Basics[K]) =>
    onChange({ ...basics, [key]: value });

  const setLink = (index: number, url: string) => {
    const links = basics.links.map((link, i) => (i === index ? { ...link, url } : link));
    onChange({ ...basics, links });
  };

  return (
    <Card title="Contact details" description="Empty links are hidden from the exported resume.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          {(id) => (
            <TextInput id={id} value={basics.name} onChange={(e) => set("name", e.target.value)} />
          )}
        </Field>
        <Field label="Location">
          {(id) => (
            <TextInput
              id={id}
              value={basics.location}
              onChange={(e) => set("location", e.target.value)}
            />
          )}
        </Field>
        <Field label="Phone">
          {(id) => (
            <TextInput id={id} value={basics.phone} onChange={(e) => set("phone", e.target.value)} />
          )}
        </Field>
        <Field label="Email">
          {(id) => (
            <TextInput id={id} value={basics.email} onChange={(e) => set("email", e.target.value)} />
          )}
        </Field>
        {basics.links.map((link, index) => (
          <Field key={link.label} label={link.label}>
            {(id) => (
              <TextInput
                id={id}
                value={link.url}
                placeholder={`${link.label.toLowerCase()}.com/your-handle`}
                onChange={(e) => setLink(index, e.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
    </Card>
  );
}
