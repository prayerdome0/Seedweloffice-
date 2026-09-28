import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  Bullets, BusinessLogo, ContactLines, FooterBar, HeaderBand, Label, MetaGrid, PaperShell, PartyCard,
  Prose, QrPanel, Row, SectionHeading, SignatureBlock, dt, px, tokens,
} from "./primitives";
import { withAlpha } from "@/lib/utils";

/* Certificates, cover letters and business cards — personal documents where
   presentation carries most of the message. */

const paragraphs = (ctx: TemplateContext): string[] => {
  const body = (ctx.payload.bodyParagraphs as string[]) ?? [];
  return body.length ? body : [];
};

const signatoryList = (ctx: TemplateContext): string[] => (ctx.payload.signatories as string[]) ?? [];

type Design = Omit<TemplateMeta, "kind">;

/* ════════════════════════════ CERTIFICATES ═══════════════════════════════ */
export const certificateTemplates: Design[] = [
  {
    id: "cert-classic-01",
    name: "Classic Award",
    category: "corporate",
    description: "Traditional award certificate with ornamental frame, seal and dual signatures.",
    tags: ["award", "ornamental"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 40 }}>
          <div style={{ border: `2px solid ${t.accent}`, borderRadius: 4, padding: 32, minHeight: 1000, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ border: `1px solid ${t.soft}`, position: "absolute", inset: 50, pointerEvents: "none", borderRadius: 3, margin: 0 }} />
            <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, size: 44, showName: true }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.7), color: t.ink, marginTop: 26, letterSpacing: "0.14em" }}>
              {String(ctx.payload.title ?? "Certificate of Achievement").toUpperCase()}
            </div>
            <div style={{ height: 1, background: t.accent, width: 150, marginTop: 14 }} />
            <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 22, letterSpacing: "0.06em" }}>This certificate is proudly presented to</div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 2), color: t.accent, marginTop: 16, lineHeight: 1.2 }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ fontSize: px(t.base * 0.86), color: t.body, marginTop: 18, maxWidth: 470, lineHeight: 1.7 }}>
              {String(ctx.payload.description ?? "in recognition of outstanding achievement and dedication")}
            </div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 700, color: t.ink, marginTop: 16 }}>{String(ctx.payload.award ?? "")}</div>
            <Row justify="center" gap={60} style={{ marginTop: "auto", paddingTop: 48 }}>
              {(signatoryList(ctx).length ? signatoryList(ctx) : ["Director", "Programme Lead"]).slice(0, 2).map((name, i) => (
                <div key={i} style={{ minWidth: 180 }}>
                  <div style={{ height: 30 }} />
                  <div style={{ height: 1, background: t.ink }} />
                  <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 6 }}>{name}</div>
                </div>
              ))}
            </Row>
            <div style={{ fontSize: px(t.base * 0.72), color: t.faint, marginTop: 26 }}>
              {ctx.payload.serial ? `Certificate no. ${String(ctx.payload.serial)} · ` : ""}
              Awarded {dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx)}
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cert-modern-01",
    name: "Modern Award",
    category: "modern",
    description: "Contemporary certificate with colour blocks, geometric accents and QR verification.",
    tags: ["modern", "verifiable"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(120deg, ${t.ink}, ${t.accent})`, color: "#fff", padding: "34px 52px" }}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ nameColor: "#fff", subColor: "rgba(255,255,255,0.72)", markBackground: "rgba(255,255,255,0.18)" }} />
              <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>Certificate</div>
            </Row>
          </div>
          <div style={{ padding: "46px 52px 52px", textAlign: "center" }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800, color: t.ink, lineHeight: 1.2 }}>{String(ctx.payload.title ?? "Certificate of Achievement")}</div>
            <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 14 }}>Awarded to</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2.1), fontWeight: 800, color: t.accent, marginTop: 10, letterSpacing: "-0.02em" }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ margin: "24px auto 0", width: 60, height: 3, background: t.accent, borderRadius: 99 }} />
            <Prose t={t} size={0.88} muted>
              <span style={{ display: "block", marginTop: 22, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
                {String(ctx.payload.description ?? "for the successful completion of all requirements")}
              </span>
            </Prose>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.16), fontWeight: 700, color: t.ink, marginTop: 18 }}>{String(ctx.payload.award ?? "")}</div>
            <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16, textAlign: "left" }}>
              {[
                { label: "Date awarded", value: dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx) },
                { label: "Certificate no.", value: String(ctx.payload.serial ?? ctx.doc.number) },
                { label: "Issued by", value: String(ctx.business?.name ?? "") },
              ].map((f) => (
                <div key={f.label} style={{ background: t.tint, borderRadius: 4, padding: 12 }}>
                  <Label t={t}>{f.label}</Label>
                  <div style={{ fontSize: px(t.base * 0.84), fontWeight: 650, color: t.ink, marginTop: 5 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <Row justify="space-between" align="flex-end" style={{ marginTop: 40 }}>
              <div style={{ textAlign: "left", minWidth: 200 }}>
                <div style={{ height: 30 }} />
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 6 }}>{signatoryList(ctx)[0] ?? ctx.business?.signatureName ?? "Authorised signatory"}</div>
                <div style={{ fontSize: px(t.base * 0.72), color: t.muted }}>{ctx.business?.signatureRole ?? "Director"}</div>
              </div>
              {ctx.design.showQr ? <QrPanel ctx={ctx} t={t} size={86} caption="Verify certificate" /> : null}
            </Row>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cert-executive-01",
    name: "Engraved",
    category: "executive",
    description: "Understated engraved certificate for professional and academic honours.",
    tags: ["serif", "engraved"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 56 }}>
          <div style={{ border: `1px solid ${t.ink}`, padding: "46px 40px", minHeight: 940, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: t.sans, fontSize: px(t.base * 0.7), letterSpacing: "0.34em", textTransform: "uppercase", color: t.muted }}>{ctx.business?.name ?? "The Institution"}</div>
            <div style={{ height: 1, background: t.ink, width: "100%", marginTop: 18, opacity: 0.4 }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink, marginTop: 46, letterSpacing: "0.2em" }}>CERTIFICATE</div>
            <div style={{ fontFamily: t.sans, fontSize: px(t.base * 0.78), color: t.muted, marginTop: 12, letterSpacing: "0.16em", textTransform: "uppercase" }}>{String(ctx.payload.award ?? "of recognition")}</div>
            <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 40, fontStyle: "italic" }}>is awarded to</div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 2.1), color: t.ink, marginTop: 20 }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ height: 1, background: t.accent, width: 120, marginTop: 22 }} />
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.94), color: t.body, marginTop: 26, maxWidth: 460, lineHeight: 1.75 }}>
              {String(ctx.payload.description ?? "")}
            </div>
            <div style={{ marginTop: "auto", width: "100%" }}>
              <Row justify="space-between" align="flex-end">
                <div style={{ textAlign: "left", minWidth: 170 }}>
                  <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontFamily: "'Playfair Display'" }}>{dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx)}</div>
                  <div style={{ height: 1, background: t.ink, marginTop: 4 }} />
                  <div style={{ fontSize: px(t.base * 0.7), color: t.muted, marginTop: 5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Date</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 210 }}>
                  <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.86), color: t.ink }}>{signatoryList(ctx)[0] ?? "—"}</div>
                  <div style={{ height: 1, background: t.ink, marginTop: 4 }} />
                  <div style={{ fontSize: px(t.base * 0.7), color: t.muted, marginTop: 5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Principal</div>
                </div>
              </Row>
              <div style={{ fontSize: px(t.base * 0.68), color: t.faint, marginTop: 22, letterSpacing: "0.1em" }}>{String(ctx.payload.serial ?? ctx.doc.number)}</div>
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cert-minimal-01",
    name: "Plain Award",
    category: "minimal",
    description: "Typography-only certificate that prints crisply in single colour.",
    tags: ["economical", "clean"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 68 }}>
          <div style={{ display: "flex", flexDirection: "column", minHeight: 960 }}>
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 38, subColor: t.faint }} />
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, marginTop: 60, lineHeight: 1.2 }}>
              {String(ctx.payload.title ?? "Certificate of Completion")}
            </div>
            <div style={{ marginTop: 16, width: 50, height: 3, background: t.accent, borderRadius: 99 }} />
            <div style={{ fontSize: px(t.base * 0.86), color: t.muted, marginTop: 30 }}>Presented to</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, color: t.ink, marginTop: 8, letterSpacing: "-0.02em" }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ fontSize: px(t.base * 0.9), color: t.body, marginTop: 22, maxWidth: 500, lineHeight: 1.7 }}>
              {String(ctx.payload.description ?? "")}
            </div>
            <div style={{ fontSize: px(t.base * 1.04), fontWeight: 700, color: t.accent, marginTop: 18 }}>{String(ctx.payload.award ?? "")}</div>
            <div style={{ marginTop: 40 }}>
              <MetaGrid t={t} items={[
                { label: "Date", value: dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx) },
                { label: "Certificate no.", value: String(ctx.payload.serial ?? ctx.doc.number) },
              ]} variant="rows" />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 40 }}>
              <Row gap={40} align="flex-end">
                {(signatoryList(ctx).length ? signatoryList(ctx) : ["Authorised signatory"]).slice(0, 2).map((name, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ height: 26 }} />
                    <div style={{ height: 1, background: t.ink }} />
                    <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 6 }}>{name}</div>
                  </div>
                ))}
              </Row>
            </div>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cert-creative-01",
    name: "Spotlight",
    category: "creative",
    description: "Bold colour-field certificate for team awards, churches and sports days.",
    tags: ["celebration", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", background: `linear-gradient(135deg, ${t.accent}, ${withAlpha(t.accent, 0.7)})`, color: "#fff", padding: "52px 52px 46px", textAlign: "center" }}>
            <div style={{ position: "absolute", top: -70, right: -60, width: 220, height: 220, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <BusinessLogo ctx={ctx} t={t} opts={{ align: "center", stack: true, nameColor: "#fff", subColor: "rgba(255,255,255,0.75)", markBackground: "rgba(255,255,255,0.2)" }} />
              </div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.9), fontWeight: 800, marginTop: 26, lineHeight: 1.15, letterSpacing: "-0.02em" }}>{String(ctx.payload.title ?? "Certificate of Achievement")}</div>
            </div>
          </div>
          <div style={{ padding: "42px 52px 52px", textAlign: "center" }}>
            <div style={{ fontSize: px(t.base * 0.86), color: t.muted }}>Congratulations to</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2.2), fontWeight: 800, color: t.ink, marginTop: 12, letterSpacing: "-0.03em" }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ margin: "26px auto 0", maxWidth: 470 }}>
              <Prose t={t} size={0.9} muted>{String(ctx.payload.description ?? "")}</Prose>
            </div>
            <div style={{ display: "inline-block", marginTop: 24, background: t.tint, borderRadius: 99, padding: "8px 20px", fontFamily: t.heading, fontWeight: 700, color: t.accent, fontSize: px(t.base * 1.02) }}>
              {String(ctx.payload.award ?? "")}
            </div>
            <Row justify="space-between" align="flex-end" style={{ marginTop: 52 }}>
              <div style={{ textAlign: "left", minWidth: 190 }}>
                <div style={{ height: 28 }} />
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 6 }}>{signatoryList(ctx)[0] ?? ctx.business?.signatureName ?? "Authorised signatory"}</div>
              </div>
              <div style={{ textAlign: "center", fontSize: px(t.base * 0.75), color: t.muted }}>
                <div>{dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx)}</div>
                <div style={{ marginTop: 3 }}>{String(ctx.payload.serial ?? ctx.doc.number)}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 190 }}>
                <div style={{ height: 28 }} />
                <div style={{ height: 1, background: t.ink }} />
                <div style={{ fontSize: px(t.base * 0.78), color: t.ink, fontWeight: 600, marginTop: 6 }}>{signatoryList(ctx)[1] ?? "Programme lead"}</div>
              </div>
            </Row>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cert-corporate-02",
    name: "Training Record",
    category: "corporate",
    description: "Certificate with an attached competency record for compliance documentation.",
    tags: ["training", "compliance"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="tinted" height={96}>
            <Row justify="space-between" align="center">
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
              <div style={{ textAlign: "right", fontSize: px(t.base * 0.78), color: t.muted }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.14), fontWeight: 800, color: t.accent }}>CERTIFICATE OF COMPLETION</div>
                <div style={{ marginTop: 3 }}>{String(ctx.payload.serial ?? ctx.doc.number)}</div>
              </div>
            </Row>
          </HeaderBand>
          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: px(t.base * 0.84), color: t.muted }}>This is to certify that</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800, color: t.ink, marginTop: 8 }}>{String(ctx.payload.recipient ?? "Recipient Name")}</div>
            <div style={{ fontSize: px(t.base * 0.88), color: t.body, marginTop: 12, lineHeight: 1.7 }}>{String(ctx.payload.description ?? "")}</div>
          </div>
          <div style={{ marginTop: 22 }}>
            <MetaGrid t={t} items={[
              { label: "Programme", value: String(ctx.payload.award ?? "—") },
              { label: "Completed", value: dt(String(ctx.payload.ceremonyDate ?? ctx.doc.issueDate), ctx) },
              { label: "Certificate no.", value: String(ctx.payload.serial ?? ctx.doc.number) },
              { label: "Issued by", value: String(ctx.business?.name ?? "—") },
            ]} variant="tinted" columns={4} />
          </div>
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="bar">Assessment record</SectionHeading>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: px(t.base * 0.79) }}>
              <tbody>
                {[
                  ["Attendance", "100% of scheduled sessions"],
                  ["Practical assessment", "Passed"],
                  ["Written assessment", "Passed"],
                  ["Instructor", signatoryList(ctx)[0] ?? String(ctx.business?.signatureName ?? "—")],
                ].map(([k, v], i) => (
                  <tr key={k}>
                    <td style={{ padding: "7px 9px", borderBottom: `1px solid ${t.rule}`, color: t.muted, width: "40%" }}>{k}</td>
                    <td style={{ padding: "7px 9px", borderBottom: `1px solid ${t.rule}`, color: t.ink, fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} align="right" label="For and on behalf of the institution" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" />
        </PaperShell>
      );
    },
  },
];

/* ═══════════════════════════ COVER LETTERS ═══════════════════════════════ */
export const coverLetterTemplates: Design[] = [
  {
    id: "letter-classic-01",
    name: "Classic Business Letter",
    category: "corporate",
    description: "Traditional full-block business letter with sender letterhead and address block.",
    tags: ["letterhead", "formal"],
    render: (ctx) => {
      const t = tokens(ctx);
      const body = paragraphs(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <BusinessLogo ctx={ctx} t={t} opts={{ size: 40 }} />
            <ContactLines ctx={ctx} t={t} align="right" />
          </Row>
          <div style={{ height: 2, background: t.ink, marginTop: 20 }} />
          <div style={{ marginTop: 22, fontSize: px(t.base * 0.84), color: t.body, lineHeight: 1.7 }}>
            <div>{dt(ctx.doc.issueDate, ctx)}</div>
            <div style={{ marginTop: 14 }}>
              {ctx.payload.recipientName ? <div style={{ fontWeight: 650, color: t.ink }}>{String(ctx.payload.recipientName)}</div> : null}
              {ctx.payload.recipientTitle ? <div>{String(ctx.payload.recipientTitle)}</div> : null}
              {ctx.payload.companyName ? <div>{String(ctx.payload.companyName)}</div> : null}
              {ctx.payload.companyAddress ? <div style={{ whiteSpace: "pre-line" }}>{String(ctx.payload.companyAddress)}</div> : null}
            </div>
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.92), fontWeight: 700, color: t.ink }}>
              Re: Application for the position of {String(ctx.payload.position ?? "—")}
            </div>
          </div>
          <div style={{ marginTop: 18, fontSize: px(t.base * 0.86), lineHeight: 1.75, color: t.body, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0 }}>{String(ctx.payload.opening ?? `Dear ${ctx.payload.recipientName || "Hiring Manager"},`)}</p>
            {body.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{p}</p>
            ))}
            <p style={{ margin: 0 }}>{String(ctx.payload.closing ?? "")}</p>
          </div>
          <div style={{ marginTop: 26 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" variant="line" label="Yours sincerely" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="rule" note={`${String(ctx.payload.fullName ?? "")} · ${String(ctx.payload.email ?? "")} · ${String(ctx.payload.phone ?? "")}`} />
        </PaperShell>
      );
    },
  },
  {
    id: "letter-modern-01",
    name: "Modern Letter",
    category: "modern",
    description: "Contemporary letter with a colour sidebar carrying your contact details.",
    tags: ["sidebar", "modern"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const body = paragraphs(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarWidth={230}
          sidebar={
            <div style={{ background: t.accent, minHeight: 1123, padding: "36px 24px", color: "#fff", display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.16), fontWeight: 800, lineHeight: 1.25 }}>{String(ctx.payload.fullName ?? "")}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9, marginTop: 5 }}>{String(ctx.payload.headline ?? "")}</div>
              </div>
              <div>
                <Label t={t} color="rgba(255,255,255,0.7)">Contact</Label>
                <div style={{ marginTop: 8, fontSize: px(t.base * 0.78), display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.5 }}>
                  {[ctx.payload.email, ctx.payload.phone, ctx.payload.location, ctx.payload.website, ctx.payload.linkedin].filter(Boolean).map((l) => (
                    <span key={String(l)} style={{ wordBreak: "break-word" }}>{String(l)}</span>
                  ))}
                </div>
              </div>
              {ctx.design.showQr ? (
                <div style={{ marginTop: "auto" }}>
                  <QrPanel ctx={ctx} t={t} size={86} caption="Portfolio" />
                </div>
              ) : null}
            </div>
          }
        >
          <div style={{ fontSize: px(t.base * 0.8), color: t.muted }}>{dt(ctx.doc.issueDate, ctx)}</div>
          <div style={{ marginTop: 18, fontSize: px(t.base * 0.83), color: t.body, lineHeight: 1.65 }}>
            {ctx.payload.recipientName ? <div style={{ fontWeight: 650, color: t.ink }}>{String(ctx.payload.recipientName)}</div> : null}
            {ctx.payload.companyName ? <div>{String(ctx.payload.companyName)}</div> : null}
            {ctx.payload.companyAddress ? <div style={{ whiteSpace: "pre-line" }}>{String(ctx.payload.companyAddress)}</div> : null}
          </div>
          <div style={{ marginTop: 22, fontFamily: t.heading, fontSize: px(t.base * 1.3), fontWeight: 800, color: t.ink, lineHeight: 1.3 }}>
            {String(ctx.payload.position ? `Application for ${ctx.payload.position}` : "Cover letter")}
          </div>
          <div style={{ marginTop: 18, fontSize: px(t.base * 0.86), lineHeight: 1.78, color: t.body, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0 }}>{String(ctx.payload.opening ?? "")}</p>
            {body.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{p}</p>
            ))}
            <p style={{ margin: 0 }}>{String(ctx.payload.closing ?? "")}</p>
          </div>
          <div style={{ marginTop: 28 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" label="Yours sincerely" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "letter-executive-01",
    name: "Executive Letter",
    category: "executive",
    description: "Serif executive correspondence for senior appointments and boards.",
    tags: ["serif", "senior"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const body = paragraphs(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 14, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.3), color: t.ink, letterSpacing: "0.04em" }}>{String(ctx.payload.fullName ?? "")}</div>
            <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {[ctx.payload.location, ctx.payload.phone, ctx.payload.email].filter(Boolean).join("  ·  ")}
            </div>
          </div>
          <div style={{ marginTop: 24, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.9), color: t.muted }}>
            {dt(ctx.doc.issueDate, ctx)}
          </div>
          <div style={{ marginTop: 18, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.92), color: t.body, lineHeight: 1.65 }}>
            {ctx.payload.recipientName ? <div>{String(ctx.payload.recipientName)}</div> : null}
            {ctx.payload.recipientTitle ? <div>{String(ctx.payload.recipientTitle)}</div> : null}
            {ctx.payload.companyName ? <div>{String(ctx.payload.companyName)}</div> : null}
            {ctx.payload.companyAddress ? <div style={{ whiteSpace: "pre-line" }}>{String(ctx.payload.companyAddress)}</div> : null}
          </div>
          <div style={{ marginTop: 24, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.96), lineHeight: 1.8, color: t.body, display: "flex", flexDirection: "column", gap: 13 }}>
            <p style={{ margin: 0 }}>{String(ctx.payload.opening ?? "")}</p>
            {body.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{p}</p>
            ))}
            <p style={{ margin: 0 }}>{String(ctx.payload.closing ?? "")}</p>
          </div>
          <div style={{ marginTop: 30 }}>
            <SignatureBlock ctx={ctx} t={t} align="left" variant="handwritten" label="Yours faithfully" />
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "letter-minimal-01",
    name: "Minimal Letter",
    category: "minimal",
    description: "Clean, unstyled letter that lets the words do the work.",
    tags: ["plain", "readable"],
    render: (ctx) => {
      const t = tokens(ctx);
      const body = paragraphs(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 62 }}>
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.2), fontWeight: 800, color: t.ink }}>{String(ctx.payload.fullName ?? "")}</div>
          <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 4 }}>
            {[ctx.payload.email, ctx.payload.phone, ctx.payload.location].filter(Boolean).join(" · ")}
          </div>
          <div style={{ height: 1, background: t.rule, marginTop: 16 }} />
          <div style={{ marginTop: 22, fontSize: px(t.base * 0.82), color: t.muted }}>{dt(ctx.doc.issueDate, ctx)}</div>
          <div style={{ marginTop: 16, fontSize: px(t.base * 0.83), color: t.body, lineHeight: 1.65 }}>
            {[ctx.payload.recipientName, ctx.payload.recipientTitle, ctx.payload.companyName, ctx.payload.companyAddress]
              .filter(Boolean)
              .map((l, i) => (
                <div key={i} style={{ whiteSpace: "pre-line" }}>{String(l)}</div>
              ))}
          </div>
          <div style={{ marginTop: 22, fontSize: px(t.base * 0.86), fontWeight: 650, color: t.ink }}>
            {String(ctx.payload.position ? `Re: ${ctx.payload.position}` : "")}
          </div>
          <div style={{ marginTop: 16, fontSize: px(t.base * 0.87), lineHeight: 1.8, color: t.body, display: "flex", flexDirection: "column", gap: 13 }}>
            <p style={{ margin: 0 }}>{String(ctx.payload.opening ?? "")}</p>
            {body.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{p}</p>
            ))}
            <p style={{ margin: 0 }}>{String(ctx.payload.closing ?? "")}</p>
          </div>
          <div style={{ marginTop: 34, fontSize: px(t.base * 0.87), color: t.ink, fontWeight: 600 }}>{String(ctx.payload.fullName ?? "")}</div>
        </PaperShell>
      );
    },
  },
  {
    id: "letter-creative-01",
    name: "Creative Letter",
    category: "creative",
    description: "Design-forward letter with a colour header band and bold opening statement.",
    tags: ["bold", "portfolio"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const body = paragraphs(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, color: "#fff", padding: "30px 52px" }}>
            <Row justify="space-between" align="center">
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800 }}>{String(ctx.payload.fullName ?? "")}</div>
                <div style={{ fontSize: px(t.base * 0.8), opacity: 0.9, marginTop: 4 }}>{String(ctx.payload.headline ?? "")}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: px(t.base * 0.76), opacity: 0.88, lineHeight: 1.6 }}>
                {[ctx.payload.email, ctx.payload.phone, ctx.payload.location].filter(Boolean).map((l) => (
                  <div key={String(l)}>{String(l)}</div>
                ))}
              </div>
            </Row>
          </div>
          <div style={{ padding: "34px 52px 52px" }}>
            <div style={{ fontSize: px(t.base * 0.8), color: t.muted }}>{dt(ctx.doc.issueDate, ctx)}</div>
            <div style={{ marginTop: 14, fontSize: px(t.base * 0.83), color: t.body, lineHeight: 1.65 }}>
              {[ctx.payload.recipientName, ctx.payload.companyName, ctx.payload.companyAddress].filter(Boolean).map((l, i) => (
                <div key={i} style={{ whiteSpace: "pre-line" }}>{String(l)}</div>
              ))}
            </div>
            <div style={{ marginTop: 22, fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, lineHeight: 1.25 }}>
              {String(ctx.payload.position ?? "Let's work together")}
            </div>
            <div style={{ marginTop: 16, fontSize: px(t.base * 0.87), lineHeight: 1.8, color: t.body, display: "flex", flexDirection: "column", gap: 13 }}>
              <p style={{ margin: 0 }}>{String(ctx.payload.opening ?? "")}</p>
              {body.map((p, i) => (
                <p key={i} style={{ margin: 0 }}>{p}</p>
              ))}
              <p style={{ margin: 0 }}>{String(ctx.payload.closing ?? "")}</p>
            </div>
            <div style={{ marginTop: 30 }}>
              <SignatureBlock ctx={ctx} t={t} align="left" variant="tinted" label="Warm regards" />
            </div>
          </div>
        </PaperShell>
      );
    },
  },
];

/* ══════════════════════════ BUSINESS CARDS ═══════════════════════════════ */
export const businessCardTemplates: Design[] = [
  {
    id: "card-corporate-01",
    name: "Corporate Card",
    category: "corporate",
    description: "Classic 90 × 55 mm card with logo, contact block and QR — 10-up on A4.",
    tags: ["classic", "print-ready"],
    render: (ctx) => {
      const t = tokens(ctx);
      const card = (front: boolean, i: number) => (
        <div key={i} style={{ width: 254, height: 156, border: `1px dashed ${t.rule}`, borderRadius: 6, overflow: "hidden", position: "relative", background: "#fff" }}>
          {front ? (
            <div style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <BusinessLogo ctx={ctx} t={t} opts={{ size: 30, showName: true }} />
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.98), fontWeight: 800, color: t.ink }}>{String(ctx.payload.fullName ?? "")}</div>
                <div style={{ fontSize: px(t.base * 0.72), color: t.accent, fontWeight: 650, marginTop: 2 }}>{String(ctx.payload.headline ?? "")}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: t.tint }}>
              <div style={{ fontSize: px(t.base * 0.7), color: t.muted, lineHeight: 1.6 }}>
                {[ctx.payload.phone, ctx.payload.email, ctx.payload.website, ctx.payload.linkedin, ctx.payload.location]
                  .filter(Boolean)
                  .map((l) => (
                    <div key={String(l)}>{String(l)}</div>
                  ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: px(t.base * 0.68), color: t.accent, fontWeight: 650, maxWidth: 140 }}>{String(ctx.payload.tagline ?? "")}</span>
                {ctx.design.showQr ? <img src={ctx.qr} alt="" style={{ width: 46, height: 46 }} /> : null}
              </div>
            </div>
          )}
        </div>
      );
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontSize: px(t.base * 0.72), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Business cards · 10-up on A4</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => card(i % 2 === 0, i))}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "card-modern-01",
    name: "Modern Card",
    category: "modern",
    description: "Colour-blocked modern card with reversed typography and QR contact sharing.",
    tags: ["colour-block", "modern"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontSize: px(t.base * 0.72), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Business cards · 10-up on A4</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 254, height: 156, border: `1px dashed ${t.rule}`, borderRadius: 6, overflow: "hidden", display: "flex" }}>
                <div style={{ width: 84, background: `linear-gradient(160deg, ${t.accent}, ${withAlpha(t.accent, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BusinessLogo ctx={ctx} t={t} opts={{ showName: false, size: 30, markBackground: "rgba(255,255,255,0.2)" }} />
                </div>
                <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.92), fontWeight: 800, color: t.ink }}>{String(ctx.payload.fullName ?? "")}</div>
                    <div style={{ fontSize: px(t.base * 0.68), color: t.accent, fontWeight: 650, marginTop: 2 }}>{String(ctx.payload.headline ?? "")}</div>
                  </div>
                  <div style={{ fontSize: px(t.base * 0.64), color: t.muted, lineHeight: 1.5 }}>
                    {[ctx.payload.phone, ctx.payload.email, ctx.payload.website].filter(Boolean).map((l) => (
                      <div key={String(l)}>{String(l)}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "card-executive-01",
    name: "Executive Card",
    category: "executive",
    description: "Understated serif card for senior professionals and consultants.",
    tags: ["serif", "understated"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontSize: px(t.base * 0.72), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Business cards · 10-up on A4</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 254,
                  height: 156,
                  border: `1px dashed ${t.rule}`,
                  borderRadius: 6,
                  background: i % 2 === 0 ? "#fff" : t.ink,
                  color: i % 2 === 0 ? t.ink : "#fff",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 6,
                }}
              >
                <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.06), fontWeight: 700 }}>{String(ctx.payload.fullName ?? "")}</div>
                <div style={{ fontSize: px(t.base * 0.68), opacity: 0.75, letterSpacing: "0.14em", textTransform: "uppercase" }}>{String(ctx.payload.headline ?? "")}</div>
                <div style={{ height: 1, width: 40, background: i % 2 === 0 ? t.accent : "rgba(255,255,255,0.5)", margin: "4px 0" }} />
                <div style={{ fontSize: px(t.base * 0.64), opacity: 0.8, lineHeight: 1.5 }}>
                  {[ctx.payload.phone, ctx.payload.email].filter(Boolean).map((l) => (
                    <div key={String(l)}>{String(l)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "card-minimal-01",
    name: "Minimal Card",
    category: "minimal",
    description: "Typography-only card with plenty of white space and a single accent rule.",
    tags: ["typographic", "clean"],
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontSize: px(t.base * 0.72), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Business cards · 10-up on A4</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 254, height: 156, border: `1px dashed ${t.rule}`, borderRadius: 6, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink }}>{String(ctx.payload.fullName ?? "")}</div>
                <div style={{ fontSize: px(t.base * 0.7), color: t.muted, marginTop: 3 }}>{String(ctx.payload.headline ?? "")}</div>
                <div style={{ height: 2, width: 30, background: t.accent, margin: "12px 0" }} />
                <div style={{ fontSize: px(t.base * 0.66), color: t.muted, lineHeight: 1.6 }}>
                  {[ctx.payload.email, ctx.payload.phone, ctx.payload.website].filter(Boolean).map((l) => (
                    <div key={String(l)}>{String(l)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "card-creative-01",
    name: "Creative Card",
    category: "creative",
    description: "Geometric card with corner accents and a bold diagonal colour field.",
    tags: ["geometric", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontSize: px(t.base * 0.72), letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, fontWeight: 700 }}>Business cards · 10-up on A4</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 254, height: 156, border: `1px dashed ${t.rule}`, borderRadius: 6, overflow: "hidden", position: "relative", background: "#fff" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 130, height: 100, background: t.accent, clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                <div style={{ position: "absolute", top: 12, right: 12, color: "#fff", fontSize: px(t.base * 0.6), fontWeight: 700, letterSpacing: "0.1em" }}>
                  {String(ctx.payload.companyName ?? ctx.business?.name ?? "").slice(0, 12).toUpperCase()}
                </div>
                <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
                  <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1), fontWeight: 800, color: t.ink }}>{String(ctx.payload.fullName ?? "")}</div>
                  <div style={{ fontSize: px(t.base * 0.68), color: t.accent, fontWeight: 650, marginTop: 2 }}>{String(ctx.payload.headline ?? "")}</div>
                  <div style={{ fontSize: px(t.base * 0.64), color: t.muted, marginTop: 8, lineHeight: 1.5 }}>
                    {[ctx.payload.phone, ctx.payload.email].filter(Boolean).map((l) => (
                      <div key={String(l)}>{String(l)}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PaperShell>
      );
    },
  },
];
