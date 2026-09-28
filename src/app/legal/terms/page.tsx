import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern use of the Seedwel Office document workspace, including plans, acceptable use and liability.",
  alternates: { canonical: "/legal/terms" },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "agreement",
    title: "1. Agreement",
    body: (
      <p>
        These terms govern your use of Seedwel Office. By creating a workspace, signing in or using any module you agree to them. If you are
        accepting on behalf of a company, school, church or non-profit, you confirm you are authorised to bind that organisation.
      </p>
    ),
  },
  {
    id: "account",
    title: "2. Your account",
    body: (
      <>
        <p>
          You are responsible for the accuracy of the details on your account and for keeping access to your device and email address secure.
          Where cloud sign-in is enabled, keep your password confidential. Where the workspace runs browser-locally, understand that data on
          a shared device may be visible to other people using that browser.
        </p>
        <p>Notify us promptly if you believe your account has been accessed without your permission.</p>
      </>
    ),
  },
  {
    id: "plans",
    title: "3. Plans, limits and billing",
    body: (
      <>
        <p>
          Every plan includes all thirteen document modules and all designs. Plans differ in monthly document volume, number of business
          profiles, seats, storage and support response times. Current limits are shown on the <Link href="/pricing">pricing page</Link> and
          inside the workspace on the subscription and storage pages.
        </p>
        <p>
          Paid plans are switched from the subscription page. Where a payment processor is connected, charges are collected by that processor
          and are subject to its terms; Seedwel Office does not store card numbers. Yearly plans are paid in advance and renew unless cancelled
          before the renewal date. Monthly plans may be cancelled at any time and remain active to the end of the paid period. Prices exclude
          any VAT, withholding or similar taxes that may apply.
        </p>
        <p>
          If you exceed a limit, we may ask you to upgrade or reduce usage; we do not delete your documents to enforce a limit.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "4. Your content",
    body: (
      <>
        <p>
          You own the content you create: document text, client details, amounts, logos, signatures and stamps. You grant us only the
          permission needed to operate the product — to store your records, render previews, generate exports and sync between your devices.
          We do not sell your content and do not use client or document content to train models.
        </p>
        <p>
          You are responsible for having the right to use the logos, signatures and images you upload, and for the accuracy and legality of the
          documents you issue. Invoices, receipts, tax documents and certificates may be subject to local legal requirements; confirming that
          your documents comply is your responsibility.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    body: (
      <>
        <p>Do not use Seedwel Office to:</p>
        <ul>
          <li>produce fraudulent documents, forged certificates, fake receipts or misleading financial records;</li>
          <li>impersonate a person, business or authority you are not authorised to represent;</li>
          <li>upload malware, or content that infringes someone else's rights;</li>
          <li>attempt to access another user's workspace, probe or overload the service;</li>
          <li>resell or redistribute the template designs as templates, or ship the product as your own.</li>
        </ul>
        <p>We may suspend a workspace that is used in this way, after notifying you where practicable.</p>
      </>
    ),
  },
  {
    id: "availability",
    title: "6. Availability and changes",
    body: (
      <p>
        We work to keep Seedwel Office available and reliable, and we improve it continuously: designs, fields and interfaces may change. We aim
        to give reasonable notice of changes that affect how you work, and where a plan's limits or price change, the new terms apply from your
        next renewal. Features described as working offline continue to work locally, but anything requiring a connection — cloud sync,
        authentication, external AI generation — needs one.
      </p>
    ),
  },
  {
    id: "liability",
    title: "7. Liability",
    body: (
      <p>
        The product is provided on a commercially reasonable basis, without a warranty that it will be uninterrupted or error-free. To the
        extent permitted by law, our total liability arising from your use of Seedwel Office is limited to the amount you paid us in the twelve
        months before the claim. We are not liable for indirect or consequential loss, including lost profits or lost business, or for the
        consequences of documents you choose to issue. Nothing in these terms excludes liability that cannot lawfully be excluded.
      </p>
    ),
  },
  {
    id: "termination",
    title: "8. Ending your use",
    body: (
      <p>
        You can stop using the product and delete your workspace at any time; export your documents and a JSON backup first. We may end this
        agreement if you materially breach these terms. On termination, cloud records associated with the account are removed after any
        legally required retention period, and locally stored data remains on your device until you clear it.
      </p>
    ),
  },
  {
    id: "contact",
    title: "9. Questions",
    body: (
      <p>
        Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with any question about these terms, your plan or your data. See also
        the <Link href="/legal/privacy">privacy policy</Link> and <Link href="/legal/cookies">cookie policy</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Badge tone="neutral">Legal</Badge>
        <h1 className="mt-4 text-[1.875rem] font-semibold tracking-tight text-fg sm:text-[2.25rem]">Terms of service</h1>
        <p className="mt-2 text-[0.8125rem] text-fg-subtle">Last updated 27 September 2026</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
          Clear terms for a clear product: what you get, what you own, what we ask of you and where the boundaries sit.
        </p>

        <nav className="mt-6 grid gap-1.5 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="text-[0.8125rem] font-medium text-[var(--brand)]">
              {section.title}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          {SECTIONS.map((section) => (
            <Card key={section.id} className="scroll-mt-24 p-5" as="section">
              <div id={section.id} className="text-[1.0625rem] font-semibold text-fg">
                {section.title}
              </div>
              <div className="mt-2 space-y-2.5 text-[0.875rem] leading-relaxed text-fg-muted [&_a]:font-semibold [&_a]:text-[var(--brand)] [&_li]:mb-1.5 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:pl-5">
                {section.body}
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-fg-subtle">
          These terms describe how the product actually behaves but are not legal advice. Operators deploying Seedwel Office commercially
          should have their own counsel review and adapt them.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
