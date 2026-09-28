# Seedwel Office

Run `npm ci && npm run dev`. Firebase Authentication and Firestore are required. Without valid Firebase keys, sign-in and sign-up are disabled and no user data is generated.

## Firebase admin setup

Add the public Firebase keys from `.env.example` to `.env.local`, enable Authentication and Cloud Firestore, then deploy `firestore.rules` in Firebase. In the Firebase console (or a trusted Admin SDK job), set the top-level `users/{uid}.role` to `admin` for your administrator. New accounts are created with `role: "user"`. Do not set roles through client code. The admin dashboard is visible only after the authenticated user's Firestore profile is loaded. Firestore rules, not the hidden navigation, are the security boundary. The dashboard currently reports user counts from Firestore; payments, orders and other operational datasets are labelled unconnected rather than showing invented numbers.

The built-in writing assistant uses an offline copy engine when no model service is configured. For model-backed output, connect a secured backend at `NEXT_PUBLIC_AI_ENDPOINT`; no model is bundled. Never put a secret key in a public environment variable.

## CV studio

The library includes 20 original CV layouts and 36 additional Studio layouts (six typographic systems across Corporate, Modern, Executive, Minimal, Creative and Academic). Studio layouts support reordering built-in and custom sections, profile photos and signatures; uploaded images must be PNG, JPEG or WebP under 500 KB. The editor saves each CV as a separate document and updates its preview while editing. Use **ATS PDF (searchable text)** in the Export menu for job applications; the standard PDF export preserves visual styling but rasterises the page and is not suitable for ATS parsing. The ATS PDF intentionally omits photos, signatures and decorative elements.

Not yet connected: payment/order processing, platform-wide analytics, editable admin operations, and dedicated letterhead or social-media design modules. Those require backend data models, authorization rules and production services; the admin page labels these areas unconnected rather than displaying sample totals.

No payment provider is connected. Account & usage displays real workspace counts only; paid checkout, billing invoices, and admin revenue are unavailable. Public links publish a document snapshot to Firestore and require the `publicShares` rules in `firestore.rules`.
