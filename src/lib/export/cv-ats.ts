import type { DocumentRecord } from "@/lib/types";

/** Searchable, selectable A4 PDF for applicant tracking systems. */
export async function exportCvAtsPdf(doc: DocumentRecord, filename: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const p = doc.payload;
  const left = 20, width = 170, bottom = 275;
  let y = 22;
  const page = () => { pdf.addPage(); y = 22; };
  const line = (text: string, size = 10, bold = false, gap = 5) => {
    if (!text.trim()) return;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const wrapped = pdf.splitTextToSize(text, width) as string[];
    for (const row of wrapped) { if (y > bottom) page(); pdf.text(row, left, y); y += gap; }
  };
  const heading = (label: string) => { y += 4; if (y > bottom - 10) page(); line(label.toUpperCase(), 11, true, 6); };
  line(p.fullName || "Your Name", 20, true, 9);
  line(p.headline || "", 11, true, 6);
  line([p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean).join(" | "), 9, false, 4.5);
  const sections: Record<string, () => void> = {
    summary: () => { if (p.summary) { heading("Professional summary"); line(p.summary); } },
    experience: () => { if (p.experience?.length) { heading("Experience"); p.experience.forEach(e => { line(`${e.role} | ${e.company} | ${e.start || ""} - ${e.current ? "Present" : e.end || ""}`, 10, true); if (e.location) line(e.location); e.highlights?.forEach(h => line(`• ${h}`)); y += 2; }); } },
    education: () => { if (p.education?.length) { heading("Education"); p.education.forEach(e => line(`${e.qualification} | ${e.institution} | ${e.end}`, 10)); } },
    skills: () => { if (p.skills?.length) { heading("Skills"); line(p.skills.join(" | ")); } },
    projects: () => { if (p.projects?.length) { heading("Projects"); p.projects.forEach(e => line(`${e.name} | ${e.description}`)); } },
    certifications: () => { if (p.certifications?.length) { heading("Certifications & awards"); p.certifications.forEach(e => line(`${e.name}${e.role ? ` | ${e.role}` : ""}`)); } },
    languages: () => { if (p.languages?.length) { heading("Languages"); line(p.languages.join(" | ")); } },
    references: () => { if (p.referee) { heading("References"); line([p.referee, p.refereeTitle, p.refereeContact].filter(Boolean).join(" | ")); } },
  };
  const ids = [...Object.keys(sections), ...(p.cvSections ?? []).map(s => s.id)];
  [...new Set([...(p.cvSectionOrder ?? []), ...ids])].filter(id => ids.includes(id)).forEach(id => {
    if (sections[id]) sections[id]();
    else { const custom = p.cvSections?.find(s => s.id === id); if (custom?.content) { heading(custom.title); line(custom.content); } }
  });
  pdf.save(filename);
}
