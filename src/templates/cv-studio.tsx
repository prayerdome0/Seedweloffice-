import type { TemplateMeta, TemplateContext, TemplateCategory } from "@/lib/types";
import { PaperShell, tokens } from "./primitives";

// Six deliberately distinct typographic systems in six professional categories.
// Single-column, real-text layouts keep the reading order predictable for ATS.
const families = [
  { label: "Ledger", align: "left", border: "double", title: "uppercase", rhythm: 12 },
  { label: "Editorial", align: "center", border: "bottom", title: "normal", rhythm: 17 },
  { label: "Timeline", align: "left", border: "left", title: "uppercase", rhythm: 15 },
  { label: "Columnist", align: "right", border: "top", title: "normal", rhythm: 13 },
  { label: "Archive", align: "left", border: "dashed", title: "uppercase", rhythm: 19 },
  { label: "Signature", align: "center", border: "none", title: "normal", rhythm: 16 },
] as const;
const categories: TemplateCategory[] = ["corporate", "modern", "executive", "minimal", "creative", "academic"];
const headings: Record<string, string> = { summary: "Profile", experience: "Professional experience", education: "Education", skills: "Core skills", projects: "Selected projects", certifications: "Certifications & awards", languages: "Languages", references: "References" };
const standardOrder = ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "references"];

function StudioCv({ ctx, family, category }: { ctx: TemplateContext; family: typeof families[number]; category: TemplateCategory }) {
  const t = tokens(ctx);
  const d = ctx.payload;
  const custom = d.cvSections ?? [];
  const valid = [...standardOrder, ...custom.map(s => s.id)];
  const order = [...new Set([...(d.cvSectionOrder ?? []), ...valid])].filter(id => valid.includes(id));
  const border = family.border === "double" ? `3px double ${t.accent}` : family.border === "dashed" ? `1px dashed ${t.accent}` : `2px solid ${t.accent}`;
  const section = (id: string) => {
    switch (id) {
      case "summary": return d.summary;
      case "skills": return d.skills?.join("  ·  ");
      case "languages": return d.languages?.join("  ·  ");
      case "references": return [d.referee, d.refereeTitle, d.refereeContact].filter(Boolean).join(" · ");
      case "experience": return d.experience?.map(item => <div key={item.id} style={{ marginBottom: 10 }}><strong>{item.role}</strong> · {item.company} <span style={{ color: t.muted }}>({item.start} – {item.current ? "Present" : item.end})</span>{item.location && <div>{item.location}</div>}{item.highlights?.length ? <ul style={{ paddingLeft: 18, margin: "3px 0" }}>{item.highlights.map((line, i) => <li key={i}>{line}</li>)}</ul> : null}</div>);
      case "education": return d.education?.map(item => <div key={item.id} style={{ marginBottom: 8 }}><strong>{item.qualification}</strong> · {item.institution} <span style={{ color: t.muted }}>{item.end}</span></div>);
      case "projects": return d.projects?.map(item => <div key={item.id} style={{ marginBottom: 8 }}><strong>{item.name}</strong> · {item.description}</div>);
      case "certifications": return d.certifications?.map(item => <div key={item.id} style={{ marginBottom: 6 }}><strong>{item.name}</strong> · {item.role}</div>);
      default: return custom.find(item => item.id === id)?.content;
    }
  };
  return <PaperShell ctx={ctx}>
    <header style={{ textAlign: family.align, borderBottom: family.border === "bottom" || family.border === "double" ? border : undefined, borderTop: family.border === "top" ? border : undefined, borderLeft: family.border === "left" ? border : undefined, padding: family.border === "left" ? "4px 0 12px 18px" : "10px 0 18px" }}>
      {d.cvPhotoDataUrl && <img src={d.cvPhotoDataUrl} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: category === "creative" ? 8 : "50%", marginBottom: 8 }} />}
      <div style={{ fontFamily: t.heading, fontSize: category === "executive" ? 34 : 29, fontWeight: 750, letterSpacing: family.title === "uppercase" ? "0.06em" : "-0.03em", textTransform: family.title, color: t.ink }}>{d.fullName || "Your Name"}</div>
      <div style={{ fontSize: 13, color: t.accent, fontWeight: 700, marginTop: 5 }}>{d.headline}</div>
      <div style={{ fontSize: 10.5, color: t.muted, marginTop: 9, overflowWrap: "anywhere" }}>{[d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean).join("  ·  ")}</div>
    </header>
    <div style={{ marginTop: 8 }}>
      {order.map(id => { const content = section(id); if (!content || (Array.isArray(content) && !content.length)) return null;
        return <section key={id} style={{ marginTop: family.rhythm, breakInside: "avoid" }}><h2 style={{ fontFamily: t.heading, fontSize: 12, letterSpacing: family.title === "uppercase" ? "0.12em" : "0.02em", textTransform: family.title, color: category === "minimal" ? t.ink : t.accent, borderBottom: family.border === "none" ? undefined : `1px solid ${t.rule}`, paddingBottom: 5, margin: "0 0 8px" }}>{headings[id] ?? custom.find(s => s.id === id)?.title}</h2><div style={{ fontSize: 11.5, lineHeight: 1.55, color: t.body, whiteSpace: typeof content === "string" ? "pre-wrap" : undefined, overflowWrap: "anywhere" }}>{content}</div></section>;
      })}
    </div>
    {d.cvSignatureDataUrl && <div style={{ marginTop: 26 }}><img src={d.cvSignatureDataUrl} alt="Signature" style={{ maxWidth: 140, maxHeight: 55, objectFit: "contain" }} /><div style={{ fontSize: 10, color: t.muted }}>Signature</div></div>}
  </PaperShell>;
}

export const cvStudioTemplates: Omit<TemplateMeta, "kind">[] = categories.flatMap(category => families.map((family, index) => ({
  id: `cv-${category}-studio-${index + 1}`,
  name: `${category[0].toUpperCase()}${category.slice(1)} ${family.label}`,
  category,
  description: `${family.label} typography with a clean, single-column ATS reading order for ${category} applications.`,
  tags: ["ats", "a4", category, "studio"],
  premium: true,
  render: (ctx: TemplateContext) => <StudioCv ctx={ctx} family={family} category={category} />,
})));
