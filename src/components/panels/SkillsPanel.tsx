"use client";

import { useState } from "react";
import { Button, Card, Field, TextArea, TextInput } from "@/components/ui";
import type { SkillGroup } from "@/lib/types";

function newGroupId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? `skills-${crypto.randomUUID().slice(0, 8)}`
    : `skills-${Date.now()}`;
}

export function parseSkillItems(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Full control over the skills block: rename the heading and each group,
 * reorder or remove groups, and edit the items as free text.
 *
 * Item text is held as a local draft so that typing a separator does not get
 * normalised away mid-keystroke. The panel is remounted (via a key in the
 * parent) whenever skills change from outside, which resets those drafts.
 */
export function SkillsPanel({
  title,
  groups,
  onTitleChange,
  onChange,
  onReset,
}: {
  title: string;
  groups: SkillGroup[];
  onTitleChange: (title: string) => void;
  onChange: (groups: SkillGroup[]) => void;
  onReset: () => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const update = (index: number, patch: Partial<SkillGroup>) =>
    onChange(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(groups.filter((_, i) => i !== index));

  const addGroup = () =>
    onChange([...groups, { id: newGroupId(), label: "New group", items: [] }]);

  const itemCount = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <Card
      title="Technical skills"
      description={`${groups.length} groups, ${itemCount} skills. This is the block recruiters scan first.`}
      action={
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onReset}>
          Reset
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Section heading">
          {(id) => (
            <TextInput
              id={id}
              value={title}
              placeholder="Technical Skills"
              onChange={(event) => onTitleChange(event.target.value)}
            />
          )}
        </Field>

        {groups.map((group, index) => (
          <div key={group.id} className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5">
              <TextInput
                value={group.label}
                aria-label={`Group ${index + 1} name`}
                onChange={(event) => update(index, { label: event.target.value })}
              />
              <Button
                variant="ghost"
                className="px-2 py-1"
                aria-label="Move group up"
                title="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1"
                aria-label="Move group down"
                title="Move down"
                disabled={index === groups.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1 text-red-600 hover:bg-red-50"
                aria-label="Remove group"
                title="Remove group"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </div>

            <TextArea
              className="mt-2"
              rows={2}
              aria-label={`${group.label} skills`}
              placeholder="Comma separated, in the order you want them printed"
              value={drafts[group.id] ?? group.items.join(", ")}
              onChange={(event) => {
                setDrafts({ ...drafts, [group.id]: event.target.value });
                update(index, { items: parseSkillItems(event.target.value) });
              }}
            />
          </div>
        ))}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={addGroup}>
            Add group
          </Button>
        </div>

        <p className="text-[11px] text-slate-500">
          Editing a group clears the ordering a tailoring run chose for it, so your order wins until
          you tailor again. Empty groups are left out of the export.
        </p>
      </div>
    </Card>
  );
}
