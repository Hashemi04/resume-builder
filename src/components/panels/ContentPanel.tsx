"use client";

import { useMemo, useState } from "react";
import { Button, Card, Toggle } from "@/components/ui";
import type { Bullet, Resume } from "@/lib/types";

type Group = { key: string; label: string; bullets: Bullet[] };

function collectGroups(resume: Resume): Group[] {
  const groups: Group[] = [];
  for (const job of resume.experience) {
    groups.push({ key: job.id, label: `${job.company} — role bullets`, bullets: job.bullets });
    for (const project of job.projects) {
      groups.push({
        key: project.id,
        label: `${job.company} / ${project.name}`,
        bullets: project.bullets,
      });
    }
  }
  for (const entry of resume.leadership) {
    for (const role of entry.roles) {
      groups.push({ key: role.id, label: `${entry.organization} — ${role.title}`, bullets: role.bullets });
    }
  }
  return groups;
}

export function ContentPanel({
  master,
  keptIds,
  rewrites,
  onChange,
}: {
  master: Resume;
  keptIds: string[];
  rewrites: Record<string, string>;
  onChange: (ids: string[]) => void;
}) {
  const groups = useMemo(() => collectGroups(master), [master]);
  const kept = useMemo(() => new Set(keptIds), [keptIds]);
  const [openGroup, setOpenGroup] = useState<string | null>(groups[0]?.key ?? null);

  const setBullet = (id: string, on: boolean) => {
    const next = new Set(kept);
    if (on) next.add(id);
    else next.delete(id);
    onChange([...next]);
  };

  const setGroup = (group: Group, on: boolean) => {
    const next = new Set(kept);
    for (const bullet of group.bullets) {
      if (on) next.add(bullet.id);
      else next.delete(bullet.id);
    }
    onChange([...next]);
  };

  return (
    <Card
      title="Included content"
      description={`${kept.size} bullets selected. Untick anything that does not help this application.`}
    >
      <div className="flex flex-col gap-1.5">
        {groups.map((group) => {
          const activeCount = group.bullets.filter((bullet) => kept.has(bullet.id)).length;
          const isOpen = openGroup === group.key;

          return (
            <div key={group.key} className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.key)}
                  className="flex flex-1 items-center gap-2 text-left text-xs font-semibold text-slate-800"
                >
                  <span className={`text-slate-400 transition ${isOpen ? "rotate-90" : ""}`}>›</span>
                  {group.label}
                  <span className="font-normal text-slate-500">
                    {activeCount}/{group.bullets.length}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  className="px-2 py-1 text-[11px]"
                  onClick={() => setGroup(group, activeCount < group.bullets.length)}
                >
                  {activeCount < group.bullets.length ? "All" : "None"}
                </Button>
              </div>

              {isOpen ? (
                <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2">
                  {group.bullets.map((bullet) => (
                    <div key={bullet.id}>
                      <Toggle
                        checked={kept.has(bullet.id)}
                        onChange={(value) => setBullet(bullet.id, value)}
                        label={rewrites[bullet.id] ?? bullet.text}
                      />
                      {rewrites[bullet.id] ? (
                        <p className="mt-1 pl-6 text-[11px] italic text-slate-400">
                          Original: {bullet.text}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
