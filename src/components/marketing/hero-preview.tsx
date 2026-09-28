"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PaperPreview } from "@/components/document/paper-preview";
import { demoBusinesses, demoDocuments } from "@/lib/seed";
import { templatesFor } from "@/templates";
import type { DocKind } from "@/lib/types";

/**
 * The document shown on the marketing homepage: a real template rendered with
 * the same engine the app uses, cycling through a few modules so visitors see
 * what they are buying rather than a mock-up.
 */
export function HeroPreview({ kinds = ["invoice", "quotation", "cv", "proposal"] as DocKind[], interval = 6200 }: { kinds?: DocKind[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(560);
  const holder = useRef<HTMLDivElement>(null);

  const workspace = useMemo(() => {
    const businesses = demoBusinesses("preview");
    const documents = demoDocuments("preview");
    return { businesses, documents };
  }, []);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth || 560);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % kinds.length), interval);
    return () => window.clearInterval(timer);
  }, [kinds.length, interval]);

  const kind = kinds[index];
  const doc = useMemo(() => {
    const candidate = workspace.documents.find((d) => d.kind === kind);
    if (candidate) return candidate;
    const fallback = workspace.documents[0];
    const template = templatesFor(kind)[0];
    return { ...fallback, kind, design: { ...fallback.design, templateId: template?.id ?? fallback.design.templateId } };
  }, [workspace.documents, kind]);

  const business = workspace.businesses.find((b) => b.id === doc.businessId) ?? workspace.businesses[0];

  return (
    <div ref={holder} className="relative w-full">
      <div
        className="animate-fade-up overflow-hidden rounded-2xl border shadow-[var(--shadow-lift)]"
        style={{ borderColor: "var(--border)", background: "#fff" }}
      >
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          </div>
          <span className="truncate text-[0.6875rem] font-medium text-fg-subtle">
            {doc.number} · {doc.title}
          </span>
          <span className="text-[0.6875rem] text-fg-subtle">{index + 1}/{kinds.length}</span>
        </div>
        <div className="max-h-[520px] overflow-hidden p-3" style={{ background: "var(--canvas-tint)" }}>
          <PaperPreview doc={doc} business={business} fitWidth={Math.max(260, width - 24)} maxScale={1} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {kinds.map((item, itemIndex) => (
          <button
            key={item}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Show ${item} example`}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: itemIndex === index ? 26 : 10,
              background: itemIndex === index ? "var(--brand)" : "var(--border-strong)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
