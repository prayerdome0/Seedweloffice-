"use client";

import { useEffect, useRef, useState } from "react";
import { PaperPreview, type PaperPreviewProps } from "./paper-preview";

/**
 * Renders a document preview only once it scrolls near the viewport.
 *
 * A gallery can hold 24 full A4 layouts; mounting them all at once would cost
 * a low-end phone several hundred milliseconds and a lot of memory, so each
 * paper waits its turn.
 */
export function LazyPaper({ placeholderHeight = 460, ...props }: PaperPreviewProps & { placeholderHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : placeholderHeight }}>
      {visible ? (
        <PaperPreview {...props} />
      ) : (
        <div className="skeleton w-full" style={{ height: placeholderHeight, borderRadius: 6 }} />
      )}
    </div>
  );
}
