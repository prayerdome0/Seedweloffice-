"use client";

import type { BusinessProfile, DocumentRecord, LineItem } from "./types";
import { amountInWords, formatMoney, seededPick, titleCase, truncate } from "./utils";
import { docKindMeta } from "./constants";

/**
 * Seedwel Assist — the drafting engine behind every "Write for me" button.
 *
 * It composes professional business copy from the details already in the
 * document, the business profile and the user's brief. Composition happens
 * on the device, which keeps the assistant fast and private on the low-
 * bandwidth connections this product targets, and means the feature works
 * with no API key at all.
 *
 * If `NEXT_PUBLIC_AI_ENDPOINT` is configured, requests are forwarded to that
 * endpoint instead, so a team can plug in their own model. The on-device
 * composer remains the fallback whenever the endpoint is unavailable.
 */

export type AssistTone = "professional" | "warm" | "confident" | "concise" | "formal";
export type AssistLength = "short" | "medium" | "long";

export interface AssistInput {
  /** Token from the document schema describing which field is being written. */
  field: string;
  /** Optional instruction from the user, e.g. "mention the 3-week lead time". */
  brief?: string;
  tone?: AssistTone;
  length?: AssistLength;
  doc?: DocumentRecord | null;
  business?: BusinessProfile | null;
  /** Regenerate counter — produces a different, equally valid variant. */
  variant?: number;
}

export interface AssistResult {
  text: string;
  lines?: string[];
  source: "assist" | "endpoint";
  credits: number;
}

export const TONES: { id: AssistTone; label: string; hint: string }[] = [
  { id: "professional", label: "Professional", hint: "Clear, measured and business-like." },
  { id: "warm", label: "Warm", hint: "Friendly and relational — good for small clients." },
  { id: "confident", label: "Confident", hint: "Direct and outcome-focused." },
  { id: "concise", label: "Concise", hint: "Short sentences, no padding." },
  { id: "formal", label: "Formal", hint: "For contracts, government and institutional work." },
];

interface Context {
  business: string;
  client: string;
  clientShort: string;
  kind: string;
  subject: string;
  items: LineItem[];
  firstItem: string;
  total: string;
  currency: string;
  industry: string;
  brief: string;
  tone: AssistTone;
  long: boolean;
  short: boolean;
}

const clean = (value?: string | null) => (value ?? "").trim();

const detectIndustry = (business: BusinessProfile | null, doc: DocumentRecord | null): string => {
  const haystack = [business?.tagline, business?.name, doc?.payload?.subject, doc?.payload?.title, doc?.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const map: [RegExp, string][] = [
    [/solar|energy|power|inverter/, "energy"],
    [/construct|build|civil|contractor|plumb/, "construction"],
    [/school|training|learn|academy|education|vocational|bootcamp/, "training"],
    [/health|clinic|medical|hospital|pharma/, "health"],
    [/logistic|transport|haulage|courier|freight/, "logistics"],
    [/retail|shop|store|supermarket|trading/, "retail"],
    [/farm|agri|poultry|maize|irrigation/, "agriculture"],
    [/bank|fintech|payment|insur|finance/, "financial services"],
    [/software|studio|design|digital|web|brand/, "design and technology"],
    [/mining|copper|quarry/, "mining"],
    [/hospitality|hotel|lodge|restaurant|catering/, "hospitality"],
    [/church|ministry|foundation|ngo|trust|charity/, "community development"],
  ];
  for (const [pattern, label] of map) if (pattern.test(haystack)) return label;
  return "business services";
};

const buildContext = (input: AssistInput): Context => {
  const doc = input.doc ?? null;
  const business = input.business ?? null;
  const items = doc?.payload?.items ?? [];
  const clientRaw = clean(doc?.payload?.clientCompany) || clean(doc?.payload?.clientName) || "your team";
  const clientShort = clientRaw.split(/[,\n]/)[0].replace(/\b(Ltd|Limited|Plc|Inc|Trust|Foundation)\b/gi, "").trim() || clientRaw;
  const currency = clean(doc?.payload?.currency) || business?.currency || "USD";
  const total = doc ? formatMoney(estimateTotal(items), currency) : "";
  const statement = items.reduce((sum, i) => sum + (i.qty ?? 0) * (i.rate ?? 0), 0);
  return {
    business: business?.name ?? "our team",
    client: clientRaw,
    clientShort,
    kind: docKindMeta(doc?.kind ?? "invoice").label,
    subject: clean(doc?.payload?.subject) || clean(doc?.title) || "this engagement",
    items,
    firstItem: clean(items[0]?.description) || "the work described",
    total: total || formatMoney(statement, currency),
    currency,
    industry: detectIndustry(business, doc),
    brief: clean(input.brief),
    tone: input.tone ?? "professional",
    long: (input.length ?? "medium") === "long",
    short: (input.length ?? "medium") === "short",
  };
};

const estimateTotal = (items: LineItem[]): number =>
  items.reduce((sum, item) => sum + (item.qty ?? 0) * (item.rate ?? 0) * (1 + (item.taxRate ?? 0) / 100), 0);

const pick = <T,>(items: T[], key: string, variant = 0): T => seededPick(items, `${key}::${variant}`);

const join = (parts: (string | false | undefined)[], sep = "\n\n"): string => parts.filter(Boolean).join(sep);

const openerFor = (ctx: Context, variant: number): string =>
  pick(
    [
      `Thank you for the opportunity to work with ${ctx.client}.`,
      `We are glad to put this proposal in front of ${ctx.client}.`,
      `${ctx.client} asked for a clear way forward on ${ctx.subject.toLowerCase()} — this is it.`,
      `Following our discussions with ${ctx.client}, here is our plan for ${ctx.subject.toLowerCase()}.`,
    ],
    `open-${ctx.kind}`,
    variant,
  );

const closerFor = (ctx: Context, variant: number): string =>
  pick(
    [
      `We are ready to begin as soon as you give the word, and we will confirm dates in writing within one working day of your approval.`,
      `Approve this document and we will schedule a kick-off call within the week to agree the first milestones.`,
      `If anything here needs adjusting, tell us and we will revise and resend the same day.`,
      `We would be pleased to answer any questions before you decide — simply reply to this document.`,
    ],
    `close-${ctx.kind}`,
    variant,
  );

/** Each tone shifts which variant is chosen, so the same brief reads differently. */
const toneOffset = (tone: AssistTone): number => ({ professional: 0, warm: 1, confident: 2, concise: 3, formal: 4 })[tone];

const briefSentence = (ctx: Context): string => {
  if (!ctx.brief) return "";
  const hint = ctx.brief.trim();
  const normalised = /[.!?]$/.test(hint) ? hint : `${hint}.`;
  return normalised.charAt(0).toUpperCase() + normalised.slice(1);
};

/* ── Generators ─────────────────────────────────────────────────────────── */

type Generator = (ctx: Context, variant: number) => AssistResult;

const G: Record<string, Generator> = {
  /* Notes and terms ------------------------------------------------------- */
  notes: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Thank you for your business. Please quote ${ctx.subject ? `“${truncate(ctx.subject, 60)}”` : "this document"} in any correspondence so we can match your payment quickly.`,
          `We appreciate your prompt attention to this document. Any queries can be raised with ${ctx.business} directly and we will respond the same working day.`,
          `All figures are stated in ${ctx.currency}. Please confirm receipt and we will issue the supporting documentation you need.`,
        ],
        "notes",
        v,
      ),
      ctx.long ? `Delivery and scheduling are handled by our project desk; you will receive named contacts once this is confirmed.` : "",
    ]),
    source: "assist",
    credits: 1,
  }),

  terms: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Payment is due within 30 days of the invoice date. Balances outstanding beyond 60 days attract interest at 2% per month.`,
          `A 50% deposit confirms the booking, with the balance payable on completion. Deposits are non-refundable once work has started.`,
          `Payment is due on presentation. Where credit terms have been agreed, they run from the date of this document and are strictly observed.`,
          `Fees exclude bank charges and third-party disbursements. These are passed through at cost with supporting receipts.`,
        ],
        "terms",
        v,
      ),
      `Work is scheduled against receipt of a signed acceptance or written approval.`,
    ]),
    source: "assist",
    credits: 1,
  }),

  receiptNotes: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Received with thanks. This receipt is issued electronically and is valid without a signature.`,
          `Payment received in full — thank you. Please retain this receipt for your records.`,
          `We confirm the amount shown above has cleared. Your account is up to date.`,
        ],
        "receipt-notes",
        v,
      ),
    ]),
    source: "assist",
    credits: 1,
  }),

  /* Quotations ------------------------------------------------------------ */
  quotationIntro: (ctx, v) => ({
    text: join([
      openerFor(ctx, v),
      briefSentence(ctx),
      pick(
        [
          `The scope below is built around ${ctx.subject.toLowerCase()} and is priced so you can see exactly what each part of the work costs. Nothing has been bundled to hide a margin.`,
          `We have kept this quotation specific: each line is something you can question, adjust or remove. Where we recommend an option, we say so and explain why.`,
          `Prices reflect current supplier rates and are held for the validity period shown. We keep our pricing open so you can compare like for like.`,
        ],
        "quote-intro",
        v,
      ),
      ctx.long
        ? `Should you wish to phase the work, we can split the schedule across two budget periods without changing the unit rates.`
        : "",
    ]),
    source: "assist",
    credits: 2,
  }),

  itemDescription: (ctx, v) => ({
    text: pick(
      [
        `${titleCase(ctx.firstItem)} — supplied and delivered as specified`,
        `Professional ${ctx.industry} services: ${ctx.subject.toLowerCase()}`,
        `Supply, delivery and installation of ${ctx.firstItem.toLowerCase()}`,
        `Advisory and delivery work covering ${ctx.firstItem.toLowerCase()}`,
      ],
      `item-${ctx.firstItem}`,
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  /* Proposals ------------------------------------------------------------- */
  proposalSummary: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      `${ctx.client} is weighing up scope, timing and cost on ${ctx.subject.toLowerCase()}. This proposal sets out what we will deliver, what it costs and what you should expect to see within the first 30 days.`,
      pick(
        [
          `Our approach is deliberately practical: one accountable lead, weekly written updates and a deliverable you can inspect at every stage rather than at the end.`,
          `We work in short cycles. Each cycle ends with something you can use — not a status report.`,
          `Everything in this document is measurable. Where we commit to a number, we track it and report it back to you.`,
        ],
        "prop-summary",
        v,
      ),
      `Total investment: ${ctx.total}.`,
      ctx.long
        ? `We have delivered comparable work in ${ctx.industry}, and we are happy to arrange a reference call with a client in the same sector before you decide.`
        : "",
    ]),
    source: "assist",
    credits: 3,
  }),

  proposalProblem: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `The challenge is rarely effort — it is alignment. Teams doing manual, duplicated work lose hours every week and cannot see where the time goes.`,
          `Growth exposes gaps that were invisible at a smaller scale: quoting slows down, records disagree, and decisions wait on information nobody owns.`,
          `There is no shortage of tools. What is missing is a system that fits how ${ctx.client} actually works, and a team able to run it after the consultants leave.`,
        ],
        "prop-problem",
        v,
      ),
      ctx.long
        ? `Left unaddressed, this shows up as slower collections, missed tenders and a leadership team spending its time on administration rather than customers.`
        : "",
    ]),
    source: "assist",
    credits: 2,
  }),

  proposalApproach: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `We begin with discovery: two structured workshops, a review of your current documents and a shortlist of the bottlenecks worth solving first. Everything after that is prioritised by value, not by what is easiest to build.`,
          `Our method is to deliver in two-week increments. Each increment ends with a demonstration, written acceptance criteria and a note of what changes next.`,
          `We work alongside your team rather than for it. Your staff are trained during delivery, so capability stays in the business once we step back.`,
        ],
        "prop-approach",
        v,
      ),
      ctx.long
        ? `Progress is reviewed weekly against a simple traffic-light report: on track, at risk, or blocked. If something is blocked, you hear it from us first.`
        : "",
    ]),
    source: "assist",
    credits: 2,
  }),

  proposalScope: (ctx, v) => ({
    text: "",
    lines: [
      `Discovery workshops and current-state review with ${ctx.client}`,
      `Design and delivery of ${ctx.subject.toLowerCase()}`,
      `Configuration, testing and acceptance criteria agreed in writing`,
      `Documentation and templates your team can maintain in-house`,
      `Training for the staff who will use the system daily`,
      `Thirty days of post-delivery support after sign-off`,
    ],
    source: "assist",
    credits: 2,
  }),

  proposalDeliverables: (ctx, v) => ({
    text: "",
    lines: [
      `Signed-off scope and delivery schedule`,
      `Completed ${ctx.kind.toLowerCase()} package with all supporting artwork and data`,
      `Reference documentation and operating instructions`,
      `Training session for up to eight staff members`,
      `Impact summary confirming agreed measures`,
      `Handover pack with named contacts and support terms`,
    ],
    source: "assist",
    credits: 2,
  }),

  proposalWhyUs: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `${ctx.business} works in ${ctx.industry}, so we bring patterns that already work locally instead of experiments. Most of our new work comes from clients we have served before.`,
          `We are a senior team, deliberately small. The person who scopes your work is the person who delivers it, and you will never be handed to an account manager.`,
          `Our record is verifiable: we report on what we promised, including when we miss it. Clients stay with us because the reporting is honest.`,
        ],
        "prop-whyus",
        v,
      ),
      `Pricing is quoted in ${ctx.currency} with no hidden change-request rates.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  proposalConclusion: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Approve this proposal and we will confirm the kick-off date within one working day. The first milestone is delivered in week three.`,
          `The next step is a 30-minute call to agree scope and dates. We will send a calendar invitation and a short agenda.`,
          `We are ready to start. On your approval we will issue the schedule and the named delivery team.`,
        ],
        "prop-close",
        v,
      ),
      `Investment: ${ctx.total} for the scope described above.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  timelineDetails: (ctx, v) => ({
    text: pick(
      [
        `Workshops scheduled with your team, requirements documented and signed off.`,
        `Delivery in two-week increments with weekly written progress notes.`,
        `Acceptance testing with your nominated reviewers and a documented sign-off.`,
        `Training, handover documentation and thirty days of support.`,
      ],
      `timeline-${v}`,
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  /* Company profile ------------------------------------------------------- */
  companyIntro: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `${ctx.business} is a ${ctx.industry} company built around a simple idea: give clients systems and presentation they can rely on, delivered by people who stay accountable.`,
          `We began small and grew by referral. Today ${ctx.business} serves clients across ${ctx.industry}, combining practical delivery with documentation that outlives the project.`,
          `${ctx.business} exists to raise the standard of ${ctx.industry} work in our market — measurable delivery, honest reporting and pricing that a finance officer can defend.`,
        ],
        "company-intro",
        v,
      ),
      ctx.long
        ? `Our team works in English plus the local languages your staff use daily, and every engagement is led by a named senior member of staff.`
        : "",
    ]),
    source: "assist",
    credits: 2,
  }),

  companyAbout: (ctx, v) => ({
    text: join([
      pick(
        [
          `Founded to serve growing organisations, ${ctx.business} has grown through repeat work rather than advertising. Clients stay because delivery is predictable and reporting is honest.`,
          `${ctx.business} was established to bring senior ${ctx.industry} capability within reach of organisations that cannot justify a large in-house function.`,
        ],
        "company-about",
        v,
      ),
      `We work in defined phases with written acceptance criteria, train your staff as part of delivery, and hand over documentation that your own team can maintain.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  companyMission: (ctx, v) => ({
    text: pick(
      [
        `To give growing organisations the systems and presentation that larger competitors take for granted, at a price and pace that respects a real budget.`,
        `To deliver dependable ${ctx.industry} work that leaves every client more capable than we found them.`,
      ],
      "mission",
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  companyVision: (ctx, v) => ({
    text: pick(
      [
        `A market where local organisations compete on the quality of their work and their records, and win.`,
        `To be the partner organisations call first when they need something built properly.`,
      ],
      "vision",
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  companyValues: (ctx, v) => ({
    text: "",
    lines: [
      `Show the working — no black boxes, no unexplained invoices`,
      `Local first — hire, buy and train within the markets we serve`,
      `Say the number — commit to measurable outcomes and report on them`,
      `Document everything — handover quality is part of delivery`,
      `Fix it fast — problems are acknowledged the same day they surface`,
    ],
    source: "assist",
    credits: 2,
  }),

  companyWhyUs: (ctx, v) => ({
    text: join([
      `${ctx.business} is chosen for three reasons: senior people do the work, timelines are committed in writing, and the handover leaves capability behind.`,
      pick(
        [
          `Most of our turnover comes from clients who have already worked with us, which is the only reference that matters.`,
          `We publish what we promise and we report against it — including the quarters where we missed.`,
        ],
        "company-whyus",
        v,
      ),
      `Costs are fixed at quotation, and change requests are priced before any work begins.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  serviceDescription: (ctx, v) => ({
    text: pick(
      [
        `Practical ${ctx.industry} delivery with written scope, fixed pricing and a documented handover.`,
        `End-to-end delivery from discovery through to training, with weekly written progress reports.`,
        `Advisory and delivery combined: we assess, recommend, then build and hand over.`,
      ],
      `service-${v}`,
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  /* Contracts ------------------------------------------------------------- */
  contractRecitals: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      `The Client wishes to engage the Service Provider to deliver ${ctx.subject.toLowerCase()} and the Service Provider has the skills, capacity and licences to do so.`,
      `The parties wish to record the terms of that engagement in writing, including scope, fees, confidentiality and the consequences of termination.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  contractTerm: (ctx, v) => ({
    text: join([
      `This agreement runs from the date of signature until the deliverables are accepted or either party terminates it with 14 days' written notice.`,
      pick(
        [
          `Work completed to the date of termination remains payable, and any materials produced are handed over on settlement of outstanding invoices.`,
          `If delivery is paused at the Client's request for more than 30 consecutive days, the Service Provider may invoice for work complete to that date.`,
        ],
        "term",
        v,
      ),
    ]),
    source: "assist",
    credits: 2,
  }),

  contractProvisions: (ctx, v) => ({
    text: join([
      `The Service Provider holds professional indemnity cover appropriate to the work described, and will notify the Client of any claim arising from it.`,
      `Neither party is liable for delay caused by events outside its reasonable control, provided the affected party gives notice within five working days.`,
      `Any variation to the scope or fees must be agreed in writing and signed by both parties before the affected work begins.`,
      `Notices may be served by email to the addresses recorded in this agreement and are treated as received on the next working day.`,
    ]),
    source: "assist",
    credits: 3,
  }),

  /* Reports --------------------------------------------------------------- */
  reportSummary: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Performance for the period is set out below against agreed measures. The headline is that delivery held to plan while cost pressure increased, and two risks need a decision before the next period closes.`,
          `This report summarises results for the period, explains the variances, and recommends the three actions with the greatest effect on the next quarter.`,
          `Trading was steady but uneven: two workstreams outperformed, one slipped, and collections improved materially. Recommendations follow the analysis.`,
        ],
        "report-summary",
        v,
      ),
      ctx.long
        ? `Figures are drawn from the accounting system and reconciled to bank statements at period end. Where estimates are used, they are labelled as such.`
        : "",
    ]),
    source: "assist",
    credits: 3,
  }),

  reportMethodology: (ctx, v) => ({
    text: join([
      `Data was compiled from transaction records, delivery logs and staff returns, then reconciled against bank statements and signed service sheets for the same period.`,
      pick(
        [
          `Percentages are calculated on completed work only. Pipeline values are weighted by stage probability and are reported separately from confirmed revenue.`,
          `Where figures are provisional they are marked. No adjustments have been made for year-end accruals, which will be reflected in the annual accounts.`,
        ],
        "report-method",
        v,
      ),
    ]),
    source: "assist",
    credits: 2,
  }),

  reportSection: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Delivery held to plan. Sixteen of eighteen workstreams closed on schedule; the two exceptions were caused by supplier lead times and were communicated to stakeholders before the original due date.`,
          `Revenue grew against the previous period, driven by repeat work rather than new client acquisition. Average order value rose while the number of low-value jobs fell, which is the intended effect of the pricing change.`,
          `Cost of delivery increased in line with the expanded team. Margin held within one percentage point of target, and overtime hours fell for the third consecutive period.`,
          `Cash collection improved sharply after the reminder sequence was introduced. Days sales outstanding fell by nine days, releasing working capital without any change to credit terms.`,
        ],
        "report-section",
        v,
      ),
      ctx.long
        ? `The trend is consistent with the three periods before this one; no single month distorts the picture.`
        : "",
    ]),
    source: "assist",
    credits: 2,
  }),

  reportConclusion: (ctx, v) => ({
    text: join([
      pick(
        [
          `Three actions are recommended for the next period: publish an updated price list, resolve the two overdue receivables, and confirm the outstanding supplier contract. Each has an owner and a date in the action log.`,
          `Recommendations: hold the current cost base, prioritise the two workstreams with the strongest margin, and complete the long-outstanding handover documentation.`,
        ],
        "report-close",
        v,
      ),
      `Performance should be reviewed again at the end of the next period against the same measures, so that like is compared with like.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  /* CV & cover letter ----------------------------------------------------- */
  cvSummary: (ctx, v) => ({
    text: join([
      briefSentence(ctx),
      pick(
        [
          `Results-driven professional with a track record of delivering measurable improvements in ${ctx.industry}. Comfortable leading small teams, presenting to senior stakeholders and taking ownership from scoping through to delivery.`,
          `Experienced practitioner in ${ctx.industry} with strengths in planning, delivery and clear written communication. Known for fixing the processes that slow teams down and for leaving documentation behind.`,
          `Senior specialist with hands-on delivery experience and a reputation for quiet reliability. Fluent in both the technical detail and the commercial conversation that surrounds it.`,
        ],
        "cv-summary",
        v,
      ),
      `Available for immediate start and open to roles that combine delivery with responsibility for standards.`,
    ]),
    source: "assist",
    credits: 2,
  }),

  cvExperience: (ctx, v) => ({
    text: "",
    lines: [
      `Led delivery of key workstreams, delivering projects on time and within budget`,
      `Introduced reporting and documentation standards adopted across the wider team`,
      `Mentored junior colleagues, three of whom progressed to senior roles`,
      `Reduced rework by building checklists into the end-to-end process`,
    ],
    source: "assist",
    credits: 2,
  }),

  cvSkills: (ctx, v) => ({
    text: "",
    lines: [
      `Project planning and delivery`,
      `Stakeholder communication`,
      `Reporting and analysis`,
      `Process improvement`,
      `Team leadership and mentoring`,
      `Documentation and quality assurance`,
      `Budget management`,
      `Client relationship management`,
    ],
    source: "assist",
    credits: 1,
  }),

  projectDescription: (ctx, v) => ({
    text: pick(
      [
        `Delivered end to end: scoping, build, testing and handover, including training for the operating team.`,
        `Owned the technical design and delivery schedule, coordinating suppliers and reporting weekly to the client.`,
        `Built to solve a specific operational problem, then documented so the client team could maintain it.`,
      ],
      "project-desc",
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  coverOpening: (ctx, v) => ({
    text: join([
      `Dear Hiring Manager,`,
      pick(
        [
          `I am writing to apply for the advertised role. My background in ${ctx.industry} maps closely to your requirements: hands-on delivery, team leadership and a habit of documenting what I build.`,
          `I would like to apply for this position. The work you describe is the work I have been doing — delivering projects properly, keeping records straight and supporting the people around me.`,
        ],
        "cover-open",
        v,
      ),
      briefSentence(ctx),
    ]),
    source: "assist",
    credits: 2,
  }),

  coverBody: (ctx, v) => ({
    text: "",
    lines: [
      `In my most recent role I took ownership of delivery across several concurrent workstreams, reporting directly to senior management and coordinating suppliers, budgets and timelines.`,
      `The result I am proudest of is a process improvement that removed duplicated manual work and cut turnaround time substantially, while improving the accuracy of records the finance team depends on.`,
      `I work well in a team and take responsibility for standards. Colleagues describe me as dependable, calm under pressure and clear in writing — qualities that matter when several stakeholders need the same information.`,
      `I am attracted to this role because it combines delivery with influence over how work is done, and I would bring the same discipline to your team from the first week.`,
    ],
    source: "assist",
    credits: 3,
  }),

  coverClosing: (ctx, v) => ({
    text: join([
      pick(
        [
          `Thank you for considering my application. I would welcome the chance to discuss how my experience fits your plans, and I can provide references on request.`,
          `I would be glad to discuss this further and can make myself available for interview at short notice.`,
        ],
        "cover-close",
        v,
      ),
      `Yours sincerely,`,
    ]),
    source: "assist",
    credits: 1,
  }),

  /* Certificates ---------------------------------------------------------- */
  certificateCitation: (ctx, v) => ({
    text: pick(
      [
        `for successfully completing all requirements of the programme, demonstrating commitment, reliability and a consistently high standard of work throughout.`,
        `in recognition of outstanding performance, sustained effort and the contribution made to colleagues and to the wider programme.`,
        `for dedication, discipline and achievement beyond the requirements set — awarded with the sincere appreciation of everyone at ${ctx.business}.`,
      ],
      "citation",
      v,
    ),
    source: "assist",
    credits: 1,
  }),

  /* Retained for completeness: names are never invented for a client. */
  clientName: (ctx, v) => ({ text: ctx.clientShort || "Client contact", source: "assist", credits: 0 }),
};

/* ── Remote endpoint (optional) ─────────────────────────────────────────── */

const endpoint = process.env.NEXT_PUBLIC_AI_ENDPOINT ?? "";

const callEndpoint = async (input: AssistInput, ctx: Context): Promise<AssistResult | null> => {
  if (!endpoint) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        field: input.field,
        brief: input.brief ?? "",
        tone: ctx.tone,
        length: input.length ?? "medium",
        document: input.doc
          ? { kind: input.doc.kind, number: input.doc.number, title: input.doc.title, subject: input.doc.payload?.subject ?? "" }
          : null,
        business: input.business ? { name: input.business.name, tagline: input.business.tagline ?? "" } : null,
      }),
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = (await response.json()) as { text?: string; lines?: string[] };
    if (!data.text && !data.lines?.length) return null;
    return { text: data.text ?? "", lines: data.lines, source: "endpoint", credits: 1 };
  } catch {
    return null;
  }
};

/* ── Public API ─────────────────────────────────────────────────────────── */

export const assistReady = Boolean(endpoint);

export const assistLabel = endpoint ? "Writing with your connected model" : "Drafting on your device";

export async function runAssist(input: AssistInput): Promise<AssistResult> {
  const ctx = buildContext(input);
  const remote = await callEndpoint(input, ctx);
  if (remote && (remote.text || remote.lines?.length)) return remote;

  const generator = G[input.field];
  if (!generator) {
    return { text: "", source: "assist", credits: 0 };
  }
  const variant = (input.variant ?? 0) + toneOffset(ctx.tone);
  const result = generator(ctx, variant);
  return { ...result, text: result.lines ? result.text : polish(result.text, ctx) };
}

const polish = (text: string, ctx: Context): string => {
  let out = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (ctx.short) {
    const sentences = out.split(/(?<=[.!?])\s+/);
    out = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.6))).join(" ");
  }
  return out;
};

/** Words written so far in this document — powers the editor's word count. */
export const documentWordCount = (doc: DocumentRecord): number => {
  const values = Object.values(doc.payload ?? {});
  let count = 0;
  for (const value of values) {
    if (typeof value === "string") count += value.trim().split(/\s+/).filter(Boolean).length;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") count += entry.trim().split(/\s+/).filter(Boolean).length;
        else if (entry && typeof entry === "object") {
          count += Object.values(entry as Record<string, unknown>)
            .filter((v) => typeof v === "string")
            .join(" ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
        }
      }
    }
  }
  return count;
};

/** Plain-text summary of a document, used by copy, email and share sheets. */
export const documentSummaryText = (doc: DocumentRecord, business: BusinessProfile | null): string => {
  const items = doc.payload.items ?? [];
  const total = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const totalWithTax = total * (1 + (doc.payload.taxRate ?? 0) / 100);
  return [
    `${docKindMeta(doc.kind).label} ${doc.number}`,
    doc.payload.subject ? `Subject: ${doc.payload.subject}` : "",
    `Issued: ${doc.issueDate}`,
    `Client: ${doc.payload.clientCompany || doc.payload.clientName || ""}`,
    business ? `From: ${business.name}` : "",
    `Total: ${formatMoney(totalWithTax, doc.payload.currency ?? "USD")} (${amountInWords(totalWithTax, doc.payload.currency ?? "USD")})`,
  ]
    .filter(Boolean)
    .join("\n");
};
