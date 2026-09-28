"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui";
import { Users, FileText, LayoutTemplate, ShoppingBag, CreditCard, MessageSquare, Settings, Megaphone } from "lucide-react";

type Profile = { name?: string; email?: string; role?: string; createdAt?: number; lastLoginAt?: number };

export default function AdminPage() {
  const { user, ready, cloud } = useAuth();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready || !cloud || user?.role !== "admin") return;
    let active = true;
    (async () => {
      try {
        const { getFirebaseApp } = await import("@/lib/firebase-app");
        const { collection, getDocs, getFirestore } = await import("firebase/firestore");
        const snap = await getDocs(collection(getFirestore(await getFirebaseApp()), "users"));
        if (active) setProfiles(snap.docs.map((doc) => doc.data() as Profile));
      } catch {
        if (active) setError("Could not load users. Check your Firestore rules and connection.");
      }
    })();
    return () => { active = false; };
  }, [ready, cloud, user?.role]);

  if (!ready) return <p className="text-fg-muted">Checking access…</p>;
  if (!cloud || user?.role !== "admin") return <Card className="p-8"><h1 className="text-xl font-semibold text-fg">Access restricted</h1><p className="mt-2 text-fg-muted">This area requires a Firestore admin account.</p></Card>;

  const now = Date.now();
  const cards = [
    ["Total users", profiles?.length, Users],
    ["Active users (30 days)", profiles?.filter(p => p.lastLoginAt && p.lastLoginAt > now - 30 * 86400000).length, Users],
    ["New signups (30 days)", profiles?.filter(p => p.createdAt && p.createdAt > now - 30 * 86400000).length, Users],
  ] as const;
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-[var(--brand)]">SEEDWEL OFFICE / ADMIN</p><h1 className="mt-1 text-2xl font-semibold text-fg">Platform overview</h1><p className="mt-1 text-sm text-fg-muted">Live account information from Firestore. Only recorded data is shown.</p></header>
    {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
    <div className="grid gap-3 sm:grid-cols-3">{cards.map(([label, value, Icon]) => <Card key={label} className="p-5"><Icon size={20} className="text-[var(--brand)]" /><p className="mt-4 text-2xl font-semibold text-fg">{value ?? "—"}</p><p className="text-sm text-fg-muted">{label}</p></Card>)}</div>
    <Card className="p-5"><h2 className="font-semibold text-fg">User management</h2><p className="mt-1 text-sm text-fg-muted">Account roles are managed in Firestore. Never promote an account from the browser.</p><div className="mt-4 space-y-2">{profiles?.slice(0, 20).map((p, i) => <div key={i} className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm" style={{borderColor:"var(--border)"}}><span className="text-fg">{p.name || p.email || "Unnamed user"}</span><span className="text-fg-muted">{p.email} · {p.role === "admin" ? "Admin" : "User"}</span></div>)}{!profiles && !error && <p className="text-sm text-fg-muted">Loading accounts…</p>}</div></Card>
    <div><h2 className="mb-3 font-semibold text-fg">Operations</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Templates", LayoutTemplate], ["Orders & purchases", ShoppingBag], ["Payments & revenue", CreditCard], ["Documents & reports", FileText], ["Support messages", MessageSquare], ["Announcements", Megaphone], ["AI settings", Settings], ["System settings", Settings]].map(([label, Icon]) => { const Symbol = Icon as typeof Users; return <Card key={label as string} className="p-4"><Symbol size={18} className="text-[var(--brand)]"/><p className="mt-3 font-medium text-fg">{label as string}</p><p className="mt-1 text-xs text-fg-muted">Not connected yet — no data available</p></Card>; })}</div></div>
  </div>;
}
