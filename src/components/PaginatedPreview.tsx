"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const MM_TO_PX = 96 / 25.4;
const PAGE_WIDTH_PX = 210 * MM_TO_PX;
const PAGE_HEIGHT_PX = 297 * MM_TO_PX;
const MARGIN_TOP_PX = 13 * MM_TO_PX;
const MARGIN_BOTTOM_PX = 12 * MM_TO_PX;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - MARGIN_TOP_PX - MARGIN_BOTTOM_PX;

/**
 * Works out where the printed pages break by measuring the document, using the
 * same rules the print stylesheet applies: a [data-block] element is never
 * split, and a [data-keep-with-next] element moves with the block after it.
 *
 * Returns the vertical offset at which each page starts.
 */
function computePageOffsets(root: HTMLElement): number[] {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block]"));
  if (blocks.length === 0) return [0];

  const rootTop = root.getBoundingClientRect().top;
  const measured = blocks.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top - rootTop,
      bottom: rect.bottom - rootTop,
      keepWithNext: element.hasAttribute("data-keep-with-next"),
    };
  });

  const offsets = [0];
  let pageStart = 0;

  for (let index = 0; index < measured.length; index += 1) {
    const block = measured[index];
    if (block.bottom - pageStart <= CONTENT_HEIGHT_PX) continue;

    // Pull any headings immediately above this block onto the new page too.
    let first = index;
    while (first > 0 && measured[first - 1].keepWithNext) first -= 1;

    const nextStart = measured[first].top;
    // A single block taller than a page cannot be moved; let it overflow.
    if (nextStart <= pageStart) continue;

    offsets.push(nextStart);
    pageStart = nextStart;
  }

  return offsets;
}

export function PaginatedPreview({
  children,
  zoom = 1,
  onPageCountChange,
}: {
  children: ReactNode;
  zoom?: number;
  onPageCountChange?: (count: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState<number[]>([0]);
  const [fitScale, setFitScale] = useState(1);

  const remeasure = useCallback(() => {
    const measureRoot = measureRef.current;
    const container = containerRef.current;
    if (!measureRoot || !container) return;

    const nextOffsets = computePageOffsets(measureRoot);
    setOffsets((current) =>
      current.length === nextOffsets.length && current.every((v, i) => v === nextOffsets[i])
        ? current
        : nextOffsets,
    );
    onPageCountChange?.(nextOffsets.length);

    const available = container.clientWidth;
    setFitScale(Math.min(available / PAGE_WIDTH_PX, 1));
  }, [onPageCountChange]);

  useEffect(() => {
    remeasure();

    const observer = new ResizeObserver(remeasure);
    if (measureRef.current) observer.observe(measureRef.current);
    if (containerRef.current) observer.observe(containerRef.current);

    // Web fonts landing after first paint would shift every measurement.
    document.fonts?.ready.then(remeasure).catch(() => undefined);

    return () => observer.disconnect();
  }, [remeasure, children]);

  const scale = fitScale * zoom;
  const gap = 24;
  const stackHeight = offsets.length * PAGE_HEIGHT_PX * scale + (offsets.length - 1) * gap * scale;

  return (
    <div ref={containerRef} className="w-full">
      <div aria-hidden className="resume-root resume-measure" ref={measureRef}>
        {children}
      </div>

      <div style={{ height: stackHeight }}>
        <div
          style={{
            width: PAGE_WIDTH_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            display: "flex",
            flexDirection: "column",
            gap,
          }}
        >
          {offsets.map((offset, index) => (
            <div key={offset}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page {index + 1} of {offsets.length}
                </span>
                <span>A4 · 210 × 297 mm</span>
              </div>
              <div className="resume-root resume-page-frame">
                <div className="resume-page-viewport">
                  <div style={{ marginTop: -offset }}>{children}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
