"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon, CheckCircle2, Download, FilePlus2, FileText, PenLine, Settings, Share2, Sparkles, Trash2, Users, Wallet,
} from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState, Input, Segmented } from "@/components/ui";
import { useWorkspace } from "@/store/workspace";
import { relativeTime } from "@/lib/utils";
import type { ActivityAction } from "@/lib/types";

const ICONS: Record<string, React.ReactNode> = {
  "document.created": <FilePlus2 size={15} />,
  "document.updated": <FileText size={15} />,
  "document.exported": <Download size={15} />,
  "document.shared": <Share2 size={15} />,
  "document.deleted": <Trash2 size={15} />,
  "document.duplicated": <FileText size={15} />,
  "document.status": <CheckCircle2 size={15} />,
  "ai.generated": <Sparkles size={15} />,
  "template.applied": <PenLine size={15} />,
  "business.created": <Users size={15} />,
  "business.updated": <Users size={15} />,
  "settings.updated": <Settings size={15} />,
  "subscription.updated": <Wallet size={15} />,
  "auth.signin": <ActivityIcon size={15} />,
};

type Filter = "all" | "documents" | "writing" | "account";

export default function ActivityPage() {
  const activity = useWorkspace((s) => s.activity);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity.filter((entry) => {
      if (filter === "documents" && !entry.action.startsWith("document") && !entry.action.startsWith("template")) return false;
      if (filter === "writing" && entry.action !== "ai.generated") return false;
      if (filter === "account" && !["settings.updated", "subscription.updated", "business.created", "business.updated", "auth.signin", "auth.signout"].includes(entry.action)) return false;
      if (q && !`${entry.detail ?? ""} ${entry.entityName ?? ""} ${entry.action}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activity, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const day = new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
      map.set(day, [...(map.get(day) ?? []), entry]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Activity</h1>
        <p className="mt-1 text-[0.875rem] text-fg-muted">
          A complete, honest log of what happened in this workspace — useful when a client asks when something was sent.
        </p>
      </header>

      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <Input value={query} placeholder="Search the log…" onChange={(event) => setQuery(event.target.value)} className="!border-0 !bg-transparent !p-0 !min-h-0 !shadow-none focus:!shadow-none" />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Everything" },
            { value: "documents", label: "Documents" },
            { value: "writing", label: "Assistant" },
            { value: "account", label: "Account" },
          ]}
        />
        <Badge tone="neutral">{filtered.length} entries</Badge>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ActivityIcon size={20} />}
            title={activity.length ? "Nothing matches that filter" : "No activity yet"}
            description={activity.length ? "Try a different filter or clear your search." : "As you create and send documents, everything is recorded here automatically."}
            action={<ButtonLink variant="brand" href="/app/documents">Go to documents</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, entries]) => (
            <Card key={day} className="overflow-hidden">
              <div className="border-b px-4 py-2.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-fg-subtle" style={{ borderColor: "var(--border)" }}>
                {day}
              </div>
              <div>
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--border)" }}>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-fg-muted" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                      {ICONS[entry.action] ?? <ActivityIcon size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.8125rem] text-fg">{entry.detail}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-fg-subtle">
                        {entry.entityId && entry.entityName ? (
                          <Link href={`/app/documents/${entry.entityId}`} className="font-semibold text-[var(--brand)]">
                            {entry.entityName}
                          </Link>
                        ) : entry.entityName ? (
                          <span>{entry.entityName}</span>
                        ) : null}
                        <span>{relativeTime(entry.createdAt)}</span>
                        <span className="font-mono">{entry.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
