import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Offline",
  description: "Seedwel Office works offline — reopen the app when you are back on a network for cloud sync.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <Card className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>
          <WifiOff size={20} />
        </div>
        <h1 className="mt-4 text-[1.25rem] font-semibold tracking-tight text-fg">You are offline</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
          Seedwel Office keeps working without a connection: you can write documents, draft with the assistant and print. Anything you
          save while offline syncs as soon as you are back on a network.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="/app" variant="brand">Open my workspace</ButtonLink>
          <ButtonLink href="/app/documents" variant="outline">My documents</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
