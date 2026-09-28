"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import type { DocumentPayload } from "@/lib/types";

const defaults = ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "references"];
const labels: Record<string, string> = { summary: "Profile", experience: "Work experience", education: "Education", skills: "Skills", projects: "Projects", certifications: "Certifications & awards", languages: "Languages", references: "References" };

export function CvStudioPanel({ payload, onChange }: { payload: DocumentPayload; onChange: (patch: Partial<DocumentPayload>) => void }) {
  const [title, setTitle] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const sections = payload.cvSections ?? [];
  const ids = [...defaults, ...sections.map(s => s.id)];
  const order = [...new Set([...(payload.cvSectionOrder ?? []), ...ids])].filter(id => ids.includes(id));
  const move = (from: string, to: string) => {
    const next = order.filter(id => id !== from);
    next.splice(next.indexOf(to), 0, from);
    onChange({ cvSectionOrder: next });
  };
  const upload = (field: "cvPhotoDataUrl" | "cvSignatureDataUrl", file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.size > 500 * 1024) {
      toast.error("Choose a PNG, JPEG or WebP under 500 KB"); return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ [field]: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return <div className="space-y-5">
    <p className="text-sm text-fg-muted">Personalise your CV. Drag sections to reorder, or use the move buttons on touch screens. Section order and images are saved with this CV version. Section order appears in Studio templates and the ATS PDF.</p>
    <div className="grid gap-3 sm:grid-cols-2">{([ ["cvPhotoDataUrl", "Profile photo"], ["cvSignatureDataUrl", "Signature"] ] as const).map(([field, label]) => <div key={field} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}><label className="block text-sm font-semibold text-fg">{label}</label>{payload[field] && <img src={payload[field]} alt={label} className="my-2 h-16 w-16 rounded-lg object-contain" />}<input aria-label={`Upload ${label}`} type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-xs text-fg-muted" onChange={e => upload(field, e.target.files?.[0])} />{payload[field] && <button type="button" className="mt-2 text-xs text-red-600" onClick={() => onChange({ [field]: undefined })}>Remove {label.toLowerCase()}</button>}</div>)}</div>
    <div><h3 className="mb-2 text-sm font-semibold text-fg">Section order</h3><div className="space-y-2">{order.map((id, index) => <div key={id} draggable onDragStart={() => setDragged(id)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragged && dragged !== id) move(dragged, id); setDragged(null); }} onDragEnd={() => setDragged(null)} className="flex min-w-0 items-center gap-2 rounded-xl border p-2" style={{ borderColor: "var(--border)" }}><span className="cursor-grab text-fg-muted" aria-hidden>⋮⋮</span><span className="min-w-0 flex-1 truncate text-sm text-fg">{labels[id] ?? sections.find(s => s.id === id)?.title}</span><button aria-label={`Move ${labels[id] ?? id} up`} type="button" disabled={!index} onClick={() => move(id, order[index - 1])} className="btn btn-ghost btn-sm">↑</button><button aria-label={`Move ${labels[id] ?? id} down`} type="button" disabled={index === order.length - 1} onClick={() => move(id, order[index + 1])} className="btn btn-ghost btn-sm">↓</button></div>)}</div></div>
    <div><h3 className="mb-2 text-sm font-semibold text-fg">Custom sections</h3>{sections.map(s => <div key={s.id} className="mb-3 space-y-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}><Input aria-label="Section title" value={s.title} onChange={e => onChange({ cvSections: sections.map(item => item.id === s.id ? { ...item, title: e.target.value } : item) })} /><Textarea aria-label={`${s.title} content`} value={s.content} onChange={e => onChange({ cvSections: sections.map(item => item.id === s.id ? { ...item, content: e.target.value } : item) })} rows={4} /><button type="button" className="text-xs text-red-600" onClick={() => onChange({ cvSections: sections.filter(item => item.id !== s.id) })}>Remove section</button></div>)}<div className="flex gap-2"><Input aria-label="New section title" placeholder="Awards, publications, volunteering…" value={title} onChange={e => setTitle(e.target.value)} /><Button variant="outline" size="sm" onClick={() => { if (!title.trim()) return; onChange({ cvSections: [...sections, { id: `custom-${crypto.randomUUID()}`, title: title.trim(), content: "" }] }); setTitle(""); }}>Add</Button></div></div>
  </div>;
}
