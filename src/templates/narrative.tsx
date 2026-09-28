import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  BankDetails, Bullets, BusinessLogo, ContactLines, CornerTriangle, FooterBar, HeaderBand, ItemsTable, Label, MetaGrid,
  PaperShell, PartyCard, Prose, QrPanel, Row, SectionHeading, SignatureBlock, TagList, TotalsBlock, dt, px, tokens,
  type Tokens,
} from "./primitives";

/* Narrative documents — proposals, company profiles, reports and contracts.
   These are read, not just checked, so typography and structure lead. */

const clientLines = (ctx: TemplateContext): (string | undefined)[] => [
  ctx.payload.clientCompany,
  ctx.payload.clientEmail,
  ctx.payload.clientPhone,
  ctx.payload.clientAddress,
];

const listOf = (ctx: TemplateContext, key: string): string[] => (ctx.payload[key] as string[] | undefined) ?? [];
const rowsOf = <T,>(ctx: TemplateContext, key: string): T[] => (ctx.payload[key] as T[] | undefined) ?? [];

const clientCard = (ctx: TemplateContext, heading = "Prepared for") => ({
  heading,
  name: String(ctx.payload.clientName ?? ctx.payload.companyName ?? ""),
  lines: clientLines(ctx),
});

const period = (ctx: TemplateContext) => {
  const start = ctx.payload.periodStart as string | undefined;
  const end = ctx.payload.periodEnd as string | undefined;
  if (!start && !end) return null;
  return `${start ? dt(start, ctx) : "—"} to ${end ? dt(end, ctx) : "—"}`;
};

const TimelineGrid = ({ ctx, t, variant = "rows" }: { ctx: TemplateContext; t: Tokens; variant?: "rows" | "cards" }) => {
  const items = rowsOf<{ id: string; phase: string; duration: string; details?: string }>(ctx, "timeline");
  if (!items.length) return null;
  if (variant === "cards")
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0,1fr))`, gap: 10 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ border: `1px solid ${t.rule}`, borderTop: `3px solid ${t.accent}`, borderRadius: 4, padding: 12 }}>
            <div style={{ fontSize: px(t.base * 0.68), color: t.accent, fontWeight: 700, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink, marginTop: 4 }}>{item.phase}</div>
            <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 3 }}>{item.duration}</div>
            {item.details ? <div style={{ fontSize: px(t.base * 0.73), color: t.muted, marginTop: 6, lineHeight: 1.5 }}>{item.details}</div> : null}
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 14, paddingBottom: 10, paddingTop: i === 0 ? 0 : 10, borderTop: i === 0 ? "none" : `1px solid ${t.rule}` }}>
          <div style={{ width: 92, flexShrink: 0, fontSize: px(t.base * 0.74), color: t.accent, fontWeight: 700 }}>{item.duration}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink }}>{item.phase}</div>
            {item.details ? <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{item.details}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};

const MetricsStrip = ({ ctx, t, variant = "plain" }: { ctx: TemplateContext; t: Tokens; variant?: "plain" | "tinted" | "dark" }) => {
  const metrics = rowsOf<{ id: string; label: string; value: string }>(ctx, "metrics");
  if (!metrics.length) return null;
  const dark = variant === "dark";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, minmax(0,1fr))`,
        gap: 14,
        background: dark ? t.ink : variant === "tinted" ? t.tint : "transparent",
        borderRadius: 4,
        padding: dark || variant === "tinted" ? 16 : 0,
      }}
    >
      {metrics.slice(0, 4).map((m) => (
        <div key={m.id}>
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: dark ? "#fff" : t.accent }}>{m.value}</div>
          <div style={{ fontSize: px(t.base * 0.72), color: dark ? "rgba(255,255,255,0.75)" : t.muted, marginTop: 3, lineHeight: 1.4 }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
};

type Design = Omit<TemplateMeta, "kind">;

/* ═════════════════════════════ PROPOSALS ═════════════════════════════════ */
export const proposalTemplates: Design[] = [
  {
    id: "proposal-corporate-01",
    name: "Engagement",
    category: "corporate",
    description: "Consulting-style proposal with numbered sections, timeline and priced investment.",
    tags: ["consulting", "numbered"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.44), fontWeight: 800, color: t.ink }}>PROPOSAL</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 3 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20, borderTop: `2px solid ${t.ink}`, paddingTop: 16 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, lineHeight: 1.2 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
            <div style={{ fontSize: px(t.base * 0.86), color: t.accent, marginTop: 6 }}>{String(ctx.payload.subject ?? "")}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <PartyCard t={t} heading={clientCard(ctx).heading} name={clientCard(ctx).name} lines={clientCard(ctx).lines} variant="tinted" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">1. Executive summary</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">2. The challenge</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.problem ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">3. Our approach</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.approach ?? "")}</Prose>
            <div style={{ marginTop: 8 }}>
              <Bullets t={t} items={listOf(ctx, "scope")} variant="check" columns={2} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">4. Timeline</SectionHeading>
            <TimelineGrid ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">5. Investment</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="lined" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 18 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "proposal-modern-01",
    name: "Momentum",
    category: "modern",
    description: "Gradient cover band, outcome tiles and a card-based investment summary.",
    tags: ["gradient", "tiles"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0 }}>
          <div style={{ background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, padding: "40px 52px", color: "#fff" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Business proposal</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, marginTop: 10, lineHeight: 1.15, maxWidth: 560 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
              <div style={{ fontSize: px(t.base * 0.86), opacity: 0.9, marginTop: 10 }}>{String(ctx.payload.subject ?? "")}</div>
              <div style={{ fontSize: px(t.base * 0.76), opacity: 0.8, marginTop: 14 }}>{ctx.doc.number} · prepared for {ctx.payload.clientCompany || ctx.payload.clientName}</div>
            </div>
          </div>
          <div style={{ padding: "28px 52px 52px" }}>
            {ctx.payload.intro ? (
              <div>
                <SectionHeading t={t} variant="tinted">Executive summary</SectionHeading>
                <Prose t={t} size={0.83}>{String(ctx.payload.intro)}</Prose>
              </div>
            ) : null}
            <div style={{ marginTop: 20 }}>
              <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            </div>
            <Row gap={22} style={{ marginTop: 22 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">The challenge</SectionHeading>
                <Prose t={t} size={0.8}>{String(ctx.payload.problem ?? "")}</Prose>
              </div>
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">Our approach</SectionHeading>
                <Prose t={t} size={0.8}>{String(ctx.payload.approach ?? "")}</Prose>
              </div>
            </Row>
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Scope &amp; deliverables</SectionHeading>
              <Row gap={20} align="flex-start">
                <div style={{ flex: 1 }}>
                  <Bullets t={t} items={listOf(ctx, "scope")} variant="check" />
                </div>
                <div style={{ flex: 1 }}>
                  <Bullets t={t} items={listOf(ctx, "deliverables")} variant="dot" />
                </div>
              </Row>
            </div>
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Phased delivery</SectionHeading>
              <TimelineGrid ctx={ctx} t={t} variant="cards" />
            </div>
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Investment</SectionHeading>
              <ItemsTable ctx={ctx} t={t} variant="borderless" />
            </div>
            <Row justify="flex-end" style={{ marginTop: 14 }}>
              <div style={{ width: 310 }}>
                <TotalsBlock ctx={ctx} t={t} variant="card" showPaid={false} />
              </div>
            </Row>
            {ctx.payload.whyUs ? (
              <div style={{ marginTop: 18, background: t.tint, borderRadius: 4, padding: 14 }}>
                <Label t={t}>Why us</Label>
                <div style={{ marginTop: 6 }}>
                  <Prose t={t} size={0.8}>{String(ctx.payload.whyUs)}</Prose>
                </div>
              </div>
            ) : null}
            <div style={{ marginTop: 20 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" />
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "proposal-executive-01",
    name: "Chancery Proposal",
    category: "executive",
    description: "Serif formal proposal with a memorandum-style heading and restrained styling.",
    tags: ["serif", "memorandum"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 46, subColor: t.faint }} />
            </div>
            <div style={{ height: 1, background: t.accent, width: 110, margin: "16px auto 0" }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink, marginTop: 16, letterSpacing: "0.16em" }}>PROPOSAL</div>
          </div>
          <div style={{ marginTop: 22, borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`, padding: "12px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "6px 18px", fontSize: px(t.base * 0.82) }}>
              {[
                ["To", `${ctx.payload.clientName ?? ""}${ctx.payload.clientCompany ? `, ${ctx.payload.clientCompany}` : ""}`],
                ["Reference", ctx.doc.number],
                ["Date", dt(ctx.doc.issueDate, ctx)],
                ["Subject", String(ctx.payload.subject ?? ctx.doc.title)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <span style={{ color: t.faint, fontFamily: t.sans, fontSize: px(t.base * 0.7), letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, paddingTop: 3 }}>{k}</span>
                  <span style={{ color: t.ink, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), lineHeight: 1.72, color: t.body }}>
            {String(ctx.payload.intro ?? "")}
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="rule" align="center">Our understanding</SectionHeading>
            <div style={{ marginTop: 10 }}>
              <Prose t={t} size={0.81}>{String(ctx.payload.problem ?? "")}</Prose>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="rule" align="center">Proposed approach</SectionHeading>
            <div style={{ marginTop: 10 }}>
              <Prose t={t} size={0.81}>{String(ctx.payload.approach ?? "")}</Prose>
              <div style={{ marginTop: 8 }}>
                <Bullets t={t} items={listOf(ctx, "scope")} variant="dot" />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="rule" align="center">Schedule of fees</SectionHeading>
            <div style={{ marginTop: 10 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" compact />
            </div>
          </div>
          <Row justify="flex-end" style={{ marginTop: 12 }}>
            <div style={{ width: 290 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 18, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.9), color: t.muted, fontStyle: "italic" }}>
            We would welcome the opportunity to discuss this proposal with you.
          </div>
          <div style={{ marginTop: 18 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "proposal-minimal-01",
    name: "Lucid",
    category: "minimal",
    description: "Whitespace-led proposal that reads as cleanly on screen as on paper.",
    tags: ["airy", "screen-first"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 60 }}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 36, subColor: t.faint }} />
            <div style={{ fontSize: px(t.base * 0.74), color: t.faint, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>{ctx.doc.number}</div>
          </Row>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2), fontWeight: 700, color: t.ink, lineHeight: 1.18 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
            <div style={{ marginTop: 14, width: 44, height: 3, background: t.accent, borderRadius: 99 }} />
          </div>
          <div style={{ marginTop: 26 }}>
            <Prose t={t} size={0.86}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 30 }}>
            <SectionHeading t={t} variant="plain">The challenge</SectionHeading>
            <Prose t={t} size={0.82}>{String(ctx.payload.problem ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="plain">Our approach</SectionHeading>
            <Prose t={t} size={0.82}>{String(ctx.payload.approach ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="plain">Deliverables</SectionHeading>
            <Bullets t={t} items={listOf(ctx, "deliverables")} variant="check" columns={2} />
          </div>
          <div style={{ marginTop: 24 }}>
            <TimelineGrid ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "proposal-creative-01",
    name: "Big Idea",
    category: "creative",
    description: "Poster-scale cover with a diagonal accent and a bold approach statement.",
    tags: ["poster", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", height: 300, background: `linear-gradient(125deg, ${t.ink} 40%, ${t.accent})`, padding: "40px 52px", color: "#fff" }}>
            <div style={{ position: "absolute", bottom: -60, right: -60, width: 260, height: 260, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
            <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.72)", markBackground: "rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", left: 52, right: 52, bottom: 40 }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Proposal for {ctx.payload.clientCompany || ctx.payload.clientName}</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2.3), fontWeight: 800, marginTop: 12, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 560 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
            </div>
          </div>
          <div style={{ padding: "30px 52px 52px" }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.16), fontWeight: 700, color: t.ink, lineHeight: 1.4 }}>{String(ctx.payload.subject ?? "")}</div>
            <div style={{ marginTop: 16 }}>
              <Prose t={t} size={0.84}>{String(ctx.payload.intro ?? "")}</Prose>
            </div>
            <div style={{ marginTop: 22 }}>
              <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            </div>
            <Row gap={24} style={{ marginTop: 22 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">Where you are today</SectionHeading>
                <Prose t={t} size={0.8}>{String(ctx.payload.problem ?? "")}</Prose>
              </div>
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">Where we take you</SectionHeading>
                <Prose t={t} size={0.8}>{String(ctx.payload.approach ?? "")}</Prose>
              </div>
            </Row>
            <div style={{ marginTop: 22 }}>
              <SectionHeading t={t} variant="bar">What you get</SectionHeading>
              <Bullets t={t} items={listOf(ctx, "deliverables")} variant="check" columns={2} />
            </div>
            <div style={{ marginTop: 22 }}>
              <SectionHeading t={t} variant="bar">Roadmap</SectionHeading>
              <TimelineGrid ctx={ctx} t={t} variant="cards" />
            </div>
            <div style={{ marginTop: 22 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" />
            </div>
            <Row justify="flex-end" style={{ marginTop: 14 }}>
              <div style={{ width: 310 }}>
                <TotalsBlock ctx={ctx} t={t} variant="solid" showPaid={false} />
              </div>
            </Row>
            <div style={{ marginTop: 20 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" />
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "proposal-corporate-02",
    name: "Tender Response",
    category: "corporate",
    description: "Sectioned tender response with compliance matrix and commercial summary.",
    tags: ["tender", "compliance"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `2px solid ${t.ink}`, paddingBottom: 12 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 800, color: t.ink }}>TENDER RESPONSE</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
          </div>
          <div style={{ marginTop: 16 }}>
            <MetaGrid t={t} items={[
              { label: "Submitted to", value: String(ctx.payload.clientCompany ?? ctx.payload.clientName ?? "—") },
              { label: "Submitted by", value: String(ctx.business?.name ?? "") },
              { label: "Valid until", value: ctx.doc.validUntil ? dt(ctx.doc.validUntil, ctx) : "—" },
              { label: "Reference", value: String(ctx.payload.reference ?? ctx.doc.number) },
            ]} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">1. Statement of understanding</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">2. Technical response</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.approach ?? "")}</Prose>
            <div style={{ marginTop: 8 }}>
              <Bullets t={t} items={listOf(ctx, "scope")} variant="numbered" columns={2} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">3. Compliance matrix</SectionHeading>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: px(t.base * 0.78) }}>
              <thead>
                <tr>
                  {["Requirement", "Our response", "Status"].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 2 ? "right" : "left", padding: "7px 8px", borderBottom: `1.5px solid ${t.ink}`, fontSize: px(t.base * 0.68), letterSpacing: "0.1em", textTransform: "uppercase", color: t.ink }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(listOf(ctx, "deliverables").length ? listOf(ctx, "deliverables") : ["—"]).map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${t.rule}`, color: t.body }}>{d}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${t.rule}`, color: t.muted }}>Compliant — included in scope of supply</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${t.rule}`, textAlign: "right", color: t.accent, fontWeight: 700 }}>Yes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">4. Commercial offer</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="boxed" compact showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 12 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 16 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Authorised to tender" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
];

/* ══════════════════════════ COMPANY PROFILES ═════════════════════════════ */
export const companyProfileTemplates: Design[] = [
  {
    id: "profile-corporate-01",
    name: "Corporate Profile",
    category: "corporate",
    description: "Complete capability document: story, services, track record and leadership.",
    tags: ["capability", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      const services = rowsOf<{ id: string; name: string; description: string }>(ctx, "services");
      const stats = rowsOf<{ id: string; label: string; value: string }>(ctx, "stats");
      const team = rowsOf<{ id: string; name: string; role: string; contact?: string }>(ctx, "team");
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <ContactLines ctx={ctx} t={t} align="right" />
          </Row>
          <div style={{ height: 2, background: t.ink, marginTop: 20 }} />
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink }}>{String(ctx.payload.title ?? "Company Profile")}</div>
            <div style={{ fontSize: px(t.base * 0.88), color: t.accent, marginTop: 5 }}>{String(ctx.payload.tagline ?? ctx.business?.tagline ?? "")}</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">About us</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.about ?? "")}</Prose>
          </div>
          <Row gap={22} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Our mission</SectionHeading>
              <Prose t={t} size={0.8}>{String(ctx.payload.mission ?? "")}</Prose>
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Our vision</SectionHeading>
              <Prose t={t} size={0.8}>{String(ctx.payload.vision ?? "")}</Prose>
            </div>
          </Row>
          {listOf(ctx, "values").length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="bar">Core values</SectionHeading>
              <TagList t={t} items={listOf(ctx, "values")} variant="tinted" />
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            {!stats.length ? null : null}
          </div>
          {services.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="plain">Our services</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                {services.map((s) => (
                  <div key={s.id}>
                    <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink }}>{s.name}</div>
                    <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {team.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="plain">Leadership</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                {team.map((m) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${t.rule}`, padding: "5px 0" }}>
                    <span style={{ fontSize: px(t.base * 0.82), fontWeight: 600, color: t.ink }}>{m.name}</span>
                    <span style={{ fontSize: px(t.base * 0.76), color: t.muted, textAlign: "right" }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "profile-modern-01",
    name: "Modern Profile",
    category: "modern",
    description: "Gradient cover, stat tiles and service cards with generous spacing.",
    tags: ["gradient", "cards"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const services = rowsOf<{ id: string; name: string; description: string }>(ctx, "services");
      const team = rowsOf<{ id: string; name: string; role: string }>(ctx, "team");
      return (
        <PaperShell ctx={ctx} style={{ padding: 0 }}>
          <div style={{ background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, padding: "42px 52px", color: "#fff" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Company profile</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.8), fontWeight: 800, marginTop: 10, lineHeight: 1.15, maxWidth: 560 }}>{String(ctx.payload.tagline ?? ctx.business?.tagline ?? ctx.business?.name ?? "")}</div>
            </div>
          </div>
          <div style={{ padding: "28px 52px 52px" }}>
            <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            <div style={{ marginTop: 22 }}>
              <SectionHeading t={t} variant="bar">Who we are</SectionHeading>
              <Prose t={t} size={0.83}>{String(ctx.payload.about ?? "")}</Prose>
            </div>
            <Row gap={22} style={{ marginTop: 20 }} align="flex-start">
              <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
                <Label t={t}>Mission</Label>
                <div style={{ marginTop: 7 }}>
                  <Prose t={t} size={0.79}>{String(ctx.payload.mission ?? "")}</Prose>
                </div>
              </div>
              <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
                <Label t={t}>Vision</Label>
                <div style={{ marginTop: 7 }}>
                  <Prose t={t} size={0.79}>{String(ctx.payload.vision ?? "")}</Prose>
                </div>
              </div>
            </Row>
            {services.length ? (
              <div style={{ marginTop: 22 }}>
                <SectionHeading t={t} variant="bar">What we do</SectionHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {services.map((s) => (
                    <div key={s.id} style={{ border: `1px solid ${t.rule}`, borderTop: `3px solid ${t.accent}`, borderRadius: 4, padding: 13 }}>
                      <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink }}>{s.name}</div>
                      <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 5, lineHeight: 1.5 }}>{s.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {listOf(ctx, "values").length ? (
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="bar">Values</SectionHeading>
                <TagList t={t} items={listOf(ctx, "values")} variant="solid" />
              </div>
            ) : null}
            {team.length ? (
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="bar">Leadership team</SectionHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {team.map((m) => (
                    <div key={m.id} style={{ background: t.tint, borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{m.name}</div>
                      <div style={{ fontSize: px(t.base * 0.74), color: t.muted, marginTop: 2 }}>{m.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {ctx.payload.whyUs ? (
              <div style={{ marginTop: 20, background: t.ink, color: "#fff", borderRadius: 4, padding: 16 }}>
                <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Why clients choose us</div>
                <div style={{ fontSize: px(t.base * 0.82), lineHeight: 1.6, marginTop: 7 }}>{String(ctx.payload.whyUs)}</div>
              </div>
            ) : null}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "profile-executive-01",
    name: "Heritage Profile",
    category: "executive",
    description: "Refined serif profile for established firms, trusts and institutions.",
    tags: ["serif", "institutional"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const services = rowsOf<{ id: string; name: string; description: string }>(ctx, "services");
      const team = rowsOf<{ id: string; name: string; role: string }>(ctx, "team");
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 52, subColor: t.faint }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.3), color: t.ink, marginTop: 16, letterSpacing: "0.14em" }}>COMPANY PROFILE</div>
            <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 6, fontStyle: "italic" }}>{String(ctx.payload.tagline ?? "")}</div>
          </div>
          <div style={{ marginTop: 20, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.95), lineHeight: 1.75, color: t.body }}>{String(ctx.payload.about ?? "")}</div>
          <Row gap={28} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="rule" align="center">Mission</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Prose t={t} size={0.8}>{String(ctx.payload.mission ?? "")}</Prose>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="rule" align="center">Vision</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Prose t={t} size={0.8}>{String(ctx.payload.vision ?? "")}</Prose>
              </div>
            </div>
          </Row>
          {services.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="rule" align="center">Areas of practice</SectionHeading>
              <div style={{ marginTop: 12 }}>
                {services.map((s) => (
                  <div key={s.id} style={{ marginBottom: 9 }}>
                    <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.9), color: t.ink }}>{s.name}</div>
                    <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 2, lineHeight: 1.55 }}>{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <MetricsStrip ctx={ctx} t={t} variant="tinted" />
          </div>
          {team.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="rule" align="center">Leadership</SectionHeading>
              <div style={{ marginTop: 10, textAlign: "center", fontSize: px(t.base * 0.8), color: t.body, lineHeight: 1.8 }}>
                {team.map((m) => `${m.name} — ${m.role}`).join("  ·  ")}
              </div>
            </div>
          ) : null}
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "profile-minimal-01",
    name: "Essentials",
    category: "minimal",
    description: "Two-page-capable minimal profile that stays readable at any length.",
    tags: ["minimal", "readable"],
    render: (ctx) => {
      const t = tokens(ctx);
      const services = rowsOf<{ id: string; name: string; description: string }>(ctx, "services");
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{ctx.business?.name}</div>
              <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 4 }}>{String(ctx.payload.tagline ?? ctx.business?.tagline ?? "")}</div>
            </div>
            <ContactLines ctx={ctx} t={t} align="right" />
          </Row>
          <div style={{ height: 1, background: t.rule, marginTop: 18 }} />
          <div style={{ marginTop: 20 }}>
            <Prose t={t} size={0.84}>{String(ctx.payload.about ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="plain">Mission</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.mission ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">Vision</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.vision ?? "")}</Prose>
          </div>
          {services.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="plain">Services</SectionHeading>
              <Bullets t={t} items={services.map((s) => `${s.name} — ${s.description}`)} variant="dot" />
            </div>
          ) : null}
          {listOf(ctx, "values").length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="plain">Values</SectionHeading>
              <Bullets t={t} items={listOf(ctx, "values")} variant="dash" columns={2} />
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <MetricsStrip ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "profile-creative-01",
    name: "Studio Profile",
    category: "creative",
    description: "Bold studio-style profile with large type and colour-blocked services.",
    tags: ["studio", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const services = rowsOf<{ id: string; name: string; description: string }>(ctx, "services");
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", background: t.ink, color: "#fff", padding: "44px 52px 38px" }}>
            <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: 999, background: t.accent, opacity: 0.35 }} />
            <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.7)", markBackground: "rgba(255,255,255,0.18)" }} />
            <div style={{ marginTop: 30, position: "relative" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2), fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 520 }}>{String(ctx.payload.tagline ?? ctx.business?.name ?? "")}</div>
            </div>
          </div>
          <div style={{ padding: "28px 52px 52px" }}>
            <Prose t={t} size={0.85}>{String(ctx.payload.about ?? "")}</Prose>
            <div style={{ marginTop: 22 }}>
              <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            </div>
            {services.length ? (
              <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${t.rule}`, borderRadius: 4, overflow: "hidden" }}>
                {services.map((s, i) => (
                  <div key={s.id} style={{ padding: 14, background: i % 3 === 0 ? t.tint : "#fff", borderRight: i % 2 === 0 ? `1px solid ${t.rule}` : "none", borderBottom: i < services.length - 2 ? `1px solid ${t.rule}` : "none" }}>
                    <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.9), fontWeight: 700, color: t.ink }}>{s.name}</div>
                    <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 5, lineHeight: 1.5 }}>{s.description}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <Row gap={22} style={{ marginTop: 22 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">Mission</SectionHeading>
                <Prose t={t} size={0.79}>{String(ctx.payload.mission ?? "")}</Prose>
              </div>
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="bar">Vision</SectionHeading>
                <Prose t={t} size={0.79}>{String(ctx.payload.vision ?? "")}</Prose>
              </div>
            </Row>
            {listOf(ctx, "values").length ? (
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="bar">Values</SectionHeading>
                <TagList t={t} items={listOf(ctx, "values")} variant="solid" />
              </div>
            ) : null}
            <FooterBar ctx={ctx} t={t} variant="tinted" />
          </div>
        </PaperShell>
      );
    },
  },
];

/* ══════════════════════════════ REPORTS ══════════════════════════════════ */
export const reportTemplates: Design[] = [
  {
    id: "report-corporate-01",
    name: "Management Report",
    category: "corporate",
    description: "Numbered sections, metric summary and recommendations — board-ready.",
    tags: ["board", "metrics"],
    render: (ctx) => {
      const t = tokens(ctx);
      const sections = rowsOf<{ id: string; heading: string; body: string }>(ctx, "sections");
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>REPORT</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 3 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20, borderTop: `2px solid ${t.ink}`, paddingTop: 16 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.44), fontWeight: 800, color: t.ink, lineHeight: 1.2 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
            {period(ctx) ? <div style={{ fontSize: px(t.base * 0.84), color: t.accent, marginTop: 6 }}>Reporting period: {period(ctx)}</div> : null}
          </div>
          <div style={{ marginTop: 16 }}>
            <MetaGrid t={t} items={[
              { label: "Prepared for", value: String(ctx.payload.preparedFor ?? "—") },
              { label: "Prepared by", value: String(ctx.payload.preparedBy ?? ctx.business?.name ?? "—") },
              { label: "Issued", value: dt(ctx.doc.issueDate, ctx) },
              { label: "Status", value: "Final" },
            ]} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 18 }}>
            <MetricsStrip ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="plain">1. Executive summary</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          {ctx.payload.about ? (
            <div style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="plain">2. Methodology</SectionHeading>
              <Prose t={t} size={0.81}>{String(ctx.payload.about)}</Prose>
            </div>
          ) : null}
          {sections.map((s, i) => (
            <div key={s.id} style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="plain">{`${i + (ctx.payload.about ? 3 : 2)}. ${s.heading}`}</SectionHeading>
              <Prose t={t} size={0.81}>{s.body}</Prose>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">{`${sections.length + (ctx.payload.about ? 3 : 2)}. Conclusion &amp; recommendations`}</SectionHeading>
            <Prose t={t} size={0.81}>{String(ctx.payload.conclusion ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 20 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "report-modern-01",
    name: "Insight",
    category: "modern",
    description: "Data-forward report with a dark metric band and sectioned analysis.",
    tags: ["data", "dashboard"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const sections = rowsOf<{ id: string; heading: string; body: string }>(ctx, "sections");
      return (
        <PaperShell ctx={ctx} style={{ padding: 0 }}>
          <div style={{ background: t.ink, color: "#fff", padding: "36px 52px" }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.7)", markBackground: "rgba(255,255,255,0.18)" }} />
              <div style={{ textAlign: "right", fontSize: px(t.base * 0.76), opacity: 0.85 }}>
                <div>{ctx.doc.number}</div>
                <div>{dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.7), fontWeight: 800, lineHeight: 1.15 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
              {period(ctx) ? <div style={{ fontSize: px(t.base * 0.82), opacity: 0.82, marginTop: 8 }}>{period(ctx)}</div> : null}
            </div>
          </div>
          <div style={{ padding: "26px 52px 52px" }}>
            <MetricsStrip ctx={ctx} t={t} variant="tinted" />
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Executive summary</SectionHeading>
              <Prose t={t} size={0.83}>{String(ctx.payload.intro ?? "")}</Prose>
            </div>
            {ctx.payload.about ? (
              <div style={{ marginTop: 18 }}>
                <SectionHeading t={t} variant="bar">Methodology</SectionHeading>
                <Prose t={t} size={0.8}>{String(ctx.payload.about)}</Prose>
              </div>
            ) : null}
            {sections.map((s) => (
              <div key={s.id} style={{ marginTop: 18 }}>
                <SectionHeading t={t} variant="bar">{s.heading}</SectionHeading>
                <Prose t={t} size={0.8}>{s.body}</Prose>
              </div>
            ))}
            <div style={{ marginTop: 20, background: t.tint, borderRadius: 4, padding: 16 }}>
              <Label t={t}>Recommendations</Label>
              <div style={{ marginTop: 7 }}>
                <Prose t={t} size={0.81}>{String(ctx.payload.conclusion ?? "")}</Prose>
              </div>
            </div>
            <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <MetaGrid t={t} items={[
                  { label: "Prepared for", value: String(ctx.payload.preparedFor ?? "—") },
                  { label: "Prepared by", value: String(ctx.payload.preparedBy ?? ctx.business?.name ?? "—") },
                ]} variant="rows" />
              </div>
              {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={76} caption="Digital copy" /> : null}
            </Row>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "report-executive-01",
    name: "Annual Review",
    category: "executive",
    description: "Serif annual review with a formal foreword and analysed sections.",
    tags: ["annual", "serif"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const sections = rowsOf<{ id: string; heading: string; body: string }>(ctx, "sections");
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 18, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 48, subColor: t.faint }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink, marginTop: 16 }}>{String(ctx.payload.title ?? "Annual Review")}</div>
            {period(ctx) ? <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 6, letterSpacing: "0.14em" }}>{period(ctx)}</div> : null}
          </div>
          <div style={{ marginTop: 20, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), lineHeight: 1.75, color: t.body }}>{String(ctx.payload.intro ?? "")}</div>
          <div style={{ marginTop: 20 }}>
            <MetricsStrip ctx={ctx} t={t} variant="tinted" />
          </div>
          {ctx.payload.about ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="rule" align="center">Approach</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Prose t={t} size={0.8}>{String(ctx.payload.about)}</Prose>
              </div>
            </div>
          ) : null}
          {sections.map((s) => (
            <div key={s.id} style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule" align="center">{s.heading}</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Prose t={t} size={0.8}>{s.body}</Prose>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20, borderTop: `1px solid ${t.rule}`, paddingTop: 14 }}>
            <SectionHeading t={t} variant="plain">Conclusion</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.conclusion ?? "")}</Prose>
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "report-minimal-01",
    name: "Brief",
    category: "minimal",
    description: "Short-form brief for internal circulation and quick executive reads.",
    tags: ["brief", "internal"],
    render: (ctx) => {
      const t = tokens(ctx);
      const sections = rowsOf<{ id: string; heading: string; body: string }>(ctx, "sections");
      return (
        <PaperShell ctx={ctx} style={{ padding: 56 }}>
          <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>Report</div>
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 700, color: t.ink, marginTop: 10, lineHeight: 1.25 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 22, fontSize: px(t.base * 0.78), color: t.muted }}>
            {period(ctx) ? <span>{period(ctx)}</span> : null}
            <span>{dt(ctx.doc.issueDate, ctx)}</span>
            <span>{ctx.doc.number}</span>
          </div>
          <div style={{ height: 1, background: t.rule, marginTop: 18 }} />
          <div style={{ marginTop: 18 }}>
            <Prose t={t} size={0.84}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          <div style={{ marginTop: 20 }}>
            <MetricsStrip ctx={ctx} t={t} />
          </div>
          {sections.map((s) => (
            <div key={s.id} style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="plain">{s.heading}</SectionHeading>
              <Prose t={t} size={0.8}>{s.body}</Prose>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="plain">Recommendations</SectionHeading>
            <Prose t={t} size={0.8}>{String(ctx.payload.conclusion ?? "")}</Prose>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note={`${ctx.payload.preparedBy ?? ctx.business?.name ?? ""} · ${ctx.payload.preparedFor ?? ""}`} />
        </PaperShell>
      );
    },
  },
  {
    id: "report-creative-01",
    name: "Impact Report",
    category: "creative",
    description: "Story-led impact report with highlighted figures and colour blocking.",
    tags: ["impact", "story"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const sections = rowsOf<{ id: string; heading: string; body: string }>(ctx, "sections");
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, color: "#fff", padding: "40px 52px" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.72)", markBackground: "rgba(255,255,255,0.2)" }} />
            <div style={{ marginTop: 26 }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Impact report</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, marginTop: 10, lineHeight: 1.1, maxWidth: 540 }}>{String(ctx.payload.title ?? ctx.doc.title)}</div>
              {period(ctx) ? <div style={{ fontSize: px(t.base * 0.82), opacity: 0.85, marginTop: 10 }}>{period(ctx)}</div> : null}
            </div>
          </div>
          <div style={{ padding: "26px 52px 52px" }}>
            <MetricsStrip ctx={ctx} t={t} variant="dark" />
            <div style={{ marginTop: 22, fontSize: px(t.base * 0.95), fontWeight: 650, color: t.ink, lineHeight: 1.5 }}>{String(ctx.payload.subject ?? "")}</div>
            <div style={{ marginTop: 12 }}>
              <Prose t={t} size={0.84}>{String(ctx.payload.intro ?? "")}</Prose>
            </div>
            {ctx.payload.about ? (
              <div style={{ marginTop: 20, background: t.tint, borderRadius: 4, padding: 16 }}>
                <Label t={t}>How we measure</Label>
                <div style={{ marginTop: 7 }}>
                  <Prose t={t} size={0.8}>{String(ctx.payload.about)}</Prose>
                </div>
              </div>
            ) : null}
            {sections.map((s, i) => (
              <div key={s.id} style={{ marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.74), fontWeight: 800 }}>{i + 1}</div>
                  <span style={{ fontFamily: t.heading, fontSize: px(t.base * 0.98), fontWeight: 800, color: t.ink }}>{s.heading}</span>
                </div>
                <Prose t={t} size={0.81}>{s.body}</Prose>
              </div>
            ))}
            <div style={{ marginTop: 22, borderTop: `2px solid ${t.accent}`, paddingTop: 14 }}>
              <SectionHeading t={t} variant="bar">Looking ahead</SectionHeading>
              <Prose t={t} size={0.81}>{String(ctx.payload.conclusion ?? "")}</Prose>
            </div>
            <div style={{ marginTop: 20 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" />
            </div>
          </div>
        </PaperShell>
      );
    },
  },
];

/* ═════════════════════════════ CONTRACTS ═════════════════════════════════ */
export const contractTemplates: Design[] = [
  {
    id: "contract-formal-01",
    name: "Formal Agreement",
    category: "corporate",
    description: "Parties, recitals, numbered clauses and dual signature execution block.",
    tags: ["clauses", "signature"],
    render: (ctx) => {
      const t = tokens(ctx);
      const parties = rowsOf<{ id: string; role: string; name: string; company?: string; address?: string; email?: string; signatory?: string }>(ctx, "parties");
      const clauses = rowsOf<{ id: string; heading: string; body: string }>(ctx, "clauses");
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.78), color: t.muted }}>
              <div style={{ fontWeight: 700, color: t.ink }}>{ctx.doc.number}</div>
              <div>{dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink, letterSpacing: "0.08em" }}>{String(ctx.payload.title ?? "SERVICE AGREEMENT").toUpperCase()}</div>
            <div style={{ fontSize: px(t.base * 0.82), color: t.muted, marginTop: 6 }}>{String(ctx.payload.subject ?? "")}</div>
          </div>
          <div style={{ marginTop: 22 }}>
            <Prose t={t} size={0.81}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          {parties.length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">1. The parties</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {parties.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${t.rule}`, borderRadius: 4, padding: 12 }}>
                    <Label t={t}>{p.role}</Label>
                    <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink, marginTop: 5 }}>{p.name || p.company}</div>
                    {p.address ? <div style={{ fontSize: px(t.base * 0.75), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{p.address}</div> : null}
                    {p.signatory ? <div style={{ fontSize: px(t.base * 0.75), color: t.muted, marginTop: 3 }}>Signed by {p.signatory}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {clauses.length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">2. Terms and conditions</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clauses.map((c, i) => (
                  <div key={c.id}>
                    <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{`2.${i + 1} ${c.heading}`}</div>
                    <div style={{ fontSize: px(t.base * 0.79), color: t.body, marginTop: 3, lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {ctx.payload.terms ? (
            <div style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="plain">Term &amp; termination</SectionHeading>
              <Prose t={t} size={0.79}>{String(ctx.payload.terms)}</Prose>
            </div>
          ) : null}
          {(ctx.payload.items ?? []).length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">Fee schedule</SectionHeading>
              <ItemsTable ctx={ctx} t={t} variant="boxed" compact />
            </div>
          ) : null}
          <div style={{ marginTop: 22 }}>
            <Label t={t}>Executed by the parties</Label>
            <div style={{ marginTop: 14 }}>
              <Row gap={24}>
                {parties.slice(0, 2).map((p) => (
                  <div key={p.id} style={{ flex: 1 }}>
                    <div style={{ height: 34 }} />
                    <div style={{ height: 1, background: t.ink }} />
                    <div style={{ fontSize: px(t.base * 0.74), color: t.ink, fontWeight: 600, marginTop: 5 }}>{p.signatory || p.name || p.company}</div>
                    <div style={{ fontSize: px(t.base * 0.7), color: t.muted, marginTop: 2 }}>{p.role}</div>
                  </div>
                ))}
              </Row>
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note="This agreement is binding once signed by both parties." />
        </PaperShell>
      );
    },
  },
  {
    id: "contract-modern-01",
    name: "Modern Contract",
    category: "modern",
    description: "Contemporary agreement with a colour header, clause cards and clear numbering.",
    tags: ["modern", "clauses"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const parties = rowsOf<{ id: string; role: string; name: string; company?: string; address?: string; signatory?: string }>(ctx, "parties");
      const clauses = rowsOf<{ id: string; heading: string; body: string }>(ctx, "clauses");
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="gradient" height={112}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.42), fontWeight: 800 }}>{String(ctx.payload.title ?? "AGREEMENT").toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), opacity: 0.9 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 22 }}>
            <Prose t={t} size={0.82}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          {parties.length ? (
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {parties.slice(0, 2).map((p) => (
                <div key={p.id} style={{ background: t.tint, borderRadius: 4, padding: 14 }}>
                  <Label t={t}>{p.role}</Label>
                  <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink, marginTop: 6 }}>{p.name || p.company}</div>
                  {p.address ? <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 4, lineHeight: 1.5 }}>{p.address}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">Terms of engagement</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {clauses.map((c, i) => (
                <div key={c.id} style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: t.tint, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.74), fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink }}>{c.heading}</div>
                    <div style={{ fontSize: px(t.base * 0.79), color: t.body, marginTop: 3, lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {ctx.payload.terms ? (
            <div style={{ marginTop: 18, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <Label t={t}>Term &amp; termination</Label>
              <div style={{ marginTop: 6 }}>
                <Prose t={t} size={0.79}>{String(ctx.payload.terms)}</Prose>
              </div>
            </div>
          ) : null}
          {(ctx.payload.items ?? []).length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Fees</SectionHeading>
              <ItemsTable ctx={ctx} t={t} variant="borderless" />
            </div>
          ) : null}
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            {(ctx.payload.items ?? []).length ? (
              <div style={{ width: 300 }}>
                <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
              </div>
            ) : null}
          </Row>
          <div style={{ marginTop: 22 }}>
            <div style={{ height: 1, background: t.ink }} />
            <div style={{ fontSize: px(t.base * 0.74), color: t.muted, marginTop: 6 }}>
              Signed for and on behalf of the parties · {dt(ctx.doc.issueDate, ctx)}
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "contract-executive-01",
    name: "Deed",
    category: "executive",
    description: "Traditional deed styling with witnesses and an embossed seal placement.",
    tags: ["deed", "witness"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const parties = rowsOf<{ id: string; role: string; name: string; company?: string; address?: string; signatory?: string }>(ctx, "parties");
      const clauses = rowsOf<{ id: string; heading: string; body: string }>(ctx, "clauses");
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 48, subColor: t.faint }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.44), color: t.ink, marginTop: 16, letterSpacing: "0.14em" }}>
              {String(ctx.payload.title ?? "AGREEMENT").toUpperCase()}
            </div>
            <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 6, letterSpacing: "0.1em" }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
          </div>
          <div style={{ marginTop: 20, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), lineHeight: 1.75, color: t.body }}>
            {String(ctx.payload.intro ?? "")}
          </div>
          {parties.length ? (
            <div style={{ marginTop: 18, borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`, padding: "12px 0" }}>
              {parties.slice(0, 2).map((p, i) => (
                <div key={p.id} style={{ fontSize: px(t.base * 0.84), color: t.body, lineHeight: 1.7 }}>
                  <strong style={{ color: t.ink }}>{i + 1}. {p.name || p.company}</strong>
                  <span style={{ color: t.muted }}> ({p.role})</span>
                  {p.address ? <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{p.address}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">Operative provisions</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clauses.map((c, i) => (
                <div key={c.id}>
                  <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{i + 1}. {c.heading}</div>
                  <div style={{ fontSize: px(t.base * 0.79), color: t.body, marginTop: 3, lineHeight: 1.65 }}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
          {ctx.payload.terms ? (
            <div style={{ marginTop: 14 }}>
              <Prose t={t} size={0.79}>{String(ctx.payload.terms)}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.9), color: t.ink, textAlign: "center" }}>IN WITNESS WHEREOF</div>
            <div style={{ marginTop: 18 }}>
              <Row gap={24}>
                {[0, 1].map((i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ height: 30 }} />
                    <div style={{ height: 1, background: t.ink }} />
                    <div style={{ fontSize: px(t.base * 0.73), color: t.muted, marginTop: 5 }}>{parties[i]?.signatory || parties[i]?.name || "Signature"}</div>
                    <div style={{ fontSize: px(t.base * 0.7), color: t.muted, marginTop: 10 }}>Witness: ______________________</div>
                  </div>
                ))}
              </Row>
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "contract-minimal-01",
    name: "Plain Terms",
    category: "minimal",
    description: "Plain-English agreement: numbered terms, no ornamentation, easy to read.",
    tags: ["plain-english", "minimal"],
    render: (ctx) => {
      const t = tokens(ctx);
      const clauses = rowsOf<{ id: string; heading: string; body: string }>(ctx, "clauses");
      const parties = rowsOf<{ id: string; role: string; name: string; company?: string; signatory?: string }>(ctx, "parties");
      return (
        <PaperShell ctx={ctx} style={{ padding: 56 }}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.14), fontWeight: 800, color: t.ink }}>{String(ctx.payload.title ?? "Agreement")}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 4 }}>{String(ctx.payload.subject ?? "")}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.76), color: t.muted }}>
              <div>{ctx.doc.number}</div>
              <div>{dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 16 }} />
          <div style={{ marginTop: 18 }}>
            <Prose t={t} size={0.84}>{String(ctx.payload.intro ?? "")}</Prose>
          </div>
          {parties.length ? (
            <div style={{ marginTop: 16 }}>
              <Label t={t}>Between</Label>
              <div style={{ marginTop: 6, fontSize: px(t.base * 0.83), color: t.body, lineHeight: 1.7 }}>
                {parties.slice(0, 2).map((p) => (
                  <div key={p.id}>
                    <strong style={{ color: t.ink }}>{p.name || p.company}</strong> — {p.role}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {clauses.map((c, i) => (
              <div key={c.id}>
                <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink }}>{i + 1}. {c.heading}</div>
                <div style={{ fontSize: px(t.base * 0.8), color: t.body, marginTop: 3, lineHeight: 1.65 }}>{c.body}</div>
              </div>
            ))}
          </div>
          {ctx.payload.terms ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink }}>{clauses.length + 1}. Duration &amp; exit</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.body, marginTop: 3, lineHeight: 1.65 }}>{String(ctx.payload.terms)}</div>
            </div>
          ) : null}
          <div style={{ marginTop: 28 }}>
            <Row gap={24}>
              {[0, 1].map((i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ height: 28 }} />
                  <div style={{ height: 1, background: t.rule }} />
                  <div style={{ fontSize: px(t.base * 0.74), color: t.muted, marginTop: 5 }}>{parties[i]?.signatory || parties[i]?.name || "Signature"}</div>
                </div>
              ))}
            </Row>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "contract-creative-01",
    name: "Retainer",
    category: "creative",
    description: "Modern retainer agreement with scope blocks and a clear fee summary.",
    tags: ["retainer", "agency"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const clauses = rowsOf<{ id: string; heading: string; body: string }>(ctx, "clauses");
      const parties = rowsOf<{ id: string; role: string; name: string; company?: string; signatory?: string }>(ctx, "parties");
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <CornerTriangle t={t} size={100} corner="top-right" opacity={0.9} />
          <div style={{ padding: "40px 52px 0", position: "relative" }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
              <div style={{ textAlign: "right", marginRight: 60 }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.ink }}>{String(ctx.payload.title ?? "Retainer Agreement").toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 3 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
            <div style={{ marginTop: 22 }}>
              <Prose t={t} size={0.83}>{String(ctx.payload.intro ?? "")}</Prose>
            </div>
            {parties.length ? (
              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {parties.slice(0, 2).map((p) => (
                  <div key={p.id} style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 12 }}>
                    <Label t={t}>{p.role}</Label>
                    <div style={{ fontSize: px(t.base * 0.85), fontWeight: 700, color: t.ink, marginTop: 5 }}>{p.name || p.company}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Scope of the retainer</SectionHeading>
              <Bullets t={t} items={listOf(ctx, "scope")} variant="check" columns={2} />
            </div>
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Terms</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {clauses.map((c, i) => (
                  <div key={c.id}>
                    <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{i + 1}. {c.heading}</div>
                    <div style={{ fontSize: px(t.base * 0.79), color: t.body, marginTop: 3, lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
            {(ctx.payload.items ?? []).length ? (
              <div style={{ marginTop: 18 }}>
                <ItemsTable ctx={ctx} t={t} variant="borderless" />
              </div>
            ) : null}
            <Row justify="flex-end" style={{ marginTop: 14 }}>
              {(ctx.payload.items ?? []).length ? (
                <div style={{ width: 300 }}>
                  <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
                </div>
              ) : null}
            </Row>
            <div style={{ marginTop: 22, paddingBottom: 40 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" />
            </div>
          </div>
        </PaperShell>
      );
    },
  },
];
