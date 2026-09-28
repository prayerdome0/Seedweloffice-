import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  AmountWords, BankDetails, Bullets, BusinessLogo, ContactLines, CornerTriangle, FooterBar, HeaderBand, ItemsTable, Label,
  MetaGrid, PaperShell, PartyCard, Prose, QrPanel, Row, SectionHeading, SignatureBlock, TagList, TitlePlate, TotalsBlock,
  px, dt, tokens,
} from "./primitives";

/* Quotation designs — 20 layouts. Quotations lead with persuasion: scope,
   inclusions, validity and an acceptance block, not just numbers. */

const quoteMeta = (ctx: TemplateContext) => {
  const rows = [
    { label: ctx.labels.numberLabel, value: ctx.doc.number },
    { label: ctx.labels.dateLabel, value: dt(ctx.doc.issueDate, ctx) },
  ];
  if (ctx.doc.validUntil) rows.push({ label: ctx.labels.validLabel, value: dt(ctx.doc.validUntil, ctx) });
  if (ctx.payload.reference) rows.push({ label: "Reference", value: String(ctx.payload.reference) });
  return rows;
};

const scope = (ctx: TemplateContext): string[] => (ctx.payload.scope as string[] | undefined) ?? [];
const deliverables = (ctx: TemplateContext): string[] => (ctx.payload.deliverables as string[] | undefined) ?? [];
const timeline = (ctx: TemplateContext) => (ctx.payload.timeline as { id: string; phase: string; duration: string; details?: string }[] | undefined) ?? [];

const clientLines = (ctx: TemplateContext): (string | undefined)[] => [
  ctx.payload.clientCompany,
  ctx.payload.clientEmail,
  ctx.payload.clientPhone,
  ctx.payload.clientAddress,
  ctx.payload.clientTaxId ? `Tax ID: ${ctx.payload.clientTaxId}` : undefined,
];

const introBlock = (ctx: TemplateContext, t: ReturnType<typeof tokens>, align: "left" | "center" = "left") =>
  ctx.payload.intro ? (
    <Prose t={t} size={0.8} muted>
      <span style={{ display: "block", textAlign: align }}>{String(ctx.payload.intro)}</span>
    </Prose>
  ) : null;

const ScopeBlock = ({ ctx, t, variant }: { ctx: TemplateContext; t: ReturnType<typeof tokens>; variant: "check" | "dot" | "numbered" | "tinted" | "columns" }) => {
  const items = scope(ctx);
  if (!items.length) return null;
  if (variant === "tinted")
    return (
      <div style={{ background: t.tint, borderRadius: 4, padding: 14 }}>
        <Label t={t}>Scope of work</Label>
        <div style={{ marginTop: 8 }}>
          <Bullets t={t} items={items} variant="check" />
        </div>
      </div>
    );
  return (
    <div>
      <SectionHeading t={t} variant="bar">Scope of work</SectionHeading>
      <Bullets t={t} items={items} variant={variant === "columns" ? "dot" : variant === "dot" ? "dot" : variant} columns={variant === "columns" ? 2 : 1} />
    </div>
  );
};

const AcceptanceBlock = ({ ctx, t, variant = "box" }: { ctx: TemplateContext; t: ReturnType<typeof tokens>; variant?: "box" | "line" | "tinted" | "dual" }) => {
  const style =
    variant === "box"
      ? { border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }
      : variant === "tinted"
        ? { background: t.tint, borderRadius: 4, padding: 14 }
        : {};
  return (
    <div style={style}>
      <Label t={t} color={variant === "tinted" ? t.accent : t.faint}>Acceptance of quotation</Label>
      <p style={{ fontSize: px(t.base * 0.76), color: t.muted, lineHeight: 1.55, margin: "6px 0 12px" }}>
        To proceed, please sign below or confirm by email quoting {ctx.doc.number}. Work begins on receipt of a signed
        acceptance or the agreed deposit.
      </p>
      <Row gap={22} align="flex-end">
        <div style={{ flex: 1 }}>
          <div style={{ height: 1, background: t.ink }} />
          <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Name &amp; signature — for and on behalf of {ctx.payload.clientCompany || ctx.payload.clientName || "the client"}</div>
        </div>
        <div style={{ width: 120 }}>
          <div style={{ height: 1, background: t.ink }} />
          <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Date</div>
        </div>
      </Row>
      {variant === "dual" ? (
        <Row gap={22} align="flex-end" style={{ marginTop: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 1, background: t.ink }} />
            <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Accepted by {ctx.business?.name ?? "us"}</div>
          </div>
          <div style={{ width: 120 }}>
            <div style={{ height: 1, background: t.ink }} />
            <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Date</div>
          </div>
        </Row>
      ) : null}
    </div>
  );
};

const TimelineBlock = ({ ctx, t, variant = "rows" }: { ctx: TemplateContext; t: ReturnType<typeof tokens>; variant?: "rows" | "cards" | "compact" }) => {
  const items = timeline(ctx);
  if (!items.length) return null;
  if (variant === "cards")
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ border: `1px solid ${t.rule}`, borderTop: `3px solid ${t.accent}`, borderRadius: 4, padding: 12 }}>
            <div style={{ fontSize: px(t.base * 0.68), color: t.accent, fontWeight: 700, letterSpacing: "0.1em" }}>{item.duration}</div>
            <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink, marginTop: 5 }}>{item.phase}</div>
            {item.details ? <div style={{ fontSize: px(t.base * 0.74), color: t.muted, marginTop: 5, lineHeight: 1.5 }}>{item.details}</div> : null}
          </div>
        ))}
      </div>
    );
  if (variant === "compact")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ width: 74, fontSize: px(t.base * 0.74), color: t.accent, fontWeight: 700 }}>{item.duration}</span>
            <span style={{ fontSize: px(t.base * 0.82), color: t.ink, fontWeight: 600 }}>{item.phase}</span>
            {item.details ? <span style={{ fontSize: px(t.base * 0.76), color: t.muted, flex: 1 }}>— {item.details}</span> : null}
          </div>
        ))}
      </div>
    );
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 10, borderLeft: i === items.length - 1 ? "none" : undefined }}>
          <div style={{ width: 96, flexShrink: 0, fontSize: px(t.base * 0.74), color: t.accent, fontWeight: 700, paddingTop: 1 }}>{item.duration}</div>
          <div style={{ flex: 1, borderLeft: `2px solid ${t.rule}`, paddingLeft: 14, paddingBottom: 4 }}>
            <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink }}>{item.phase}</div>
            {item.details ? <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{item.details}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};

type Design = Omit<TemplateMeta, "kind">;

export const quotationTemplates: Design[] = [
  /* ── Corporate ─────────────────────────────────────────────────────────── */
  {
    id: "quotation-corporate-01",
    name: "Ledger Quotation",
    category: "corporate",
    description: "Corporate standard: letterhead, specification clause and ruled pricing schedule.",
    tags: ["classic", "clause-based"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <ContactLines ctx={ctx} t={t} align="right" />
          </Row>
          <div style={{ height: 1, background: t.ink, marginTop: 22 }} />
          <Row justify="space-between" align="flex-end" style={{ marginTop: 18 }}>
            <TitlePlate ctx={ctx} t={t} align="left" showNumber={false} subtitle={ctx.payload.subject ? <span style={{ fontSize: px(t.base * 0.82), color: t.muted }}>{String(ctx.payload.subject)}</span> : undefined} />
            <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 22 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">1. Introduction</SectionHeading>
            {introBlock(ctx, t)}
          </div>
          <div style={{ marginTop: 16 }}>
            <ScopeBlock ctx={ctx} t={t} variant="check" />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="plain">Pricing schedule</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-corporate-02",
    name: "Specification",
    category: "corporate",
    description: "Formal specification sheet with deliverables, timeline and boxed investment.",
    tags: ["spec", "deliverables"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.44), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.accent, fontWeight: 700, marginTop: 2 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={quoteMeta(ctx)} variant="tinted" columns={4} />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading="Prepared for" name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading="Prepared by" name={ctx.business?.name ?? ""} lines={[ctx.business?.addressLine1, ctx.business?.phone, ctx.business?.email]} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ScopeBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">Deliverables</SectionHeading>
            <Bullets t={t} items={deliverables(ctx)} variant="check" columns={2} />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="box" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-corporate-03",
    name: "Boardroom",
    category: "corporate",
    description: "Solid header band, phase timeline and a dual authorisation block.",
    tags: ["timeline", "dual-sign"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="solid">
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
          </HeaderBand>
          <Row gap={18} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 264 }}>
              <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <ScopeBlock ctx={ctx} t={t} variant="dot" />
          </div>
          <div style={{ marginTop: 18 }}>
            <TimelineBlock ctx={ctx} t={t} variant="compact" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="striped" showTax />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} />
            </div>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="striped" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="dual" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-corporate-04",
    name: "Tender",
    category: "corporate",
    description: "Numbered tender response with compliance notes and validity statement.",
    tags: ["tender", "compliance"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `2px solid ${t.ink}`, paddingBottom: 12 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.3), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()} · {ctx.doc.number}</div>
            </Row>
          </div>
          <div style={{ marginTop: 16 }}>
            <MetaGrid t={t} items={quoteMeta(ctx)} variant="inline" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">1. Offer summary</SectionHeading>
            {introBlock(ctx, t)}
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">2. Scope of supply</SectionHeading>
            <Bullets t={t} items={scope(ctx)} variant="numbered" />
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">3. Prices</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="boxed" compact showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 300, border: `1px solid ${t.rule}`, padding: 12 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">4. Commercial conditions</SectionHeading>
            <Prose t={t} size={0.78} muted>{String(ctx.payload.terms ?? "Prices are exclusive of import duty. Validity as stated above.")}</Prose>
          </div>
          <div style={{ marginTop: 16 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="tinted" />
          </div>
          <div style={{ marginTop: 18 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-corporate-05",
    name: "Consortium",
    category: "corporate",
    description: "Two-column corporate layout pairing offer detail with a sticky pricing rail.",
    tags: ["two-column", "dense"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
            <div style={{ textAlign: "right" }}>
              <Label t={t}>{ctx.labels.title}</Label>
              <div style={{ fontSize: px(t.base * 0.88), fontWeight: 700, color: t.ink, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <Row gap={22} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1.35 }}>
              <Row gap={14} align="flex-start">
                <div style={{ flex: 1 }}>
                  <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
                </div>
              </Row>
              <div style={{ marginTop: 16 }}>{introBlock(ctx, t)}</div>
              <div style={{ marginTop: 16 }}>
                <ScopeBlock ctx={ctx} t={t} variant="check" />
              </div>
              <div style={{ marginTop: 16 }}>
                <SectionHeading t={t} variant="bar">Deliverables</SectionHeading>
                <Bullets t={t} items={deliverables(ctx)} variant="dot" />
              </div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 16 }}>
              <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" />
              <div style={{ marginTop: 16 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
              </div>
              <div style={{ marginTop: 12 }}>
                <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
              </div>
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="box" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },

  /* ── Modern ────────────────────────────────────────────────────────────── */
  {
    id: "quotation-modern-01",
    name: "Aurora Quote",
    category: "modern",
    description: "Gradient masthead, tinted scope card and a confident investment summary.",
    tags: ["gradient", "cards"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="gradient" height={106}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.8)", markBackground: "rgba(255,255,255,0.22)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.92 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 24 }}>{introBlock(ctx, t)}</div>
          <Row gap={18} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1.3 }}>
              <ScopeBlock ctx={ctx} t={t} variant="tinted" />
              <div style={{ marginTop: 16 }}>
                <SectionHeading t={t} variant="bar">Deliverables</SectionHeading>
                <Bullets t={t} items={deliverables(ctx)} variant="check" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="outline" />
              <div style={{ marginTop: 12 }}>
                <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" />
              </div>
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 314 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-modern-02",
    name: "Blueprint",
    category: "modern",
    description: "Grid-led proposal with a numbered phase tracker and progress bars.",
    tags: ["grid", "phases"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20, background: t.ink, color: "#fff", borderRadius: 4, padding: "14px 16px" }}>
            <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.75, fontWeight: 700 }}>Prepared for</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 700, marginTop: 5 }}>{ctx.payload.clientCompany || ctx.payload.clientName || "Client"}</div>
          </div>
          <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">What is included</SectionHeading>
            <Bullets t={t} items={scope(ctx)} variant="check" columns={2} />
          </div>
          <div style={{ marginTop: 18 }}>
            <TimelineBlock ctx={ctx} t={t} variant="cards" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="tinted-head" />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} />
              <div style={{ marginTop: 12 }}>
                <BankDetails ctx={ctx} t={t} />
              </div>
            </div>
            <div style={{ width: 292 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-modern-03",
    name: "Sidecar",
    category: "modern",
    description: "Tinted left rail for scope, clean body for pricing and acceptance.",
    tags: ["sidebar", "scannable"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarWidth={240}
          sidebar={
            <div style={{ background: t.tint, minHeight: 1123, padding: "34px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ stack: true, size: 46 }} />
              <div>
                <Label t={t}>Inclusions</Label>
                <div style={{ marginTop: 8 }}>
                  <Bullets t={t} items={scope(ctx)} variant="check" />
                </div>
              </div>
              <div>
                <Label t={t}>Deliverables</Label>
                <div style={{ marginTop: 8 }}>
                  <TagList t={t} items={deliverables(ctx)} variant="outline" />
                </div>
              </div>
              <div style={{ marginTop: "auto", borderTop: `1px solid ${t.soft}`, paddingTop: 12 }}>
                <Label t={t}>Valid until</Label>
                <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink, marginTop: 4 }}>{ctx.doc.validUntil ? dt(ctx.doc.validUntil, ctx) : "—"}</div>
              </div>
            </div>
          }
        >
          <TitlePlate ctx={ctx} t={t} variant="badge" align="left" subtitle={<span style={{ fontSize: px(t.base * 0.8), color: t.muted }}>{ctx.doc.number}</span>} />
          <div style={{ marginTop: 18 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 20 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
          </div>
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="bar">Investment</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 292 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="box" />
          </div>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-modern-04",
    name: "Signal",
    category: "modern",
    description: "Numbered value pillars above the price table — sells outcomes, not hours.",
    tags: ["outcomes", "numbered"],
    render: (ctx) => {
      const t = tokens(ctx);
      const items = scope(ctx).slice(0, 3);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 44 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.36), fontWeight: 800, color: t.accent }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.16), fontWeight: 700, color: t.ink, lineHeight: 1.35 }}>{String(ctx.payload.subject ?? "What we will deliver for you")}</div>
          </div>
          {items.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginTop: 18 }}>
              {items.map((item, i) => (
                <div key={i} style={{ borderTop: `3px solid ${t.accent}`, paddingTop: 10 }}>
                  <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.1), fontWeight: 800, color: t.soft === "transparent" ? t.accent : t.accent }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontSize: px(t.base * 0.8), color: t.body, marginTop: 5, lineHeight: 1.5 }}>{item}</div>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>{introBlock(ctx, t)}</div>
          <Row gap={20} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="solid" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-modern-05",
    name: "Clearwater",
    category: "modern",
    description: "Airy layout with a two-column comparison of inclusions and exclusions.",
    tags: ["inclusions", "airy"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40, subColor: t.faint }} />
            <MetaGrid t={t} items={quoteMeta(ctx)} variant="inline" align="right" />
          </Row>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.7), fontWeight: 700, color: t.ink, lineHeight: 1.25 }}>{String(ctx.payload.subject ?? ctx.labels.title)}</div>
            <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 6 }}>Quotation {ctx.doc.number} · prepared for {ctx.payload.clientCompany || ctx.payload.clientName}</div>
          </div>
          <div style={{ marginTop: 24 }}>{introBlock(ctx, t)}</div>
          <Row gap={20} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Included</SectionHeading>
              <Bullets t={t} items={scope(ctx)} variant="check" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Deliverables</SectionHeading>
              <Bullets t={t} items={deliverables(ctx)} variant="dot" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row gap={20} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} variant="tinted" />
            </div>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },

  /* ── Executive ─────────────────────────────────────────────────────────── */
  {
    id: "quotation-executive-01",
    name: "Chancery Quote",
    category: "executive",
    description: "Serif letterhead, italic preamble and a discreet fee schedule.",
    tags: ["serif", "premium"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 48, subColor: t.faint }} />
            </div>
            <div style={{ height: 1, background: t.accent, width: 120, margin: "16px auto 0" }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.62), color: t.ink, marginTop: 16, letterSpacing: "0.2em" }}>{ctx.labels.title.toUpperCase()}</div>
            <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 6, letterSpacing: "0.1em" }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
          </div>
          <div style={{ marginTop: 26, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), lineHeight: 1.7, color: t.body }}>
            <span style={{ display: "block", marginBottom: 10 }}>Dear {ctx.payload.clientName || "Sir or Madam"},</span>
            {String(ctx.payload.intro ?? "")}
          </div>
          <div style={{ marginTop: 20 }}>
            <ScopeBlock ctx={ctx} t={t} variant="dot" />
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: t.sans, fontSize: px(t.base * 0.72), letterSpacing: "0.16em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Fee schedule</div>
            <div style={{ marginTop: 8 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" compact />
            </div>
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 296 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <Prose t={t} size={0.82} muted>{String(ctx.payload.terms ?? "This quotation is valid for the period stated above.")}</Prose>
          </div>
          <div style={{ marginTop: 22 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 22, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.9), color: t.muted, fontStyle: "italic" }}>
            Yours faithfully,
            <div style={{ marginTop: 22, fontStyle: "normal", color: t.ink }}>{ctx.design.signatureName || ctx.business?.name}</div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-executive-02",
    name: "Belgravia",
    category: "executive",
    description: "Symmetrical executive frame with a bordered offer and formal acceptance deed.",
    tags: ["framed", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ border: `1px solid ${t.rule}`, padding: 22 }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
              <div style={{ textAlign: "right", fontFamily: "'Playfair Display'" }}>
                <div style={{ fontSize: px(t.base * 1.4), color: t.ink, letterSpacing: "0.16em" }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted, fontFamily: t.sans, marginTop: 4 }}>{ctx.doc.number}</div>
              </div>
            </Row>
            <div style={{ height: 1, background: t.rule, margin: "18px 0" }} />
            <Row gap={24} align="flex-start">
              <div style={{ flex: 1 }}>
                <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
              </div>
              <div style={{ width: 250 }}>
                <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" align="right" />
              </div>
            </Row>
            <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule" align="center">Scope &amp; deliverables</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Bullets t={t} items={[...scope(ctx), ...deliverables(ctx)]} variant="dot" columns={2} />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <ItemsTable ctx={ctx} t={t} variant="lined" />
            </div>
            <Row justify="flex-end" style={{ marginTop: 14 }}>
              <div style={{ width: 292 }}>
                <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
              </div>
            </Row>
            <div style={{ marginTop: 20 }}>
              <AcceptanceBlock ctx={ctx} t={t} variant="box" />
            </div>
          </div>
          <div style={{ marginTop: 18, textAlign: "center", fontSize: px(t.base * 0.7), color: t.faint, letterSpacing: "0.06em" }}>
            {[ctx.business?.name, ctx.business?.addressLine1, ctx.business?.city, ctx.business?.country, ctx.business?.phone, ctx.business?.email].filter(Boolean).join(" · ")}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-executive-03",
    name: "Aurelia",
    category: "executive",
    description: "Gold-accented executive quotation with an emphasised investment panel.",
    tags: ["gold", "premium"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const gold = "#b8860b";
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 46 }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ height: 1, background: gold, margin: "8px 0 6px auto", width: 90 }} />
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="plain" />
          </div>
          <div style={{ marginTop: 18 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <ScopeBlock ctx={ctx} t={t} variant="numbered" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 306, background: "#fbf7ee", border: `1px solid #ecdfc2`, borderRadius: 4, padding: 14 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" labelColor="#8a7436" valueColor={t.ink} showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-executive-04",
    name: "Regent Quote",
    category: "executive",
    description: "Ruled executive grid with a prominent envelope-style address block.",
    tags: ["ruled", "address"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `3px double ${t.ink}`, paddingBottom: 14 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.34), color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
            </Row>
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 300, border: `1px solid ${t.rule}`, borderRadius: 3, padding: 14 }}>
              <Label t={t}>{ctx.labels.billTo}</Label>
              <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink, marginTop: 6 }}>{ctx.payload.clientName}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>
                {(clientLines(ctx) as (string)[]).map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="rule">Schedule of works</SectionHeading>
            <Bullets t={t} items={[...scope(ctx), ...deliverables(ctx)]} variant="dot" />
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} />
            </div>
            <div style={{ width: 290 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="dual" />
          </div>
        </PaperShell>
      );
    },
  },

  /* ── Minimal ───────────────────────────────────────────────────────────── */
  {
    id: "quotation-minimal-01",
    name: "Swiss Quote",
    category: "minimal",
    description: "Pure grid quotation: three data columns, hairline rules, no decoration.",
    tags: ["grid", "hairline"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1), fontWeight: 700, color: t.ink }}>{ctx.business?.name ?? ""}</div>
              <div style={{ marginTop: 6 }}>
                <ContactLines ctx={ctx} t={t} compact />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label t={t}>{ctx.labels.title}</Label>
              <div style={{ fontSize: px(t.base * 0.86), fontWeight: 600, color: t.ink, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 20 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 18 }}>
            {[
              ["Reference", String(ctx.payload.reference ?? "—")],
              [ctx.labels.dateLabel, dt(ctx.doc.issueDate, ctx)],
              [ctx.labels.validLabel, ctx.doc.validUntil ? dt(ctx.doc.validUntil, ctx) : "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <Label t={t}>{k}</Label>
                <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <SectionHeading t={t} variant="plain">Scope</SectionHeading>
            <Bullets t={t} items={scope(ctx)} variant="dash" />
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 284 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-minimal-02",
    name: "Note",
    category: "minimal",
    description: "Informal but precise — reads like a well-written covering note with figures.",
    tags: ["letter", "personal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: px(t.base * 1.2), fontWeight: 700, color: t.ink, fontFamily: t.heading }}>{String(ctx.payload.subject ?? ctx.labels.title)}</div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.faint, marginTop: 4 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
          </div>
          <div style={{ marginTop: 20, lineHeight: 1.7, fontSize: px(t.base * 0.84), color: t.body }}>
            <span style={{ display: "block", marginBottom: 8 }}>Hello {ctx.payload.clientName?.split(" ")[0] || "there"},</span>
            {String(ctx.payload.intro ?? "")}
          </div>
          <div style={{ marginTop: 20 }}>
            <Bullets t={t} items={scope(ctx)} variant="check" />
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 268 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <Prose t={t} size={0.8} muted>{String(ctx.payload.notes ?? "Happy to walk you through this at your convenience.")}</Prose>
          </div>
          <div style={{ marginTop: 18 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-minimal-03",
    name: "Column",
    category: "minimal",
    description: "Two-column reading rhythm: narrative on the left, figures held at the right.",
    tags: ["columns", "editorial"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 30 }}>
            <div>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 38, subColor: t.faint }} />
              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>{String(ctx.payload.subject ?? ctx.labels.title)}</div>
              </div>
              <div style={{ marginTop: 16 }}>{introBlock(ctx, t)}</div>
              <div style={{ marginTop: 18 }}>
                <SectionHeading t={t} variant="bar">Scope</SectionHeading>
                <Bullets t={t} items={scope(ctx)} variant="dot" />
              </div>
              <div style={{ marginTop: 18 }}>
                <SectionHeading t={t} variant="bar">Deliverables</SectionHeading>
                <Bullets t={t} items={deliverables(ctx)} variant="check" />
              </div>
              <div style={{ marginTop: 20 }}>
                <AcceptanceBlock ctx={ctx} t={t} variant="box" />
              </div>
            </div>
            <div>
              <div style={{ borderTop: `2px solid ${t.ink}`, paddingTop: 12 }}>
                <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" />
              </div>
              <div style={{ marginTop: 16 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
              </div>
              <div style={{ marginTop: 12 }}>
                <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
              </div>
              <div style={{ marginTop: 16 }}>
                <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
              </div>
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-minimal-04",
    name: "Fjord Quote",
    category: "minimal",
    description: "Generous white space, single accent dot and a compact figures rail.",
    tags: ["airy", "nordic"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 36, subColor: t.faint }} />
            <div style={{ fontSize: px(t.base * 0.74), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>{ctx.labels.title}</div>
          </Row>
          <div style={{ marginTop: 34 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>{String(ctx.payload.subject ?? ctx.doc.title)}</div>
            <div style={{ marginTop: 10, width: 34, height: 3, background: t.accent, borderRadius: 99 }} />
          </div>
          <div style={{ marginTop: 24 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 22 }}>
            <Bullets t={t} items={scope(ctx)} variant="check" columns={2} />
          </div>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="space-between" style={{ marginTop: 18 }} align="flex-end">
            <div style={{ flex: 1 }}>
              <MetaGrid t={t} items={quoteMeta(ctx)} variant="inline" />
            </div>
            <div style={{ width: 260 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },

  /* ── Creative ──────────────────────────────────────────────────────────── */
  {
    id: "quotation-creative-01",
    name: "Ribbon Quote",
    category: "creative",
    description: "Corner ribbon and a solid investment bar — great for agencies.",
    tags: ["ribbon", "agency"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 250, height: 200, background: t.accent, clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
          <div style={{ position: "relative" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 44 }} />
            <div style={{ textAlign: "right", color: "#fff", marginTop: -36 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.32), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.76), opacity: 0.92 }}>{ctx.doc.number}</div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 20 }}>
            <ScopeBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" />
          </div>
          <div style={{ marginTop: 16, background: t.accent, color: "#fff", borderRadius: 4, padding: "13px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: px(t.base * 0.8), letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, opacity: 0.92 }}>Total investment</span>
            <span style={{ fontFamily: t.heading, fontSize: px(t.base * 1.42), fontWeight: 800 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</span>
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="outline" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-creative-02",
    name: "Studio",
    category: "creative",
    description: "Big type, numbered milestones and a photographic-style image plate.",
    tags: ["bold-type", "milestones"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ background: t.ink, color: "#fff", borderRadius: 6, padding: "26px 24px" }}>
            <Row justify="space-between" align="flex-start">
              <div style={{ maxWidth: 380 }}>
                <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: t.accent }}>{ctx.labels.title}</div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, marginTop: 10, lineHeight: 1.25 }}>{String(ctx.payload.subject ?? ctx.doc.title)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <BusinessLogo ctx={ctx} t={t} opts={{ showName: false, size: 48, markBackground: "rgba(255,255,255,0.16)" }} />
                <div style={{ fontSize: px(t.base * 0.74), opacity: 0.8, marginTop: 10 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </div>
          <div style={{ marginTop: 22 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <TimelineBlock ctx={ctx} t={t} variant="cards" />
          </div>
          <div style={{ marginTop: 18 }}>
            <Bullets t={t} items={scope(ctx)} variant="check" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 290 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-creative-03",
    name: "Sunburst Quote",
    category: "creative",
    description: "Layered shape header with a bright scope card and pill inclusions.",
    tags: ["shapes", "pills"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -140, right: -110, width: 340, height: 340, borderRadius: 999, background: t.tint }} />
          <div style={{ position: "relative" }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 44 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.46), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.accent, fontWeight: 700 }}>{ctx.doc.number}</div>
              </div>
            </Row>
            <div style={{ marginTop: 24 }}>
              <ScopeBlock ctx={ctx} t={t} variant="tinted" />
            </div>
            <div style={{ marginTop: 16 }}>
              <TagList t={t} items={deliverables(ctx)} variant="solid" />
            </div>
            <div style={{ marginTop: 20 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" />
            </div>
            <div style={{ marginTop: 16, border: `2px solid ${t.accent}`, borderRadius: 6, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Label t={t}>Total investment</Label>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 3 }}>Valid until {ctx.doc.validUntil ? dt(ctx.doc.validUntil, ctx) : "—"}</div>
              </div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.55), fontWeight: 800, color: t.accent }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            </div>
            <div style={{ marginTop: 20 }}>
              <AcceptanceBlock ctx={ctx} t={t} />
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-creative-04",
    name: "Kinetic Quote",
    category: "creative",
    description: "Diagonal masthead energy contained by a strict pricing grid.",
    tags: ["diagonal", "dynamic"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 160, background: `linear-gradient(115deg, ${t.accent}, ${t.ink})`, clipPath: "polygon(0 0, 100% 0, 100% 74%, 0 100%)" }} />
          <div style={{ position: "relative", color: "#fff", paddingBottom: 20 }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </div>
          <div style={{ marginTop: 36 }}>
            <Row gap={20} align="flex-start">
              <div style={{ flex: 1 }}>
                <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
              </div>
              <div style={{ width: 250 }}>
                <MetaGrid t={t} items={quoteMeta(ctx)} variant="rows" align="right" />
              </div>
            </Row>
          </div>
          <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <Bullets t={t} items={scope(ctx)} variant="arrow" columns={2} />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-creative-05",
    name: "Mosaic Quote",
    category: "creative",
    description: "Tile header with inclusions in colour blocks and a split investment panel.",
    tags: ["tiles", "colour"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const tiles = scope(ctx).slice(0, 3);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={10} align="stretch">
            <div style={{ flex: 2, background: t.accent, borderRadius: 4, padding: 16, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>{ctx.labels.title}</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 800, marginTop: 8 }}>{ctx.doc.number}</div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
              <Label t={t}>Prepared for</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink, marginTop: 5 }}>{ctx.payload.clientCompany || ctx.payload.clientName}</div>
            </div>
            <div style={{ flex: 1, background: t.ink, borderRadius: 4, padding: 14, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Valid until</div>
              <div style={{ fontSize: px(t.base * 0.92), fontWeight: 700, marginTop: 6 }}>{ctx.doc.validUntil ? dt(ctx.doc.validUntil, ctx) : "—"}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>{introBlock(ctx, t)}</div>
          {tiles.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginTop: 18 }}>
              {tiles.map((tile, i) => (
                <div key={i} style={{ background: t.tint, borderRadius: 4, padding: 12, borderTop: `3px solid ${t.accent}` }}>
                  <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.04), fontWeight: 800, color: t.accent }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontSize: px(t.base * 0.78), color: t.body, marginTop: 5, lineHeight: 1.5 }}>{tile}</div>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="boxed" />
            </div>
            <div style={{ width: 288 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "quotation-creative-06",
    name: "Origami Quote",
    category: "creative",
    description: "Folded corner accents with a folded-paper investment summary.",
    tags: ["fold", "playful"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <CornerTriangle t={t} size={110} corner="top-right" />
          <div style={{ width: 0, height: 0, borderTop: "110px solid transparent", borderRight: `110px solid ${t.soft}`, position: "absolute", top: 0, right: 0 }} />
          <Row justify="space-between" align="flex-start" style={{ position: "relative" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
            <div style={{ textAlign: "right", marginRight: 66 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.76), color: t.muted }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>{introBlock(ctx, t)}</div>
          <div style={{ marginTop: 18 }}>
            <ScopeBlock ctx={ctx} t={t} variant="check" />
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AcceptanceBlock ctx={ctx} t={t} variant="box" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
];
