import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { ButtonLink, Card } from "@/components/ui";
import { totalTemplateCount } from "@/templates";

export const metadata: Metadata = { title: "Access and billing", description: "Current availability of Seedwel Office billing and workspace access." };
export default function PricingPage() {
  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><p className="text-sm font-semibold text-[var(--brand)]">TRANSPARENT ACCESS</p><h1 className="mt-3 text-3xl font-semibold text-fg">Create documents without a checkout</h1><p className="mt-3 text-fg-muted">The document editor, {totalTemplateCount} designs, export and writing tools are available to registered accounts. Firebase authentication and Firestore must be configured by the site operator before anyone can create an account.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><Card className="p-6"><h2 className="text-lg font-semibold text-fg">Available now</h2><p className="mt-2 text-sm text-fg-muted">Create and save documents, customise designs, export and publish links from your account.</p></Card><Card className="p-6"><h2 className="text-lg font-semibold text-fg">Not available yet</h2><p className="mt-2 text-sm text-fg-muted">Paid plans, card checkout, subscriptions and billing invoices are not connected. We will not simulate purchases or ask for card details.</p></Card></div><ButtonLink href="/sign-up" variant="brand" className="mt-8">Create an account</ButtonLink></main><SiteFooter /></div>;
}
