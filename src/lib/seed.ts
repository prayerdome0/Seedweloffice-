import type {
  ActivityLog, AppNotification, AppUser, BusinessProfile, DocumentRecord, DocumentPayload, DocKind, InvoiceRecord,
  Subscription, UserSettings,
} from "./types";
import { addDaysISO, todayISO, uid } from "./utils";
import { blankPayload } from "./documents/schema";
import { defaultDesign, nextDocNumber, round2 } from "./documents/compute";
import { defaultTemplateId } from "@/templates";

/**
 * Demo workspace.
 *
 * Used to seed the local (no-configuration) data engine so the product can be
 * evaluated end to end without a Firebase project. Everything here is normal
 * application data: the user can edit, duplicate or delete every record, and
 * "Reset workspace" in Settings rebuilds it from scratch.
 */

const DAY = 86_400_000;
const now = Date.now();
const daysAgo = (n: number) => now - n * DAY;

export const DEMO_USER: AppUser = {
  uid: "demo-user",
  email: "you@seedweloffice.com",
  displayName: "Chanda Mwale",
  jobTitle: "Managing Consultant",
  country: "Zambia",
  timezone: "Africa/Lusaka",
  language: "en",
  emailVerified: true,
  provider: "demo",
  createdAt: daysAgo(48),
  lastLoginAt: now,
};

export const demoBusinesses = (ownerId: string): BusinessProfile[] => [
  {
    id: "biz-seedwel-studio",
    ownerId,
    name: "Seedwel Studio",
    legalName: "Seedwel Studio Limited",
    tagline: "Design, software and business systems for growing companies",
    registrationNumber: "PACRA 120200045521",
    taxId: "TPIN 1002938475",
    taxLabel: "VAT",
    email: "hello@seedwelstudio.com",
    phone: "+260 97 452 1180",
    altPhone: "+260 96 330 7742",
    website: "seedwelstudio.com",
    addressLine1: "Plot 24, Thabo Mbeki Road",
    addressLine2: "Stand 1104, Kabulonga",
    city: "Lusaka",
    region: "Lusaka Province",
    postalCode: "10101",
    country: "Zambia",
    primaryColor: "#0e908f",
    accentColor: "#f0a90e",
    bankName: "Zambia National Commercial Bank",
    bankAccountName: "Seedwel Studio Limited",
    bankAccountNumber: "0123456789012",
    bankBranch: "Kabulonga",
    bankSwift: "ZNBCCZML",
    mobileMoney: "Airtel Money 0974521180",
    facebook: "facebook.com/seedwelstudio",
    instagram: "instagram.com/seedwelstudio",
    linkedin: "linkedin.com/company/seedwelstudio",
    twitter: "x.com/seedwelstudio",
    whatsapp: "+260974521180",
    currency: "ZMW",
    invoicePrefix: "INV",
    taxRate: 16,
    paymentTerms: 30,
    footerNote: "Thank you for supporting a Zambian-owned studio.",
    signatureName: "Chanda Mwale",
    signatureRole: "Managing Consultant",
    isDefault: true,
    createdAt: daysAgo(48),
    updatedAt: daysAgo(3),
  },
  {
    id: "biz-kwacha-foundation",
    ownerId,
    name: "Kwacha Skills Foundation",
    legalName: "Kwacha Skills Foundation Trust",
    tagline: "Vocational training and enterprise support for young Zambians",
    registrationNumber: "TRUST 88421",
    taxId: "TPIN 1008874221",
    taxLabel: "VAT",
    email: "programmes@kwachaskills.org",
    phone: "+260 95 110 8822",
    website: "kwachaskills.org",
    addressLine1: "12 Freedom Way",
    city: "Kitwe",
    region: "Copperbelt",
    country: "Zambia",
    primaryColor: "#1d4ed8",
    accentColor: "#0e908f",
    bankName: "Absa Bank Zambia",
    bankAccountName: "Kwacha Skills Foundation Trust",
    bankAccountNumber: "1029384756",
    bankBranch: "Kitwe",
    currency: "ZMW",
    invoicePrefix: "KSF",
    taxRate: 0,
    paymentTerms: 14,
    footerNote: "Registered non-profit trust. Donations are acknowledged in writing.",
    signatureName: "Mary Tembo",
    signatureRole: "Executive Director",
    isDefault: false,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(9),
  },
];

interface SeedDocInput {
  id: string;
  kind: DocKind;
  number: string;
  title: string;
  status: DocumentRecord["status"];
  businessId: string;
  clientName: string;
  currency: string;
  createdDaysAgo: number;
  updatedDaysAgo: number;
  issueOffset?: number;
  dueInDays?: number;
  templateId?: string;
  starred?: boolean;
  tags?: string[];
  payload: DocumentPayload;
}

const buildDoc = (ownerId: string, business: BusinessProfile | null, input: SeedDocInput): DocumentRecord => {
  const design = defaultDesign(business ?? undefined, input.templateId ?? defaultTemplateId[input.kind]);
  return {
    id: input.id,
    ownerId,
    kind: input.kind,
    number: input.number,
    title: input.title,
    status: input.status,
    businessId: input.businessId,
    currency: input.currency,
    issueDate: addDaysISO(input.issueOffset ?? 0, new Date(daysAgo(input.createdDaysAgo))),
    dueDate: input.dueInDays ? addDaysISO(input.dueInDays, new Date(daysAgo(input.createdDaysAgo))) : undefined,
    validUntil: input.kind === "quotation" ? addDaysISO(21, new Date(daysAgo(input.createdDaysAgo))) : undefined,
    clientName: input.clientName,
    tags: input.tags ?? [],
    starred: input.starred ?? false,
    archived: false,
    design: { ...design, qrValue: `https://seedweloffice.com/v/${input.number.toLowerCase()}` },
    payload: input.payload,
    shareToken: input.status === "sent" || input.status === "paid" ? `sh_${input.id.slice(-8)}` : undefined,
    aiGenerated: true,
    createdAt: daysAgo(input.createdDaysAgo),
    updatedAt: daysAgo(input.updatedDaysAgo),
  };
};

export const demoDocuments = (ownerId: string): DocumentRecord[] => {
  const studio = demoBusinesses(ownerId)[0];
  const trust = demoBusinesses(ownerId)[1];

  const line = (description: string, qty: number, rate: number, unit = "unit", detail?: string, taxRate = 16) => ({
    id: uid("itm"),
    description,
    detail,
    qty,
    unit,
    rate,
    taxRate,
    discount: 0,
  });

  const docs: DocumentRecord[] = [
    buildDoc(ownerId, studio, {
      id: "doc-inv-014",
      kind: "invoice",
      number: "INV-2026-014",
      title: "Website redevelopment — Zambezi Logistics",
      status: "paid",
      businessId: studio.id,
      clientName: "Grace Banda",
      currency: "ZMW",
      createdDaysAgo: 26,
      updatedDaysAgo: 6,
      dueInDays: 30,
      templateId: "invoice-modern-01",
      starred: true,
      tags: ["website", "retainer"],
      payload: {
        ...blankPayload("invoice"),
        title: "TAX INVOICE",
        subject: "Design and build of the Zambezi Logistics customer portal",
        reference: "ZL-PORTAL-2026",
        clientName: "Grace Banda",
        clientCompany: "Zambezi Logistics Ltd",
        clientEmail: "accounts@zambezilogistics.co.zm",
        clientPhone: "+260 97 223 9911",
        clientAddress: "Plot 55, Mumbwa Road\nLusaka, Zambia",
        clientTaxId: "TPIN 1007723119",
        currency: "ZMW",
        taxLabel: "VAT",
        taxRate: 16,
        discountType: "percent",
        discountValue: 5,
        amountPaid: 61800,
        paymentMethod: "Bank transfer",
        notes: "Thank you for your continued partnership. Portal hosting renews in February 2027.",
        terms: "Payment due within 30 days of invoice date. Late payments attract 2% monthly interest.",
        items: [
          line("Discovery workshops and information architecture", 3, 4200, "day", "Stakeholder interviews, journey mapping and sitemap sign-off"),
          line("UI design — 12 screens", 12, 1850, "screen", "Responsive designs in light and dark themes"),
          line("Front-end development (Next.js)", 1, 21500, "package", "Includes accessibility review and performance budget"),
          line("Content migration and staff training", 2, 3100, "day", "Two half-day training sessions delivered on site"),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-inv-015",
      kind: "invoice",
      number: "INV-2026-015",
      title: "Monthly support retainer — March 2026",
      status: "sent",
      businessId: studio.id,
      clientName: "Peter Nkumbula",
      currency: "ZMW",
      createdDaysAgo: 9,
      updatedDaysAgo: 9,
      dueInDays: 14,
      templateId: "invoice-corporate-03",
      tags: ["retainer", "support"],
      payload: {
        ...blankPayload("invoice"),
        title: "TAX INVOICE",
        subject: "Monthly retainer — support, hosting and content updates",
        reference: "RC-2026-03",
        clientName: "Peter Nkumbula",
        clientCompany: "Copperbelt Retail Group",
        clientEmail: "finance@copperbeltretail.zm",
        clientPhone: "+260 96 774 2210",
        clientAddress: "Unit 8, President Avenue\nKitwe, Zambia",
        currency: "ZMW",
        taxLabel: "VAT",
        taxRate: 16,
        amountPaid: 0,
        paymentMethod: "Bank transfer",
        notes: "Includes up to 20 hours of support. Unused hours do not roll over.",
        terms: "Payment due within 14 days. Please quote the invoice number on all payments.",
        items: [
          line("Retainer — application support (March)", 1, 9800, "month", "Monitoring, security patches and incident response"),
          line("Managed cloud hosting and backups", 1, 2400, "month"),
          line("Content updates", 6, 450, "hour", "Product photography, price lists and promotions"),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-inv-013",
      kind: "invoice",
      number: "INV-2026-013",
      title: "Training programme delivery",
      status: "overdue",
      businessId: studio.id,
      clientName: "Ndola Schools Trust",
      currency: "ZMW",
      createdDaysAgo: 44,
      updatedDaysAgo: 11,
      dueInDays: 30,
      templateId: "invoice-executive-01",
      tags: ["training", "education"],
      payload: {
        ...blankPayload("invoice"),
        title: "TAX INVOICE",
        subject: "Digital skills training for 12 school administrators",
        clientName: "Ndola Schools Trust",
        clientCompany: "Ndola Schools Trust",
        clientEmail: "bursar@ndolaschoolstrust.org.zm",
        clientPhone: "+260 95 884 1122",
        clientAddress: "Buteko Avenue\nNdola, Zambia",
        currency: "ZMW",
        taxLabel: "VAT",
        taxRate: 16,
        amountPaid: 6500,
        paymentMethod: "Mobile money",
        notes: "First instalment received. Balance now overdue — please settle to avoid interruption.",
        terms: "Payment due within 30 days. A further 5% is charged on balances over 60 days.",
        items: [
          line("Curriculum development — digital office skills", 1, 7200, "package"),
          line("Delivery of training (4 workshops)", 4, 3400, "workshop", "Facilitator, materials and certificates included"),
          line("Certificates and assessment records", 12, 210, "learner"),
        ],
      },
    }),
    buildDoc(ownerId, trust, {
      id: "doc-inv-016",
      kind: "invoice",
      number: "KSF-2026-006",
      title: "Enterprise bootcamp sponsorship",
      status: "partial",
      businessId: trust.id,
      clientName: "Tembo Investments",
      currency: "ZMW",
      createdDaysAgo: 16,
      updatedDaysAgo: 4,
      dueInDays: 14,
      templateId: "invoice-corporate-04",
      tags: ["sponsorship"],
      payload: {
        ...blankPayload("invoice"),
        title: "INVOICE",
        subject: "Sponsorship of the 2026 youth enterprise bootcamp",
        clientName: "Tembo Investments",
        clientCompany: "Tembo Investments Ltd",
        clientEmail: "csr@tempoinvestments.zm",
        clientPhone: "+260 97 001 4455",
        clientAddress: "Kafue Road\nLusaka, Zambia",
        currency: "ZMW",
        taxLabel: "VAT",
        taxRate: 0,
        amountPaid: 25000,
        paymentMethod: "Bank transfer",
        notes: "Thank you for investing in young entrepreneurs. A recognition report follows in June.",
        terms: "Sponsorship balances are payable within 14 days of this invoice.",
        items: [
          line("Platinum sponsorship — 40 participants", 1, 65000, "package", "Venue, facilitation, materials and mentorship"),
          line("Impact reporting pack", 1, 4500, "report", "Photography, testimonials and outcome metrics"),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-qt-021",
      kind: "quotation",
      number: "QT-2026-021",
      title: "Solar installation — Kafue warehouse",
      status: "sent",
      businessId: studio.id,
      clientName: "Mutale Chileshe",
      currency: "ZMW",
      createdDaysAgo: 7,
      updatedDaysAgo: 7,
      tags: ["energy", "hardware"],
      templateId: "quotation-modern-02",
      payload: {
        ...blankPayload("quotation"),
        title: "QUOTATION",
        subject: "Supply and installation of a 15 kW hybrid solar system",
        reference: "RFQ-KW-0091",
        clientName: "Mutale Chileshe",
        clientCompany: "Kafue Cold Storage",
        clientEmail: "mutale@kafuecold.zm",
        clientPhone: "+260 97 664 7788",
        clientAddress: "Industrial Area, Kafue\nLusaka Province",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        intro:
          "Thank you for the opportunity to quote for your warehouse energy requirements. The proposal below is sized for your measured peak load of 11.4 kW with an allowance for expansion, and is designed to keep your cold chain running through load shedding.",
        scope: [
          "Site survey, shading analysis and load assessment",
          "Supply of 28 × 545 W monocrystalline panels",
          "Two 8 kW hybrid inverters with monitoring gateway",
          "Battery bank sized for 6 hours of critical load",
          "Mounting structure, DC/AC protection and cabling",
          "Commissioning, staff training and 24-month workmanship warranty",
        ],
        deliverables: [
          "As-built system documentation",
          "Monitoring dashboard access for two managers",
          "Preventive maintenance schedule for 24 months",
        ],
        terms: "50% deposit on acceptance, balance on commissioning. Panels carry a 12-year product warranty.",
        notes: "Quotation valid for 21 days. Prices are subject to exchange rate movement on imported components.",
        items: [
          line("Solar panels 545 W", 28, 2450, "panel", "Tier-1 manufacturer, 12-year product warranty", 16),
          line("Hybrid inverters 8 kW", 2, 14500, "unit", "Includes Wi-Fi monitoring gateway", 16),
          line("Lithium battery modules 5.1 kWh", 6, 12800, "module", "6000 cycle rating", 16),
          line("Installation, protection and commissioning", 1, 28000, "package", "Certified installers, includes safety signage", 16),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-qt-020",
      kind: "quotation",
      number: "QT-2026-020",
      title: "Brand refresh and stationery",
      status: "accepted",
      businessId: studio.id,
      clientName: "Ruth Sakala",
      currency: "ZMW",
      createdDaysAgo: 21,
      updatedDaysAgo: 12,
      templateId: "quotation-creative-01",
      tags: ["branding", "design"],
      payload: {
        ...blankPayload("quotation"),
        title: "QUOTATION",
        subject: "Brand refresh, collateral and templates",
        clientName: "Ruth Sakala",
        clientCompany: "Mulanje Coffee Roasters",
        clientEmail: "ruth@mulanjecoffee.zm",
        clientPhone: "+260 96 552 3390",
        clientAddress: "Stand 22, Great East Road\nLusaka, Zambia",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        intro:
          "Your roastery has outgrown the original identity. This scope refreshes the mark for retail packaging while keeping the equity you have built over six years, then rolls it through every touchpoint your team uses daily.",
        scope: [
          "Brand audit and competitor review",
          "Logo refinement with three lockup variations",
          "Colour, typography and photography direction",
          "Packaging labels for four coffee lines",
          "Stationery, invoice and social templates",
        ],
        deliverables: ["Brand guidelines PDF", "Print-ready packaging artwork", "Editable invoice and letterhead templates"],
        terms: "Two rounds of revisions per deliverable. Balance due on final artwork handover.",
        notes: "Printing of physical packaging is quoted separately by your chosen printer.",
        items: [
          line("Brand audit and strategy workshop", 1, 9500, "package"),
          line("Logo refinement and lockups", 1, 7800, "package"),
          line("Packaging artwork — 4 lines", 4, 3200, "line"),
          line("Stationery and document templates", 1, 5400, "package"),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-rct-042",
      kind: "receipt",
      number: "RCT-2026-042",
      title: "Payment received — Copperbelt Retail",
      status: "final",
      businessId: studio.id,
      clientName: "Peter Nkumbula",
      currency: "ZMW",
      createdDaysAgo: 5,
      updatedDaysAgo: 5,
      templateId: "receipt-modern-01",
      tags: ["payment"],
      payload: {
        ...blankPayload("receipt"),
        title: "OFFICIAL RECEIPT",
        subject: "February support retainer and hosting",
        receivedFrom: "Copperbelt Retail Group",
        paymentReference: "BANK REF 88923145",
        paymentMethod: "Bank transfer",
        clientName: "Peter Nkumbula",
        clientCompany: "Copperbelt Retail Group",
        clientEmail: "finance@copperbeltretail.zm",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        amountPaid: 14152,
        notes: "Payment received with thanks. Your March invoice follows shortly.",
        items: [
          line("February retainer — application support", 1, 9800, "month", undefined, 16),
          line("Managed hosting and backups", 1, 2400, "month", undefined, 16),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-rct-041",
      kind: "receipt",
      number: "RCT-2026-041",
      title: "Training fee received",
      status: "final",
      businessId: studio.id,
      clientName: "Peter Sibeso",
      currency: "ZMW",
      createdDaysAgo: 13,
      updatedDaysAgo: 13,
      templateId: "receipt-minimal-02",
      tags: ["training"],
      payload: {
        ...blankPayload("receipt"),
        title: "RECEIPT",
        subject: "Advanced spreadsheet skills workshop",
        receivedFrom: "Peter Sibeso",
        paymentMethod: "Mobile money",
        paymentReference: "AIRTEL 77120934",
        clientName: "Peter Sibeso",
        clientPhone: "+260 96 331 0099",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        amountPaid: 870,
        items: [line("Workshop seat — 2 days", 1, 750, "seat", undefined, 16)],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-cv-chanda",
      kind: "cv",
      number: "CV-2026-001",
      title: "Chanda Mwale — Senior Software Engineer",
      status: "final",
      businessId: studio.id,
      clientName: "Chanda Mwale",
      currency: "ZMW",
      createdDaysAgo: 19,
      updatedDaysAgo: 8,
      templateId: "cv-modern-02",
      starred: true,
      tags: ["engineering", "portfolio"],
      payload: {
        ...blankPayload("cv"),
        fullName: "Chanda Mwale",
        headline: "Senior Software Engineer · Cloud & Payments",
        email: "chanda.mwale@email.com",
        phone: "+260 97 112 2334",
        location: "Lusaka, Zambia",
        website: "chandamwale.dev",
        linkedin: "linkedin.com/in/chandamwale",
        summary:
          "Senior software engineer with nine years building payment and logistics platforms across Southern Africa. I specialise in reliable Node.js and TypeScript services, cloud cost engineering and mentoring growing teams. Most recently I led the rebuild of a mobile-money integration processing over ZMW 40 million monthly.",
        skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "AWS", "Terraform", "Payment integrations", "Team leadership"],
        languages: ["English (fluent)", "Bemba (native)", "Nyanja (conversational)"],
        experience: [
          {
            id: uid("exp"),
            role: "Lead Software Engineer",
            company: "ZamPay Fintech",
            location: "Lusaka, Zambia",
            start: "Mar 2021",
            end: "",
            current: true,
            highlights: [
              "Rebuilt the mobile-money gateway, lifting transaction success from 91% to 99.4%",
              "Cut monthly cloud spend by 38% through workload right-sizing and caching",
              "Grew and mentored a team of six engineers with a structured code-review culture",
            ],
          },
          {
            id: uid("exp"),
            role: "Senior Developer",
            company: "TechZambia Solutions",
            location: "Lusaka, Zambia",
            start: "Jan 2018",
            end: "Feb 2021",
            current: false,
            highlights: [
              "Delivered a national parcel-tracking platform used by 14 courier branches",
              "Introduced automated testing that reduced production incidents by 60%",
            ],
          },
          {
            id: uid("exp"),
            role: "Software Developer",
            company: "LusakaSoft",
            location: "Lusaka, Zambia",
            start: "Feb 2016",
            end: "Dec 2017",
            current: false,
            highlights: ["Built billing modules for two utility clients", "Automated monthly reporting, saving 30 staff hours"],
          },
        ],
        education: [
          { id: uid("edu"), qualification: "BSc Computer Science", institution: "University of Zambia", location: "Lusaka", start: "2012", end: "2016", grade: "Distinction" },
          { id: uid("edu"), qualification: "AWS Certified Solutions Architect — Associate", institution: "Amazon Web Services", end: "2023", grade: "Passed" },
        ],
        projects: [
          { id: uid("prj"), name: "Rural Health Records", role: "Technical lead", description: "Offline-first patient records for 9 rural clinics, synchronising over intermittent connections.", link: "github.com/chandamwale/rural-health" },
          { id: uid("prj"), name: "OpenLedger", role: "Maintainer", description: "Open-source double-entry accounting engine with double-tax and multi-currency support.", link: "github.com/chandamwale/openledger" },
        ],
        certifications: [
          { id: uid("crt"), name: "AWS Certified Solutions Architect", role: "Amazon Web Services · 2023" },
          { id: uid("crt"), name: "Professional Scrum Master I", role: "Scrum.org · 2022" },
        ],
        interests: ["Community tech meetups", "Chess", "Long-distance running"],
        referee: "Mrs. Mutinta Phiri",
        refereeTitle: "Head of Engineering, ZamPay Fintech",
        refereeContact: "+260 97 887 6655 · mutinta.phiri@zampay.zm",
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-cl-001",
      kind: "cover-letter",
      number: "CL-2026-001",
      title: "Application — Head of Engineering, Africloud",
      status: "final",
      businessId: studio.id,
      clientName: "Africloud Systems",
      currency: "ZMW",
      createdDaysAgo: 15,
      updatedDaysAgo: 15,
      templateId: "letter-modern-01",
      tags: ["application"],
      payload: {
        ...blankPayload("cover-letter"),
        fullName: "Chanda Mwale",
        email: "chanda.mwale@email.com",
        phone: "+260 97 112 2334",
        location: "Lusaka, Zambia",
        headline: "Senior Software Engineer · Cloud & Payments",
        position: "Head of Engineering",
        recipientName: "Ms. Naledi Mokoena",
        recipientTitle: "Chief Technology Officer",
        companyName: "Africloud Systems",
        companyAddress: "14 Stellenbosch Avenue\nJohannesburg, South Africa",
        opening:
          "Dear Ms. Mokoena,\n\nI am applying for the Head of Engineering role advertised on your careers page. Over nine years I have built and led engineering teams delivering payment and logistics platforms across Southern Africa, and Africloud's ambition to serve 10,000 small businesses by 2028 is exactly the kind of scale problem I want to work on.",
        bodyParagraphs: [
          "At ZamPay I lead a team of six engineers responsible for a mobile-money gateway that processes more than ZMW 40 million each month. When transaction failures reached 9% in 2022, I ran a six-week reliability programme that combined structured logging, automated reconciliation and a rewritten retry strategy. Success rates are now 99.4% and support tickets fell by more than half.",
          "I care about how teams work as much as what they ship. I introduced lightweight design reviews, a shared on-call rotation with blameless postmortems, and a mentoring pairing rota that has helped four junior engineers move into mid-level roles. Handover documentation is a habit I insist on, because a platform nobody else understands is a liability.",
          "Your stack — TypeScript services on Kubernetes with Postgres — mirrors what I work with daily, and I would bring practical experience of cost engineering in African network conditions: caching aggressively, designing for intermittent connectivity and keeping infrastructure spend predictable as usage grows.",
        ],
        closing:
          "I would welcome the opportunity to discuss how I can help Africloud scale its engineering practice. I am available for interviews at your convenience and can provide references from my current leadership team.\n\nYours sincerely,",
      },
    }),
    buildDoc(ownerId, trust, {
      id: "doc-prop-007",
      kind: "proposal",
      number: "PROP-2026-007",
      title: "Digital transformation programme 2026",
      status: "sent",
      businessId: trust.id,
      clientName: "Ministry of Small Business",
      currency: "ZMW",
      createdDaysAgo: 11,
      updatedDaysAgo: 6,
      templateId: "proposal-modern-01",
      starred: true,
      tags: ["grant", "programme"],
      payload: {
        ...blankPayload("proposal"),
        title: "Digital Transformation Programme 2026",
        subject: "Equipping 400 small businesses with digital trading tools over 12 months",
        reference: "MSB/RFP/2026/014",
        clientName: "Director of Programmes",
        clientCompany: "Ministry of Small Business Development",
        clientEmail: "procurement@msbd.gov.zm",
        clientPhone: "+260 21 123 4567",
        clientAddress: "New Government Complex\nLusaka, Zambia",
        currency: "ZMW",
        taxRate: 0,
        taxLabel: "VAT",
        intro:
          "Small businesses in Zambia lose customers for one reason above all others: they cannot be found, quoted or invoiced professionally. This programme equips 400 businesses in four provinces with the digital trading essentials — a visible profile, standard quotations and professional invoices — and leaves behind local trainers who can keep the work going after the programme closes.",
        problem:
          "Only 27% of the small businesses we surveyed issue formal quotations, and just 14% send invoices that a bank or buyer would accept. The result is slow payment, lost tenders and no credit history. Business owners are not short of ambition — they are short of low-cost, locally relevant tools and the confidence to use them.",
        approach:
          "We combine practical training with a document platform that businesses keep after the programme. Each cohort follows a four-week curriculum: digital presence, quoting and pricing, invoicing and record keeping, then a supported trading month where our team reviews real documents and gives written feedback.",
        scope: [
          "Four provincial hubs: Lusaka, Kitwe, Livingstone and Chipata",
          "400 participating businesses across four cohorts",
          "Training of 24 local trainers who co-deliver and continue afterwards",
          "Document platform licences for 12 months for every participant",
          "Monthly monitoring reports to the Ministry",
        ],
        deliverables: [
          "Curriculum pack and facilitator guide",
          "Training of trainer certification for 24 local trainers",
          "400 business document sets produced with participants",
          "Impact evaluation report with 12-month follow-up data",
        ],
        whyUs: "The Foundation has delivered vocational and enterprise training in Copperbelt and Lusaka since 2016, reaching 3,200 learners. We report with real numbers, we work in Bemba and Nyanja as well as English, and 71% of our graduates are trading eighteen months after completing a programme.",
        conclusion:
          "We propose a two-week mobilisation period followed by four delivery cohorts and a final evaluation. The Ministry receives monthly reporting, an open data workbook and a final impact report, and every participating business retains its document platform for twelve months.",
        terms: "Payment is released in four tranches against agreed milestones. All programme materials are released to the Ministry under a perpetual licence.",
        items: [
          line("Curriculum design and facilitation guide", 1, 145000, "package"),
          line("Delivery of four cohorts", 4, 118000, "cohort", "Venue, facilitation, meals and materials included"),
          line("Training of trainers", 24, 6500, "trainer", "Certification, toolkit and three follow-up clinics"),
          line("Document platform licences", 400, 480, "licence", "12 months per participating business"),
          line("Monitoring, evaluation and reporting", 1, 96000, "package", "Includes 12-month follow-up survey"),
        ],
        timeline: [
          { id: uid("tlm"), phase: "Mobilisation and curriculum sign-off", duration: "Weeks 1–2", details: "Stakeholder workshop, trainer selection and material approval." },
          { id: uid("tlm"), phase: "Cohort 1 & 2 — Lusaka and Kitwe", duration: "Months 1–4", details: "Two 200-business cohorts running in parallel with weekly clinics." },
          { id: uid("tlm"), phase: "Cohort 3 & 4 — Livingstone and Chipata", duration: "Months 5–8", details: "Provincial delivery with local trainers leading sessions." },
          { id: uid("tlm"), phase: "Supported trading and evaluation", duration: "Months 9–12", details: "Document reviews, impact survey and final reporting." },
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-studio-profile",
      kind: "company-profile",
      number: "CP-2026-001",
      title: "Seedwel Studio — Company Profile 2026",
      status: "final",
      businessId: studio.id,
      clientName: "Seedwel Studio",
      currency: "ZMW",
      createdDaysAgo: 34,
      updatedDaysAgo: 10,
      templateId: "profile-modern-01",
      tags: ["capability", "profile"],
      payload: {
        ...blankPayload("company-profile"),
        title: "Company Profile 2026",
        tagline: "Design, software and business systems for growing companies",
        about:
          "Seedwel Studio is a Lusaka-based design and software studio founded in 2018. We work with SMEs, NGOs and institutions that need dependable digital systems without enterprise overhead. Our team of eleven designers, engineers and business analysts has delivered 128 projects across nine sectors, from custom logistics platforms to brand systems for national retailers.",
        mission: "To give growing African businesses the professional systems and presentation that larger competitors take for granted.",
        vision: "A generation of Zambian businesses that look, quote, invoice and report as professionally as anyone in the world.",
        values: ["Show the working", "Local first", "Ship then refine", "Build for the team who inherits it", "Measure honestly"],
        intro:
          "We are a small senior team by design. Every project is led by a partner, every deliverable is reviewed against a written quality checklist, and every handover includes documentation your own team can maintain.",
        whyUs:
          "Clients choose us because we stay. 82% of our work is a continuation of an earlier engagement, and we have never had a project fail acceptance testing. We price in Kwacha for local clients, we train your staff as part of delivery, and we say no when a project is not right for us.",
        accreditations: ["PACRA registered", "ZRA compliant", "Google Cloud Partner", "AWS Select Partner"],
        services: [
          { id: uid("svc"), name: "Business branding", description: "Identity systems, packaging and document templates that make small businesses look established." },
          { id: uid("svc"), name: "Web and software development", description: "Custom portals, internal systems and integrations built to be maintained by your team." },
          { id: uid("svc"), name: "Business process improvement", description: "Mapping, automating and documenting the processes that slow growing companies down." },
          { id: uid("svc"), name: "Training and enablement", description: "Practical workshops in digital office skills, spreadsheets and online trading." },
        ],
        stats: [
          { id: uid("stt"), value: "128", label: "Projects delivered" },
          { id: uid("stt"), value: "9", label: "Sectors served" },
          { id: uid("stt"), value: "82%", label: "Repeat business" },
          { id: uid("stt"), value: "11", label: "Team members" },
        ],
        team: [
          { id: uid("tm"), name: "Chanda Mwale", role: "Managing Consultant", contact: "chanda@seedwelstudio.com" },
          { id: uid("tm"), name: "Naomi Kabwe", role: "Design Director", contact: "naomi@seedwelstudio.com" },
          { id: uid("tm"), name: "Joseph Zulu", role: "Head of Engineering", contact: "joseph@seedwelstudio.com" },
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-agr-004",
      kind: "contract",
      number: "AGR-2026-004",
      title: "Service agreement — Mulanje Coffee Roasters",
      status: "sent",
      businessId: studio.id,
      clientName: "Ruth Sakala",
      currency: "ZMW",
      createdDaysAgo: 18,
      updatedDaysAgo: 12,
      templateId: "contract-formal-01",
      tags: ["branding"],
      payload: {
        ...blankPayload("contract"),
        title: "Service Agreement",
        subject: "Brand refresh, packaging artwork and document templates",
        reference: "AGR/MS-2026-004",
        intro:
          "This agreement sets out the terms on which Seedwel Studio Limited will provide branding and design services to Mulanje Coffee Roasters Limited, following acceptance of quotation QT-2026-020.",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        terms: "The engagement runs until final artwork handover. Either party may terminate with 14 days' written notice; work completed to that date remains payable.",
        notes: "All intellectual property transfers to the client on final payment. Seedwel Studio retains the right to reference the work in its portfolio.",
        items: [
          line("Brand refresh and packaging artwork", 1, 25900, "package", "As detailed in quotation QT-2026-020", 16),
        ],
        parties: [
          { id: uid("pty"), role: "The Service Provider", name: "Seedwel Studio Limited", company: "Seedwel Studio Limited", address: "Plot 24, Thabo Mbeki Road\nLusaka, Zambia", email: "hello@seedwelstudio.com", signatory: "Chanda Mwale" },
          { id: uid("pty"), role: "The Client", name: "Mulanje Coffee Roasters Limited", company: "Mulanje Coffee Roasters Limited", address: "Stand 22, Great East Road\nLusaka, Zambia", email: "ruth@mulanjecoffee.zm", signatory: "Ruth Sakala" },
        ],
        clauses: [
          { id: uid("cls"), heading: "Services", body: "The Service Provider will deliver the scope described in quotation QT-2026-020, including three concepts, two rounds of revisions per deliverable and final print-ready artwork." },
          { id: uid("cls"), heading: "Fees and payment", body: "Fees total ZMW 25,900 exclusive of VAT. A 50% deposit is payable on signature and the balance on final artwork handover. Invoices are payable within 14 days." },
          { id: uid("cls"), heading: "Client responsibilities", body: "The Client will provide brand assets, product information and timely feedback within five working days of each presentation to keep the schedule on track." },
          { id: uid("cls"), heading: "Confidentiality", body: "Both parties will keep commercial information disclosed during the engagement confidential for three years after completion." },
          { id: uid("cls"), heading: "Governing law", body: "This agreement is governed by the laws of the Republic of Zambia and the parties submit to the jurisdiction of the Zambian courts." },
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-po-009",
      kind: "purchase-order",
      number: "PO-2026-009",
      title: "Studio equipment order — Kitwe office",
      status: "sent",
      businessId: studio.id,
      clientName: "TechHub Supplies Ltd",
      currency: "ZMW",
      createdDaysAgo: 8,
      updatedDaysAgo: 8,
      dueInDays: 10,
      templateId: "po-modern-01",
      tags: ["hardware", "office"],
      payload: {
        ...blankPayload("purchase-order"),
        title: "PURCHASE ORDER",
        subject: "Workstations and monitors for the Kitwe delivery team",
        reference: "REQ-KTW-2026-14",
        clientName: "TechHub Supplies Ltd",
        clientCompany: "TechHub Supplies Ltd",
        clientEmail: "orders@techhubsupplies.zm",
        clientPhone: "+260 96 220 4477",
        clientAddress: "Nkana Road\nKitwe, Zambia",
        deliveryAddress: "Seedwel Studio, 2nd Floor Mpelembe House\nKitwe, Zambia\nAttention: Joseph Zulu",
        currency: "ZMW",
        taxRate: 16,
        taxLabel: "VAT",
        paymentMethod: "30 days from invoice",
        notes: "Deliveries accepted between 09:00 and 15:00 on weekdays. Please include calibration certificates with monitors.",
        terms: "Goods must match the stated specification. Substitutions require prior written approval.",
        items: [
          line("Workstation — 32 GB RAM, 1 TB NVMe", 3, 18500, "unit", "Three-year on-site warranty", 16),
          line("27-inch 4K colour-accurate monitor", 6, 6200, "unit", "Factory-calibrated, sRGB 99%", 16),
          line("Ergonomic desk and chair set", 3, 4800, "set", undefined, 16),
        ],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-dn-012",
      kind: "delivery-note",
      number: "DN-2026-012",
      title: "Dispatch — Copperbelt Retail signage",
      status: "final",
      businessId: studio.id,
      clientName: "Peter Nkumbula",
      currency: "ZMW",
      createdDaysAgo: 6,
      updatedDaysAgo: 6,
      templateId: "dn-modern-01",
      tags: ["dispatch"],
      payload: {
        ...blankPayload("delivery-note"),
        title: "DELIVERY NOTE",
        poNumber: "PO-2026-009",
        clientName: "Peter Nkumbula",
        clientCompany: "Copperbelt Retail Group",
        clientPhone: "+260 96 774 2210",
        clientAddress: "Unit 8, President Avenue\nKitwe, Zambia",
        deliveryAddress: "Copperbelt Retail Group, Unit 8 President Avenue\nKitwe, Zambia\nReceiving bay, weekdays 08:00–14:00",
        driverName: "Martin Chola",
        vehicleNumber: "BAX 4471 ZM",
        receivedBy: "",
        currency: "ZMW",
        notes: "Six signboards packed individually. Two units require glass handling — please inspect before signing.",
        items: [
          { id: uid("itm"), description: "Illuminated shopfront signboard", detail: "1200 × 600 mm, warm white LED", qty: 4, unit: "unit", rate: 3400, taxRate: 0, discount: 0 },
          { id: uid("itm"), description: "A1 poster frames with acrylic fronts", detail: "Wall-mounted, brushed aluminium", qty: 8, unit: "frame", rate: 620, taxRate: 0, discount: 0 },
          { id: uid("itm"), description: "Installation toolkit and spare fixings", qty: 1, unit: "kit", rate: 480, taxRate: 0, discount: 0 },
        ],
      },
    }),
    buildDoc(ownerId, trust, {
      id: "doc-cert-003",
      kind: "certificate",
      number: "CERT-2026-003",
      title: "Certificate of completion — Enterprise bootcamp",
      status: "final",
      businessId: trust.id,
      clientName: "Grace Banda",
      currency: "ZMW",
      createdDaysAgo: 4,
      updatedDaysAgo: 4,
      templateId: "cert-modern-01",
      tags: ["training"],
      payload: {
        ...blankPayload("certificate"),
        title: "Certificate of Completion",
        recipient: "Grace Banda",
        award: "Youth Enterprise Bootcamp 2026",
        ceremonyDate: todayISO(),
        serial: "KSF-2026-0142",
        description:
          "for successfully completing the eight-week Youth Enterprise Bootcamp, including digital trading, bookkeeping and customer service modules, and for presenting a business plan judged both viable and well costed by the panel.",
        signatories: ["Mary Tembo, Executive Director", "Daniel Mulenga, Programme Manager"],
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-bc-001",
      kind: "business-card",
      number: "BC-2026-001",
      title: "Business cards — Chanda Mwale",
      status: "final",
      businessId: studio.id,
      clientName: "Chanda Mwale",
      currency: "ZMW",
      createdDaysAgo: 28,
      updatedDaysAgo: 28,
      templateId: "card-corporate-01",
      tags: ["stationery"],
      payload: {
        ...blankPayload("business-card"),
        fullName: "Chanda Mwale",
        headline: "Managing Consultant",
        companyName: "Seedwel Studio",
        tagline: "Design, software and business systems",
        email: "chanda@seedwelstudio.com",
        phone: "+260 97 452 1180",
        website: "seedwelstudio.com",
        linkedin: "linkedin.com/in/chandamwale",
        location: "Plot 24, Thabo Mbeki Road, Lusaka",
      },
    }),
    buildDoc(ownerId, studio, {
      id: "doc-rpt-002",
      kind: "report",
      number: "RPT-2026-002",
      title: "Quarterly performance report — Q1 2026",
      status: "final",
      businessId: studio.id,
      clientName: "Internal",
      currency: "ZMW",
      createdDaysAgo: 12,
      updatedDaysAgo: 12,
      templateId: "report-modern-01",
      tags: ["internal", "finance"],
      payload: {
        ...blankPayload("report"),
        title: "Quarterly Performance Report",
        periodStart: addDaysISO(-90),
        periodEnd: addDaysISO(0),
        preparedFor: "Seedwel Studio partners",
        preparedBy: "Chanda Mwale, Managing Consultant",
        intro:
          "The first quarter closed above plan on revenue and slightly behind on new business. Retainer income now covers 61% of fixed costs, which materially reduces the cash-flow risk we flagged in January. Two delivery risks need attention: the Kitwe office fit-out is two weeks late, and one project is waiting on client content.",
        about:
          "Figures are drawn from the studio accounting system and reconciled against bank statements on 31 March. Project margins are calculated after direct costs and contractor time. Pipeline values are weighted by stage probability.",
        metrics: [
          { id: uid("mtr"), value: "K386K", label: "Revenue for the quarter" },
          { id: uid("mtr"), value: "42%", label: "Gross margin" },
          { id: uid("mtr"), value: "61%", label: "Retainer coverage of fixed costs" },
          { id: uid("mtr"), value: "17", label: "Active projects" },
        ],
        sections: [
          { id: uid("sec"), heading: "Commercial performance", body: "Revenue reached K386,400 against a plan of K360,000. Branding work contributed 34% and software delivery 48%, with training making up the balance. Average project value rose to K22,700 following the decision to decline three small fixed-scope jobs and focus on retainers." },
          { id: uid("sec"), heading: "Delivery", body: "Sixteen of seventeen projects shipped on schedule. The exception, Copperbelt Retail signage, slipped by nine days due to a supplier delay in imported acrylic; the client was informed in advance and agreed a revised date. No project failed acceptance testing." },
          { id: uid("sec"), heading: "Cash and receivables", body: "Overdue receivables stand at K36,300, of which K29,800 is more than 60 days old. A structured reminder sequence and deposits on new projects reduced average collection time from 51 to 38 days during the quarter." },
          { id: uid("sec"), heading: "People", body: "Two engineers joined the Kitwe team and the analyst role remains open. Staff retention is 100% for the quarter. Internal training hours averaged 5.2 hours per person, ahead of the 4-hour target." },
        ],
        conclusion:
          "Maintain the retainer-first sales approach, introduce a 40% deposit on all new project work, and resolve the Kitwe fit-out before the end of April. Pricing on software delivery should rise by 8% from July to protect margin against contractor cost increases.",
      },
    }),
  ];

  return docs;
};

export const demoActivity = (ownerId: string): ActivityLog[] => {
  const entries: Array<[ActivityLog["action"], string | undefined, string | undefined, string, number]> = [
    ["document.created", "doc-inv-015", "INV-2026-015", "Created invoice for Copperbelt Retail Group", 0.4],
    ["document.exported", "doc-qt-021", "QT-2026-021", "Exported quotation as PDF", 0.6],
    ["ai.generated", "doc-prop-007", "PROP-2026-007", "Generated proposal executive summary", 0.9],
    ["document.shared", "doc-inv-014", "INV-2026-014", "Shared invoice link with Zambezi Logistics", 1.2],
    ["document.updated", "doc-rpt-002", "RPT-2026-002", "Updated quarterly performance report", 1.6],
    ["business.updated", "biz-seedwel-studio", "Seedwel Studio", "Added bank details to Seedwel Studio profile", 2.1],
    ["document.created", "doc-dn-012", "DN-2026-012", "Created delivery note for Copperbelt Retail", 2.6],
    ["template.applied", "doc-rct-042", "RCT-2026-042", "Applied the Aurora receipt template", 3.4],
    ["document.exported", "doc-cv-chanda", "CV-2026-001", "Exported CV as Word document", 4.2],
    ["ai.generated", "doc-cl-001", "CL-2026-001", "Generated cover letter body paragraphs", 5.1],
    ["document.created", "doc-cert-003", "CERT-2026-003", "Issued certificate to Grace Banda", 6.3],
    ["settings.updated", undefined, undefined, "Switched on invoice payment reminders", 7.8],
    ["auth.signin", undefined, undefined, "Signed in from Lusaka, Zambia", 9.5],
    ["document.duplicated", "doc-inv-016", "KSF-2026-006", "Duplicated sponsorship invoice", 12.4],
    ["subscription.updated", undefined, undefined, "Upgraded to the Professional plan", 21.0],
  ];
  return entries.map(([action, entityId, entityName, detail, days], i) => ({
    id: `act-${i}`,
    ownerId,
    action,
    entityId,
    entityName,
    detail,
    createdAt: daysAgo(days),
  }));
};

export const demoSubscription = (ownerId: string): Subscription => ({
  id: "sub-demo",
  ownerId,
  plan: "professional",
  status: "active",
  seats: 1,
  interval: "monthly",
  startedAt: daysAgo(21),
  renewsAt: now + 9 * DAY,
  amount: 12,
  currency: "USD",
  paymentMethod: { brand: "Visa", last4: "4242", expiry: "08/28" },
});

export const demoInvoices = (ownerId: string): InvoiceRecord[] => [
  { id: "sinv-1", ownerId, number: "SEO-2026-0312", date: daysAgo(21), amount: 12, currency: "USD", status: "paid", plan: "Professional · monthly", period: "12 Mar – 11 Apr 2026" },
  { id: "sinv-2", ownerId, number: "SEO-2026-0281", date: daysAgo(51), amount: 12, currency: "USD", status: "paid", plan: "Professional · monthly", period: "11 Feb – 11 Mar 2026" },
  { id: "sinv-3", ownerId, number: "SEO-2026-0244", date: daysAgo(82), amount: 0, currency: "USD", status: "paid", plan: "Starter · trial", period: "Free trial" },
];

export const demoSettings = (): UserSettings => ({
  theme: "system",
  accent: "#0e908f",
  density: "comfortable",
  language: "en",
  dateFormat: "dd MMM yyyy",
  currency: "ZMW",
  numberFormat: "comma",
  emailUpdates: true,
  productNews: false,
  invoiceReminders: true,
  paymentAlerts: true,
  weeklyDigest: true,
  twoFactor: false,
  sessionAlerts: true,
  autoSave: true,
  defaultTemplate: {},
  onboardingDone: false,
});

export const demoNotifications = (ownerId: string): AppNotification[] => [
  { id: "ntf-1", ownerId, title: "Invoice 90 days overdue", body: "INV-2026-013 for Ndola Schools Trust is now 14 days past due.", tone: "warning", href: "/app/documents/doc-inv-013", read: false, createdAt: daysAgo(0.2) },
  { id: "ntf-2", ownerId, title: "Quotation accepted", body: "Mulanje Coffee Roasters accepted QT-2026-020.", tone: "success", href: "/app/documents/doc-qt-020", read: false, createdAt: daysAgo(1.1) },
  { id: "ntf-3", ownerId, title: "Payment recorded", body: "Copperbelt Retail Group paid K14,152.00 against INV-2026-015.", tone: "success", href: "/app/documents/doc-inv-015", read: true, createdAt: daysAgo(4.4) },
  { id: "ntf-4", ownerId, title: "New template library", body: "Twenty new receipt designs are now available in your library.", tone: "info", href: "/app/templates", read: true, createdAt: daysAgo(9.2) },
];

export interface Workspace {
  user: AppUser;
  businesses: BusinessProfile[];
  documents: DocumentRecord[];
  activity: ActivityLog[];
  settings: UserSettings;
  subscription: Subscription;
  invoices: InvoiceRecord[];
  notifications: AppNotification[];
}

export const buildDemoWorkspace = (ownerId = DEMO_USER.uid, name = DEMO_USER.displayName, email = DEMO_USER.email): Workspace => {
  const user: AppUser = { ...DEMO_USER, uid: ownerId, displayName: name, email };
  return {
    user,
    businesses: demoBusinesses(ownerId),
    documents: demoDocuments(ownerId),
    activity: demoActivity(ownerId),
    settings: demoSettings(),
    subscription: demoSubscription(ownerId),
    invoices: demoInvoices(ownerId),
    notifications: demoNotifications(ownerId),
  };
};

/** Storage estimate used by the dashboard meter, in bytes. */
export const workspaceBytes = (workspace: Workspace): number => {
  let bytes = 0;
  for (const doc of workspace.documents) bytes += JSON.stringify(doc).length;
  for (const biz of workspace.businesses) bytes += JSON.stringify(biz).length;
  return bytes;
};

export const documentRevenue = (docs: DocumentRecord[]): { invoiced: number; collected: number; outstanding: number } => {
  let invoiced = 0;
  let collected = 0;
  for (const doc of docs) {
    if (doc.kind !== "invoice") continue;
    const items = doc.payload.items ?? [];
    const subtotal = items.reduce((acc, i) => acc + i.qty * i.rate, 0);
    const discount = doc.payload.discountType === "percent" ? (subtotal * (doc.payload.discountValue ?? 0)) / 100 : doc.payload.discountValue ?? 0;
    const taxable = Math.max(0, subtotal - discount);
    const total = round2(taxable + (taxable * (doc.payload.taxRate ?? 0)) / 100 + (doc.payload.shipping ?? 0));
    invoiced += total;
    collected += doc.payload.amountPaid ?? 0;
  }
  return { invoiced: round2(invoiced), collected: round2(collected), outstanding: round2(Math.max(0, invoiced - collected)) };
};

export const nextNumberFor = (kind: DocKind, docs: DocumentRecord[], prefix?: string): string => nextDocNumber(docs, kind, prefix);
