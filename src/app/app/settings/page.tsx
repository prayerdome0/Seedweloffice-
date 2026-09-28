"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, Check, Cloud, Database, Globe, KeyRound, Moon, Palette, RefreshCw, Save, ShieldCheck, Smartphone, Sun, SunMoon, Trash2, User,
} from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, Segmented, SectionHeader, Select, Switch } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/components/providers/theme-provider";
import { ACCENTS } from "@/lib/theme";
import { COUNTRIES, CURRENCIES, DATE_FORMATS, LANGUAGES, TIMEZONES, docKindMeta, DOC_KINDS } from "@/lib/constants";
import { TEMPLATES } from "@/templates";
import { formatBytes, relativeTime } from "@/lib/utils";
import { hasPushConfig } from "@/lib/config";
import { disablePush, enablePush, isPushEnabled, isPushSupported } from "@/lib/firebase-messaging";
import type { ThemeMode } from "@/lib/theme";
import type { UserSettings } from "@/lib/types";

type Section = "profile" | "appearance" | "documents" | "notifications" | "security" | "sync" | "data";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "appearance", label: "Appearance" },
  { value: "documents", label: "Document defaults" },
  { value: "notifications", label: "Notifications" },
  { value: "security", label: "Security" },
  { value: "sync", label: "Cloud sync" },
  { value: "data", label: "Your data" },
];

export default function SettingsPage() {
  const { user, cloud, updateUser, resendVerification, sendReset } = useAuth();
  const settings = useWorkspace((s) => s.settings);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const updateProfile = useWorkspace((s) => s.updateProfile);
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const subscription = useWorkspace((s) => s.subscription);
  const { mode, setMode, accentId, setAccentId } = useTheme();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState({
    displayName: user?.displayName ?? "",
    jobTitle: user?.jobTitle ?? "",
    phone: user?.phone ?? "",
    country: user?.country ?? "Zambia",
    timezone: user?.timezone ?? "Africa/Lusaka",
    language: user?.language ?? "en",
  });
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [push, setPush] = useState({ supported: false, configured: true, blocked: false, enabled: false, busy: false, checked: false });

  useEffect(() => {
    let alive = true;
    void (async () => {
      const supported = await isPushSupported();
      const permission = typeof Notification !== "undefined" ? Notification.permission : "denied";
      if (!alive) return;
      setPush({
        supported,
        configured: hasPushConfig(),
        blocked: permission === "denied",
        enabled: supported && isPushEnabled(),
        busy: false,
        checked: true,
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handlePushToggle = async (value: boolean) => {
    if (value) {
      setPush((p) => ({ ...p, busy: true }));
      const result = await enablePush(user?.uid);
      if (result.ok) {
        toast.success("Push notifications on", "Due-date reminders and payment alerts will reach this device.");
        setPush((p) => ({ ...p, enabled: true, blocked: false, busy: false }));
      } else if (result.reason === "denied") {
        toast.error("Notifications are blocked", "Allow notifications for this site in your browser settings, then try again.");
        setPush((p) => ({ ...p, enabled: false, blocked: true, busy: false }));
      } else if (result.reason === "unsupported") {
        setPush((p) => ({ ...p, supported: false, busy: false }));
      } else if (result.reason === "unconfigured") {
        setPush((p) => ({ ...p, configured: false, busy: false }));
      } else {
        toast.error("Couldn't turn on push", result.message ?? "");
        setPush((p) => ({ ...p, busy: false }));
      }
      return;
    }

    setPush((p) => ({ ...p, busy: true }));
    await disablePush();
    toast.info("Push notifications off", "This device will no longer receive web push.");
    setPush((p) => ({ ...p, enabled: false, busy: false }));
  };

  const pushDescription = !push.checked
    ? "Checking whether this device can receive web push…"
    : !push.configured
      ? "Add the Firebase web config and VAPID key to enable device push."
      : !push.supported
        ? "Not connected can't receive web push notifications."
        : push.enabled
          ? "On — reminders, payment alerts and sign-in notices arrive on this device."
          : push.blocked
            ? "Blocked — allow notifications for this site in your browser settings, then toggle again."
            : "Off — turn on to get reminders and alerts even when the tab is closed.";

  useEffect(() => {
    if (!user) return;
    setProfile({
      displayName: user.displayName ?? "",
      jobTitle: user.jobTitle ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "Zambia",
      timezone: user.timezone ?? "Africa/Lusaka",
      language: user.language ?? "en",
    });
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#sync") setSection("sync");
  }, []);

  const saveProfile = () => {
    updateUser(profile);
    updateProfile(profile);
    toast.success("Profile updated");
  };

  const exportData = () => {
    const payload = { exportedAt: new Date().toISOString(), user, settings, subscription, businesses, documents };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `seedwel-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Export started", "Your full workspace is in the download.");
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Settings</h1>
        <p className="mt-1 text-[0.875rem] text-fg-muted">Profile, appearance, document defaults and everything about your data.</p>
      </header>

      <div className="no-scrollbar overflow-x-auto">
        <Segmented value={section} onChange={setSection} options={SECTIONS} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {section === "profile" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Your profile" description="Shown across the app and used as the signatory fallback." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <Input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} />
                </Field>
                <Field label="Email">
                  <Input value={user?.email ?? ""} readOnly />
                </Field>
                <Field label="Job title">
                  <Input value={profile.jobTitle} placeholder="e.g. Managing Consultant" onChange={(event) => setProfile({ ...profile, jobTitle: event.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                </Field>
                <Field label="Country">
                  <Select value={profile.country} onChange={(event) => setProfile({ ...profile, country: event.target.value, timezone: TIMEZONES.includes(profile.timezone) ? profile.timezone : "Africa/Lusaka" })}>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Timezone" help="Used for dates, reminders and activity logs.">
                  <Select value={profile.timezone} onChange={(event) => setProfile({ ...profile, timezone: event.target.value })}>
                    {TIMEZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Language">
                  <Select value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}>
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="brand" icon={<Save size={15} />} onClick={saveProfile}>
                  Save profile
                </Button>
              </div>
            </Card>
          ) : null}

          {section === "appearance" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Appearance" description="Light, dark or follow your device. The accent colour carries into every document." />
              <div className="mt-4">
                <span className="label">Theme</span>
                <div className="mt-2">
                  <Segmented
                    value={mode}
                    onChange={(value: ThemeMode) => {
                      setMode(value);
                      updateSettings({ theme: value });
                    }}
                    options={[
                      { value: "light", label: "Light", icon: <Sun size={14} /> },
                      { value: "dark", label: "Dark", icon: <Moon size={14} /> },
                      { value: "system", label: "System", icon: <SunMoon size={14} /> },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-5">
                <span className="label">Accent colour</span>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ACCENTS.map((accent) => {
                    const active = accentId === accent.id;
                    return (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => {
                          setAccentId(accent.id);
                          updateSettings({ accent: accent.hex });
                        }}
                        className="flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all"
                        style={{ borderColor: active ? "var(--brand)" : "var(--border)", background: "var(--surface)" }}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: accent.hex }}>
                          {active ? <Check size={13} color="#fff" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[0.75rem] font-semibold text-fg">{accent.name}</span>
                          <span className="block truncate text-[0.625rem] text-fg-subtle">{accent.note}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <Field label="Interface density">
                  <Segmented
                    value={settings.density}
                    onChange={(value) => updateSettings({ density: value })}
                    options={[
                      { value: "comfortable", label: "Comfortable" },
                      { value: "compact", label: "Compact" },
                    ]}
                  />
                </Field>
                <Switch checked={settings.autoSave} onChange={(value) => updateSettings({ autoSave: value })} label="Autosave as I type" description="Documents save about a second after you stop typing." />
              </div>
            </Card>
          ) : null}

          {section === "documents" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Document defaults" description="Applied to every new document you create." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Default currency">
                  <Select value={settings.currency} onChange={(event) => updateSettings({ currency: event.target.value })}>
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} — {currency.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date format">
                  <Select value={settings.dateFormat} onChange={(event) => updateSettings({ dateFormat: event.target.value })}>
                    {DATE_FORMATS.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Number formatting">
                  <Segmented
                    value={settings.numberFormat}
                    onChange={(value) => updateSettings({ numberFormat: value })}
                    options={[
                      { value: "comma", label: "1,234.56" },
                      { value: "space", label: "1 234,56" },
                      { value: "none", label: "1234.56" },
                    ]}
                  />
                </Field>
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <span className="label">Preferred design per module</span>
                <p className="mb-3 mt-0.5 text-[0.75rem] text-fg-muted">New documents open with this design already applied.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DOC_KINDS.map((kind) => (
                    <Field key={kind.kind} label={kind.label}>
                      <Select
                        value={settings.defaultTemplate?.[kind.kind] ?? ""}
                        onChange={(event) =>
                          updateSettings({
                            defaultTemplate: { ...settings.defaultTemplate, [kind.kind]: event.target.value || undefined },
                          } as Partial<UserSettings>)
                        }
                      >
                        <option value="">Use the recommended design</option>
                        {TEMPLATES[kind.kind].map((design) => (
                          <option key={design.id} value={design.id}>
                            {design.name} · {design.category}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ))}
                </div>
                <p className="mt-3 text-[0.75rem] text-fg-subtle">
                  Tip: pick exact designs from the{" "}
                  <Link href="/app/templates" className="font-semibold text-[var(--brand)]">
                    template library
                  </Link>
                  , where you can preview every layout and set it as the default in one tap.
                </p>
              </div>
            </Card>
          ) : null}

          {section === "notifications" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Notifications" description="Choose what deserves your attention." />
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)" }}>
                  <Switch
                    checked={push.enabled}
                    disabled={push.busy || !push.supported || !push.configured}
                    onChange={handlePushToggle}
                    label="Push on this device"
                    description={pushDescription}
                  />
                </div>
                <Switch checked={settings.invoiceReminders} onChange={(value) => updateSettings({ invoiceReminders: value })} label="Invoice reminders" description="Alerts when an invoice passes its due date." />
                <Switch checked={settings.paymentAlerts} onChange={(value) => updateSettings({ paymentAlerts: value })} label="Payment alerts" description="Confirmation when a payment is recorded against an invoice." />
                <Switch checked={settings.emailUpdates} onChange={(value) => updateSettings({ emailUpdates: value })} label="Email updates" description="Account and security messages by email." />
                <Switch checked={settings.weeklyDigest} onChange={(value) => updateSettings({ weeklyDigest: value })} label="Weekly digest" description="A Monday summary of documents sent, paid and overdue." />
                <Switch checked={settings.productNews} onChange={(value) => updateSettings({ productNews: value })} label="Product news" description="Occasional messages about new templates and features." />
              </div>
            </Card>
          ) : null}

          {section === "security" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Security" description="Protect your workspace and your clients' information." />
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} style={{ color: "var(--brand)" }} className="mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
                        Email verification
                        {user?.emailVerified ? <Badge tone="success" dot>Verified</Badge> : <Badge tone="warning" dot>Pending</Badge>}
                      </div>
                      <p className="mt-0.5 text-[0.75rem] text-fg-muted">
                        {cloud ? "Verified accounts can reset passwords and receive payment alerts." : "Local workspaces are verified automatically — there is no email service connected."}
                      </p>
                    </div>
                  </div>
                  {cloud && !user?.emailVerified ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const result = await resendVerification();
                        (result.ok ? toast.success : toast.error)(result.ok ? "Verification email sent" : "Could not send", result.message);
                      }}
                    >
                      Resend verification
                    </Button>
                  ) : null}
                </div>

                <Switch checked={settings.twoFactor} onChange={(value) => updateSettings({ twoFactor: value })} label="Two-step verification" description="Ask for a code from your phone alongside your password." />
                <Switch checked={settings.sessionAlerts} onChange={(value) => updateSettings({ sessionAlerts: value })} label="New sign-in alerts" description="Tell me when my account is used on a new device." />

                <div className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
                    <KeyRound size={16} /> Password
                  </div>
                  <p className="mt-1 text-[0.75rem] text-fg-muted">
                    {cloud
                      ? "We will email you a secure link to choose a new password."
                      : "This workspace keeps accounts in this browser only. Signing out and creating a new workspace resets access."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2.5"
                    onClick={async () => {
                      const result = await sendReset(user?.email ?? "");
                      (result.ok ? toast.success : toast.info)("Password reset", result.message ?? "");
                    }}
                  >
                    Send reset link
                  </Button>
                </div>

                <div className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
                    <Smartphone size={16} /> Devices
                  </div>
                  <p className="mt-1 text-[0.75rem] text-fg-muted">
                    Last sign-in {user?.lastLoginAt ? relativeTime(user.lastLoginAt) : "just now"} from your current device.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {section === "sync" ? (
            <Card className="p-4 sm:p-5" >
              <SectionHeader title="Cloud sync" description="Keep your documents safe and available on every device." />
              <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: cloud ? "color-mix(in oklab, var(--brand) 7%, var(--surface))" : "var(--surface-2)" }}>
                <div className="flex items-start gap-3">
                  {cloud ? <Cloud size={18} style={{ color: "var(--brand)" }} className="mt-0.5" /> : <Database size={18} className="mt-0.5 text-fg-subtle" />}
                  <div>
                    <div className="flex items-center gap-2 text-[0.9375rem] font-semibold text-fg">
                      {cloud ? "Cloud sync is active" : "Service unavailable"}
                      <Badge tone={cloud ? "success" : "neutral"}>{cloud ? "Firestore" : "Not connected"}</Badge>
                    </div>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-muted">
                      {cloud
                        ? "Every document, profile and preference syncs to your Firebase project. Sign in on any device to pick up where you left off."
                        : "Firebase is required. Sign-in and document storage are unavailable until configured."}
                    </p>
                    {!cloud ? (
                      <div className="mt-3 space-y-2 text-[0.8125rem] text-fg-muted">
                        <p className="font-semibold text-fg">To turn on cloud sync</p>
                        <ol className="ml-4 list-decimal space-y-1">
                          <li>Create a Firebase project and enable Email/Password and Google sign-in.</li>
                          <li>Add the six <code className="kbd">NEXT_PUBLIC_FIREBASE_*</code> variables to your environment.</li>
                          <li>Redeploy. Signing in then syncs everything automatically.</li>
                        </ol>
                        <p className="text-[0.75rem] text-fg-subtle">
                          No document data is stored locally while the service is unconfigured.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {section === "data" ? (
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Your data" description="Export, reset or remove everything in this workspace." />
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <Globe size={17} className="mt-0.5 text-fg-subtle" />
                    <div>
                      <div className="text-[0.875rem] font-semibold text-fg">Export everything</div>
                      <p className="mt-0.5 text-[0.75rem] text-fg-muted">A single JSON file with every document, profile and setting.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    Download JSON
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5" style={{ borderColor: "color-mix(in oklab, #b91c1c 30%, var(--border))" }}>
                  <div className="flex items-start gap-3">
                    <Trash2 size={17} className="mt-0.5" style={{ color: "#b91c1c" }} />
                    <div>
                      <div className="text-[0.875rem] font-semibold text-fg">Delete all documents</div>
                      <p className="mt-0.5 text-[0.75rem] text-fg-muted">Removes every document in this workspace. Business profiles and settings stay.</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setConfirmWipe(true)}>
                    Delete documents
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionHeader title="Workspace at a glance" />
            <dl className="mt-3 space-y-2 text-[0.8125rem]">
              <Line label="Documents" value={String(documents.length)} />
              <Line label="Business profiles" value={String(businesses.length)} />
              <Line label="Plan" value={subscription.plan} />
              <Line label="Storage" value={formatBytes(documents.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0))} />
              <Line label="Sync" value={cloud ? "Cloud" : "Not connected"} />
              <Line label="Theme" value={mode} />
            </dl>
          </Card>

          <Card className="p-4">
            <SectionHeader title="Shortcuts" description="Work faster with the keyboard." />
            <ul className="mt-3 space-y-2 text-[0.8125rem] text-fg-muted">
              {[
                ["Open search", "⌘ K"],
                ["New document", "⌘ ⇧ N"],
                ["Print current document", "⌘ P"],
              ].map(([label, keys]) => (
                <li key={label} className="flex items-center justify-between gap-2">
                  <span>{label}</span>
                  <span className="kbd">{keys}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Palette size={16} style={{ color: "var(--brand)" }} />
              <h2 className="text-[0.9375rem] font-semibold text-fg">Need a hand?</h2>
            </div>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">
              Our team answers support requests within one working day, and we are happy to help set up your branding.
            </p>
            <Link href="/contact" className="btn btn-outline btn-sm mt-3 w-full">
              Contact support
            </Link>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-fg-subtle" />
              <h2 className="text-[0.9375rem] font-semibold text-fg">Modules in this plan</h2>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {DOC_KINDS.map((kind) => (
                <Badge key={kind.kind} tone="neutral">
                  {docKindMeta(kind.kind).label}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[0.75rem] text-fg-subtle">
              <User size={13} /> Signed in as {user?.email}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="Delete every document?"
        description="This cannot be undone. Consider exporting your workspace first."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                documents.forEach((doc) => useWorkspace.getState().deleteDocument(doc.id));
                setConfirmWipe(false);
                toast.success("All documents deleted");
              }}
            >
              Delete everything
            </Button>
          </>
        }
      />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="font-semibold capitalize text-fg">{value}</dd>
    </div>
  );
}
