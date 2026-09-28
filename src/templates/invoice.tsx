import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  AmountWords, BankDetails, Bullets, BusinessLogo, ContactLines, CornerTriangle, FooterBar, HeaderBand, ItemsTable, Label,
  MetaGrid, PaperShell, PartyCard, QrPanel, Row, SectionHeading, SignatureBlock, TitlePlate, TotalsBlock, tokens, dt, px,
} from "./primitives";

/* Invoice designs — 20 layouts across corporate, modern, executive, minimal and creative. */

const meta = (ctx: TemplateContext) => {
  const items = [
    { label: ctx.labels.numberLabel, value: ctx.doc.number },
    { label: ctx.labels.dateLabel, value: dt(ctx.doc.issueDate, ctx) },
  ];
  if (ctx.doc.dueDate) items.push({ label: ctx.labels.dueLabel, value: dt(ctx.doc.dueDate, ctx) });
  if (ctx.payload.reference) items.push({ label: "Reference", value: String(ctx.payload.reference) });
  if (ctx.payload.poNumber) items.push({ label: "PO number", value: String(ctx.payload.poNumber) });
  return items;
};

const clientLines = (ctx: TemplateContext): (string | undefined)[] => [
  ctx.payload.clientCompany && ctx.payload.clientCompany !== ctx.payload.clientName ? ctx.payload.clientCompany : undefined,
  ctx.payload.clientEmail,
  ctx.payload.clientPhone,
  ctx.payload.clientAddress,
  ctx.payload.clientTaxId ? `Tax ID: ${ctx.payload.clientTaxId}` : undefined,
];

type Design = Omit<TemplateMeta, "kind">;

export const invoiceTemplates: Design[] = [
  /* ── Corporate ─────────────────────────────────────────────────────────── */
  {
    id: "invoice-corporate-01",
    name: "Ledger",
    category: "corporate",
    description: "The dependable corporate standard: symmetric header, ruled table, quiet totals.",
    tags: ["classic", "ruled", "safe"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <ContactLines ctx={ctx} t={t} align="right" />
          </Row>
          <div style={{ height: 1, background: t.ink, margin: "22px 0 0" }} />
          <div style={{ height: 1, background: t.ink, marginTop: 3 }} />
          <Row justify="space-between" align="flex-end" style={{ marginTop: 18 }}>
            <TitlePlate ctx={ctx} t={t} variant="plain" align="left" showNumber={false} />
            <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 24 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="plain" />
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 20 }}>
            <div style={{ width: 306 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <AmountWords ctx={ctx} t={t} />
          <Row gap={22} style={{ marginTop: 22 }}>
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} />
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} /> : null}
          </Row>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-corporate-02",
    name: "Meridian",
    category: "corporate",
    description: "Boxed specification grid with a solid table header and structured totals panel.",
    tags: ["structured", "grid", "professional"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.accent, fontWeight: 700, marginTop: 3, letterSpacing: "0.08em" }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="tinted" columns={3} />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading={ctx.labels.from} name={ctx.business?.name ?? String(ctx.payload.companyName ?? "")} lines={[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.phone, ctx.business?.email]} />
            </div>
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="boxed" />
            </div>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" />
            </div>
          </Row>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-corporate-03",
    name: "Summit",
    category: "corporate",
    description: "Full-bleed solid header band with the branding reversed out in white.",
    tags: ["band", "bold", "brand"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ background: "#fff" }}>
          <HeaderBand t={t} variant="solid">
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#ffffff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 800, letterSpacing: "0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9, marginTop: 3 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <Row justify="space-between" style={{ marginTop: 22 }} align="flex-start">
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="striped" showTax />
          </div>
          <Row gap={20} justify="space-between" style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} variant="tinted" />
              <div style={{ marginTop: 14 }}>
                <BankDetails ctx={ctx} t={t} variant="tinted" />
              </div>
            </div>
            <div style={{ width: 304 }}>
              <TotalsBlock ctx={ctx} t={t} variant="striped" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-corporate-04",
    name: "Beacon",
    category: "corporate",
    description: "Centred letterhead with a double rule — ideal for established trading houses.",
    tags: ["letterhead", "centred"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 46 }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <ContactLines ctx={ctx} t={t} align="center" />
            </div>
          </div>
          <div style={{ height: 2, background: t.accent, marginTop: 18 }} />
          <div style={{ height: 1, background: t.rule, marginTop: 3 }} />
          <Row justify="space-between" align="flex-end" style={{ marginTop: 20 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="rows" />
            <TitlePlate ctx={ctx} t={t} variant="underline" align="right" />
          </Row>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.from} name={ctx.business?.name ?? ""} lines={[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.email]} />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <BankDetails ctx={ctx} t={t} variant="boxed" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-corporate-05",
    name: "Concorde",
    category: "corporate",
    description: "Two-tone header with an accent stripe and dense information architecture.",
    tags: ["stripe", "dense"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="tinted" height={96}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.accent, letterSpacing: "0.06em" }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 2 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <Row gap={16} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 300 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="tinted-head" showTax />
          </div>
          <Row gap={20} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">{ctx.labels.notes}</SectionHeading>
              <p style={{ fontSize: px(t.base * 0.79), color: t.muted, lineHeight: 1.6, margin: 0 }}>{String(ctx.payload.notes ?? "")}</p>
            </div>
            <div style={{ width: 296 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },

  /* ── Modern ────────────────────────────────────────────────────────────── */
  {
    id: "invoice-modern-01",
    name: "Aurora",
    category: "modern",
    description: "Gradient header, borderless table and a floating totals card.",
    tags: ["gradient", "bold", "sales"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="gradient" height={104}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#ffffff", subColor: "rgba(255,255,255,0.8)", markBackground: "rgba(255,255,255,0.22)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.7), fontWeight: 800, letterSpacing: "-0.01em" }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.82), opacity: 0.92, marginTop: 2 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
          </HeaderBand>
          <Row gap={20} style={{ marginTop: 24 }} align="flex-start">
            <div style={{ width: 260 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="tinted" />
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <MetaGrid t={t} items={meta(ctx).slice(0, 3)} variant="inline" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 320 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" />
            </div>
          </Row>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} />
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={80} /> : null}
          </Row>
          <div style={{ marginTop: 22 }}>
            <BankDetails ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-modern-02",
    name: "Northwind",
    category: "modern",
    description: "Left rail carries branding and metadata; the invoice body breathes on the right.",
    tags: ["sidebar", "editorial"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarSide="left"
          sidebarWidth={242}
          sidebar={
            <div style={{ background: t.accent, minHeight: 1123, padding: "36px 26px", color: "#fff", display: "flex", flexDirection: "column", gap: 26 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)", stack: true, align: "left" }} />
              <div>
                <Label t={t} color="rgba(255,255,255,0.7)">Contact</Label>
                <div style={{ marginTop: 8 }}>
                  <ContactLines ctx={ctx} t={t} color="rgba(255,255,255,0.92)" />
                </div>
              </div>
              <div>
                <Label t={t} color="rgba(255,255,255,0.7)">{ctx.labels.numberLabel}</Label>
                <div style={{ fontSize: px(t.base * 0.9), fontWeight: 700, marginTop: 5 }}>{ctx.doc.number}</div>
                <Label t={t} color="rgba(255,255,255,0.7)">{ctx.labels.dateLabel}</Label>
                <div style={{ fontSize: px(t.base * 0.86), marginTop: 5 }}>{dt(ctx.doc.issueDate, ctx)}</div>
                {ctx.doc.dueDate ? (
                  <>
                    <Label t={t} color="rgba(255,255,255,0.7)">{ctx.labels.dueLabel}</Label>
                    <div style={{ fontSize: px(t.base * 0.86), marginTop: 5 }}>{dt(ctx.doc.dueDate, ctx)}</div>
                  </>
                ) : null}
              </div>
              <div style={{ marginTop: "auto" }}>
                {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={92} caption={ctx.labels.qrHint} /> : null}
              </div>
            </div>
          }
        >
          <TitlePlate ctx={ctx} t={t} variant="split" />
          <div style={{ marginTop: 26 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
          </div>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 290 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <BankDetails ctx={ctx} t={t} variant="tinted" />
          </div>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} variant="line" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-modern-03",
    name: "Cobalt",
    category: "modern",
    description: "Deep right rail with reversed typography and a spacious left column.",
    tags: ["sidebar-right", "contrast"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarSide="right"
          sidebarWidth={228}
          sidebar={
            <div style={{ background: "#0f1c33", minHeight: 1123, padding: "36px 24px", color: "#fff", display: "flex", flexDirection: "column", gap: 22 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.7)", markBackground: `linear-gradient(135deg, ${t.accent}, rgba(255,255,255,0.18))`, stack: true }} />
              <div>
                <Label t={t} color="rgba(255,255,255,0.6)">Reach us</Label>
                <div style={{ marginTop: 7 }}>
                  <ContactLines ctx={ctx} t={t} color="rgba(255,255,255,0.88)" />
                </div>
              </div>
              <div>
                <Label t={t} color="rgba(255,255,255,0.6)">Summary</Label>
                {[
                  [ctx.labels.numberLabel, ctx.doc.number],
                  [ctx.labels.dateLabel, dt(ctx.doc.issueDate, ctx)],
                  [ctx.labels.dueLabel, ctx.doc.dueDate ? dt(ctx.doc.dueDate, ctx) : "—"],
                  [ctx.labels.total, `${ctx.payload.currency} ${ctx.totals.total.toFixed(2)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: px(t.base * 0.76), padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <span style={{ opacity: 0.7 }}>{k}</span>
                    <span style={{ fontWeight: 650 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.16)", fontSize: px(t.base * 0.7), opacity: 0.7, lineHeight: 1.5 }}>{ctx.labels.thankYou}</div>
            </div>
          }
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, color: t.ink, letterSpacing: "-0.025em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ height: 5, width: 74, background: t.accent, borderRadius: 99, marginTop: 10 }} />
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.8), color: t.muted }}>
              <div style={{ fontWeight: 700, color: t.ink }}>{ctx.doc.number}</div>
              <div>{ctx.payload.subject ? String(ctx.payload.subject) : ctx.doc.title}</div>
            </div>
          </div>
          <Row gap={16} style={{ marginTop: 26 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="outline" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 286 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <BankDetails ctx={ctx} t={t} variant="boxed" />
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} variant="tinted" align="right" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-modern-04",
    name: "Pulse",
    category: "modern",
    description: "Badge title, tinted specification band and accent-striped line items.",
    tags: ["badge", "fresh"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 46 }} />
            <TitlePlate ctx={ctx} t={t} variant="badge" subtitle={<span style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number}</span>} />
          </Row>
          <div style={{ marginTop: 22 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="tinted" columns={4} />
          </div>
          <Row gap={18} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1.1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.from} name={ctx.business?.name ?? ""} lines={[ctx.business?.email, ctx.business?.phone, ctx.business?.city]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" />
          </div>
          <Row gap={20} justify="space-between" style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">{ctx.labels.notes}</SectionHeading>
              <p style={{ fontSize: px(t.base * 0.79), color: t.muted, lineHeight: 1.6, margin: 0 }}>{String(ctx.payload.notes ?? "")}</p>
              {ctx.payload.terms ? (
                <>
                  <SectionHeading t={t} variant="bar"><span style={{ display: "inline-block", marginTop: 10 }}>{ctx.labels.terms}</span></SectionHeading>
                  <p style={{ fontSize: px(t.base * 0.76), color: t.faint, lineHeight: 1.6, margin: 0 }}>{String(ctx.payload.terms)}</p>
                </>
              ) : null}
            </div>
            <div style={{ width: 292 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} variant="line" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-modern-05",
    name: "Vector",
    category: "modern",
    description: "Oversized wordmark, hairline rules and a shadowed totals card.",
    tags: ["typographic", "light"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <BusinessLogo ctx={ctx} t={t} opts={{ size: 56 }} />
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${t.ink}`, paddingBottom: 10 }}>
              <span style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</span>
              <span style={{ fontSize: px(t.base * 0.84), color: t.muted, fontWeight: 600 }}>{ctx.doc.number}</span>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="inline" />
          </div>
          <Row gap={24} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ flex: 1 }}>
              <ContactLines ctx={ctx} t={t} align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 320 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Signature" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },

  /* ── Executive ─────────────────────────────────────────────────────────── */
  {
    id: "invoice-executive-01",
    name: "Chancery",
    category: "executive",
    description: "Serif display typesetting with a centred monogram and generous margins.",
    tags: ["serif", "formal", "premium"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const headingFont = "'Playfair Display'";
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 50, subColor: t.faint }} />
            </div>
            <div style={{ height: 1, background: t.accent, marginTop: 16, width: 130, marginLeft: "auto", marginRight: "auto" }} />
            <div style={{ fontFamily: headingFont, fontSize: px(t.base * 1.7), color: t.ink, marginTop: 16, letterSpacing: "0.22em" }}>{ctx.labels.title.toUpperCase()}</div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 6, letterSpacing: "0.14em" }}>{ctx.doc.number}</div>
          </div>
          <Row justify="space-between" style={{ marginTop: 26 }} align="flex-start">
            <div style={{ fontFamily: headingFont, fontSize: px(t.base * 0.9), color: t.muted }}>
              {ctx.labels.dateLabel} · {dt(ctx.doc.issueDate, ctx)}
              {ctx.doc.dueDate ? <div>{ctx.labels.dueLabel} · {dt(ctx.doc.dueDate, ctx)}</div> : null}
            </div>
            <div style={{ textAlign: "right", fontFamily: headingFont, fontSize: px(t.base * 0.9) }}>
              <div style={{ color: t.faint, fontFamily: t.sans, fontSize: px(t.base * 0.7), letterSpacing: "0.14em", textTransform: "uppercase" }}>{ctx.labels.billTo}</div>
              <div style={{ color: t.ink, marginTop: 4, fontWeight: 600 }}>{ctx.payload.clientName || ctx.payload.clientCompany}</div>
              <div style={{ color: t.muted, fontSize: px(t.base * 0.8), fontFamily: t.sans }}>{String(ctx.payload.clientAddress ?? "")}</div>
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" compact />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showDiscount showPaid />
            </div>
          </Row>
          <div style={{ marginTop: 24, textAlign: "center", fontFamily: headingFont, fontSize: px(t.base * 0.84), color: t.muted, fontStyle: "italic" }}>
            {ctx.labels.thankYou}
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" variant="line" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-executive-02",
    name: "Regent",
    category: "executive",
    description: "Double rule letterhead with ruled specification table — boardroom ready.",
    tags: ["double-rule", "serif"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 48, showName: true, subColor: t.faint }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink, letterSpacing: "0.12em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ height: 3, background: t.ink, marginTop: 20 }} />
          <div style={{ height: 1, background: t.ink, marginTop: 3 }} />
          <Row gap={24} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ width: 280 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" />
          </div>
          <Row gap={20} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} />
            </div>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" />
            </div>
          </Row>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-executive-03",
    name: "St. James",
    category: "executive",
    description: "Ornamented centre letterhead with a boxed fee summary.",
    tags: ["ornament", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 18, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 44 }} />
            </div>
            <div style={{ marginTop: 10, fontSize: px(t.base * 0.76), color: t.muted, letterSpacing: "0.02em" }}>
              {[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.country].filter(Boolean).join(" · ")}
            </div>
            <div style={{ marginTop: 4, fontSize: px(t.base * 0.76), color: t.muted }}>
              {[ctx.business?.phone, ctx.business?.email, ctx.business?.website].filter(Boolean).join(" · ")}
            </div>
          </div>
          <Row justify="space-between" style={{ marginTop: 18 }} align="flex-end">
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.28), color: t.ink, letterSpacing: "0.16em" }}>{ctx.labels.title.toUpperCase()}</div>
            <MetaGrid t={t} items={meta(ctx)} variant="inline" align="right" />
          </Row>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1, borderTop: `1px solid ${t.rule}`, paddingTop: 12 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 306, border: `1px solid ${t.rule}`, borderRadius: 3, padding: 14 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="For and on behalf of" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-executive-04",
    name: "Barrister",
    category: "executive",
    description: "Numbered clauses and a formal schedule — reads like instructions to counsel.",
    tags: ["formal", "numbered"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `2px solid ${t.ink}`, paddingBottom: 12 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40, showName: true }} />
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.3), color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
            </Row>
          </div>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 20 }}>
            <PartyCard t={t} heading="1. The client" name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">2. Schedule of charges</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="boxed" compact showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" />
            </div>
          </Row>
          {ctx.payload.terms ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="plain">3. Terms of payment</SectionHeading>
              <p style={{ fontSize: px(t.base * 0.79), color: t.muted, lineHeight: 1.6, margin: 0 }}>{String(ctx.payload.terms)}</p>
            </div>
          ) : null}
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} variant="box" align="left" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },

  /* ── Minimal ───────────────────────────────────────────────────────────── */
  {
    id: "invoice-minimal-01",
    name: "Swiss",
    category: "minimal",
    description: "Strict grid, hairline rules and a single accent rule. Nothing wasted.",
    tags: ["grid", "hairline", "print-cheap"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 700, color: t.ink }}>{ctx.business?.name ?? ""}</div>
              <div style={{ marginTop: 6 }}>
                <ContactLines ctx={ctx} t={t} compact />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label t={t}>{ctx.labels.title}</Label>
              <div style={{ fontSize: px(t.base * 0.86), color: t.ink, fontWeight: 600, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 20 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 20 }}>
            {[
              [ctx.labels.dateLabel, dt(ctx.doc.issueDate, ctx)],
              [ctx.labels.dueLabel, ctx.doc.dueDate ? dt(ctx.doc.dueDate, ctx) : "—"],
              [ctx.labels.total, `${ctx.payload.currency} ${ctx.totals.total.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k}>
                <Label t={t}>{k}</Label>
                <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26 }}>
            <Label t={t}>{ctx.labels.billTo}</Label>
            <div style={{ marginTop: 6 }}>
              <PartyCard t={t} heading="" name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </div>
          <div style={{ marginTop: 26 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 286 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <div style={{ marginTop: 30 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note={ctx.labels.thankYou} />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-minimal-02",
    name: "Paperclip",
    category: "minimal",
    description: "Top-right title, bottom-ruled items and a light footprint for everyday billing.",
    tags: ["light", "everyday"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 700, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.faint, marginTop: 3 }}>#{ctx.doc.number}</div>
            </div>
          </Row>
          <Row gap={22} style={{ marginTop: 28 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <Label t={t}>{ctx.labels.billTo}</Label>
              <div style={{ marginTop: 6, fontSize: px(t.base * 0.86), color: t.ink, fontWeight: 650 }}>{ctx.payload.clientName || ctx.payload.clientCompany}</div>
              <div style={{ marginTop: 4 }}>
                <ContactLines ctx={ctx} t={t} compact />
              </div>
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 26 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-minimal-03",
    name: "Grid",
    category: "minimal",
    description: "Vertical rule column layout inspired by technical documentation.",
    tags: ["columns", "technical"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 24, borderTop: `2px solid ${t.ink}`, paddingTop: 18 }}>
            <div>
              <Label t={t}>Issued</Label>
              <div style={{ fontSize: px(t.base * 0.86), color: t.ink, marginTop: 4 }}>{dt(ctx.doc.issueDate, ctx)}</div>
              <div style={{ marginTop: 14 }}>
                <Label t={t}>{ctx.labels.billTo}</Label>
                <div style={{ fontSize: px(t.base * 0.84), color: t.ink, marginTop: 4, fontWeight: 600 }}>{ctx.payload.clientName}</div>
                <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 2 }}>{String(ctx.payload.clientAddress ?? "")}</div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Label t={t}>{ctx.labels.numberLabel}</Label>
                <div style={{ fontSize: px(t.base * 0.84), color: t.ink, marginTop: 4 }}>{ctx.doc.number}</div>
              </div>
            </div>
            <div style={{ borderLeft: `1px solid ${t.rule}`, paddingLeft: 24 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, marginTop: 16, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 4 }}>{String(ctx.payload.subject ?? "")}</div>
              <div style={{ marginTop: 20 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" compact />
              </div>
              <Row justify="flex-end" style={{ marginTop: 14 }}>
                <div style={{ width: 270 }}>
                  <TotalsBlock ctx={ctx} t={t} variant="plain" />
                </div>
              </Row>
              <div style={{ marginTop: 20 }}>
                <BankDetails ctx={ctx} t={t} />
              </div>
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-minimal-04",
    name: "Fjord",
    category: "minimal",
    description: "Airy Nordic layout: light accents, wide leading and a compact totals rail.",
    tags: ["airy", "nordic"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 36, subColor: t.faint }} />
            <div style={{ width: 8, height: 8, borderRadius: 99, background: t.accent }} />
          </Row>
          <div style={{ marginTop: 34 }}>
            <div style={{ fontSize: px(t.base * 0.74), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>{ctx.labels.title}</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 700, color: t.ink, marginTop: 8, lineHeight: 1.25 }}>{String(ctx.payload.subject ?? ctx.doc.title)}</div>
          </div>
          <Row gap={24} style={{ marginTop: 30 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 30 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="space-between" style={{ marginTop: 20 }} align="flex-end">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} />
            </div>
            <div style={{ width: 260 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },

  /* ── Creative ──────────────────────────────────────────────────────────── */
  {
    id: "invoice-creative-01",
    name: "Ribbon",
    category: "creative",
    description: "Corner geometry and a diagonal accent ribbon holding the document title.",
    tags: ["geometric", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 260, height: 210, background: t.accent, clipPath: "polygon(100% 0, 100% 100%, 0 0)", opacity: 0.96 }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 150, background: `linear-gradient(180deg, ${t.accent}, rgba(255,255,255,0))` }} />
          <div style={{ position: "relative", minHeight: 150 }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 46 }} />
            <div style={{ textAlign: "right", color: "#fff", marginTop: -34 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.36), fontWeight: 800, letterSpacing: "0.04em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), opacity: 0.92 }}>{ctx.doc.number}</div>
            </div>
          </div>
          <Row gap={20} style={{ marginTop: 14, position: "relative" }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 260 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 26 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 310 }}>
              <TotalsBlock ctx={ctx} t={t} variant="solid" />
            </div>
          </Row>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="boxed" />
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={84} /> : null}
          </Row>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-creative-02",
    name: "Sunburst",
    category: "creative",
    description: "Layered circles behind a confident title plate and solid totals bar.",
    tags: ["shapes", "vibrant"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -120, right: -90, width: 320, height: 320, borderRadius: 999, background: t.tint }} />
          <div style={{ position: "absolute", top: -60, right: -20, width: 160, height: 160, borderRadius: 999, border: `2px solid ${t.soft}` }} />
          <Row justify="space-between" align="flex-start" style={{ position: "relative" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 46, markBackground: t.accent }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.accent, fontWeight: 700, marginTop: 3 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <Row gap={18} style={{ marginTop: 26 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="outline" />
            </div>
            <div style={{ width: 260 }}>
              <MetaGrid t={t} items={meta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <div style={{ marginTop: 18, background: t.accent, color: "#fff", borderRadius: 4, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: px(t.base * 0.84), letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, opacity: 0.9 }}>{ctx.labels.total}</span>
            <span style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</span>
          </div>
          <Row gap={18} style={{ marginTop: 14 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid />
            </div>
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-creative-03",
    name: "Marigold",
    category: "creative",
    description: "Warm gold duotone with an offset title and decorative rule set.",
    tags: ["duotone", "warm"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid ${t.rule}`, paddingBottom: 18 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ showName: false, size: 52 }} />
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink }}>{ctx.business?.name ?? ""}</div>
                <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 3 }}>{[ctx.business?.city, ctx.business?.country].filter(Boolean).join(", ")}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 800, color: t.accent, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </div>
          <Row gap={22} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 250 }}>
              <ContactLines ctx={ctx} t={t} align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="striped" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 18 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <div style={{ height: 4, flex: 3, background: t.accent, borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: t.soft, borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: t.tint, borderRadius: 99 }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-creative-04",
    name: "Kinetic",
    category: "creative",
    description: "Diagonal split header with reversed white typography and kinetic rules.",
    tags: ["diagonal", "dynamic"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 172, background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, clipPath: "polygon(0 0, 100% 0, 100% 78%, 0 100%)" }} />
          <div style={{ position: "relative", color: "#fff", paddingBottom: 24 }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.82), opacity: 0.9 }}>{ctx.doc.number}</div>
              </div>
            </Row>
            <Row gap={26} style={{ marginTop: 22, color: "#fff" }}>
              {meta(ctx).slice(1, 4).map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.75, fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: px(t.base * 0.86), fontWeight: 650, marginTop: 3 }}>{m.value}</div>
                </div>
              ))}
            </Row>
          </div>
          <Row gap={20} style={{ marginTop: 42 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 312 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" />
            </div>
          </Row>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <Bullets t={t} variant="check" items={[ctx.labels.terms]} />
              <p style={{ fontSize: px(t.base * 0.78), color: t.muted, lineHeight: 1.6, margin: "6px 0 0" }}>{String(ctx.payload.terms ?? "Payment due within 30 days of invoice date.")}</p>
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={78} /> : null}
          </Row>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} variant="tinted" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-creative-05",
    name: "Mosaic",
    category: "creative",
    description: "Block mosaic header with colour tiles and a split fee summary.",
    tags: ["tiles", "colour-block"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={10} align="stretch" style={{ height: 92 }}>
            <div style={{ flex: 2, background: t.accent, borderRadius: 4, padding: 16, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>{ctx.labels.title}</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.26), fontWeight: 800 }}>{ctx.doc.number}</div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
              <Label t={t}>Issued</Label>
              <div style={{ fontSize: px(t.base * 0.82), fontWeight: 650, color: t.ink, marginTop: 4 }}>{dt(ctx.doc.issueDate, ctx)}</div>
              <Label t={t}><span style={{ display: "inline-block", marginTop: 10 }}>{ctx.labels.dueLabel}</span></Label>
              <div style={{ fontSize: px(t.base * 0.82), fontWeight: 650, color: t.ink, marginTop: 4 }}>{ctx.doc.dueDate ? dt(ctx.doc.dueDate, ctx) : "—"}</div>
            </div>
            <div style={{ flex: 1, background: t.ink, borderRadius: 4, padding: 14, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>{ctx.labels.total}</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.2), fontWeight: 800, marginTop: 6 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            </div>
          </Row>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            </div>
            <div style={{ width: 260 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showTax />
          </div>
          <Row gap={18} justify="space-between" style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="boxed" />
            </div>
            <div style={{ width: 292 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "invoice-creative-06",
    name: "Origami",
    category: "creative",
    description: "Folded-paper accents echo the Seedwel mark across a clean invoice body.",
    tags: ["fold", "playful"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <CornerTriangle t={t} size={120} corner="top-right" opacity={0.94} />
          <div style={{ width: 0, height: 0, borderTop: "120px solid transparent", borderRight: `120px solid ${t.soft}`, position: "absolute", top: 0, right: 0 }} />
          <Row justify="space-between" align="flex-start" style={{ position: "relative" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 44 }} />
            <div style={{ textAlign: "right", marginRight: 74 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.42), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 2 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 26 }}>
            <MetaGrid t={t} items={meta(ctx)} variant="tinted" columns={3} />
          </div>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.clientName} lines={clientLines(ctx)} variant="bar" />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.from} name={ctx.business?.name ?? ""} lines={[ctx.business?.email, ctx.business?.phone]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
];
