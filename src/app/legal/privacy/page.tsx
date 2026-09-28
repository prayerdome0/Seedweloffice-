import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Seedwel Office handles your documents, account data and uploads — including what stays on your device.",
  alternates: { canonical: "/legal/privacy" },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "what-we-collect",
    title: "1. What we handle",
    body: (
      <>
        <p>Seedwel Office handles three categories of information:</p>
        <ul>
          <li>
            <strong>Account details</strong> you give us: name, email address, business name and country. This is used to sign you in, to
            attribute documents to the right workspace and to answer support requests.
          </li>
          <li>
            <strong>Document content</strong> you create: document fields, line items, client names, addresses, tax identifiers and the
            logos, signatures and stamps you upload.
          </li>
          <li>
            <strong>Operational records</strong>: an activity log of actions taken in your workspace, subscription state, usage counters and
            device-level preferences such as theme choice and default designs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "where-it-lives",
    title: "2. Where your data lives",
    body: (
      <>
        <p>
          This is the important part, and it depends on how your workspace is configured:
        </p>
        <ul>
          <li>
            <strong>Without a connected cloud project</strong>, everything — accounts, documents, uploads, activity and settings — is stored
            in your browser's local storage on the device you are using. It is not transmitted to us or to anyone else. Clearing your browser
            data, or using a different device, means the workspace is not there.
          </li>
          <li>
            <strong>With a connected cloud project</strong>, records are synced to that Firebase project (Firestore and, for image uploads,
            Cloud Storage) so the workspace follows you between devices. Access is governed by per-user security rules: only the signed-in
            owner of a record can read or write it.
          </li>
        </ul>
        <p>
          You can see which mode you are in at any time on the <strong>Storage</strong> and <strong>Settings</strong> pages inside the app.
          The product tells you plainly rather than implying a level of syncing that is not happening.
        </p>
      </>
    ),
  },
  {
    id: "sign-in",
    title: "3. Signing in",
    body: (
      <>
        <p>
          Where email and password sign-in is enabled, authentication is handled by Firebase Authentication, which stores a salted hash of
          your password — we never see or store the password itself. Google sign-in receives only the basic profile scope (name, email,
          profile picture). Password reset and email verification messages are sent by the authentication provider, not by us directly.
        </p>
        <p>
          Where no authentication provider is connected, the account created on the sign-up screen exists only in your browser. It provides
          a named owner for your local records; it is not a credential that protects data on a shared computer. Do not use it on a device you
          do not trust.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "4. The writing assistant",
    body: (
      <>
        <p>
          The writing assistant can run entirely on your device, composing drafts from the details already in your document. In that mode
          nothing you write is sent anywhere.
        </p>
        <p>
          If a workspace administrator connects an external AI endpoint, the text you submit for generation — together with the document
          context shown in the assistant panel — is sent to that endpoint to produce the draft. No account credentials, uploaded images or
          unrelated documents are included. Generated text is inserted into your document only after you accept it, and the assistant records
          the action in your activity log so you can see what was generated and when.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "5. Sharing and exports",
    body: (
      <>
        <p>
          A share link creates a token that resolves to one document in read-only form. Anyone holding the link can view it, so treat share
          links as you would a PDF attachment: share them only with the people who should see the document. You can revoke a link from the
          document's sharing panel, which invalidates the token for future visitors.
        </p>
        <p>
          Exports (PDF, Word, print, JSON backup) are generated in your browser and saved by you. Once a file leaves the product, it is
          outside our control and governed by wherever you choose to send it.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "6. Retention and deletion",
    body: (
      <>
        <p>
          Local workspaces persist until you delete the browser's data or use the data controls in Settings. Cloud workspaces retain records
          for as long as your account is active; deleting a document from the library removes it from the active store, and "clear all data"
          in Settings removes the workspace contents associated with your account.
        </p>
        <p>
          Subscription invoice records may be retained for the period required by accounting and tax rules. Activity log entries age out of
          the interface after 90 days by default and can be cleared manually.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "7. Your rights and controls",
    body: (
      <>
        <p>Inside the product you can, at any time:</p>
        <ul>
          <li>Export every document as PDF or Word, and the whole workspace as a JSON backup.</li>
          <li>Edit or delete any document, business profile, client record or uploaded asset.</li>
          <li>Clear the activity log and reset appearance, document and notification settings.</li>
          <li>Delete the workspace and its local records entirely.</li>
        </ul>
        <p>
          To request deletion of a cloud-hosted account and its synced records, write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
          from the email address on the account. We confirm receipt and complete verified requests within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "8. Cookies and tracking",
    body: (
      <p>
        Seedwel Office does not run advertising or cross-site tracking scripts. Where an analytics or payment provider is connected by the
        operator of a deployment, that provider may set its own cookies. Your theme preference and session state use browser storage, not
        tracking cookies. See the{" "}
        <Link href="/legal/cookies">cookie policy</Link> for the full list.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Changes and contact",
    body: (
      <>
        <p>
          When this policy changes materially we update the date below and, where you have an account with us, note the change inside the app.
          Continued use after an update constitutes acceptance of the revised policy.
        </p>
        <p>
          Questions about privacy, or about a document you believe was shared in error, go to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Badge tone="neutral">Legal</Badge>
        <h1 className="mt-4 text-[1.875rem] font-semibold tracking-tight text-fg sm:text-[2.25rem]">Privacy policy</h1>
        <p className="mt-2 text-[0.8125rem] text-fg-subtle">Last updated 27 September 2026</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
          This policy describes what Seedwel Office does with your information in plain language. It reflects what the product actually does
          in both its browser-local and cloud-connected modes.
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
              <div className="prose-copy mt-2 space-y-2.5 text-[0.875rem] leading-relaxed text-fg-muted [&_a]:font-semibold [&_a]:text-[var(--brand)] [&_li]:mb-1.5 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:pl-5">
                {section.body}
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-fg-subtle">
          This document is written to describe a real, functioning product but is not legal advice. Operators deploying Seedwel Office
          commercially should have their own counsel review and adapt it for their jurisdiction and data-protection obligations.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
