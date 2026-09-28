"use client";

/**
 * A small abstract thumbnail of a template: enough structure to tell layouts
 * apart at a glance without shipping a screenshot for every design.
 */
export function TemplateThumb({ accent, variant, active }: { accent: string; variant: string; active?: boolean }) {
  const pale = `color-mix(in oklab, ${accent} 16%, #ffffff)`;
  const solid = `color-mix(in oklab, ${accent} 74%, #101827)`;
  const row = "#e8edf4";

  const pattern: { w: number; h: number; c: string; mt: number; center?: boolean }[] =
    variant === "minimal"
      ? [
          { w: 58, h: 6, c: solid, mt: 0 },
          { w: 34, h: 3, c: pale, mt: 6 },
          { w: 88, h: 3, c: row, mt: 12 },
          { w: 80, h: 3, c: row, mt: 4 },
          { w: 66, h: 3, c: row, mt: 4 },
        ]
      : variant === "creative"
        ? [
            { w: 100, h: 24, c: accent, mt: 0 },
            { w: 62, h: 5, c: solid, mt: 9 },
            { w: 90, h: 3, c: row, mt: 8 },
            { w: 46, h: 3, c: row, mt: 4 },
          ]
        : variant === "executive"
          ? [
              { w: 54, h: 7, c: solid, mt: 0, center: true },
              { w: 30, h: 3, c: pale, mt: 6, center: true },
              { w: 86, h: 3, c: row, mt: 13 },
              { w: 70, h: 3, c: row, mt: 4 },
            ]
          : [
              { w: 42, h: 7, c: solid, mt: 0 },
              { w: 86, h: 3, c: row, mt: 13 },
              { w: 74, h: 3, c: row, mt: 4 },
              { w: 28, h: 9, c: pale, mt: 9 },
            ];

  return (
    <div
      className="flex h-[72px] w-full flex-col overflow-hidden rounded-lg border p-2"
      style={{ borderColor: active ? `color-mix(in oklab, ${accent} 45%, var(--border))` : "var(--border)", background: "#fff" }}
      aria-hidden
    >
      {pattern.map((line, index) => (
        <div
          key={index}
          style={{
            width: `${line.w}%`,
            height: line.h,
            background: line.c,
            borderRadius: 2,
            marginTop: line.mt,
            marginLeft: line.center ? "auto" : undefined,
            marginRight: line.center ? "auto" : undefined,
          }}
        />
      ))}
    </div>
  );
}
