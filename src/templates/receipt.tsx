import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  AmountWords, BankDetails, Bullets, BusinessLogo, ContactLines, CornerTriangle, FooterBar, HeaderBand, ItemsTable, Label,
  MetaGrid, PaperShell, PartyCard, Prose, QrPanel, Row, SectionHeading, SignatureBlock, TitlePlate, TotalsBlock, dt, px, tokens,
} from "./primitives";
import { withAlpha } from "@/lib/utils";

/* Receipt designs — 20 layouts, from tills and thermal slips to formal
   acknowledgement documents used by schools, churches and NGOs. */

const receiptMeta = (ctx: TemplateContext) => {
  const rows = [
    { label: ctx.labels.numberLabel, value: ctx.doc.number },
    { label: ctx.labels.dateLabel, value: dt(ctx.doc.issueDate, ctx) },
  ];
  if (ctx.payload.paymentMethod) rows.push({ label: "Method", value: String(ctx.payload.paymentMethod) });
  if (ctx.payload.paymentReference) rows.push({ label: "Reference", value: String(ctx.payload.paymentReference) });
  return rows;
};

const payerLines = (ctx: TemplateContext): (string | undefined)[] => [
  ctx.payload.clientCompany,
  ctx.payload.clientEmail,
  ctx.payload.clientPhone,
  ctx.payload.clientAddress,
];

const PaidStamp = ({ t, label = "PAID", color, rotate = -12, size = 108 }: { t: ReturnType<typeof tokens>; label?: string; color?: string; rotate?: number; size?: number }) => (
  <div
    style={{
      border: `3px solid ${color ?? t.accent}`,
      color: color ?? t.accent,
      borderRadius: 10,
      padding: "8px 16px",
      fontFamily: t.heading,
      fontWeight: 800,
      fontSize: size * 0.24,
      letterSpacing: "0.16em",
      transform: `rotate(${rotate}deg)`,
      opacity: 0.9,
      display: "inline-block",
      background: withAlpha("#ffffff", 0.4),
    }}
  >
    {label}
  </div>
);

const paidAmountRow = (ctx: TemplateContext, t: ReturnType<typeof tokens>) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, background: t.tint, borderRadius: 4, padding: "12px 16px" }}>
    <span style={{ fontSize: px(t.base * 0.8), letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: t.muted }}>{ctx.labels.total}</span>
    <span style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.accent }}>
      {ctx.payload.currency} {ctx.totals.total.toFixed(2)}
    </span>
  </div>
);

type Design = Omit<TemplateMeta, "kind">;

export const receiptTemplates: Design[] = [
  /* ── Corporate ─────────────────────────────────────────────────────────── */
  {
    id: "receipt-corporate-01",
    name: "Ledger Receipt",
    category: "corporate",
    description: "Formal corporate acknowledgement with a ruled payment schedule.",
    tags: ["classic", "ruled"],
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
            <TitlePlate ctx={ctx} t={t} align="left" showNumber={false} />
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 22 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Received by" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-corporate-02",
    name: "Acknowledgement",
    category: "corporate",
    description: "Tinted metadata band with boxed particulars and a formal acknowledgement statement.",
    tags: ["tinted", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="tinted" height={92}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.accent }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 20 }}>
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="tinted" columns={4} />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} />
            </div>
            <div style={{ flex: 1, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
              <PartyCard t={t} heading={ctx.labels.from} name={ctx.business?.name ?? ""} lines={[ctx.business?.phone, ctx.business?.email, ctx.business?.city]} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Particulars of payment</SectionHeading>
            <ItemsTable ctx={ctx} t={t} variant="boxed" />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300, border: `1px solid ${t.rule}`, padding: 12 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
            <Prose t={t} size={0.8} muted>
              Received the sum stated above in full satisfaction of the account referenced. This receipt is issued electronically and is valid without a physical signature.
            </Prose>
            <PaidStamp t={t} />
          </div>
          <div style={{ marginTop: 20 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="For and on behalf of" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-corporate-03",
    name: "Deposit Slip",
    category: "corporate",
    description: "Bank-deposit style slip with countersigned verification and dual amounts.",
    tags: ["slip", "verification"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `2px solid ${t.ink}`, paddingBottom: 12 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
            </Row>
          </div>
          <div style={{ marginTop: 16 }}>
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="inline" />
          </div>
          <div style={{ marginTop: 18, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 22px" }}>
              {[
                [ctx.labels.billTo, String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
                ["Company", String(ctx.payload.clientCompany ?? "—")],
                ["Payment for", String(ctx.payload.subject ?? "—")],
                ["Reference", String(ctx.payload.paymentReference ?? "—")],
              ].map(([k, v]) => (
                <div key={k}>
                  <Label t={t}>{k}</Label>
                  <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} variant="tinted" />
            </div>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <Row gap={24}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Payer signature</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Cashier / received by</div>
              </div>
            </Row>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-corporate-04",
    name: "Audit Receipt",
    category: "corporate",
    description: "Audit-ready receipt with dual reference numbers and a verification panel.",
    tags: ["audit", "dual-ref"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 20, height: 3, background: t.accent }} />
          <Row gap={20} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 260 }}>
              <Label t={t}>Amount received</Label>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, marginTop: 5 }}>
                {ctx.payload.currency} {ctx.totals.total.toFixed(2)}
              </div>
              <div style={{ marginTop: 10 }}>
                <PaidStamp t={t} size={86} />
              </div>
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 296 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <BankDetails ctx={ctx} t={t} variant="boxed" />
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={80} caption="Scan to verify" /> : null}
          </Row>
          <div style={{ marginTop: 20 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Authorised" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-corporate-05",
    name: "Counterfoil",
    category: "corporate",
    description: "Detachable counterfoil strip for record keeping and cash reconciliation.",
    tags: ["counterfoil", "records"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={0} align="stretch">
            <div style={{ width: 190, borderRight: `1px dashed ${t.rule}`, paddingRight: 18 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ stack: true, size: 40, showName: true }} />
              <div style={{ marginTop: 14 }}>
                <Label t={t}>Counterfoil</Label>
                <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 4 }}>{ctx.doc.number}</div>
                <div style={{ fontSize: px(t.base * 0.74), color: t.muted, marginTop: 2 }}>{dt(ctx.doc.issueDate, ctx)}</div>
                <div style={{ marginTop: 10, fontSize: px(t.base * 0.78), color: t.ink }}>
                  <strong>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</strong>
                </div>
                <div style={{ marginTop: 6, fontSize: px(t.base * 0.72), color: t.muted, lineHeight: 1.5 }}>{String(ctx.payload.receivedFrom || ctx.payload.clientName || "")}</div>
              </div>
              <div style={{ marginTop: "auto", paddingTop: 24 }}>
                <div style={{ height: 1, background: t.rule }} />
                <div style={{ fontSize: px(t.base * 0.68), color: t.faint, marginTop: 6 }}>Office copy</div>
              </div>
            </div>
            <div style={{ flex: 1, paddingLeft: 22 }}>
              <Row justify="space-between" align="flex-start">
                <TitlePlate ctx={ctx} t={t} align="left" showNumber={false} />
                <div style={{ textAlign: "right", fontSize: px(t.base * 0.78), color: t.muted }}>
                  <div style={{ fontWeight: 700, color: t.ink }}>{ctx.doc.number}</div>
                  <div>{dt(ctx.doc.issueDate, ctx)}</div>
                </div>
              </Row>
              <div style={{ marginTop: 18 }}>
                <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="tinted" />
              </div>
              <div style={{ marginTop: 18 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
              </div>
              <Row justify="flex-end" style={{ marginTop: 14 }}>
                <div style={{ width: 280 }}>
                  <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
                </div>
              </Row>
              <div style={{ marginTop: 18 }}>
                <AmountWords ctx={ctx} t={t} />
              </div>
              <div style={{ marginTop: 20 }}>
                <SignatureBlock ctx={ctx} t={t} align="right" label="Received by" />
              </div>
            </div>
          </Row>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },

  /* ── Modern ────────────────────────────────────────────────────────────── */
  {
    id: "receipt-modern-01",
    name: "Aurora Receipt",
    category: "modern",
    description: "Gradient masthead with the amount received front and centre.",
    tags: ["gradient", "headline-amount"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="gradient" height={132}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.8)", markBackground: "rgba(255,255,255,0.22)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
              </div>
            </Row>
            <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.28)", paddingTop: 12 }}>
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Amount received</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2), fontWeight: 800, marginTop: 4 }}>
                {ctx.payload.currency} {ctx.totals.total.toFixed(2)}
              </div>
            </div>
          </HeaderBand>
          <Row gap={18} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="tinted" />
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="card" showPaid={false} />
            </div>
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} />
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
    id: "receipt-modern-02",
    name: "Till Card",
    category: "modern",
    description: "Compact card-style receipt — perfect for point of sale and mobile printing.",
    tags: ["compact", "pos"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ maxWidth: 520, margin: "0 auto", border: `1px solid ${t.rule}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 6px 22px rgba(15,23,42,0.06)" }}>
            <div style={{ background: t.accent, color: "#fff", padding: "18px 20px" }}>
              <Row justify="space-between" align="center">
                <BusinessLogo ctx={ctx} t={t} opts={{ showName: true, size: 38, nameColor: "#fff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)" }} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>{ctx.labels.title}</div>
                  <div style={{ fontSize: px(t.base * 0.82), fontWeight: 700, marginTop: 2 }}>{ctx.doc.number}</div>
                </div>
              </Row>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {[
                  ["Date", dt(ctx.doc.issueDate, ctx)],
                  ["Method", String(ctx.payload.paymentMethod ?? "—")],
                  [ctx.labels.billTo, String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
                  ["Reference", String(ctx.payload.paymentReference ?? "—")],
                ].map(([k, v]) => (
                  <div key={k}>
                    <Label t={t}>{k}</Label>
                    <div style={{ fontSize: px(t.base * 0.82), color: t.ink, fontWeight: 600, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
              </div>
              <div style={{ marginTop: 12 }}>
                <TotalsBlock ctx={ctx} t={t} variant="striped" showPaid={false} />
              </div>
              <div style={{ marginTop: 14, borderTop: `1px dashed ${t.rule}`, paddingTop: 12, textAlign: "center" }}>
                <Prose t={t} size={0.76} muted>{String(ctx.payload.notes ?? ctx.labels.thankYou)}</Prose>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <PaidStamp t={t} rotate={-6} />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-modern-03",
    name: "Vertical",
    category: "modern",
    description: "Left rail with payment metadata; body reads as a clean financial statement.",
    tags: ["sidebar", "statement"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarWidth={228}
          sidebar={
            <div style={{ background: t.ink, minHeight: 1123, padding: "34px 22px", color: "#fff", display: "flex", flexDirection: "column", gap: 22 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ stack: true, nameColor: "#fff", subColor: "rgba(255,255,255,0.7)", markBackground: `linear-gradient(135deg, ${t.accent}, rgba(255,255,255,0.2))` }} />
              <div>
                {receiptMeta(ctx).map((m) => (
                  <div key={m.label} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.65, fontWeight: 700 }}>{m.label}</div>
                    <div style={{ fontSize: px(t.base * 0.82), fontWeight: 600, marginTop: 3 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.65, fontWeight: 700 }}>Amount</div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, marginTop: 4 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
                {ctx.design.showQr ? (
                  <div style={{ marginTop: 16 }}>
                    <QrPanel ctx={ctx} t={t} size={92} caption="Verify" />
                  </div>
                ) : null}
              </div>
            </div>
          }
        >
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.8), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
          <div style={{ height: 5, width: 70, background: t.accent, borderRadius: 99, marginTop: 10 }} />
          <div style={{ marginTop: 24 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="bar" />
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} variant="tinted" />
          </div>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Received by" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-modern-04",
    name: "Split Receipt",
    category: "modern",
    description: "Half-page summary above a perforated tear line — pairs with invoice dispatch.",
    tags: ["perforated", "dispatch"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number}</div>
            </div>
          </Row>
          {paidAmountRow(ctx, t)}
          <Row gap={18} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} />
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22, borderTop: `1.5px dashed ${t.rule}`, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: px(t.base * 0.72), color: t.faint }}>Retain this section for your records</div>
            <PaidStamp t={t} size={78} rotate={-4} />
          </div>
          <div style={{ marginTop: 16 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-modern-05",
    name: "Digital Receipt",
    category: "modern",
    description: "Screen-first receipt with verification QR and digital signature notice.",
    tags: ["digital", "qr"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 38, subColor: t.faint }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: px(t.base * 0.72), color: t.faint }}>{dt(ctx.doc.issueDate, ctx)}</div>
                <div style={{ fontSize: px(t.base * 0.8), fontWeight: 700, color: t.ink }}>{ctx.doc.number}</div>
              </div>
              {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={68} caption="Verify" /> : null}
            </div>
          </div>
          <div style={{ marginTop: 22, fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
          <div style={{ marginTop: 6, fontSize: px(t.base * 0.84), color: t.muted }}>
            Received from <strong style={{ color: t.ink }}>{ctx.payload.receivedFrom || ctx.payload.clientName}</strong>
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
            <div style={{ width: 250 }}>
              <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 20, background: t.tint, borderRadius: 4, padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: t.accent, marginTop: 3 }} />
            <Prose t={t} size={0.76} muted>
              This is a digitally issued receipt. Verify authenticity using the QR code or by contacting {ctx.business?.email ?? "our accounts desk"} quoting {ctx.doc.number}.
            </Prose>
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },

  /* ── Executive ─────────────────────────────────────────────────────────── */
  {
    id: "receipt-executive-01",
    name: "Chancery Receipt",
    category: "executive",
    description: "Engraved serif acknowledgement with a wax-seal style stamp placement.",
    tags: ["serif", "seal"],
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
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.6), color: t.ink, marginTop: 16, letterSpacing: "0.2em" }}>{ctx.labels.title.toUpperCase()}</div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 5, letterSpacing: "0.12em" }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
          </div>
          <div style={{ marginTop: 28, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), lineHeight: 1.75, color: t.body, textAlign: "center" }}>
            This acknowledges receipt of the sum of
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.ink, margin: "10px 0" }}>
              {ctx.payload.currency} {ctx.totals.total.toFixed(2)}
            </div>
            from <strong>{ctx.payload.receivedFrom || ctx.payload.clientName}</strong> in respect of {String(ctx.payload.subject ?? ctx.doc.title)}.
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 380 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" compact showUnit={false} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <PaidStamp t={t} rotate={-8} size={104} />
          </div>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Received by" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-executive-02",
    name: "Notarial",
    category: "executive",
    description: "Double-rule notarial format for legal, property and trust payments.",
    tags: ["notarial", "legal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `3px double ${t.ink}`, paddingBottom: 14 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.3), color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
            </Row>
          </div>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="rule">Statement of account</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {[
                [ctx.labels.billTo, String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
                ["Company", String(ctx.payload.clientCompany ?? "—")],
                ["Payment for", String(ctx.payload.subject ?? "—")],
                ["Method", String(ctx.payload.paymentMethod ?? "—")],
              ].map(([k, v]) => (
                <div key={k}>
                  <Label t={t}>{k}</Label>
                  <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" compact showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} variant="tinted" />
            </div>
            <div style={{ width: 288 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <Row gap={24}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Payer</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>Witness / officer</div>
              </div>
            </Row>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-executive-03",
    name: "Donor Receipt",
    category: "executive",
    description: "Formal donation and sponsorship acknowledgement for NGOs and churches.",
    tags: ["donation", "ngo"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ border: `1px solid ${t.rule}`, borderRadius: 4, padding: 22 }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
              <div style={{ textAlign: "right", fontFamily: "'Playfair Display'" }}>
                <div style={{ fontSize: px(t.base * 1.32), color: t.ink, letterSpacing: "0.14em" }}>ACKNOWLEDGEMENT</div>
                <div style={{ fontSize: px(t.base * 0.76), color: t.muted, fontFamily: t.sans, marginTop: 4 }}>of received contribution</div>
              </div>
            </Row>
            <div style={{ height: 1, background: t.rule, margin: "18px 0" }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.96), lineHeight: 1.8, color: t.body }}>
              Received with gratitude from <strong>{ctx.payload.receivedFrom || ctx.payload.clientName}</strong> the sum of{" "}
              <strong>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</strong> towards {String(ctx.payload.subject ?? "our programmes")}.
            </div>
            <div style={{ marginTop: 18 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" compact showUnit={false} />
            </div>
            <Row gap={20} style={{ marginTop: 18 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" />
              </div>
              <div style={{ width: 260 }}>
                <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
              </div>
            </Row>
            <div style={{ marginTop: 20 }}>
              <AmountWords ctx={ctx} t={t} />
            </div>
            <div style={{ marginTop: 22 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" label="Authorised for the organisation" />
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-executive-04",
    name: "School Fee Receipt",
    category: "executive",
    description: "Term-based fee receipt with balance carried forward and account summary.",
    tags: ["education", "balance"],
    render: (ctx) => {
      const t = tokens(ctx);
      const balance = Math.max(0, (ctx.payload.amountPaid ?? 0) - ctx.totals.total);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 14, borderBottom: `2px solid ${t.ink}` }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 42 }} />
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.2), fontWeight: 800, marginTop: 12, letterSpacing: "0.06em" }}>{ctx.labels.title.toUpperCase()}</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="inline" />
          </div>
          <div style={{ marginTop: 18, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label t={t}>Received with thanks from</Label>
                <div style={{ fontSize: px(t.base * 0.9), fontWeight: 700, color: t.ink, marginTop: 5 }}>{ctx.payload.receivedFrom || ctx.payload.clientName}</div>
              </div>
              <div>
                <Label t={t}>Being payment for</Label>
                <div style={{ fontSize: px(t.base * 0.9), fontWeight: 600, color: t.ink, marginTop: 5 }}>{String(ctx.payload.subject ?? ctx.doc.title)}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
              {balance > 0 ? <div style={{ marginTop: 8, fontSize: px(t.base * 0.76), color: t.muted, textAlign: "right" }}>Credit balance carried forward: {ctx.payload.currency} {balance.toFixed(2)}</div> : null}
            </div>
          </Row>
          <div style={{ marginTop: 18 }}>
            <AmountWords ctx={ctx} t={t} variant="tinted" />
          </div>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-end">
            <PaidStamp t={t} size={88} rotate={-6} />
            <div style={{ flex: 1 }}>
              <SignatureBlock ctx={ctx} t={t} align="right" label="Bursar / accounts" />
            </div>
          </Row>
        </PaperShell>
      );
    },
  },

  /* ── Minimal ───────────────────────────────────────────────────────────── */
  {
    id: "receipt-minimal-01",
    name: "Slip",
    category: "minimal",
    description: "Ultra-light slip: brand, amount, date and signature. Nothing more.",
    tags: ["slip", "light"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 700, color: t.ink }}>{ctx.business?.name ?? ""}</div>
              <div style={{ marginTop: 5 }}>
                <ContactLines ctx={ctx} t={t} compact />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label t={t}>{ctx.labels.title}</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 600, color: t.ink, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 20 }} />
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <Label t={t}>{ctx.labels.billTo}</Label>
              <div style={{ fontSize: px(t.base * 0.86), fontWeight: 650, color: t.ink, marginTop: 4 }}>{ctx.payload.receivedFrom || ctx.payload.clientName}</div>
              <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 2 }}>{String(ctx.payload.clientCompany ?? "")}</div>
            </div>
            <div>
              <Label t={t}>{ctx.labels.dateLabel}</Label>
              <div style={{ fontSize: px(t.base * 0.86), color: t.ink, marginTop: 4 }}>{dt(ctx.doc.issueDate, ctx)}</div>
              <Label t={t}><span style={{ display: "inline-block", marginTop: 10 }}>Method</span></Label>
              <div style={{ fontSize: px(t.base * 0.82), color: t.ink, marginTop: 4 }}>{String(ctx.payload.paymentMethod ?? "—")}</div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1.5px solid ${t.ink}`, paddingTop: 10 }}>
            <span style={{ fontSize: px(t.base * 0.84), color: t.muted }}>{ctx.labels.total}</span>
            <span style={{ fontFamily: t.heading, fontSize: px(t.base * 1.42), fontWeight: 800, color: t.ink }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" label="Received by" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-minimal-02",
    name: "Thermal",
    category: "minimal",
    description: "Narrow till-roll layout in monospace — prints beautifully on 80mm paper.",
    tags: ["thermal", "monospace"],
    render: (ctx) => {
      const t = tokens(ctx);
      const mono = "'JetBrains Mono', ui-monospace, monospace";
      return (
        <PaperShell ctx={ctx}>
          <div style={{ maxWidth: 420, margin: "0 auto", fontFamily: mono, fontSize: px(t.base * 0.82) }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.1), fontWeight: 800 }}>{ctx.business?.name?.toUpperCase()}</div>
              <div style={{ marginTop: 5, fontSize: px(t.base * 0.74), color: t.muted, lineHeight: 1.5 }}>
                {[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.phone].filter(Boolean).join("\n")}
              </div>
              <div style={{ margin: "14px 0", borderTop: `1px dashed ${t.rule}` }} />
              <div style={{ fontWeight: 700, letterSpacing: "0.1em" }}>{ctx.labels.title.toUpperCase()}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              {[
                ["Receipt", ctx.doc.number],
                ["Date", dt(ctx.doc.issueDate, ctx)],
                ["Payer", String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
                ["Method", String(ctx.payload.paymentMethod ?? "—")],
                ["Ref", String(ctx.payload.paymentReference ?? "—")],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
                  <span style={{ color: t.muted }}>{k}</span>
                  <span style={{ textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ margin: "14px 0", borderTop: `1px dashed ${t.rule}` }} />
            {(ctx.payload.items ?? []).map((item) => (
              <div key={item.id} style={{ marginBottom: 6 }}>
                <div>{item.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", color: t.muted }}>
                  <span>{item.qty} x {item.rate.toFixed(2)}</span>
                  <span>{(item.qty * item.rate).toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div style={{ margin: "14px 0", borderTop: `1px dashed ${t.rule}` }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: px(t.base * 1.05) }}>
              <span>TOTAL</span>
              <span>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</span>
            </div>
            <div style={{ marginTop: 8, textAlign: "center", color: t.muted, fontSize: px(t.base * 0.74), lineHeight: 1.6 }}>
              {String(ctx.payload.notes ?? ctx.labels.thankYou)}
              <div style={{ marginTop: 6 }}>Served by {ctx.design.signatureName || ctx.business?.name}</div>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
              {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={88} caption="Scan for e-receipt" /> : null}
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-minimal-03",
    name: "Grid Receipt",
    category: "minimal",
    description: "Three-column data grid with hairline dividers and no colour fill.",
    tags: ["grid", "data"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 36, showName: false }} />
            <div style={{ textAlign: "right" }}>
              <Label t={t}>{ctx.labels.title}</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink, marginTop: 3 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 0, borderTop: `1px solid ${t.rule}` }}>
            {[
              ["Date", dt(ctx.doc.issueDate, ctx)],
              ["Method", String(ctx.payload.paymentMethod ?? "—")],
              ["Reference", String(ctx.payload.paymentReference ?? "—")],
              [ctx.labels.billTo, String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
              ["Company", String(ctx.payload.clientCompany ?? "—")],
              ["Amount", `${ctx.payload.currency} ${ctx.totals.total.toFixed(2)}`],
            ].map(([k, v], i) => (
              <div key={k} style={{ padding: "12px 14px", borderBottom: `1px solid ${t.rule}`, borderRight: i % 3 === 2 ? "none" : `1px solid ${t.rule}` }}>
                <Label t={t}>{k}</Label>
                <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" label="Received by" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-minimal-04",
    name: "Postcard",
    category: "minimal",
    description: "Small-format postcard receipt with generous margins and a single accent rule.",
    tags: ["small-format", "airy"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ maxWidth: 500, margin: "40px auto 0" }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{ctx.labels.title.toUpperCase()}</div>
            <div style={{ marginTop: 8, height: 3, width: 54, background: t.accent, borderRadius: 99 }} />
            <div style={{ marginTop: 26, fontSize: px(t.base * 0.9), color: t.body, lineHeight: 1.7 }}>
              Received from <strong style={{ color: t.ink }}>{ctx.payload.receivedFrom || ctx.payload.clientName}</strong> the amount of
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 800, color: t.ink, margin: "10px 0" }}>
                {ctx.payload.currency} {ctx.totals.total.toFixed(2)}
              </div>
              in payment for {String(ctx.payload.subject ?? ctx.doc.title)}.
            </div>
            <div style={{ marginTop: 26 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" compact showUnit={false} />
            </div>
            <div style={{ marginTop: 20 }}>
              <MetaGrid t={t} items={receiptMeta(ctx)} variant="inline" />
            </div>
            <div style={{ marginTop: 30 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 34 }} />
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },

  /* ── Creative ──────────────────────────────────────────────────────────── */
  {
    id: "receipt-creative-01",
    name: "Ribbon Receipt",
    category: "creative",
    description: "Corner ribbon, bold amount bar and a playful paid badge.",
    tags: ["ribbon", "badge"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 230, height: 180, background: t.accent, clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
          <div style={{ position: "relative" }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 44 }} />
            <div style={{ textAlign: "right", color: "#fff", marginTop: -34 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.3), fontWeight: 800 }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ fontSize: px(t.base * 0.76), opacity: 0.92 }}>{ctx.doc.number}</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>{paidAmountRow(ctx, t)}</div>
          <Row gap={18} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 240 }}>
              <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <PaidStamp t={t} rotate={-10} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-creative-02",
    name: "Confetti",
    category: "creative",
    description: "Celebratory receipt for milestones and final payments, with shape accents.",
    tags: ["celebration", "shapes"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -130, left: -80, width: 300, height: 300, borderRadius: 999, background: t.tint }} />
          <div style={{ position: "absolute", top: 40, right: 40, width: 14, height: 14, borderRadius: 4, background: t.accent, transform: "rotate(24deg)" }} />
          <div style={{ position: "absolute", top: 96, right: 96, width: 10, height: 10, borderRadius: 99, background: t.soft }} />
          <div style={{ position: "relative" }}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
                <div style={{ fontSize: px(t.base * 0.76), color: t.muted }}>{ctx.doc.number}</div>
              </div>
            </Row>
            <div style={{ marginTop: 26, textAlign: "center" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.accent }}>Thank you!</div>
              <Prose t={t} size={0.84} muted>
                Payment of {ctx.payload.currency} {ctx.totals.total.toFixed(2)} received from {ctx.payload.receivedFrom || ctx.payload.clientName} has been recorded.
              </Prose>
            </div>
            <div style={{ marginTop: 22 }}>
              <ItemsTable ctx={ctx} t={t} variant="borderless" showUnit={false} />
            </div>
            <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
              </div>
              <div style={{ width: 240, textAlign: "center" }}>
                {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={92} caption="Share this receipt" /> : null}
              </div>
            </Row>
            <div style={{ marginTop: 22, textAlign: "center" }}>
              <SignatureBlock ctx={ctx} t={t} align="center" variant="handwritten" label="With thanks" />
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-creative-03",
    name: "Ticket",
    category: "creative",
    description: "Event-ticket styling with notched edges and stubbed tear-off payment proof.",
    tags: ["ticket", "event"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${t.rule}`, boxShadow: "0 8px 24px rgba(15,23,42,0.07)" }}>
            <div style={{ flex: 1, padding: 24 }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
              <div style={{ marginTop: 18, fontFamily: t.heading, fontSize: px(t.base * 1.44), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    [ctx.labels.billTo, String(ctx.payload.receivedFrom || ctx.payload.clientName || "—")],
                    ["Date", dt(ctx.doc.issueDate, ctx)],
                    ["Method", String(ctx.payload.paymentMethod ?? "—")],
                    ["Reference", String(ctx.payload.paymentReference ?? "—")],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <Label t={t}>{k}</Label>
                      <div style={{ fontSize: px(t.base * 0.84), color: t.ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <ItemsTable ctx={ctx} t={t} variant="lined" compact showUnit={false} />
              </div>
            </div>
            <div style={{ width: 200, background: t.accent, color: "#fff", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `2px dashed rgba(255,255,255,0.5)` }}>
              <div>
                <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Paid</div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 800, marginTop: 6 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: px(t.base * 0.72), opacity: 0.9 }}>{ctx.doc.number}</div>
                {ctx.design.showQr ? (
                  <div style={{ marginTop: 12 }}>
                    <QrPanel ctx={ctx} t={t} size={82} caption="Validate" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-creative-04",
    name: "Marigold Receipt",
    category: "creative",
    description: "Warm duotone receipt with decorative rules and a gold stamp frame.",
    tags: ["gold", "warm"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const gold = "#b8860b";
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 42 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, color: t.ink }}>{ctx.labels.title.toUpperCase()}</div>
              <div style={{ height: 1, background: gold, width: 80, marginLeft: "auto", marginTop: 8 }} />
              <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 6 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <div style={{ marginTop: 24 }}>
            <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="plain" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="striped" showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <div style={{ background: "#fbf7ee", border: `1px solid #ecdfc2`, borderRadius: 4, padding: 14 }}>
                <TotalsBlock ctx={ctx} t={t} variant="plain" labelColor="#8a7436" showPaid={false} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <PaidStamp t={t} color={gold} label="PAID" rotate={-8} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <AmountWords ctx={ctx} t={t} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <div style={{ height: 4, flex: 3, background: gold, borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: "#ecdfc2", borderRadius: 99 }} />
          </div>
          <FooterBar ctx={ctx} t={t} variant="centered" />
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-creative-05",
    name: "Stamp",
    category: "creative",
    description: "Oversized rubber-stamp treatment for photo-copy proof of payment.",
    tags: ["stamp", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <CornerTriangle t={t} size={96} corner="bottom-left" opacity={0.9} />
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <MetaGrid t={t} items={receiptMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ marginTop: 26, border: `2px solid ${t.ink}`, borderRadius: 6, padding: 18 }}>
            <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: t.muted }}>{ctx.labels.title}</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2.1), fontWeight: 800, color: t.ink, marginTop: 6 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            <div style={{ marginTop: 12, fontSize: px(t.base * 0.86), color: t.body }}>
              From <strong>{ctx.payload.receivedFrom || ctx.payload.clientName}</strong> — {String(ctx.payload.subject ?? ctx.doc.title)}
            </div>
          </div>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="boxed" showUnit={false} />
          </div>
          <Row gap={18} style={{ marginTop: 16 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
            <div style={{ flex: 1 }}>
              <AmountWords ctx={ctx} t={t} variant="tinted" />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} />
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Received by" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "receipt-creative-06",
    name: "Mosaic Receipt",
    category: "creative",
    description: "Colour-block mosaic header with a split amount and reference rail.",
    tags: ["tiles", "modern"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={10} align="stretch">
            <div style={{ flex: 2, background: t.accent, borderRadius: 4, padding: 16, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>{ctx.labels.title}</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.2), fontWeight: 800, marginTop: 8 }}>{ctx.doc.number}</div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
              <Label t={t}>Amount</Label>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink, marginTop: 5 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: t.ink, borderRadius: 4, padding: 14, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Date</div>
              <div style={{ fontSize: px(t.base * 0.9), fontWeight: 700, marginTop: 6 }}>{dt(ctx.doc.issueDate, ctx)}</div>
            </div>
          </Row>
          <Row gap={20} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading={ctx.labels.billTo} name={ctx.payload.receivedFrom || ctx.payload.clientName} lines={payerLines(ctx)} variant="bar" />
            </div>
            <div style={{ width: 240 }}>
              <MetaGrid t={t} items={receiptMeta(ctx).slice(2)} variant="rows" align="right" />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showUnit={false} />
          </div>
          <div style={{ marginTop: 16 }}>
            <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
          </div>
          <div style={{ marginTop: 18 }}>
            <Bullets t={t} variant="check" items={[String(ctx.payload.notes ?? ctx.labels.thankYou)]} />
          </div>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
];
