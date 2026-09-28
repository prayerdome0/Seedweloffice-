import type { CSSProperties, ReactNode } from "react";
import { FONT_STACK } from "@/lib/constants";
import type { TemplateContext } from "@/lib/types";
import { formatDate, formatNumber, withAlpha } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   Paper primitives — the shared vocabulary every document template draws with.
   Everything is inline-styled so the on-screen preview, print output and PDF
   raster are pixel-identical.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Tokens {
  accent: string;
  ink: string;
  body: string;
  muted: string;
  faint: string;
  rule: string;
  tint: string;
  soft: string;
  heading: string;
  sans: string;
  base: number;
  scale: number;
  pad: number;
}

export const tokens = (ctx: TemplateContext): Tokens => {
  const accent = ctx.design.accent || "#0e908f";
  const base = 13.4 * (ctx.design.fontScale || 1);
  return {
    accent,
    ink: "#101827",
    body: "#1f2937",
    muted: "#64748b",
    faint: "#94a3b8",
    rule: "#e3e8ef",
    tint: withAlpha(accent, 0.07),
    soft: withAlpha(accent, 0.14),
    heading: FONT_STACK(ctx.design.fontHeading),
    sans: FONT_STACK(ctx.design.fontBody),
    base,
    scale: ctx.design.fontScale || 1,
    pad: 52,
  };
};

export const px = (n: number) => `${n}px`;

export const money = (value: number, ctx: TemplateContext): string => {
  const decimals = ctx.payload.currency === "TZS" || ctx.payload.currency === "UGX" || ctx.payload.currency === "JPY" ? 0 : 2;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value ?? 0);
};

export const currencyCode = (ctx: TemplateContext) => ctx.payload.currency ?? ctx.doc.currency ?? "USD";

export const dt = (value: string | number | undefined, ctx: TemplateContext) =>
  formatDate(value, "dd MMM yyyy");

/** Small caps-ish label used above values everywhere. */
export const Label = ({ children, t, color, size = 8.4 }: { children: ReactNode; t: Tokens; color?: string; size?: number }) => (
  <div
    style={{
      fontFamily: t.sans,
      fontSize: px(size),
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: color ?? t.faint,
      lineHeight: 1.4,
    }}
  >
    {children}
  </div>
);

export const Rule = ({ color, style, mt = 0, mb = 0 }: { color?: string; style?: CSSProperties; mt?: number; mb?: number }) => (
  <div style={{ height: 1, background: color ?? "#e3e8ef", marginTop: mt, marginBottom: mb, ...style }} />
);

/* ── Page shell ──────────────────────────────────────────────────────────── */
export function PaperShell({
  ctx,
  children,
  style,
  sidebar,
  sidebarWidth = 236,
  sidebarSide = "left",
}: {
  ctx: TemplateContext;
  children: ReactNode;
  style?: CSSProperties;
  sidebar?: ReactNode;
  sidebarWidth?: number;
  sidebarSide?: "left" | "right";
}) {
  const t = tokens(ctx);
  const { design } = ctx;
  return (
    <div className="paper" style={{ fontFamily: t.sans, fontSize: px(t.base), color: t.body, ...style }}>
      {design.showWatermark && design.watermarkText ? <Watermark text={design.watermarkText} t={t} /> : null}
      {sidebar ? (
        <div style={{ display: "flex", minHeight: 1123, alignItems: "stretch", flexDirection: sidebarSide === "left" ? "row" : "row-reverse" }}>
          <div style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</div>
          <div style={{ flex: 1, minWidth: 0, padding: px(t.pad), position: "relative" }}>{children}</div>
        </div>
      ) : (
        <div style={{ padding: px(t.pad), position: "relative" }}>{children}</div>
      )}
    </div>
  );
}

export const Watermark = ({ text, t }: { text: string; t: Tokens }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    <span
      style={{
        fontFamily: t.heading,
        fontSize: 130,
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: withAlpha(t.accent, 0.07),
        transform: "rotate(-28deg)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  </div>
);

/* ── Logo & brand lockup ─────────────────────────────────────────────────── */
export interface LogoOpts {
  size?: number;
  showName?: boolean;
  nameColor?: string;
  subColor?: string;
  align?: "left" | "center" | "right";
  markBackground?: string;
  markColor?: string;
  stack?: boolean;
}

export function BusinessLogo({ ctx, t, opts = {} }: { ctx: TemplateContext; t: Tokens; opts?: LogoOpts }) {
  const { business, design } = ctx;
  const logo = design.logoDataUrl || business?.logoDataUrl;
  const size = opts.size ?? 44;
  const name = business?.name ?? ctx.payload.companyName ?? "Your Business";
  const showName = opts.showName ?? true;
  const markColor = opts.markColor ?? "#ffffff";
  const align = opts.align ?? "left";

  if (logo && opts.showName === false) {
    return <img src={logo} alt={name} style={{ maxHeight: size, maxWidth: size * 4.2, objectFit: "contain" }} />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: opts.stack ? "column" : "row",
        alignItems: align === "center" ? "center" : "center",
        gap: opts.stack ? 10 : 12,
        justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
        textAlign: align,
      }}
    >
      {logo ? (
        <img src={logo} alt="" style={{ maxHeight: size, maxWidth: size * 3.6, objectFit: "contain", flexShrink: 0 }} />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.26,
            background: opts.markBackground ?? `linear-gradient(135deg, ${t.accent}, ${withAlpha(t.accent, 0.72)})`,
            color: markColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: t.heading,
            fontWeight: 800,
            fontSize: size * 0.42,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          {name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "S"}
        </div>
      )}
      {showName ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: align, minWidth: 0 }}>
          <span style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 1.12), color: opts.nameColor ?? t.ink, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {name}
          </span>
          {business?.tagline ? (
            <span style={{ fontSize: px(t.base * 0.74), color: opts.subColor ?? t.muted, lineHeight: 1.35 }}>{business.tagline}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ── Contact block ───────────────────────────────────────────────────────── */
export function ContactLines({ ctx, t, color, align = "left", showWebsite = true, compact = false }: { ctx: TemplateContext; t: Tokens; color?: string; align?: "left" | "right" | "center"; showWebsite?: boolean; compact?: boolean }) {
  const b = ctx.business;
  const rows = [
    [b?.addressLine1, b?.addressLine2, b?.city, b?.region, b?.country].filter(Boolean).join(", "),
    b?.phone ? (b.altPhone ? `${b.phone} · ${b.altPhone}` : b.phone) : b?.altPhone,
    b?.email,
    showWebsite ? b?.website : undefined,
  ].filter(Boolean) as string[];
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 2 : 4, textAlign: align, alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
      {rows.map((row, i) => (
        <span key={i} style={{ fontSize: px(t.base * 0.76), color: color ?? t.muted, lineHeight: 1.45, wordBreak: "break-word" }}>
          {row}
        </span>
      ))}
    </div>
  );
}

/* ── Document title plate ────────────────────────────────────────────────── */
export function TitlePlate({
  ctx,
  t,
  variant = "plain",
  align = "right",
  label,
  showNumber = true,
  subtitle,
}: {
  ctx: TemplateContext;
  t: Tokens;
  variant?: "plain" | "block" | "underline" | "outline" | "gradient" | "badge" | "split";
  align?: "left" | "right";
  label?: string;
  showNumber?: boolean;
  subtitle?: ReactNode;
}) {
  const { doc, labels } = ctx;
  const text = (label ?? labels.title).toUpperCase();

  const meta = (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: variant === "block" ? 12 : 8, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      {showNumber ? (
        <span style={{ fontSize: px(t.base * 0.82), fontWeight: 600, color: variant === "block" ? "rgba(255,255,255,0.92)" : t.body, letterSpacing: "0.01em" }}>
          {doc.number}
        </span>
      ) : null}
      {subtitle}
    </div>
  );

  if (variant === "block") {
    return (
      <div style={{ textAlign: align }}>
        <div
          style={{
            display: "inline-block",
            background: `linear-gradient(120deg, ${t.accent}, ${withAlpha(t.accent, 0.78)})`,
            color: "#fff",
            padding: "14px 22px 16px",
            borderRadius: 3,
            minWidth: 232,
            textAlign: align,
          }}
        >
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.72), fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1.1 }}>{text}</div>
          {meta}
        </div>
      </div>
    );
  }
  if (variant === "gradient") {
    return (
      <div style={{ textAlign: align }}>
        <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.95), fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.05, background: `linear-gradient(92deg, ${t.accent}, ${withAlpha(t.accent, 0.55)})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text}</div>
        {meta}
      </div>
    );
  }
  if (variant === "underline") {
    return (
      <div style={{ textAlign: align }}>
        <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.8), fontWeight: 700, color: t.ink, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{text}</div>
        <div style={{ height: 4, width: 62, background: t.accent, marginTop: 8, marginLeft: align === "right" ? "auto" : 0, borderRadius: 99 }} />
        {meta}
      </div>
    );
  }
  if (variant === "outline") {
    return (
      <div style={{ textAlign: align }}>
        <div style={{ display: "inline-block", border: `1.5px solid ${t.accent}`, color: t.accent, padding: "8px 18px", borderRadius: 100, fontFamily: t.heading, fontSize: px(t.base * 1.16), fontWeight: 700, letterSpacing: "0.14em" }}>{text}</div>
        {meta}
      </div>
    );
  }
  if (variant === "badge") {
    return (
      <div style={{ textAlign: align }}>
        <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.accent, letterSpacing: "0.06em" }}>{text}</div>
        {meta}
      </div>
    );
  }
  if (variant === "split") {
    return (
      <div style={{ display: "flex", justifyContent: align === "right" ? "flex-end" : "space-between", alignItems: "baseline", gap: 16 }}>
        <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 800, color: t.ink, letterSpacing: "-0.01em" }}>{text}</div>
        <div style={{ fontSize: px(t.base * 0.8), color: t.muted, fontWeight: 600 }}>{doc.number}</div>
      </div>
    );
  }
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 700, color: t.ink, letterSpacing: "0.02em", lineHeight: 1.15 }}>{text}</div>
      {meta}
    </div>
  );
}

/* ── Party blocks ────────────────────────────────────────────────────────── */
export function PartyCard({
  t,
  heading,
  name,
  lines,
  variant = "plain",
  align = "left",
}: {
  t: Tokens;
  heading: string;
  name?: string;
  lines: (string | undefined)[];
  variant?: "plain" | "tinted" | "outline" | "bar" | "solid";
  align?: "left" | "right";
}) {
  const clean = lines.filter(Boolean) as string[];
  const wrap: CSSProperties = {
    textAlign: align,
    ...(variant === "tinted" ? { background: t.tint, padding: "14px 16px", borderRadius: 4 } : {}),
    ...(variant === "outline" ? { border: `1px solid ${t.rule}`, padding: "14px 16px", borderRadius: 4 } : {}),
    ...(variant === "bar" ? { borderLeft: `3px solid ${t.accent}`, paddingLeft: 14 } : {}),
    ...(variant === "solid" ? { background: t.accent, color: "#fff", padding: "14px 16px", borderRadius: 4 } : {}),
  };
  const headColor = variant === "solid" ? "rgba(255,255,255,0.72)" : t.faint;
  const nameColor = variant === "solid" ? "#fff" : t.ink;
  const lineColor = variant === "solid" ? "rgba(255,255,255,0.9)" : t.muted;
  return (
    <div style={wrap}>
      <Label t={t} color={headColor}>{heading}</Label>
      {name ? <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.98), color: nameColor, marginTop: 6, lineHeight: 1.3 }}>{name}</div> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 5, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
        {clean.map((line, i) => (
          <span key={i} style={{ fontSize: px(t.base * 0.78), color: lineColor, lineHeight: 1.45, wordBreak: "break-word" }}>{line}</span>
        ))}
      </div>
    </div>
  );
}

/** Meta grid (number / date / due date …). */
export function MetaGrid({
  t,
  items,
  align = "left",
  variant = "plain",
  columns,
}: {
  t: Tokens;
  items: { label: string; value: string }[];
  align?: "left" | "right";
  variant?: "plain" | "rows" | "tinted" | "inline";
  columns?: number;
}) {
  if (variant === "inline") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", alignItems: "baseline", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {items.map((i) => (
          <span key={i.label} style={{ fontSize: px(t.base * 0.78), color: t.muted }}>
            <span style={{ color: t.faint, fontWeight: 600 }}>{i.label}: </span>
            <span style={{ color: t.ink, fontWeight: 600 }}>{i.value}</span>
          </span>
        ))}
      </div>
    );
  }
  if (variant === "rows") {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((i, idx) => (
          <div key={i.label} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "5px 0", borderTop: idx === 0 ? "none" : `1px solid ${t.rule}` }}>
            <span style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{i.label}</span>
            <span style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 650 }}>{i.value}</span>
          </div>
        ))}
      </div>
    );
  }
  if (variant === "tinted") {
    return (
      <div style={{ background: t.tint, borderRadius: 4, padding: 14, display: "grid", gridTemplateColumns: `repeat(${columns ?? 2}, minmax(0, 1fr))`, gap: 12 }}>
        {items.map((i) => (
          <div key={i.label} style={{ textAlign: align }}>
            <Label t={t} color={t.faint}>{i.label}</Label>
            <div style={{ fontSize: px(t.base * 0.83), fontWeight: 650, color: t.ink, marginTop: 3 }}>{i.value}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns ?? 2}, minmax(0, 1fr))`, gap: "10px 18px" }}>
      {items.map((i) => (
        <div key={i.label} style={{ textAlign: align }}>
          <Label t={t}>{i.label}</Label>
          <div style={{ fontSize: px(t.base * 0.83), fontWeight: 650, color: t.ink, marginTop: 3 }}>{i.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Items table ─────────────────────────────────────────────────────────── */
export type TableVariant = "lined" | "striped" | "boxed" | "borderless" | "solid-head" | "tinted-head" | "zebra-accent";

export function ItemsTable({ ctx, t, variant = "lined", showUnit = true, showTax = false, compact = false }: { ctx: TemplateContext; t: Tokens; variant?: TableVariant; showUnit?: boolean; showTax?: boolean; compact?: boolean }) {
  const { payload, labels } = ctx;
  const items = payload.items ?? [];
  const headBg =
    variant === "solid-head" ? t.accent : variant === "tinted-head" || variant === "zebra-accent" ? t.tint : "transparent";
  const headColor = variant === "solid-head" ? "#fff" : t.ink;
  const cellPad = compact ? "6px 10px" : "9px 10px";
  const rowBorder =
    variant === "boxed" ? `1px solid ${t.rule}` : variant === "borderless" ? "none" : `1px solid ${t.rule}`;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: showTax ? "40%" : "46%" }} />
        <col style={{ width: "10%" }} />
        {showUnit ? <col style={{ width: "12%" }} /> : null}
        <col style={{ width: showTax ? "13%" : "18%" }} />
        {showTax ? <col style={{ width: "10%" }} /> : null}
        <col style={{ width: showTax ? "15%" : "24%" }} />
      </colgroup>
      <thead>
        <tr style={{ background: headBg, borderTop: variant === "boxed" ? `1px solid ${t.rule}` : "none" }}>
          {[
            { label: labels.itemsHeading, align: "left" as const },
            { label: labels.qty, align: "center" as const },
            ...(showUnit ? [{ label: labels.unit, align: "left" as const }] : []),
            { label: labels.rate, align: "right" as const },
            ...(showTax ? [{ label: `${labels.tax} %`, align: "right" as const }] : []),
            { label: labels.amount, align: "right" as const },
          ].map((col, i) => (
            <th
              key={i}
              style={{
                textAlign: col.align,
                padding: cellPad,
                fontFamily: t.sans,
                fontSize: px(t.base * 0.7),
                fontWeight: 700,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color: headColor,
                borderBottom: variant === "solid-head" ? "none" : `1.5px solid ${variant === "borderless" ? "transparent" : t.ink}`,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => {
          const striped = variant === "striped" && idx % 2 === 1;
          const zebra = variant === "zebra-accent" && idx % 2 === 1;
          const bg = striped ? "#f8fafc" : zebra ? t.tint : "transparent";
          const line = item.qty * item.rate;
          return (
            <tr key={item.id} style={{ background: bg }}>
              <td style={{ padding: cellPad, borderBottom: rowBorder, verticalAlign: "top" }}>
                <div style={{ fontWeight: 600, color: t.ink, fontSize: px(t.base * 0.87), lineHeight: 1.4, wordBreak: "break-word" }}>{item.description || "—"}</div>
                {item.detail ? <div style={{ fontSize: px(t.base * 0.73), color: t.muted, marginTop: 2, lineHeight: 1.45 }}>{item.detail}</div> : null}
              </td>
              <td style={{ padding: cellPad, borderBottom: rowBorder, textAlign: "center", fontSize: px(t.base * 0.83), color: t.body, verticalAlign: "top" }}>{formatNumber(item.qty || 0, (item.qty || 0) % 1 === 0 ? 0 : 2)}</td>
              {showUnit ? <td style={{ padding: cellPad, borderBottom: rowBorder, fontSize: px(t.base * 0.78), color: t.muted, verticalAlign: "top" }}>{item.unit || "unit"}</td> : null}
              <td style={{ padding: cellPad, borderBottom: rowBorder, textAlign: "right", fontSize: px(t.base * 0.83), color: t.body, verticalAlign: "top", whiteSpace: "nowrap" }}>{money(item.rate, ctx)}</td>
              {showTax ? <td style={{ padding: cellPad, borderBottom: rowBorder, textAlign: "right", fontSize: px(t.base * 0.8), color: t.muted, verticalAlign: "top" }}>{item.taxRate ? `${formatNumber(item.taxRate, 0)}%` : "—"}</td> : null}
              <td style={{ padding: cellPad, borderBottom: rowBorder, textAlign: "right", fontSize: px(t.base * 0.87), fontWeight: 650, color: t.ink, verticalAlign: "top", whiteSpace: "nowrap" }}>{money(line, ctx)}</td>
            </tr>
          );
        })}
        {!items.length ? (
          <tr>
            <td colSpan={6} style={{ padding: "18px 10px", color: t.faint, fontSize: px(t.base * 0.8), borderBottom: rowBorder }}>
              No line items yet — add them in the editor.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}

/* ── Totals ──────────────────────────────────────────────────────────────── */
export function TotalsBlock({
  ctx,
  t,
  variant = "plain",
  showPaid = true,
  showDiscount = true,
  labelColor,
  valueColor,
  footer,
}: {
  ctx: TemplateContext;
  t: Tokens;
  variant?: "plain" | "tinted" | "outline" | "solid" | "striped" | "right-rule" | "card";
  showPaid?: boolean;
  showDiscount?: boolean;
  labelColor?: string;
  valueColor?: string;
  footer?: ReactNode;
}) {
  const { totals, labels } = ctx;
  const rows: { label: string; value: string; strong?: boolean; accent?: boolean }[] = [{ label: labels.subtotal, value: money(totals.subtotal, ctx) }];
  if (showDiscount && totals.discount > 0) rows.push({ label: `${labels.discount}${ctx.payload.discountType === "percent" ? ` (${formatNumber(ctx.payload.discountValue ?? 0, 0)}%)` : ""}`, value: `−${money(totals.discount, ctx)}` });
  if (totals.tax > 0) rows.push({ label: `${labels.tax}${ctx.payload.taxRate ? ` (${formatNumber(ctx.payload.taxRate, 0)}%)` : ""}`, value: money(totals.tax, ctx) });
  if (totals.shipping > 0) rows.push({ label: labels.shipping, value: money(totals.shipping, ctx) });
  rows.push({ label: labels.total, value: money(totals.total, ctx), strong: true, accent: true });
  if (showPaid && totals.paid > 0) {
    rows.push({ label: labels.paid, value: `−${money(totals.paid, ctx)}` });
    rows.push({ label: labels.balance, value: money(totals.balance, ctx), strong: true });
  }

  const wrapStyle: CSSProperties = {
    ...(variant === "tinted" ? { background: t.tint, padding: "12px 14px", borderRadius: 4 } : {}),
    ...(variant === "outline" ? { border: `1px solid ${t.rule}`, padding: "12px 14px", borderRadius: 4 } : {}),
    ...(variant === "card" ? { background: "#fff", border: `1px solid ${t.rule}`, boxShadow: "0 2px 10px rgba(15,23,42,0.06)", padding: "12px 14px", borderRadius: 6 } : {}),
    ...(variant === "solid" ? { background: t.accent, padding: "14px 16px", borderRadius: 4 } : {}),
  };

  const isSolid = variant === "solid";
  const lc = isSolid ? "rgba(255,255,255,0.82)" : labelColor ?? t.muted;
  const vc = isSolid ? "#fff" : valueColor ?? t.ink;

  return (
    <div style={wrapStyle}>
      {rows.map((row, i) => {
        const isTotal = row.accent;
        const showRule = variant !== "striped" && !isSolid && i > 0 && !isTotal;
        return (
          <div
            key={`${row.label}-${i}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 18,
              padding: isTotal ? (isSolid ? "6px 0 2px" : "7px 0 4px") : "4px 0",
              borderTop: isTotal && !isSolid ? `1.5px solid ${t.accent}` : showRule ? `1px solid ${t.rule}` : "none",
              marginTop: isTotal ? 4 : 0,
            }}
          >
            <span style={{ fontSize: px(t.base * (isTotal ? 0.95 : 0.82)), fontWeight: isTotal ? 700 : 500, color: isTotal && !isSolid ? t.ink : lc }}>{row.label}</span>
            <span style={{ fontSize: px(t.base * (isTotal ? 1.16 : 0.86)), fontWeight: isTotal ? 800 : 600, color: isTotal && !isSolid ? t.accent : vc, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {row.value}
            </span>
          </div>
        );
      })}
      {footer}
    </div>
  );
}

/* ── Amount in words, bank details, QR, signature, stamp ─────────────────── */
export function AmountWords({ ctx, t, variant = "plain" }: { ctx: TemplateContext; t: Tokens; variant?: "plain" | "tinted" }) {
  const words = ctx.payload.__amountWords as string | undefined;
  if (!words) return null;
  return (
    <div style={{ background: variant === "tinted" ? t.tint : "transparent", padding: variant === "tinted" ? "10px 12px" : 0, borderRadius: 4 }}>
      <Label t={t}>Amount in words</Label>
      <div style={{ fontSize: px(t.base * 0.78), color: t.body, marginTop: 4, fontStyle: "italic", lineHeight: 1.5 }}>{words}</div>
    </div>
  );
}

export function BankDetails({ ctx, t, variant = "plain" }: { ctx: TemplateContext; t: Tokens; variant?: "plain" | "boxed" | "tinted" }) {
  const b = ctx.business;
  if (!ctx.design.showBankDetails || !b) return null;
  const rows = [
    ["Bank", b.bankName],
    ["Account name", b.bankAccountName ?? b.name],
    ["Account no.", b.bankAccountNumber],
    ["Branch", b.bankBranch],
    ["SWIFT", b.bankSwift],
    ["Mobile money", b.mobileMoney],
  ].filter(([, v]) => Boolean(v)) as [string, string][];
  if (!rows.length) return null;
  const style: CSSProperties =
    variant === "boxed"
      ? { border: `1px solid ${t.rule}`, borderRadius: 4, padding: 12 }
      : variant === "tinted"
        ? { background: t.tint, borderRadius: 4, padding: 12 }
        : {};
  return (
    <div style={style}>
      <Label t={t} color={variant === "plain" ? t.faint : t.accent}>{ctx.labels.bank}</Label>
      <div style={{ display: "grid", gridTemplateColumns: rows.length > 3 ? "1fr 1fr" : "1fr", gap: "4px 18px", marginTop: 7 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: px(t.base * 0.76) }}>
            <span style={{ color: t.muted }}>{k}</span>
            <span style={{ color: t.ink, fontWeight: 600, textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QrPanel({ ctx, t, size = 74, caption }: { ctx: TemplateContext; t: Tokens; size?: number; caption?: string }) {
  if (!ctx.design.showQr || !ctx.qr) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <img src={ctx.qr} alt="QR code" width={size} height={size} style={{ display: "block", borderRadius: 3, border: `1px solid ${t.rule}`, padding: 4, background: "#fff" }} />
      <span style={{ fontSize: px(t.base * 0.62), color: t.faint, textAlign: "center", maxWidth: size + 30, lineHeight: 1.35 }}>{caption ?? ctx.labels.qrHint}</span>
    </div>
  );
}

export function SignatureBlock({
  ctx,
  t,
  variant = "line",
  name,
  role,
  align = "left",
  label,
}: {
  ctx: TemplateContext;
  t: Tokens;
  variant?: "line" | "box" | "handwritten" | "tinted";
  name?: string;
  role?: string;
  align?: "left" | "right" | "center";
  label?: string;
}) {
  const { design, business } = ctx;
  if (!design.showSignature) return null;
  const signature = design.signatureDataUrl || business?.signatureDataUrl;
  const person = name ?? design.signatureName ?? business?.signatureName ?? business?.name ?? "";
  const position = role ?? design.signatureRole ?? business?.signatureRole ?? "";
  const stamp = design.showStamp ? design.stampDataUrl || business?.stampDataUrl : undefined;

  return (
    <div style={{ display: "flex", gap: 22, alignItems: "flex-end", justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
      <div style={{ minWidth: 210, textAlign: align, ...(variant === "box" ? { border: `1px solid ${t.rule}`, borderRadius: 4, padding: "10px 12px" } : {}), ...(variant === "tinted" ? { background: t.tint, borderRadius: 4, padding: "10px 12px" } : {}) }}>
        {signature ? (
          <img src={signature} alt="" style={{ maxHeight: 46, maxWidth: 200, objectFit: "contain", marginBottom: 4, display: "block", marginLeft: align === "right" ? "auto" : 0 }} />
        ) : (
          <div style={{ height: 34 }} />
        )}
        <div style={{ height: variant === "handwritten" ? 0 : 1, background: variant === "handwritten" ? "transparent" : t.ink }} />
        <div style={{ fontSize: px(t.base * 0.82), fontWeight: 700, color: t.ink, marginTop: 6 }}>{person || "Authorised signatory"}</div>
        {position ? <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 2 }}>{position}</div> : null}
        <div style={{ fontSize: px(t.base * 0.66), color: t.faint, marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label ?? ctx.labels.authorized}</div>
      </div>
      {stamp ? <img src={stamp} alt="" style={{ maxHeight: 92, maxWidth: 130, objectFit: "contain", opacity: 0.94 }} /> : null}
    </div>
  );
}

/* ── Narrative helpers ───────────────────────────────────────────────────── */
export function SectionHeading({ t, children, variant = "rule", align = "left", color }: { t: Tokens; children: ReactNode; variant?: "rule" | "bar" | "plain" | "tinted" | "numbered"; align?: "left" | "center"; number?: number; color?: string }) {
  const c = color ?? t.ink;
  if (variant === "bar") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div style={{ width: 3, height: 15, background: t.accent, borderRadius: 2 }} />
        <span style={{ fontFamily: t.heading, fontSize: px(t.base * 0.92), fontWeight: 700, color: c, letterSpacing: "-0.01em" }}>{children}</span>
      </div>
    );
  }
  if (variant === "plain") {
    return <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.92), fontWeight: 700, color: c, marginBottom: 6 }}>{children}</div>;
  }
  if (variant === "tinted") {
    return (
      <div style={{ background: t.tint, borderRadius: 3, padding: "7px 11px", fontFamily: t.heading, fontSize: px(t.base * 0.86), fontWeight: 700, color: t.accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 9 }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 8, textAlign: align }}>
      <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.88), fontWeight: 700, color: c, letterSpacing: "0.1em", textTransform: "uppercase" }}>{children}</div>
      <div style={{ height: 1.5, background: align === "center" ? t.accent : t.ink, marginTop: 5, width: align === "center" ? 40 : "100%", marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0, opacity: align === "center" ? 1 : 0.85 }} />
    </div>
  );
}

export const Prose = ({ children, t, size = 0.82, muted = false }: { children: ReactNode; t: Tokens; size?: number; muted?: boolean }) => (
  <p style={{ fontSize: px(t.base * size), lineHeight: 1.62, color: muted ? t.muted : t.body, margin: 0 }}>{children}</p>
);

export function Bullets({ items, t, variant = "dot", columns = 1 }: { items: string[]; t: Tokens; variant?: "dot" | "check" | "dash" | "arrow" | "numbered"; columns?: number }) {
  if (!items?.length) return null;
  const marker = (i: number) =>
    variant === "check" ? "✓" : variant === "dash" ? "—" : variant === "arrow" ? "→" : variant === "numbered" ? `${i + 1}.` : "•";
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "5px 20px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: t.accent, fontWeight: 700, fontSize: px(t.base * 0.8), lineHeight: 1.6, flexShrink: 0, minWidth: variant === "numbered" ? 14 : 8 }}>{marker(i)}</span>
          <span style={{ fontSize: px(t.base * 0.81), color: t.body, lineHeight: 1.55 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function TagList({ items, t, variant = "outline" }: { items: string[]; t: Tokens; variant?: "outline" | "solid" | "tinted" | "bar" }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            fontSize: px(t.base * 0.74),
            fontWeight: 600,
            padding: "4px 9px",
            borderRadius: variant === "bar" ? 3 : 99,
            border: variant === "solid" || variant === "bar" ? "none" : `1px solid ${t.rule}`,
            background: variant === "solid" ? t.accent : variant === "tinted" || variant === "bar" ? t.tint : "#fff",
            color: variant === "solid" ? "#fff" : variant === "tinted" || variant === "bar" ? t.accent : t.body,
            whiteSpace: "nowrap",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Decorative shapes ───────────────────────────────────────────────────── */
export const CornerTriangle = ({ t, size = 150, corner = "top-right", color, opacity = 1 }: { t: Tokens; size?: number; corner?: "top-right" | "bottom-left" | "top-left" | "bottom-right"; color?: string; opacity?: number }) => {
  const c = color ?? t.accent;
  const style: CSSProperties = { position: "absolute", width: 0, height: 0, opacity, pointerEvents: "none" };
  if (corner === "top-right") return <div style={{ ...style, top: 0, right: 0, borderTop: `${size}px solid ${c}`, borderLeft: `${size}px solid transparent` }} />;
  if (corner === "top-left") return <div style={{ ...style, top: 0, left: 0, borderTop: `${size}px solid ${c}`, borderRight: `${size}px solid transparent` }} />;
  if (corner === "bottom-left") return <div style={{ ...style, bottom: 0, left: 0, borderBottom: `${size}px solid ${c}`, borderRight: `${size}px solid transparent` }} />;
  return <div style={{ ...style, bottom: 0, right: 0, borderBottom: `${size}px solid ${c}`, borderLeft: `${size}px solid transparent` }} />;
};

export const HeaderBand = ({ t, children, variant = "solid", height, sticky }: { t: Tokens; children: ReactNode; variant?: "solid" | "gradient" | "tinted" | "split" | "edge"; height?: number; sticky?: boolean }) => {
  const bg =
    variant === "solid" ? t.accent : variant === "gradient" ? `linear-gradient(115deg, ${t.accent} 0%, ${withAlpha(t.accent, 0.62)} 100%)` : variant === "tinted" ? t.tint : "transparent";
  return (
    <div style={{ background: bg, minHeight: height, margin: `${-t.pad}px ${-t.pad}px 0`, padding: `26px ${t.pad}px 24px`, color: variant === "tinted" ? t.ink : "#fff", position: "relative" }}>
      {variant === "edge" ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg, ${t.accent}, ${withAlpha(t.accent, 0.4)})`, marginTop: -26 }} /> : null}
      {children}
    </div>
  );
};

export function FooterBar({ ctx, t, variant = "plain", note }: { ctx: TemplateContext; t: Tokens; variant?: "plain" | "rule" | "tinted" | "solid" | "centered"; note?: string }) {
  const b = ctx.business;
  const parts = [b?.name, b?.phone, b?.email, b?.website].filter(Boolean) as string[];
  const text = note ?? ctx.labels.thankYou;

  if (variant === "solid") {
    return (
      <div style={{ margin: `0 ${-t.pad}px ${-t.pad}px`, padding: `16px ${t.pad}px`, background: t.accent, color: "rgba(255,255,255,0.95)", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
        <span style={{ fontSize: px(t.base * 0.74) }}>{text}</span>
        <span style={{ fontSize: px(t.base * 0.72), opacity: 0.85 }}>{parts.join(" · ")}</span>
      </div>
    );
  }
  if (variant === "tinted") {
    return (
      <div style={{ margin: `0 ${-t.pad}px ${-t.pad}px`, padding: `14px ${t.pad}px`, background: t.tint, color: t.muted, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
        <span style={{ fontSize: px(t.base * 0.72) }}>{text}</span>
        <span style={{ fontSize: px(t.base * 0.7) }}>{parts.join(" · ")}</span>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 26 }}>
      {variant === "rule" ? <Rule color={t.rule} /> : null}
      <div style={{ display: "flex", justifyContent: variant === "centered" ? "center" : "space-between", gap: 14, paddingTop: variant === "rule" ? 12 : 6, flexWrap: "wrap", textAlign: variant === "centered" ? "center" : "left" }}>
        <span style={{ fontSize: px(t.base * 0.72), color: t.muted }}>{text}</span>
        <span style={{ fontSize: px(t.base * 0.7), color: t.faint }}>{parts.join(" · ")}</span>
      </div>
    </div>
  );
}

/* ── Layout helpers ──────────────────────────────────────────────────────── */
export const Row = ({ children, gap = 16, align = "stretch", justify = "flex-start", style }: { children: ReactNode; gap?: number; align?: CSSProperties["alignItems"]; justify?: CSSProperties["justifyContent"]; style?: CSSProperties }) => (
  <div style={{ display: "flex", gap, alignItems: align, justifyContent: justify, ...style }}>{children}</div>
);

export const Col = ({ children, gap = 12, grow, style }: { children: ReactNode; gap?: number; grow?: boolean; style?: CSSProperties }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, flex: grow ? "1 1 0" : undefined, minWidth: 0, ...style }}>{children}</div>
);

export const Stack = ({ children, gap = 18, style }: { children: ReactNode; gap?: number; style?: CSSProperties }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);
