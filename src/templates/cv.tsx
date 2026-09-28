import type { TemplateMeta, TemplateContext } from "@/lib/types";
import {
  Bullets, BusinessLogo, CornerTriangle, FooterBar, HeaderBand, Label, PaperShell, Prose, QrPanel, Row, SectionHeading,
  SignatureBlock, TagList, dt, px, tokens, type Tokens,
} from "./primitives";
import { withAlpha } from "@/lib/utils";

/* CV designs — 20 résumé layouts. Every one is recruiter-scannable, ATS-safe
   (real text, no text-as-image) and printable on a single A4 sheet. */

interface CvData {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  skills: string[];
  languages: string[];
  interests: string[];
  certifications: { id: string; name: string; role: string }[];
  experience: NonNullable<TemplateContext["payload"]["experience"]>;
  education: NonNullable<TemplateContext["payload"]["education"]>;
  projects: NonNullable<TemplateContext["payload"]["projects"]>;
  referee: string;
  refereeTitle: string;
  refereeContact: string;
}

const cvData = (ctx: TemplateContext): CvData => ({
  name: String(ctx.payload.fullName ?? "Your Name"),
  headline: String(ctx.payload.headline ?? ""),
  email: String(ctx.payload.email ?? ""),
  phone: String(ctx.payload.phone ?? ""),
  location: String(ctx.payload.location ?? ""),
  website: String(ctx.payload.website ?? ""),
  linkedin: String(ctx.payload.linkedin ?? ""),
  summary: String(ctx.payload.summary ?? ""),
  skills: (ctx.payload.skills as string[]) ?? [],
  languages: (ctx.payload.languages as string[]) ?? [],
  interests: (ctx.payload.interests as string[]) ?? [],
  certifications: (ctx.payload.certifications as { id: string; name: string; role: string }[]) ?? [],
  experience: ctx.payload.experience ?? [],
  education: ctx.payload.education ?? [],
  projects: ctx.payload.projects ?? [],
  referee: String(ctx.payload.referee ?? ""),
  refereeTitle: String(ctx.payload.refereeTitle ?? ""),
  refereeContact: String(ctx.payload.refereeContact ?? ""),
});

const contactLine = (d: CvData, sep = " · ") => [d.email, d.phone, d.location].filter(Boolean).join(sep);
const webLine = (d: CvData, sep = " · ") => [d.website, d.linkedin].filter(Boolean).join(sep);
const period = (start?: string, end?: string, current?: boolean) => [start, current ? "Present" : end].filter(Boolean).join(" – ");

/* ── Re-usable section renderers ─────────────────────────────────────────── */
function ExperienceList({ d, t, variant = "timeline", compact = false }: { d: CvData; t: Tokens; variant?: "timeline" | "compact" | "ruled" | "cards" | "stacked"; compact?: boolean }) {
  if (!d.experience.length) return null;
  if (variant === "compact")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {d.experience.map((job) => (
          <div key={job.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <span style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink }}>{job.role}</span>
              <span style={{ fontSize: px(t.base * 0.74), color: t.muted, whiteSpace: "nowrap" }}>{period(job.start, job.end, job.current)}</span>
            </div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.accent, fontWeight: 600 }}>
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </div>
            {job.highlights?.length ? (
              <div style={{ marginTop: 4 }}>
                <Bullets t={t} items={job.highlights} variant="dash" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  if (variant === "cards")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {d.experience.map((job) => (
          <div key={job.id} style={{ borderLeft: `3px solid ${t.accent}`, background: t.tint, borderRadius: "0 4px 4px 0", padding: "10px 14px" }}>
            <div style={{ fontSize: px(t.base * 0.88), fontWeight: 700, color: t.ink }}>{job.role}</div>
            <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 2 }}>
              {[job.company, job.location, period(job.start, job.end, job.current)].filter(Boolean).join(" · ")}
            </div>
            {job.highlights?.length ? (
              <div style={{ marginTop: 6 }}>
                <Bullets t={t} items={job.highlights} variant="dot" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  if (variant === "ruled")
    return (
      <div>
        {d.experience.map((job, i) => (
          <div key={job.id} style={{ paddingTop: i === 0 ? 0 : 10, paddingBottom: 10, borderBottom: i === d.experience.length - 1 ? "none" : `1px solid ${t.rule}` }}>
            <Row justify="space-between" align="baseline">
              <span style={{ fontSize: px(t.base * 0.88), fontWeight: 700, color: t.ink }}>{job.role}</span>
              <span style={{ fontSize: px(t.base * 0.74), color: t.muted }}>{period(job.start, job.end, job.current)}</span>
            </Row>
            <div style={{ fontSize: px(t.base * 0.78), color: t.accent, fontWeight: 600, marginTop: 2 }}>{job.company}</div>
            {job.highlights?.length ? (
              <div style={{ marginTop: 5 }}>
                <Bullets t={t} items={job.highlights} variant="dot" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  if (variant === "stacked")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {d.experience.map((job, i) => (
          <div key={job.id} style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 84, flexShrink: 0, fontSize: px(t.base * 0.72), color: t.muted, fontWeight: 600, paddingTop: 2 }}>{period(job.start, job.end, job.current)}</div>
            <div style={{ flex: 1, borderLeft: `2px solid ${i === 0 ? t.accent : t.rule}`, paddingLeft: 14 }}>
              <div style={{ fontSize: px(t.base * 0.88), fontWeight: 700, color: t.ink }}>{job.role}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.accent, fontWeight: 600, marginTop: 2 }}>{job.company}{job.location ? ` · ${job.location}` : ""}</div>
              {job.highlights?.length ? (
                <div style={{ marginTop: 5 }}>
                  <Bullets t={t} items={job.highlights} variant="dash" />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12 }}>
      {d.experience.map((job) => (
        <div key={job.id}>
          <div style={{ fontSize: px(t.base * 0.88), fontWeight: 700, color: t.ink }}>{job.role}</div>
          <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 1 }}>
            {[job.company, job.location].filter(Boolean).join(" · ")}
            {job.start || job.end ? ` — ${period(job.start, job.end, job.current)}` : ""}
          </div>
          {job.highlights?.length ? (
            <div style={{ marginTop: 5 }}>
              <Bullets t={t} items={job.highlights} variant="dot" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationList({ d, t, variant = "plain" }: { d: CvData; t: Tokens; variant?: "plain" | "ruled" | "compact" }) {
  if (!d.education.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: variant === "compact" ? 6 : 10 }}>
      {d.education.map((ed) => (
        <div key={ed.id} style={variant === "ruled" ? { borderBottom: `1px solid ${t.rule}`, paddingBottom: 8 } : undefined}>
          <div style={{ fontSize: px(t.base * 0.86), fontWeight: 700, color: t.ink }}>{ed.qualification}</div>
          <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 1 }}>
            {[ed.institution, ed.location, ed.end].filter(Boolean).join(" · ")}
            {ed.grade ? ` — ${ed.grade}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsList({ d, t, variant = "plain" }: { d: CvData; t: Tokens; variant?: "plain" | "cards" | "compact" }) {
  if (!d.projects.length) return null;
  if (variant === "cards")
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {d.projects.map((p) => (
          <div key={p.id} style={{ border: `1px solid ${t.rule}`, borderRadius: 4, padding: 11 }}>
            <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{p.name}</div>
            {p.role ? <div style={{ fontSize: px(t.base * 0.72), color: t.accent, marginTop: 2 }}>{p.role}</div> : null}
            <div style={{ fontSize: px(t.base * 0.75), color: t.muted, marginTop: 5, lineHeight: 1.5 }}>{p.description}</div>
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: variant === "compact" ? 6 : 9 }}>
      {d.projects.map((p) => (
        <div key={p.id}>
          <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>
            {p.name}
            {p.role ? <span style={{ fontWeight: 500, color: t.muted }}> — {p.role}</span> : null}
          </div>
          <div style={{ fontSize: px(t.base * 0.75), color: t.muted, marginTop: 2, lineHeight: 1.5 }}>{p.description}</div>
        </div>
      ))}
    </div>
  );
}

function Certifications({ d, t, variant = "list" }: { d: CvData; t: Tokens; variant?: "list" | "tags" | "ruled" }) {
  if (!d.certifications.length) return null;
  if (variant === "tags") return <TagList t={t} items={d.certifications.map((c) => c.role ? `${c.name} — ${c.role}` : c.name)} variant="outline" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {d.certifications.map((c) => (
        <div key={c.id} style={{ fontSize: px(t.base * 0.79), color: t.body }}>
          <strong style={{ color: t.ink }}>{c.name}</strong>
          {c.role ? <span style={{ color: t.muted }}> · {c.role}</span> : null}
        </div>
      ))}
    </div>
  );
}

function RefereeBlock({ d, t, variant = "box" }: { d: CvData; t: Tokens; variant?: "box" | "inline" }) {
  if (!d.referee) return null;
  if (variant === "inline")
    return (
      <Prose t={t} size={0.78} muted>
        {d.referee}
        {d.refereeTitle ? `, ${d.refereeTitle}` : ""}
        {d.refereeContact ? ` · ${d.refereeContact}` : ""}
      </Prose>
    );
  return (
    <div style={{ border: `1px solid ${t.rule}`, borderRadius: 4, padding: 12 }}>
      <div style={{ fontSize: px(t.base * 0.84), fontWeight: 700, color: t.ink }}>{d.referee}</div>
      <div style={{ fontSize: px(t.base * 0.75), color: t.muted, marginTop: 2 }}>{[d.refereeTitle, d.refereeContact].filter(Boolean).join(" · ")}</div>
    </div>
  );
}

/** Monogram disc when the candidate has no photo. */
const Monogram = ({ d, t, size = 68, bg, color }: { d: CvData; t: Tokens; size?: number; bg?: string; color?: string }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: bg ?? `linear-gradient(135deg, ${t.accent}, ${withAlpha(t.accent, 0.7)})`,
      color: color ?? "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: t.heading,
      fontWeight: 800,
      fontSize: size * 0.36,
      letterSpacing: "-0.02em",
      flexShrink: 0,
    }}
  >
    {d.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "CV"}
  </div>
);

type Design = Omit<TemplateMeta, "kind">;

export const cvTemplates: Design[] = [
  /* ── Corporate ─────────────────────────────────────────────────────────── */
  {
    id: "cv-corporate-01",
    name: "Executive Standard",
    category: "corporate",
    description: "Timeless reverse-chronological CV with ruled sections — the safest choice for corporate roles.",
    tags: ["classic", "ats", "safe"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.7), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.92), color: t.accent, fontWeight: 650, marginTop: 4 }}>{d.headline}</div>
            </div>
            <Monogram d={d} t={t} />
          </Row>
          <div style={{ marginTop: 12, fontSize: px(t.base * 0.78), color: t.muted }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
          <div style={{ height: 2, background: t.ink, marginTop: 14 }} />
          {d.summary ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule">Professional summary</SectionHeading>
              <Prose t={t} size={0.81}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="rule">Work experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="ruled" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="rule">Education</SectionHeading>
            <EducationList d={d} t={t} />
          </div>
          {d.skills.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule">Core skills</SectionHeading>
              <TagList t={t} items={d.skills} variant="outline" />
            </div>
          ) : null}
          {d.certifications.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule">Certifications</SectionHeading>
              <Certifications d={d} t={t} />
            </div>
          ) : null}
          {d.referee ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="rule">References</SectionHeading>
              <RefereeBlock d={d} t={t} variant="inline" />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-corporate-02",
    name: "Boardroom",
    category: "corporate",
    description: "Branded header band with a two-column capability grid for senior managers.",
    tags: ["band", "two-column"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="solid" height={112}>
            <Row justify="space-between" align="center">
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800, letterSpacing: "-0.02em" }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.92), opacity: 0.92, marginTop: 4 }}>{d.headline}</div>
                <div style={{ fontSize: px(t.base * 0.76), opacity: 0.85, marginTop: 8 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
              </div>
              <Monogram d={d} t={t} size={64} bg="rgba(255,255,255,0.2)" />
            </Row>
          </HeaderBand>
          {d.summary ? (
            <div style={{ marginTop: 20 }}>
              <Prose t={t} size={0.83}>{d.summary}</Prose>
            </div>
          ) : null}
          <Row gap={24} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1.5 }}>
              <SectionHeading t={t} variant="bar">Experience</SectionHeading>
              <ExperienceList d={d} t={t} variant="compact" />
              <div style={{ marginTop: 16 }}>
                <SectionHeading t={t} variant="bar">Education</SectionHeading>
                <EducationList d={d} t={t} variant="compact" />
              </div>
            </div>
            <div style={{ flex: 1, background: t.tint, borderRadius: 4, padding: 14 }}>
              {d.skills.length ? (
                <>
                  <Label t={t}>Core skills</Label>
                  <div style={{ marginTop: 8 }}>
                    <TagList t={t} items={d.skills} variant="outline" />
                  </div>
                </>
              ) : null}
              {d.languages.length ? (
                <div style={{ marginTop: 14 }}>
                  <Label t={t}>Languages</Label>
                  <div style={{ marginTop: 8 }}>
                    <TagList t={t} items={d.languages} variant="tinted" />
                  </div>
                </div>
              ) : null}
              {d.certifications.length ? (
                <div style={{ marginTop: 14 }}>
                  <Label t={t}>Certifications</Label>
                  <div style={{ marginTop: 8 }}>
                    <Certifications d={d} t={t} />
                  </div>
                </div>
              ) : null}
            </div>
          </Row>
          {d.projects.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Key projects</SectionHeading>
              <ProjectsList d={d} t={t} variant="compact" />
            </div>
          ) : null}
          {d.referee ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">References</SectionHeading>
              <RefereeBlock d={d} t={t} />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-corporate-03",
    name: "Civil Service",
    category: "corporate",
    description: "Formal, list-heavy structure with a personal particulars table for public-sector applications.",
    tags: ["formal", "public-sector"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", borderBottom: `2px solid ${t.ink}`, paddingBottom: 14 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink, letterSpacing: "0.04em" }}>{d.name.toUpperCase()}</div>
            <div style={{ fontSize: px(t.base * 0.86), color: t.accent, fontWeight: 650, marginTop: 3 }}>{d.headline}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 22px" }}>
              {[
                ["Email", d.email],
                ["Phone", d.phone],
                ["Location", d.location],
                ["Website", d.website],
                ["LinkedIn", d.linkedin],
                ["Nationality / permit", String(ctx.payload.nationality ?? "—")],
              ]
                .filter(([, v]) => v && v !== "—")
                .map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: px(t.base * 0.79), borderBottom: `1px solid ${t.rule}`, padding: "4px 0" }}>
                    <span style={{ color: t.muted }}>{k}</span>
                    <span style={{ color: t.ink, fontWeight: 600, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
            </div>
          </div>
          {d.summary ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="plain">Career summary</SectionHeading>
              <Prose t={t} size={0.8}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">Employment history</SectionHeading>
            <ExperienceList d={d} t={t} variant="ruled" />
          </div>
          <div style={{ marginTop: 16 }}>
            <SectionHeading t={t} variant="plain">Academic qualifications</SectionHeading>
            <EducationList d={d} t={t} variant="ruled" />
          </div>
          {d.certifications.length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">Professional training</SectionHeading>
              <Certifications d={d} t={t} variant="ruled" />
            </div>
          ) : null}
          {d.skills.length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">Competencies</SectionHeading>
              <Bullets t={t} items={d.skills} variant="dot" columns={2} />
            </div>
          ) : null}
          {d.referee ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="plain">Referees</SectionHeading>
              <RefereeBlock d={d} t={t} />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-corporate-04",
    name: "Consultant",
    category: "corporate",
    description: "Engagement-style CV that leads with impact metrics and client outcomes.",
    tags: ["consulting", "impact"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 800, color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.9), color: t.muted, marginTop: 3 }}>{d.headline}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.77), color: t.muted, lineHeight: 1.6 }}>
              {[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </Row>
          <div style={{ marginTop: 16, background: t.ink, color: "#fff", borderRadius: 4, padding: "12px 16px" }}>
            <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Value proposition</div>
            <div style={{ fontSize: px(t.base * 0.85), lineHeight: 1.6, marginTop: 6 }}>{d.summary}</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">Engagement experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="cards" />
          </div>
          {d.projects.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Selected projects</SectionHeading>
              <ProjectsList d={d} t={t} variant="cards" />
            </div>
          ) : null}
          <Row gap={22} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1.2 }}>
              <SectionHeading t={t} variant="bar">Education</SectionHeading>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Expertise</SectionHeading>
              <TagList t={t} items={d.skills} variant="tinted" />
            </div>
          </Row>
          {d.referee ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Reference</SectionHeading>
              <RefereeBlock d={d} t={t} />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-corporate-05",
    name: "Operations",
    category: "corporate",
    description: "Dense, information-rich format for operational and technical leadership roles.",
    tags: ["dense", "operations"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 44 }}>
          <Row justify="space-between" align="flex-end" style={{ borderBottom: `3px double ${t.ink}`, paddingBottom: 12 }}>
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.86), color: t.accent, fontWeight: 650, marginTop: 3 }}>{d.headline}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.75), color: t.muted, lineHeight: 1.55 }}>
              {[d.phone, d.email, d.location].filter(Boolean).map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </Row>
          <Row gap={26} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1.6 }}>
              {d.summary ? (
                <>
                  <SectionHeading t={t} variant="plain">Profile</SectionHeading>
                  <Prose t={t} size={0.79}>{d.summary}</Prose>
                </>
              ) : null}
              <div style={{ marginTop: 14 }}>
                <SectionHeading t={t} variant="plain">Professional experience</SectionHeading>
                <ExperienceList d={d} t={t} variant="compact" />
              </div>
              {d.education.length ? (
                <div style={{ marginTop: 14 }}>
                  <SectionHeading t={t} variant="plain">Education</SectionHeading>
                  <EducationList d={d} t={t} variant="compact" />
                </div>
              ) : null}
            </div>
            <div style={{ flex: 1 }}>
              {d.skills.length ? (
                <>
                  <SectionHeading t={t} variant="plain">Technical skills</SectionHeading>
                  <Bullets t={t} items={d.skills} variant="dash" />
                </>
              ) : null}
              {d.certifications.length ? (
                <div style={{ marginTop: 14 }}>
                  <SectionHeading t={t} variant="plain">Certifications</SectionHeading>
                  <Certifications d={d} t={t} />
                </div>
              ) : null}
              {d.languages.length ? (
                <div style={{ marginTop: 14 }}>
                  <SectionHeading t={t} variant="plain">Languages</SectionHeading>
                  <Bullets t={t} items={d.languages} variant="dot" />
                </div>
              ) : null}
              {d.referee ? (
                <div style={{ marginTop: 14 }}>
                  <SectionHeading t={t} variant="plain">Referee</SectionHeading>
                  <RefereeBlock d={d} t={t} />
                </div>
              ) : null}
            </div>
          </Row>
        </PaperShell>
      );
    },
  },

  /* ── Modern ────────────────────────────────────────────────────────────── */
  {
    id: "cv-modern-01",
    name: "Aurora CV",
    category: "modern",
    description: "Gradient accent header with skill pills and clean chronological body.",
    tags: ["gradient", "pills"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <HeaderBand t={t} variant="gradient" height={128}>
            <Row justify="space-between" align="center">
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.72), fontWeight: 800 }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.94), opacity: 0.94, marginTop: 4 }}>{d.headline}</div>
                <div style={{ fontSize: px(t.base * 0.78), opacity: 0.86, marginTop: 9 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
              </div>
              <Monogram d={d} t={t} size={66} bg="rgba(255,255,255,0.22)" />
            </Row>
          </HeaderBand>
          {d.summary ? (
            <div style={{ marginTop: 20 }}>
              <Prose t={t} size={0.83}>{d.summary}</Prose>
            </div>
          ) : null}
          {d.skills.length ? (
            <div style={{ marginTop: 16 }}>
              <Label t={t}>Skills</Label>
              <div style={{ marginTop: 8 }}>
                <TagList t={t} items={d.skills} variant="solid" />
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="stacked" />
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">Education</SectionHeading>
            <EducationList d={d} t={t} />
          </div>
          {d.projects.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Projects</SectionHeading>
              <ProjectsList d={d} t={t} variant="cards" />
            </div>
          ) : null}
          {d.certifications.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Certifications</SectionHeading>
              <Certifications d={d} t={t} variant="tags" />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-modern-02",
    name: "Left Rail",
    category: "modern",
    description: "Bold coloured sidebar for contact, skills and languages; uncluttered main column.",
    tags: ["sidebar", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell
          ctx={ctx}
          style={{ padding: 0 }}
          sidebarWidth={252}
          sidebar={
            <div style={{ background: t.accent, minHeight: 1123, padding: "38px 24px", color: "#fff", display: "flex", flexDirection: "column", gap: 20 }}>
              <Monogram d={d} t={t} size={78} bg="rgba(255,255,255,0.22)" />
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.38), fontWeight: 800, lineHeight: 1.2 }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.84), opacity: 0.9, marginTop: 4 }}>{d.headline}</div>
              </div>
              <div>
                <Label t={t} color="rgba(255,255,255,0.7)">Contact</Label>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5, fontSize: px(t.base * 0.78) }}>
                  {[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).map((l) => (
                    <span key={l} style={{ wordBreak: "break-word", opacity: 0.95 }}>{l}</span>
                  ))}
                </div>
              </div>
              {d.skills.length ? (
                <div>
                  <Label t={t} color="rgba(255,255,255,0.7)">Skills</Label>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5, fontSize: px(t.base * 0.79) }}>
                    {d.skills.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {d.languages.length ? (
                <div>
                  <Label t={t} color="rgba(255,255,255,0.7)">Languages</Label>
                  <div style={{ marginTop: 8, fontSize: px(t.base * 0.79), lineHeight: 1.7 }}>{d.languages.join(", ")}</div>
                </div>
              ) : null}
              {d.certifications.length ? (
                <div>
                  <Label t={t} color="rgba(255,255,255,0.7)">Certifications</Label>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, fontSize: px(t.base * 0.76) }}>
                    {d.certifications.map((c) => (
                      <span key={c.id}>
                        {c.name}
                        {c.role ? <span style={{ opacity: 0.8 }}> · {c.role}</span> : null}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {ctx.design.showQr ? (
                <div style={{ marginTop: "auto" }}>
                  <QrPanel ctx={ctx} t={t} size={86} caption="Portfolio" />
                </div>
              ) : null}
            </div>
          }
        >
          {d.summary ? (
            <>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.06), fontWeight: 800, color: t.ink }}>Profile</div>
              <div style={{ marginTop: 8 }}>
                <Prose t={t} size={0.83}>{d.summary}</Prose>
              </div>
            </>
          ) : null}
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="bar">Experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="compact" />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Education</SectionHeading>
            <EducationList d={d} t={t} />
          </div>
          {d.projects.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Projects</SectionHeading>
              <ProjectsList d={d} t={t} />
            </div>
          ) : null}
          {d.referee ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">References</SectionHeading>
              <RefereeBlock d={d} t={t} />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-modern-03",
    name: "Two Tone",
    category: "modern",
    description: "Split colour header (dark + accent) with the summary under the fold.",
    tags: ["split", "headline"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0 }}>
          <div style={{ display: "flex", minHeight: 196 }}>
            <div style={{ width: 300, background: t.ink, color: "#fff", padding: "34px 28px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <Monogram d={d} t={t} size={64} bg={t.accent} />
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, lineHeight: 1.15 }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.84), opacity: 0.86, marginTop: 4 }}>{d.headline}</div>
              </div>
            </div>
            <div style={{ flex: 1, background: t.tint, padding: "34px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
              <Label t={t}>Contact</Label>
              <div style={{ fontSize: px(t.base * 0.82), color: t.ink, lineHeight: 1.75 }}>
                {[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "26px 52px 52px" }}>
            {d.summary ? (
              <>
                <SectionHeading t={t} variant="tinted">Professional profile</SectionHeading>
                <Prose t={t} size={0.83}>{d.summary}</Prose>
              </>
            ) : null}
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="tinted">Experience</SectionHeading>
              <ExperienceList d={d} t={t} variant="ruled" />
            </div>
            <Row gap={26} style={{ marginTop: 20 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="tinted">Education</SectionHeading>
                <EducationList d={d} t={t} variant="compact" />
              </div>
              <div style={{ flex: 1 }}>
                <SectionHeading t={t} variant="tinted">Skills</SectionHeading>
                <TagList t={t} items={d.skills} variant="outline" />
              </div>
            </Row>
            {d.projects.length ? (
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="tinted">Projects</SectionHeading>
                <ProjectsList d={d} t={t} variant="cards" />
              </div>
            ) : null}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-modern-04",
    name: "Timeline",
    category: "modern",
    description: "Career timeline with connecting rail — shows progression at a glance.",
    tags: ["timeline", "progression"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.62), fontWeight: 800, color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.9), color: t.accent, fontWeight: 650, marginTop: 4 }}>{d.headline}</div>
              <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 8 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
            </div>
            <Monogram d={d} t={t} size={62} />
          </Row>
          {d.summary ? (
            <div style={{ marginTop: 18, background: t.tint, borderRadius: 4, padding: 14 }}>
              <Prose t={t} size={0.82}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Career timeline</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {d.experience.map((job, i) => (
                <div key={job.id} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 99, background: i === 0 ? t.accent : "#fff", border: `2.5px solid ${t.accent}`, marginTop: 4 }} />
                    {i < d.experience.length - 1 ? <div style={{ flex: 1, width: 2, background: t.soft, marginTop: 2, marginBottom: 2 }} /> : null}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 14 }}>
                    <div style={{ fontSize: px(t.base * 0.74), color: t.accent, fontWeight: 700 }}>{period(job.start, job.end, job.current)}</div>
                    <div style={{ fontSize: px(t.base * 0.9), fontWeight: 700, color: t.ink, marginTop: 2 }}>{job.role}</div>
                    <div style={{ fontSize: px(t.base * 0.79), color: t.muted }}>{[job.company, job.location].filter(Boolean).join(" · ")}</div>
                    {job.highlights?.length ? (
                      <div style={{ marginTop: 5 }}>
                        <Bullets t={t} items={job.highlights} variant="dot" />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Row gap={26} style={{ marginTop: 8 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Education</SectionHeading>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Skills</SectionHeading>
              <TagList t={t} items={d.skills} variant="tinted" />
            </div>
          </Row>
          {d.certifications.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Certifications</SectionHeading>
              <Certifications d={d} t={t} variant="tags" />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-modern-05",
    name: "Product",
    category: "modern",
    description: "Tech-focused CV with skill proficiency matrix and project grid.",
    tags: ["tech", "matrix"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const matrix = d.skills.slice(0, 8);
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.66), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.92), color: t.accent, fontWeight: 650, marginTop: 3 }}>{d.headline}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.76), color: t.muted, lineHeight: 1.6 }}>
              {[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </Row>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${t.accent}, ${withAlpha(t.accent, 0.2)})`, marginTop: 14 }} />
          {d.summary ? (
            <div style={{ marginTop: 16 }}>
              <Prose t={t} size={0.82}>{d.summary}</Prose>
            </div>
          ) : null}
          {matrix.length ? (
            <div style={{ marginTop: 16 }}>
              <SectionHeading t={t} variant="bar">Technical skills</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 24px" }}>
                {matrix.map((s, i) => (
                  <div key={s}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: px(t.base * 0.76), color: t.body }}>
                      <span style={{ fontWeight: 600 }}>{s}</span>
                      <span style={{ color: t.muted }}>{i % 3 === 0 ? "Expert" : i % 3 === 1 ? "Advanced" : "Proficient"}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: t.tint, marginTop: 4, overflow: "hidden" }}>
                      <div style={{ width: `${92 - i * 6}%`, height: "100%", background: t.accent, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="bar">Experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="compact" />
          </div>
          {d.projects.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Projects</SectionHeading>
              <ProjectsList d={d} t={t} variant="cards" />
            </div>
          ) : null}
          <Row gap={26} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Education</SectionHeading>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Certifications</SectionHeading>
              <Certifications d={d} t={t} />
            </div>
          </Row>
        </PaperShell>
      );
    },
  },

  /* ── Executive ─────────────────────────────────────────────────────────── */
  {
    id: "cv-executive-01",
    name: "Chairman",
    category: "executive",
    description: "Serif executive profile with a statement of intent and board-level gravitas.",
    tags: ["serif", "board"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const serif = "'Playfair Display'";
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: serif, fontSize: px(t.base * 1.7), color: t.ink, letterSpacing: "0.04em" }}>{d.name}</div>
            <div style={{ fontSize: px(t.base * 0.82), color: t.muted, marginTop: 6, letterSpacing: "0.18em", textTransform: "uppercase" }}>{d.headline}</div>
            <div style={{ fontSize: px(t.base * 0.78), color: t.muted, marginTop: 10 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
          </div>
          {d.summary ? (
            <div style={{ marginTop: 22, fontFamily: serif, fontSize: px(t.base * 0.95), lineHeight: 1.75, color: t.body, textAlign: "center" }}>{d.summary}</div>
          ) : null}
          <div style={{ marginTop: 24 }}>
            <SectionHeading t={t} variant="rule" align="center">Executive experience</SectionHeading>
            <div style={{ marginTop: 12 }}>
              <ExperienceList d={d} t={t} variant="ruled" />
            </div>
          </div>
          <Row gap={28} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="rule" align="center">Education</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <EducationList d={d} t={t} variant="compact" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="rule" align="center">Directorships &amp; skills</SectionHeading>
              <div style={{ marginTop: 10 }}>
                <Bullets t={t} items={d.skills} variant="dot" />
              </div>
            </div>
          </Row>
          {d.certifications.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="rule" align="center">Professional memberships</SectionHeading>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <Certifications d={d} t={t} variant="tags" />
              </div>
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-executive-02",
    name: "Heritage",
    category: "executive",
    description: "Monogram-led heritage layout with centred headings and refined spacing.",
    tags: ["monogram", "refined"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Monogram d={d} t={t} size={74} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.56), color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.84), color: t.accent, marginTop: 5, letterSpacing: "0.1em" }}>{d.headline}</div>
            </div>
            <div style={{ display: "flex", gap: 18, fontSize: px(t.base * 0.76), color: t.muted, flexWrap: "wrap", justifyContent: "center" }}>
              {[d.email, d.phone, d.location, d.website].filter(Boolean).map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
            <div style={{ height: 1, background: t.rule, width: "100%" }} />
          </div>
          {d.summary ? (
            <div style={{ marginTop: 20 }}>
              <Prose t={t} size={0.84}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="rule" align="center">Professional history</SectionHeading>
            <div style={{ marginTop: 12 }}>
              <ExperienceList d={d} t={t} variant="ruled" />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="rule" align="center">Education &amp; credentials</SectionHeading>
            <div style={{ marginTop: 12 }}>
              <EducationList d={d} t={t} variant="ruled" />
            </div>
          </div>
          <Row gap={28} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <Label t={t}>Core competencies</Label>
              <div style={{ marginTop: 8 }}>
                <TagList t={t} items={d.skills} variant="outline" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label t={t}>Languages</Label>
              <div style={{ marginTop: 8 }}>
                <Bullets t={t} items={d.languages} variant="dot" />
              </div>
            </div>
          </Row>
          {d.referee ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="rule" align="center">References</SectionHeading>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <RefereeBlock d={d} t={t} variant="inline" />
              </div>
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-executive-03",
    name: "Barrister CV",
    category: "executive",
    description: "Formal legal CV with numbered practice areas and matter lists.",
    tags: ["legal", "numbered"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderBottom: `3px double ${t.ink}`, paddingBottom: 12 }}>
            <Row justify="space-between" align="flex-end">
              <div>
                <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.5), color: t.ink }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 4 }}>{d.headline}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: px(t.base * 0.75), color: t.muted, lineHeight: 1.55 }}>
                {[d.email, d.phone, d.location].filter(Boolean).map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </Row>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>1. Summary of practice</div>
            <div style={{ marginTop: 6 }}>
              <Prose t={t} size={0.8}>{d.summary}</Prose>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>2. Professional experience</div>
            <div style={{ marginTop: 8 }}>
              <ExperienceList d={d} t={t} variant="ruled" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>3. Education &amp; call to the bar</div>
            <div style={{ marginTop: 8 }}>
              <EducationList d={d} t={t} variant="ruled" />
            </div>
          </div>
          {d.skills.length ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>4. Practice areas</div>
              <div style={{ marginTop: 8 }}>
                <Bullets t={t} items={d.skills} variant="numbered" columns={2} />
              </div>
            </div>
          ) : null}
          {d.certifications.length ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>5. Memberships</div>
              <div style={{ marginTop: 8 }}>
                <Certifications d={d} t={t} />
              </div>
            </div>
          ) : null}
          {d.referee ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: t.heading, fontWeight: 700, fontSize: px(t.base * 0.88), color: t.ink }}>6. Referees</div>
              <div style={{ marginTop: 8 }}>
                <RefereeBlock d={d} t={t} />
              </div>
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-executive-04",
    name: "Academic",
    category: "executive",
    description: "Long-form academic CV for researchers, lecturers and grant applicants.",
    tags: ["academic", "publications"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const publications = (ctx.payload.publications as string[]) ?? [];
      return (
        <PaperShell ctx={ctx}>
          <div style={{ textAlign: "center", borderBottom: `1px solid ${t.ink}`, paddingBottom: 14 }}>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.44), color: t.ink }}>{d.name}</div>
            <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 4 }}>{d.headline}</div>
            <div style={{ fontSize: px(t.base * 0.76), color: t.muted, marginTop: 8 }}>{[d.email, d.phone, d.location, d.website].filter(Boolean).join(" · ")}</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SectionHeading t={t} variant="plain">Research interests</SectionHeading>
            <Prose t={t} size={0.8}>{d.summary}</Prose>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">Academic appointments</SectionHeading>
            <ExperienceList d={d} t={t} variant="compact" />
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading t={t} variant="plain">Education</SectionHeading>
            <EducationList d={d} t={t} variant="ruled" />
          </div>
          {publications.length ? (
            <div style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="plain">Selected publications</SectionHeading>
              <Bullets t={t} items={publications} variant="numbered" />
            </div>
          ) : null}
          {d.projects.length ? (
            <div style={{ marginTop: 14 }}>
              <SectionHeading t={t} variant="plain">Grants &amp; projects</SectionHeading>
              <ProjectsList d={d} t={t} />
            </div>
          ) : null}
          <Row gap={26} style={{ marginTop: 14 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="plain">Teaching areas</SectionHeading>
              <TagList t={t} items={d.skills} variant="outline" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="plain">Memberships</SectionHeading>
              <Certifications d={d} t={t} />
            </div>
          </Row>
        </PaperShell>
      );
    },
  },

  /* ── Minimal ───────────────────────────────────────────────────────────── */
  {
    id: "cv-minimal-01",
    name: "Swiss CV",
    category: "minimal",
    description: "Typographic minimalism: one column, hairline rules, absolute clarity.",
    tags: ["typographic", "ats"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.6), fontWeight: 800, color: t.ink, letterSpacing: "-0.02em" }}>{d.name}</div>
          <div style={{ fontSize: px(t.base * 0.86), color: t.muted, marginTop: 5 }}>{d.headline}</div>
          <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 8 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
          <div style={{ height: 2, background: t.accent, marginTop: 18 }} />
          {d.summary ? (
            <div style={{ marginTop: 18 }}>
              <Label t={t}>Profile</Label>
              <div style={{ marginTop: 6 }}>
                <Prose t={t} size={0.81}>{d.summary}</Prose>
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <Label t={t}>Experience</Label>
            <div style={{ marginTop: 10 }}>
              <ExperienceList d={d} t={t} variant="ruled" />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Label t={t}>Education</Label>
            <div style={{ marginTop: 10 }}>
              <EducationList d={d} t={t} variant="ruled" />
            </div>
          </div>
          {d.skills.length ? (
            <div style={{ marginTop: 20 }}>
              <Label t={t}>Skills</Label>
              <div style={{ marginTop: 8 }}>
                <Bullets t={t} items={d.skills} variant="dot" columns={2} />
              </div>
            </div>
          ) : null}
          {d.certifications.length ? (
            <div style={{ marginTop: 20 }}>
              <Label t={t}>Certifications</Label>
              <div style={{ marginTop: 8 }}>
                <Certifications d={d} t={t} />
              </div>
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-minimal-02",
    name: "Fjord CV",
    category: "minimal",
    description: "Airy Nordic résumé with wide leading and restraint in every element.",
    tags: ["airy", "nordic"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 62 }}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.48), fontWeight: 700, color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.84), color: t.muted, marginTop: 5 }}>{d.headline}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: t.accent, marginTop: 8 }} />
          </Row>
          <div style={{ marginTop: 26, fontSize: px(t.base * 0.78), color: t.muted, lineHeight: 1.7 }}>
            {[contactLine(d, "\n"), webLine(d, "\n")].filter(Boolean).join("\n").split("\n").map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          {d.summary ? (
            <div style={{ marginTop: 28 }}>
              <Prose t={t} size={0.84}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 28 }}>
            <Label t={t}>Experience</Label>
            <div style={{ marginTop: 12 }}>
              <ExperienceList d={d} t={t} variant="compact" />
            </div>
          </div>
          <div style={{ marginTop: 26 }}>
            <Label t={t}>Education</Label>
            <div style={{ marginTop: 12 }}>
              <EducationList d={d} t={t} variant="compact" />
            </div>
          </div>
          <Row gap={30} style={{ marginTop: 26 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <Label t={t}>Skills</Label>
              <div style={{ marginTop: 10 }}>
                <Bullets t={t} items={d.skills} variant="dash" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label t={t}>Languages</Label>
              <div style={{ marginTop: 10 }}>
                <Bullets t={t} items={d.languages} variant="dash" />
              </div>
            </div>
          </Row>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-minimal-03",
    name: "Grid CV",
    category: "minimal",
    description: "Strict two-column grid with labelled rails — scans like a data sheet.",
    tags: ["grid", "labelled"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const row = (label: string, content: React.ReactNode, last = false) => (
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 22, paddingBottom: 16, marginBottom: 16, borderBottom: last ? "none" : `1px solid ${t.rule}` }}>
          <div>
            <Label t={t}>{label}</Label>
          </div>
          <div>{content}</div>
        </div>
      );
      return (
        <PaperShell ctx={ctx}>
          <div style={{ borderTop: `2px solid ${t.ink}`, paddingTop: 18, marginBottom: 18 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.44), fontWeight: 800, color: t.ink }}>{d.name}</div>
            <div style={{ fontSize: px(t.base * 0.86), color: t.accent, fontWeight: 600, marginTop: 4 }}>{d.headline}</div>
          </div>
          {row("Contact", (
            <div style={{ fontSize: px(t.base * 0.79), color: t.body, lineHeight: 1.7 }}>
              {[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          ))}
          {d.summary ? row("Profile", <Prose t={t} size={0.8}>{d.summary}</Prose>) : null}
          {row("Experience", <ExperienceList d={d} t={t} variant="compact" />)}
          {row("Education", <EducationList d={d} t={t} variant="compact" />)}
          {d.skills.length ? row("Skills", <Bullets t={t} items={d.skills} variant="dot" columns={2} />) : null}
          {d.certifications.length ? row("Credentials", <Certifications d={d} t={t} />) : null}
          {d.projects.length ? row("Projects", <ProjectsList d={d} t={t} variant="compact" />, !d.referee) : null}
          {d.referee ? row("References", <RefereeBlock d={d} t={t} variant="inline" />, true) : null}
        </PaperShell>
      );
    },
  },
  {
    id: "cv-minimal-04",
    name: "Note CV",
    category: "minimal",
    description: "Letter-style CV for speculative applications and career changers.",
    tags: ["letter", "career-change"],
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{d.name}</div>
          <div style={{ fontSize: px(t.base * 0.8), color: t.muted, marginTop: 3 }}>{[d.email, d.phone, d.location].filter(Boolean).join(" · ")}</div>
          <div style={{ height: 1, background: t.rule, marginTop: 16 }} />
          <div style={{ marginTop: 20, fontSize: px(t.base * 0.9), fontWeight: 650, color: t.ink }}>{d.headline}</div>
          {d.summary ? (
            <div style={{ marginTop: 12 }}>
              <Prose t={t} size={0.84}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 22 }}>
            <SectionHeading t={t} variant="bar">What I bring</SectionHeading>
            <Bullets t={t} items={d.skills} variant="check" />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Where I have worked</SectionHeading>
            <ExperienceList d={d} t={t} variant="compact" />
          </div>
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Education</SectionHeading>
            <EducationList d={d} t={t} variant="compact" />
          </div>
          {d.interests.length ? (
            <div style={{ marginTop: 20 }}>
              <SectionHeading t={t} variant="bar">Interests</SectionHeading>
              <TagList t={t} items={d.interests} variant="outline" />
            </div>
          ) : null}
          <div style={{ marginTop: 24 }}>
            <SignatureBlock ctx={ctx} t={t} variant="handwritten" label="Yours sincerely" />
          </div>
          <FooterBar ctx={ctx} t={t} variant="plain" note="References available on request" />
        </PaperShell>
      );
    },
  },

  /* ── Creative ──────────────────────────────────────────────────────────── */
  {
    id: "cv-creative-01",
    name: "Mosaic CV",
    category: "creative",
    description: "Colour-block mosaic header with skill chips — makes a strong first impression.",
    tags: ["tiles", "colour"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx}>
          <Row gap={10} align="stretch">
            <div style={{ flex: 2.2, background: `linear-gradient(135deg, ${t.accent}, ${withAlpha(t.accent, 0.72)})`, borderRadius: 6, padding: 20, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800, lineHeight: 1.15 }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.86), opacity: 0.94 }}>{d.headline}</div>
              <div style={{ fontSize: px(t.base * 0.75), opacity: 0.86, marginTop: 4 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
            </div>
            <div style={{ flex: 1, background: t.ink, borderRadius: 6, padding: 16, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10 }}>
              <Monogram d={d} t={t} size={58} bg="rgba(255,255,255,0.16)" />
              <div style={{ fontSize: px(t.base * 0.68), letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Open to work</div>
            </div>
          </Row>
          {d.summary ? (
            <div style={{ marginTop: 18 }}>
              <Prose t={t} size={0.83}>{d.summary}</Prose>
            </div>
          ) : null}
          {d.skills.length ? (
            <div style={{ marginTop: 16 }}>
              <TagList t={t} items={d.skills} variant="tinted" />
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="tinted">Experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="cards" />
          </div>
          <Row gap={22} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="tinted">Education</SectionHeading>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="tinted">Projects</SectionHeading>
              <ProjectsList d={d} t={t} variant="compact" />
            </div>
          </Row>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-creative-02",
    name: "Portfolio",
    category: "creative",
    description: "Design-led CV with bold headline typography and project showcase grid.",
    tags: ["design", "portfolio"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -90, right: -70, width: 240, height: 240, borderRadius: 999, background: t.tint }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: px(t.base * 0.7), letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>{d.headline}</div>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 2.3), fontWeight: 800, color: t.ink, lineHeight: 1.02, marginTop: 10, letterSpacing: "-0.03em" }}>{d.name}</div>
            <div style={{ marginTop: 14, fontSize: px(t.base * 0.79), color: t.muted }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
            <div style={{ marginTop: 22, maxWidth: 560 }}>
              <Prose t={t} size={0.86}>{d.summary}</Prose>
            </div>
            <div style={{ marginTop: 22 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 800, color: t.ink }}>Selected work</div>
              <div style={{ marginTop: 12 }}>
                <ProjectsList d={d} t={t} variant="cards" />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 800, color: t.ink }}>Experience</div>
              <div style={{ marginTop: 12 }}>
                <ExperienceList d={d} t={t} variant="compact" />
              </div>
            </div>
            <Row gap={26} style={{ marginTop: 20 }} align="flex-start">
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 800, color: t.ink }}>Skills</div>
                <div style={{ marginTop: 10 }}>
                  <TagList t={t} items={d.skills} variant="solid" />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.02), fontWeight: 800, color: t.ink }}>Education</div>
                <div style={{ marginTop: 10 }}>
                  <EducationList d={d} t={t} variant="compact" />
                </div>
              </div>
            </Row>
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-creative-03",
    name: "Bold Rail",
    category: "creative",
    description: "Oversized vertical name rail with content flowing in the right column.",
    tags: ["vertical", "bold"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ padding: 0 }}>
          <Row gap={0} align="stretch">
            <div style={{ width: 96, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 1123 }}>
              <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", color: "#fff", fontFamily: t.heading, fontSize: px(t.base * 1.4), fontWeight: 800, letterSpacing: "0.16em" }}>
                {d.name.toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, padding: 44 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.34), fontWeight: 800, color: t.ink }}>{d.headline}</div>
              <div style={{ marginTop: 10, fontSize: px(t.base * 0.78), color: t.muted }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
              <div style={{ height: 3, width: 60, background: t.accent, marginTop: 16, borderRadius: 99 }} />
              {d.summary ? (
                <div style={{ marginTop: 18 }}>
                  <Prose t={t} size={0.83}>{d.summary}</Prose>
                </div>
              ) : null}
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="bar">Experience</SectionHeading>
                <ExperienceList d={d} t={t} variant="stacked" />
              </div>
              <div style={{ marginTop: 20 }}>
                <SectionHeading t={t} variant="bar">Education</SectionHeading>
                <EducationList d={d} t={t} />
              </div>
              {d.skills.length ? (
                <div style={{ marginTop: 20 }}>
                  <SectionHeading t={t} variant="bar">Skills</SectionHeading>
                  <TagList t={t} items={d.skills} variant="tinted" />
                </div>
              ) : null}
              {d.certifications.length ? (
                <div style={{ marginTop: 20 }}>
                  <SectionHeading t={t} variant="bar">Certifications</SectionHeading>
                  <Certifications d={d} t={t} />
                </div>
              ) : null}
            </div>
          </Row>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-creative-04",
    name: "Geometric",
    category: "creative",
    description: "Geometric accents inspired by the Seedwel mark, with numbered sections.",
    tags: ["geometric", "brand"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      return (
        <PaperShell ctx={ctx} style={{ overflow: "hidden" }}>
          <CornerTriangle t={t} size={110} corner="top-right" />
          <div style={{ width: 0, height: 0, borderTop: "110px solid transparent", borderRight: `110px solid ${t.soft}`, position: "absolute", top: 0, right: 0 }} />
          <div style={{ position: "relative" }}>
            <Row justify="space-between" align="flex-start">
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.56), fontWeight: 800, color: t.ink }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.88), color: t.accent, fontWeight: 650, marginTop: 4 }}>{d.headline}</div>
                <div style={{ fontSize: px(t.base * 0.77), color: t.muted, marginTop: 8 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
              </div>
              <div style={{ marginRight: 62 }}>
                <Monogram d={d} t={t} size={58} />
              </div>
            </Row>
            {d.summary ? (
              <div style={{ marginTop: 22, background: t.tint, borderRadius: 5, padding: 14 }}>
                <Prose t={t} size={0.83}>{d.summary}</Prose>
              </div>
            ) : null}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.72), fontWeight: 800 }}>1</div>
                <span style={{ fontFamily: t.heading, fontWeight: 800, color: t.ink, fontSize: px(t.base * 0.94) }}>Experience</span>
              </div>
              <ExperienceList d={d} t={t} variant="compact" />
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.72), fontWeight: 800 }}>2</div>
                <span style={{ fontFamily: t.heading, fontWeight: 800, color: t.ink, fontSize: px(t.base * 0.94) }}>Education</span>
              </div>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.72), fontWeight: 800 }}>3</div>
                <span style={{ fontFamily: t.heading, fontWeight: 800, color: t.ink, fontSize: px(t.base * 0.94) }}>Skills &amp; languages</span>
              </div>
              <Row gap={20} align="flex-start">
                <div style={{ flex: 1.4 }}>
                  <TagList t={t} items={d.skills} variant="outline" />
                </div>
                <div style={{ flex: 1 }}>
                  <Bullets t={t} items={d.languages} variant="dot" />
                </div>
              </Row>
            </div>
            {d.projects.length ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(t.base * 0.72), fontWeight: 800 }}>4</div>
                  <span style={{ fontFamily: t.heading, fontWeight: 800, color: t.ink, fontSize: px(t.base * 0.94) }}>Projects</span>
                </div>
                <ProjectsList d={d} t={t} variant="cards" />
              </div>
            ) : null}
          </div>
        </PaperShell>
      );
    },
  },
  {
    id: "cv-creative-05",
    name: "Marigold CV",
    category: "creative",
    description: "Warm golden accents with a quiet, refined creative presentation.",
    tags: ["gold", "warm"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const gold = "#b8860b";
      return (
        <PaperShell ctx={ctx}>
          <Row justify="space-between" align="flex-start">
            <div>
              <div style={{ fontFamily: "'Playfair Display'", fontSize: px(t.base * 1.7), color: t.ink }}>{d.name}</div>
              <div style={{ fontSize: px(t.base * 0.86), color: gold, fontWeight: 650, marginTop: 5, letterSpacing: "0.06em" }}>{d.headline}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: px(t.base * 0.77), color: t.muted, lineHeight: 1.7 }}>
              {[d.email, d.phone, d.location, d.website].filter(Boolean).map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </Row>
          <div style={{ height: 1, background: gold, marginTop: 14, opacity: 0.5 }} />
          {d.summary ? (
            <div style={{ marginTop: 18, fontFamily: "'Playfair Display'", fontSize: px(t.base * 0.92), lineHeight: 1.72, color: t.body }}>{d.summary}</div>
          ) : null}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.72), letterSpacing: "0.2em", textTransform: "uppercase", color: gold, fontWeight: 700, marginBottom: 10 }}>Experience</div>
            <ExperienceList d={d} t={t} variant="ruled" />
          </div>
          <Row gap={28} style={{ marginTop: 20 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.72), letterSpacing: "0.2em", textTransform: "uppercase", color: gold, fontWeight: 700, marginBottom: 10 }}>Education</div>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.72), letterSpacing: "0.2em", textTransform: "uppercase", color: gold, fontWeight: 700, marginBottom: 10 }}>Skills</div>
              <Bullets t={t} items={d.skills} variant="dot" />
            </div>
          </Row>
          {d.certifications.length ? (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: t.heading, fontSize: px(t.base * 0.72), letterSpacing: "0.2em", textTransform: "uppercase", color: gold, fontWeight: 700, marginBottom: 10 }}>Certifications</div>
              <Certifications d={d} t={t} />
            </div>
          ) : null}
          <FooterBar ctx={ctx} t={t} variant="centered" note={ctx.business?.name ? `Portfolio by ${ctx.business.name}` : "References available on request"} />
        </PaperShell>
      );
    },
  },
  {
    id: "cv-creative-06",
    name: "Signal CV",
    category: "creative",
    description: "Metric-forward CV that opens with measurable impact and industry focus.",
    tags: ["metrics", "impact"],
    premium: true,
    render: (ctx) => {
      const t = tokens(ctx);
      const d = cvData(ctx);
      const metrics = (ctx.payload.metrics as { id: string; label: string; value: string }[]) ?? [];
      return (
        <PaperShell ctx={ctx}>
          <div style={{ background: `linear-gradient(120deg, ${t.accent}, ${t.ink})`, borderRadius: 6, padding: "22px 24px", color: "#fff" }}>
            <Row justify="space-between" align="center">
              <div>
                <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.5), fontWeight: 800 }}>{d.name}</div>
                <div style={{ fontSize: px(t.base * 0.88), opacity: 0.92, marginTop: 4 }}>{d.headline}</div>
                <div style={{ fontSize: px(t.base * 0.75), opacity: 0.82, marginTop: 8 }}>{[contactLine(d), webLine(d)].filter(Boolean).join(" · ")}</div>
              </div>
              <Monogram d={d} t={t} size={60} bg="rgba(255,255,255,0.2)" />
            </Row>
          </div>
          {metrics.length ? (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, minmax(0,1fr))`, gap: 12, marginTop: 18 }}>
              {metrics.slice(0, 4).map((m) => (
                <div key={m.id} style={{ borderTop: `3px solid ${t.accent}`, paddingTop: 9 }}>
                  <div style={{ fontFamily: t.heading, fontSize: px(t.base * 1.26), fontWeight: 800, color: t.ink }}>{m.value}</div>
                  <div style={{ fontSize: px(t.base * 0.72), color: t.muted, marginTop: 3, lineHeight: 1.4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          ) : null}
          {d.summary ? (
            <div style={{ marginTop: 18 }}>
              <Prose t={t} size={0.83}>{d.summary}</Prose>
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <SectionHeading t={t} variant="bar">Experience</SectionHeading>
            <ExperienceList d={d} t={t} variant="stacked" />
          </div>
          <Row gap={24} style={{ marginTop: 18 }} align="flex-start">
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Education</SectionHeading>
              <EducationList d={d} t={t} variant="compact" />
            </div>
            <div style={{ flex: 1 }}>
              <SectionHeading t={t} variant="bar">Skills</SectionHeading>
              <TagList t={t} items={d.skills} variant="tinted" />
            </div>
          </Row>
          {d.languages.length ? (
            <div style={{ marginTop: 18 }}>
              <SectionHeading t={t} variant="bar">Languages</SectionHeading>
              <TagList t={t} items={d.languages} variant="outline" />
            </div>
          ) : null}
        </PaperShell>
      );
    },
  },
];
