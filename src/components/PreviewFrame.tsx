"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const A4_WIDTH_PX = 794; // 210mm at 96dpi

/**
 * Scales the fixed-width A4 document down to whatever space the preview column
 * has, without touching the document's own layout units.
 */
export function PreviewFrame({ children, zoom = 1 }: { children: ReactNode; zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const update = () => {
      const available = container.clientWidth;
      const next = Math.min(available / A4_WIDTH_PX, 1) * zoom;
      setScale(next);
      setHeight(content.offsetHeight * next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [zoom, children]);

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ height: height || undefined }} className="print:!h-auto">
        <div
          ref={contentRef}
          style={{ width: A4_WIDTH_PX, transform: `scale(${scale})`, transformOrigin: "top left" }}
          className="print:!w-auto print:!transform-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
