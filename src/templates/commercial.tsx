import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  BankDetails, Bullets, BusinessLogo, ContactLines, FooterBar, HeaderBand, ItemsTable, Label, MetaGrid, PaperShell,
  PartyCard, Prose, QrPanel, Row, SectionHeading, SignatureBlock, TitlePlate, TotalsBlock, dt, px, tokens,
} from "./primitives";

/* Purchase orders and delivery notes — logistics documents that must read
   instantly on a warehouse floor and in an accounts department. */

const supplierLines = (ctx: TemplateContext): (string | undefined)[] => [
  ctx.payload.clientCompany,
  ctx.payload.clientAddress,
  ctx.payload.clientPhone,
  ctx.payload.clientEmail,
  ctx.payload.clientTaxId ? `Tax ID: ${ctx.payload.clientTaxId}` : undefined,
];

const poMeta = (ctx: TemplateContext) => {
  const rows = [
    { label: "Order number", value: ctx.doc.number },
    { label: "Order date", value: dt(ctx.doc.issueDate, ctx) },
  ];
  if (ctx.doc.dueDate) rows.push({ label: "Expected", value: dt(ctx.doc.dueDate, ctx) });
  if (ctx.payload.paymentMethod) rows.push({ label: "Payment terms", value: String(ctx.payload.paymentMethod) });
  return rows;
};

const deliveryMeta = (ctx: TemplateContext) => {
  const rows = [
    { label: "Note number", value: ctx.doc.number },
    { label: "Dispatch date", value: dt(ctx.doc.issueDate, ctx) },
  ];
  if (ctx.payload.poNumber) rows.push({ label: "Order / PO", value: String(ctx.payload.poNumber) });
  if (ctx.payload.vehicleNumber) rows.push({ label: "Vehicle", value: String(ctx.payload.vehicleNumber) });
  if (ctx.payload.driverName) rows.push({ label: "Driver", value: String(ctx.payload.driverName) });
  return rows;
};

type Design = Omit<TemplateMeta, "kind">;

export const purchaseOrderTemplates: Design[] = [
  {
    id: "po-corporate-01",
    name: "Standard Order",
    category: "corporate",
    description: "Classic purchase order with supplier block, order grid and authorisation line.",
    tags: ["classic", "procurement"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <MetaGrid t={t} items={poMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ height: 2, background: t.ink, marginTop: 20 }} />
          <div style={{ marginTop: 18 }}>
            <TitlePlate ctx={ctx} t={t} align="left" showNumber={false} subtitle={ctx.payload.subject ? <span style={{ fontSize: px(t.base * 0.82), color: t.muted }}>{String(ctx.payload.subject)}</span> : undefined} />
          </div>
          <Row gap={18} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Supplier" name={ctx.payload.clientName} lines={supplierLines(ctx)} variant="tinted" />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Deliver to" name={ctx.business?.name ?? ""} lines={[String(ctx.payload.deliveryAddress ?? ""), ctx.business?.phone, ctx.business?.email]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 306 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          {ctx.payload.notes ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Instructions to supplier</SectionHeading>
              <Prose t={t} size={0.79}>{String(ctx.payload.notes)}</Prose>
            </div>
          ) : null}
          {ctx.payload.terms ? (
            <div style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="bar">Supply terms</SectionHeading>
              <Prose t={t} size={0.77} muted>{String(ctx.payload.terms)}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="Authorised to order" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note="Please acknowledge receipt of this order and confirm the delivery date." />
        </PaperShell>
      );
    },
  },
  {
    id: "po-modern-01",
    name: "Fast Order",
    category: "modern",
    description: "Headline order number with a solid header and quick-scan item grid.",
    tags: ["scannable", "modern"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="solid" height={112}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Purchase order</div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, marginTop: 4 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 20 }}>
            <MetaGrid t={t} items={poMeta(ctx)} variant="tinted" columns={3} />
          </div>
          <Row gap={18} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Supplier" name={ctx.payload.clientName} lines={supplierLines(ctx)} variant="bar" />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Deliver to" name={ctx.business?.name ?? ""} lines={[String(ctx.payload.deliveryAddress ?? "")]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 16 }}>
            <div style={{ width: 306 }}>
              <TotalsBlock ctx={ctx} t={t} variant="tinted" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <BankDetails ctx={ctx} t={t} variant="boxed" />
          </div>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "po-executive-01",
    name: "Formal Requisition",
    category: "executive",
    description: "Formal procurement document with numbered clauses and approval signatures.",
    tags: ["formal", "approvals"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", borderBottom: `3px double ${t.ink}`, paddingBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 44, subColor: t.faint }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.24), color: t.ink, marginTop: 14, letterSpacing: "0.14em" }}>PURCHASE ORDER</div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 5 }}>{ctx.doc.number} · {dt(ctx.doc.issueDate, ctx)}</div>
          </div>
          <Row gap={22} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1.2 }}>
              <PartyCard t={t} heading="1. Supplier" name={ctx.payload.clientName} lines={supplierLines(ctx)} />
            </div>
            <div style={{ flex: 1 }}>
              <Label t={t}>2. Order particulars</Label>
              <div style={{ marginTop: 7 }}>
                <MetaGrid t={t} items={poMeta(ctx)} variant="rows" />
              </div>
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <Label t={t}>3. Description of goods and services</Label>
            <div style={{ marginTop: 8 }}>
              <ItemsTable ctx={ctx} t={t} variant="boxed" showTax />
            </div>
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 300 }}>
              <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 18 }}>
            <Label t={t}>4. Conditions</Label>
            <div style={{ marginTop: 6 }}>
              <Prose t={t} size={0.78} muted>{String(ctx.payload.terms ?? "Goods to be supplied as specified. Invoice must quote this order number.")}</Prose>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Row gap={24}>
              {["Prepared by", "Approved by"].map((role) => (
                <div key={role} style={{ flex: 1 }}>
                  <div style={{ height: 28 }} />
                  <div style={{ height: 1, background: t.ink }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{role}</div>
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
    id: "po-minimal-01",
    name: "Lean Order",
    category: "minimal",
    description: "Hairline grid purchase order for everyday ordering with zero decoration.",
    tags: ["lean", "hairline"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.04), fontWeight: 700, color: t.ink }}>{ctx.business?.name}</div>
              <div style={{ marginTop: 6 }}>
                <ContactLines ctx={ctx} t={t} compact />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label t={t}>Purchase order</Label>
              <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink, marginTop: 4 }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 18 }} />
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <Label t={t}>Supplier</Label>
              <div style={{ fontSize: px(t.base * 0.85), fontWeight: 650, color: t.ink, marginTop: 5 }}>{ctx.payload.clientName || ctx.payload.clientCompany}</div>
              <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{String(ctx.payload.clientAddress ?? "")}</div>
            </div>
            <div>
              <Label t={t}>Deliver to</Label>
              <div style={{ fontSize: px(t.base * 0.82), color: t.ink, marginTop: 5, lineHeight: 1.5 }}>{String(ctx.payload.deliveryAddress ?? ctx.business?.addressLine1 ?? "")}</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <MetaGrid t={t} items={poMeta(ctx)} variant="inline" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 280 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" label="Authorised" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
  {
    id: "po-minimal-02",
    name: "Checklist Order",
    category: "minimal",
    description: "Enhanced order with a receipt checklist for goods-inwards inspection.",
    tags: ["checklist", "goods-in"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="center">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 800, color: t.ink }}>PURCHASE ORDER</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted }}>{ctx.doc.number}</div>
            </div>
          </Row>
          <div style={{ marginTop: 18 }}>
            <MetaGrid t={t} items={poMeta(ctx)} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 18 }}>
            <PartyCard t={t} heading="Supplier" name={ctx.payload.clientName} lines={supplierLines(ctx)} variant="outline" />
          </div>
          <div style={{ marginTop: 18 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showTax />
          </div>
          <Row justify="flex-end" style={{ marginTop: 14 }}>
            <div style={{ width: 296 }}>
              <TotalsBlock ctx={ctx} t={t} variant="plain" showPaid={false} />
            </div>
          </Row>
          <div style={{ marginTop: 20, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
            <Label t={t}>Goods-in inspection</Label>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 18px" }}>
              {["Quantities correct", "Items undamaged", "Packaging intact", "Documentation complete"].map((c) => (
                <div key={c} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: px(t.base * 0.78), color: t.body }}>
                  <span style={{ width: 12, height: 12, border: `1.4px solid ${t.ink}`, borderRadius: 2, display: "inline-block" }} />
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Row gap={24}>
              {["Received by", "Checked by"].map((r) => (
                <div key={r} style={{ flex: 1 }}>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 1, background: t.rule }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{r}</div>
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
    id: "po-creative-01",
    name: "Trade Order",
    category: "creative",
    description: "Colour-block trading order with prominent totals and supplier clarity.",
    tags: ["colour-block", "trade"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={10} align="stretch">
            <div style={{ flex: 2, background: t.accent, borderRadius: 4, padding: 16, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Purchase order</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.24), fontWeight: 800, marginTop: 8 }}>{ctx.doc.number}</div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
              <Label t={t}>Order date</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 650, color: t.ink, marginTop: 5 }}>{dt(ctx.doc.issueDate, ctx)}</div>
            </div>
            <div style={{ flex: 1, background: t.ink, borderRadius: 4, padding: 14, color: "#fff" }}>
              <div style={{ fontSize: px(t.base * 0.66), letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Order total</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, marginTop: 6 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            </div>
          </Row>
          <Row gap={18} style={{ marginTop: 22 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Supplier" name={ctx.payload.clientName} lines={supplierLines(ctx)} variant="bar" />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Deliver to" name={ctx.business?.name ?? ""} lines={[String(ctx.payload.deliveryAddress ?? ""), ctx.business?.phone]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showTax />
          </div>
          <div style={{ marginTop: 16 }}>
            <TotalsBlock ctx={ctx} t={t} variant="outline" showPaid={false} />
          </div>
          <div style={{ marginTop: 18 }}>
            <Bullets t={t} variant="check" items={[String(ctx.payload.notes ?? "Deliver during business hours. Quote the order number on all correspondence.")]} />
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

export const deliveryNoteTemplates: Design[] = [
  {
    id: "dn-corporate-01",
    name: "Standard Note",
    category: "corporate",
    description: "Dispatch details, item list and a received-in-good-order sign-off.",
    tags: ["dispatch", "sign-off"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} />
            <MetaGrid t={t} items={deliveryMeta(ctx)} variant="rows" align="right" />
          </Row>
          <div style={{ height: 2, background: t.ink, marginTop: 20 }} />
          <div style={{ marginTop: 18 }}>
            <TitlePlate ctx={ctx} t={t} align="left" showNumber={false} />
          </div>
          <Row gap={18} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Deliver to" name={ctx.payload.clientName} lines={[ctx.payload.clientCompany, String(ctx.payload.deliveryAddress ?? ""), ctx.payload.clientPhone]} variant="tinted" />
            </div>
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Dispatched from" name={ctx.business?.name ?? ""} lines={[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.phone]} />
            </div>
          </Row>
          <div style={{ marginTop: 22 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" showUnit showTax={false} />
          </div>
          <div style={{ marginTop: 18, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
            <Label t={t}>Received in good order and condition</Label>
            <Row gap={24} style={{ marginTop: 16 }}>
              {["Received by (name)", "Signature", "Date"].map((f) => (
                <div key={f} style={{ flex: f === "Signature" ? 1.4 : 1 }}>
                  <div style={{ height: 22 }} />
                  <div style={{ height: 1, background: t.ink }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{f}</div>
                </div>
              ))}
            </Row>
          </div>
          {ctx.payload.notes ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="bar">Handling notes</SectionHeading>
              <Prose t={t} size={0.78} muted>{String(ctx.payload.notes)}</Prose>
            </div>
          ) : null}
          <FooterBar ctx={ctx} t={t} variant="rule" note="Please retain this note as proof of delivery." />
        </PaperShell>
      );
    },
  },
  {
    id: "dn-modern-01",
    name: "Logistics Slip",
    category: "modern",
    description: "Dark logistics header with driver and vehicle details called out clearly.",
    tags: ["logistics", "driver"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="solid" height={116}>
            <Row justify="space-between" align="flex-start">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.78)", markBackground: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Delivery note</div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.36), fontWeight: 800, marginTop: 4 }}>{ctx.doc.number}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            {[
              { label: "Driver", value: String(ctx.payload.driverName ?? "—") },
              { label: "Vehicle", value: String(ctx.payload.vehicleNumber ?? "—") },
              { label: "Dispatched", value: dt(ctx.doc.issueDate, ctx) },
            ].map((f) => (
              <div key={f.label} style={{ background: t.tint, borderRadius: 4, padding: 12 }}>
                <Label t={t}>{f.label}</Label>
                <div style={{ fontSize: px(t.base * 0.9), fontWeight: 700, color: t.ink, marginTop: 5 }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <PartyCard t={t} heading="Deliver to" name={ctx.payload.clientName} lines={[ctx.payload.clientCompany, String(ctx.payload.deliveryAddress ?? ""), ctx.payload.clientPhone]} variant="bar" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="zebra-accent" showTax={false} />
          </div>
          <div style={{ marginTop: 18, background: t.tint, borderRadius: 4, padding: 14, display: "flex", justifyContent: "space-between", gap: 20 }}>
            <div>
              <Label t={t}>Total items</Label>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.1), fontWeight: 800, color: t.ink, marginTop: 4 }}>{ctx.totals.items}</div>
            </div>
            <div>
              <Label t={t}>Total quantity</Label>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.1), fontWeight: 800, color: t.ink, marginTop: 4 }}>{ctx.totals.quantity}</div>
            </div>
            <div>
              <Label t={t}>Declared value</Label>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.1), fontWeight: 800, color: t.ink, marginTop: 4 }}>{ctx.payload.currency} {ctx.totals.total.toFixed(2)}</div>
            </div>
          </div>
          <Row gap={24} style={{ marginTop: 24 }}>
            {["Delivered by", "Received by", "Date"].map((f) => (
              <div key={f} style={{ flex: 1 }}>
                <div style={{ height: 24 }} />
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{f}</div>
              </div>
            ))}
          </Row>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
  {
    id: "dn-minimal-01",
    name: "Warehouse Note",
    category: "minimal",
    description: "Plain goods-out note designed for fast warehouse handling.",
    tags: ["warehouse", "plain"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink }}>{String(ctx.payload.title ?? "Delivery Note")}</div>
              <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 3 }}>{ctx.business?.name}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.78), color: t.muted }}>
              <div style={{ fontWeight: 700, color: t.ink }}>{ctx.doc.number}</div>
              <div>{dt(ctx.doc.issueDate, ctx)}</div>
              {ctx.payload.poNumber ? <div>PO {String(ctx.payload.poNumber)}</div> : null}
            </div>
          </Row>
          <div style={{ height: 2, background: t.accent, marginTop: 16 }} />
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <Label t={t}>Consignee</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 650, color: t.ink, marginTop: 5 }}>{ctx.payload.clientName || ctx.payload.clientCompany}</div>
              <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{String(ctx.payload.deliveryAddress ?? "")}</div>
            </div>
            <div>
              <Label t={t}>Transport</Label>
              <div style={{ fontSize: px(t.base * 0.8), color: t.body, marginTop: 5, lineHeight: 1.6 }}>
                {ctx.payload.driverName ? <div>Driver: {String(ctx.payload.driverName)}</div> : null}
                {ctx.payload.vehicleNumber ? <div>Vehicle: {String(ctx.payload.vehicleNumber)}</div> : null}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="lined" compact showTax={false} />
          </div>
          <div style={{ marginTop: 20 }}>
            <Row gap={24}>
              {["Issued by", "Received by", "Date"].map((f) => (
                <div key={f} style={{ flex: 1 }}>
                  <div style={{ height: 20 }} />
                  <div style={{ height: 1, background: t.rule }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{f}</div>
                </div>
              ))}
            </Row>
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note="Goods received in good order unless noted on this document." />
        </PaperShell>
      );
    },
  },
  {
    id: "dn-executive-01",
    name: "Consignment",
    category: "executive",
    description: "Formal consignment note with a ruled manifest and witness line.",
    tags: ["consignment", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `3px double ${t.ink}`, paddingBottom: 14 }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 38 }} />
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.24), color: t.ink }}>CONSIGNMENT NOTE</div>
            </Row>
          </div>
          <div style={{ marginTop: 16 }}>
            <MetaGrid t={t} items={deliveryMeta(ctx)} variant="tinted" columns={3} />
          </div>
          <Row gap={22} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <Label t={t}>Consignor</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 650, color: t.ink, marginTop: 5 }}>{ctx.business?.name}</div>
              <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>
                {[ctx.business?.addressLine1, ctx.business?.city, ctx.business?.phone].filter(Boolean).join(", ")}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label t={t}>Consignee</Label>
              <div style={{ fontSize: px(t.base * 0.84), fontWeight: 650, color: t.ink, marginTop: 5 }}>{ctx.payload.clientName || ctx.payload.clientCompany}</div>
              <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 3, lineHeight: 1.5 }}>{String(ctx.payload.deliveryAddress ?? "")}</div>
            </div>
          </Row>
          <div style={{ marginTop: 20 }}>
            <Label t={t}>Manifest of goods</Label>
            <div style={{ marginTop: 8 }}>
              <ItemsTable ctx={ctx} t={t} variant="boxed" compact showTax={false} />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Prose t={t} size={0.78} muted>
              The goods listed above were handed over in good order and condition. Any discrepancy must be noted at the time of
              delivery and countersigned by both parties.
            </Prose>
          </div>
          <div style={{ marginTop: 22 }}>
            <Row gap={24}>
              {["Consignor signature", "Consignee signature", "Witness"].map((f) => (
                <div key={f} style={{ flex: 1 }}>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 1, background: t.ink }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{f}</div>
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
    id: "dn-creative-01",
    name: "Track Slip",
    category: "creative",
    description: "Modern tracking slip with a QR code for digital proof of delivery.",
    tags: ["tracking", "qr"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.accent, color: "#fff", borderRadius: 6, padding: "16px 20px" }}>
            <div>
              <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Delivery note</div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.3), fontWeight: 800, marginTop: 5 }}>{ctx.doc.number}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.78), opacity: 0.92 }}>
              <div>{dt(ctx.doc.issueDate, ctx)}</div>
              {ctx.payload.poNumber ? <div>PO {String(ctx.payload.poNumber)}</div> : null}
            </div>
          </div>
          <Row gap={20} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <PartyCard t={t} heading="Deliver to" name={ctx.payload.clientName} lines={[ctx.payload.clientCompany, String(ctx.payload.deliveryAddress ?? ""), ctx.payload.clientPhone]} variant="outline" />
            </div>
            {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={92} caption="Scan for tracking" /> : null}
          </Row>
          <div style={{ marginTop: 20 }}>
            <ItemsTable ctx={ctx} t={t} variant="borderless" showTax={false} />
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
            {[
              { label: "Items", value: String(ctx.totals.items) },
              { label: "Quantity", value: String(ctx.totals.quantity) },
              { label: "Declared value", value: `${ctx.payload.currency} ${ctx.totals.total.toFixed(2)}` },
            ].map((f) => (
              <div key={f.label} style={{ borderTop: `3px solid ${t.accent}`, paddingTop: 8 }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink }}>{f.value}</div>
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 2 }}>{f.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, border: `1px solid ${t.rule}`, borderRadius: 4, padding: 14 }}>
            <Row gap={24}>
              {["Delivered by", "Received by", "Date"].map((f) => (
                <div key={f} style={{ flex: 1 }}>
                  <div style={{ height: 22 }} />
                  <div style={{ height: 1, background: t.ink }} />
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 5 }}>{f}</div>
                </div>
              ))}
            </Row>
          </div>
          <FooterBar ctx={ctx} t={t} variant="tinted" />
        </PaperShell>
      );
    },
  },
];
