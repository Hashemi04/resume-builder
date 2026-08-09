"use client";

import { useRef, useState } from "react";
import { Button, Card, Chip, TextInput } from "@/components/ui";
import { versionSubtitle, type ResumeVersion } from "@/lib/versions";

export function VersionsPanel({
  versions,
  activeId,
  busyId,
  onSave,
  onLoad,
  onRename,
  onDelete,
  onDownload,
  onExport,
  onImport,
}: {
  versions: ResumeVersion[];
  activeId: string | null;
  busyId: string | null;
  onSave: (name: string) => void;
  onLoad: (version: ResumeVersion) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDownload: (version: ResumeVersion) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const [name, setName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    onSave(name);
    setName("");
  }

  function commitRename(id: string) {
    if (renameValue.trim()) onRename(id, renameValue.trim());
    setRenamingId(null);
  }

  return (
    <Card
      title="Saved versions"
      description="Keep one version per application so you know exactly what you sent."
      action={<Chip>{versions.length}</Chip>}
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <TextInput
            value={name}
            placeholder="e.g. Divar — Senior Frontend"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
          />
          <Button variant="primary" onClick={handleSave} className="shrink-0">
            Save
          </Button>
        </div>

        {versions.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Nothing saved yet. Tailor the resume for a job, then save it under the company name.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {versions.map((version) => {
              const isActive = version.id === activeId;
              const isBusy = version.id === busyId;

              return (
                <li
                  key={version.id}
                  className={`rounded-lg border px-3 py-2 ${
                    isActive ? "border-slate-900 bg-slate-50" : "border-slate-200"
                  }`}
                >
                  {renamingId === version.id ? (
                    <div className="flex gap-2">
                      <TextInput
                        autoFocus
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commitRename(version.id);
                          if (event.key === "Escape") setRenamingId(null);
                        }}
                      />
                      <Button onClick={() => commitRename(version.id)} className="shrink-0">
                        Done
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{version.name}</span>
                        {isActive ? <Chip tone="good">loaded</Chip> : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">{versionSubtitle(version)}</p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <Button className="px-2 py-1 text-xs" onClick={() => onLoad(version)}>
                          Load
                        </Button>
                        <Button
                          className="px-2 py-1 text-xs"
                          disabled={isBusy}
                          onClick={() => onDownload(version)}
                        >
                          {isBusy ? "Generating…" : "PDF"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs"
                          onClick={() => {
                            setRenamingId(version.id);
                            setRenameValue(version.name);
                          }}
                        >
                          Rename
                        </Button>
                        {confirmingId === version.id ? (
                          <>
                            <Button
                              variant="ghost"
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => {
                                onDelete(version.id);
                                setConfirmingId(null);
                              }}
                            >
                              Confirm delete
                            </Button>
                            <Button
                              variant="ghost"
                              className="px-2 py-1 text-xs"
                              onClick={() => setConfirmingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="px-2 py-1 text-xs"
                            onClick={() => setConfirmingId(version.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex gap-2 border-t border-slate-100 pt-3">
          <Button className="flex-1" onClick={onExport} disabled={versions.length === 0}>
            Export backup
          </Button>
          <Button className="flex-1" onClick={() => fileInputRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </Card>
  );
}
