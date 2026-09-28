"use client";

import { Card } from "@/components/ui";
import { useWorkspace } from "@/store/workspace";

export default function SubscriptionPage() {
  const docs = useWorkspace(s => s.documents);
  const businesses = useWorkspace(s => s.businesses);
  return <div className="space-y-5">
    <header><h1 className="text-2xl font-semibold text-fg">Account & usage</h1><p className="mt-1 text-sm text-fg-muted">Your actual workspace usage. There is no checkout or paid subscription connected yet.</p></header>
    <div className="grid gap-3 sm:grid-cols-2"><Card className="p-5"><p className="text-2xl font-semibold text-fg">{docs.length}</p><p className="text-sm text-fg-muted">Documents created</p></Card><Card className="p-5"><p className="text-2xl font-semibold text-fg">{businesses.length}</p><p className="text-sm text-fg-muted">Business profiles</p></Card></div>
    <Card className="p-5"><h2 className="font-semibold text-fg">Billing is not available</h2><p className="mt-2 text-sm text-fg-muted">You cannot be charged or change plans in this app. We will only show invoices and payment methods when a verified payment provider is connected. No test cards or simulated purchases are recorded.</p></Card>
  </div>;
}
