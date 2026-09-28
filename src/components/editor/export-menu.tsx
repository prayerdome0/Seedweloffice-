"use client";

import { useState } from "react";
import { CalendarPlus, Download, FileCode2, FileDown, FileText, Loader2, Printer, Share2 } from "lucide-react";
import { Button, Dropdown, MenuItem, MenuLabel } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { exportElementToPdf } from "@/lib/export/pdf";
import { icsForDocument } from "@/lib/export/share";
import { downloadBlob, downloadText, slugify } from "@/lib/utils";
import { docKindMeta } from "@/lib/constants";
import { APP_NAME } from "@/lib/config";
import type { BusinessProfile, DocumentRecord } from "@/lib/types";

/** Export menu: PDF, Word, plain text, print, calendar and data. */
export function ExportMenu({ doc, business, onShare }: { doc: DocumentRecord; business: BusinessProfile | null; onShare: () => void }) {
  const recordActivity = useWorkspace((s) => s.recordActivity);
  const attachmentShare = useWorkspace((s) => s.attachShareLink);
  const [busy, setBusy] = useState<string | null>(null);

  const filename = `${docKindMeta(doc.kind).label.replace(/\s+/g, "-").toLowerCase()}-${slugify(doc.number)}`;

  const withPaper = async (label: string, run: (element: HTMLElement) => Promise<void>) => {
    const element = document.querySelector<HTMLElement>(".editor-stage .paper, .print-root .paper, .paper");
    if (!element) {
      toast.error("Nothing to export yet", "Open the preview and try again.");
      return;
    }
    setBusy(label);
    try {
      await run(element);
      recordActivity("document.exported", doc.id, doc.number, `Exported ${doc.number} as ${label.toUpperCase()}`);
      toast.success(`${label} ready`, "Check your downloads folder.");
    } catch (error) {
      console.error(error);
      toast.error(`The ${label} export failed`, "Please try again — your document is unchanged.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dropdown
      width={248}
      trigger={({ toggle }) => (
        <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={toggle}>
          Export
        </Button>
      )}
    >
      {(close) => (
        <div>
          <MenuLabel>Share</MenuLabel>
          <MenuItem
            icon={<Share2 size={15} />}
            onClick={() => {
              close();
              onShare();
            }}
          >
            Share & send
          </MenuItem>
          <div className="divider my-1.5" />
          <MenuLabel>Download</MenuLabel>
          <MenuItem
            icon={busy === "PDF" ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
            disabled={busy === "PDF"}
            onClick={async () => {
              close();
              await withPaper("pdf", (element) =>
                exportElementToPdf(element, {
                  filename: `${filename}.pdf`,
                  title: `${doc.title} — ${doc.number}`,
                  footer: `${business?.name ?? APP_NAME} · ${doc.number}`,
                }),
              );
            }}
          >
            PDF (print quality)
          </MenuItem>
          {doc.kind === "cv" && <MenuItem icon={<FileDown size={15} />} disabled={!!busy} onClick={async () => {
            close(); setBusy("ATS PDF");
            try {
              const { exportCvAtsPdf } = await import("@/lib/export/cv-ats");
              await exportCvAtsPdf(doc, `${filename}-ats.pdf`);
              recordActivity("document.exported", doc.id, doc.number, `Exported ${doc.number} as searchable ATS PDF`);
              toast.success("ATS PDF ready", "Text is selectable and searchable.");
            } catch (error) { console.error(error); toast.error("ATS PDF export failed"); }
            finally { setBusy(null); }
          }}>ATS PDF (searchable text)</MenuItem>}
          <MenuItem
            icon={busy === "Word" ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            disabled={busy === "Word"}
            onClick={async () => {
              close();
              setBusy("Word");
              try {
                // Loaded on demand: the Word generator is large and most
                // documents are shared as PDF or print.
                const { buildDocumentDocx } = await import("@/lib/export/docx");
                const blob = await buildDocumentDocx(doc, business);
                downloadBlob(blob, `${filename}.docx`);
                recordActivity("document.exported", doc.id, doc.number, `Exported ${doc.number} as Word`);
                toast.success("Word document ready", "You can now red-line or edit it in Word, Pages or Google Docs.");
              } catch (error) {
                console.error(error);
                toast.error("The Word export failed", "Please try again.");
              } finally {
                setBusy(null);
              }
            }}
          >
            Word (.docx)
          </MenuItem>
          <MenuItem
            icon={<FileCode2 size={15} />}
            onClick={async () => {
              close();
              const { plainTextExport } = await import("@/lib/export/docx");
              downloadText(plainTextExport(doc, business), `${filename}.txt`);
              recordActivity("document.exported", doc.id, doc.number, `Exported ${doc.number} as plain text`);
            }}
          >
            Plain text
          </MenuItem>
          <MenuItem
            icon={<FileCode2 size={15} />}
            onClick={() => {
              close();
              downloadText(JSON.stringify(doc, null, 2), `${filename}.json`);
            }}
          >
            JSON data
          </MenuItem>
          <div className="divider my-1.5" />
          <MenuLabel>Print & schedule</MenuLabel>
          <MenuItem
            icon={<Printer size={15} />}
            onClick={() => {
              close();
              recordActivity("document.exported", doc.id, doc.number, `Printed ${doc.number}`);
              window.setTimeout(() => window.print(), 120);
            }}
          >
            Print
          </MenuItem>
          <MenuItem
            icon={<CalendarPlus size={15} />}
            onClick={() => {
              close();
              const ics = icsForDocument(doc, business);
              if (!ics) {
                toast.info("No due date set", "Add a due or valid-until date first, then create the reminder.");
                return;
              }
              downloadText(ics, `${filename}.ics`, "text/calendar");
              toast.success("Calendar reminder saved", "Open the file to add it to your calendar.");
            }}
          >
            Add to calendar
          </MenuItem>
          <MenuItem
            icon={<Share2 size={15} />}
            onClick={async () => {
              close();
              const token = attachmentShare(doc.id);
              if (typeof navigator !== "undefined" && navigator.share) {
                try {
                  await navigator.share({ title: doc.title, url: `${window.location.origin}/v/${token}` });
                  return;
                } catch {
                  /* fall through to copy */
                }
              }
              window.location.hash = "share";
            }}
          >
            Create share link
          </MenuItem>
        </div>
      )}
    </Dropdown>
  );
}
