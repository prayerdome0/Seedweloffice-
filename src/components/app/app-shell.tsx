"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity, BadgeCheck, Bell, Building2, ChevronRight, CreditCard, FileStack, FolderOpen, HardDrive, LayoutDashboard,
  LifeBuoy, LogOut, Menu, Moon, PenLine, Plus, Search, Settings, Sparkles, Sun, SunMoon, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useWorkspace, useUnreadCount } from "@/store/workspace";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, Badge, Button, ButtonLink, Dropdown, MenuItem, MenuLabel, Skeleton } from "@/components/ui";
import { CommandPalette } from "./command-palette";
import { QuickCreate } from "./quick-create";
import { cn, greeting, relativeTime, truncate } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: "unread";
}

const NAV_PRIMARY: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
  { href: "/app/documents", label: "Documents", icon: <FolderOpen size={17} /> },
  { href: "/app/templates", label: "Templates", icon: <FileStack size={17} /> },
  { href: "/app/assist", label: "Writing assistant", icon: <Sparkles size={17} /> },
];

const NAV_MANAGE: NavItem[] = [
  { href: "/app/businesses", label: "Business profiles", icon: <Building2 size={17} /> },
  { href: "/app/activity", label: "Activity", icon: <Activity size={17} /> },
  { href: "/app/storage", label: "Storage & usage", icon: <HardDrive size={17} /> },
  { href: "/app/subscription", label: "Subscription", icon: <CreditCard size={17} /> },
  { href: "/app/settings", label: "Settings", icon: <Settings size={17} /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const status = useWorkspace((s) => s.status);
  const syncError = useWorkspace((s) => s.error);
  const businesses = useWorkspace((s) => s.businesses);
  const documents = useWorkspace((s) => s.documents);
  const notifications = useWorkspace((s) => s.notifications);
  const markRead = useWorkspace((s) => s.markNotificationsRead);
  const dismiss = useWorkspace((s) => s.dismissNotification);
  const unread = useUnreadCount();
  const { mode, setMode, resolved } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [quickCreate, setQuickCreate] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/sign-in?next=${encodeURIComponent(pathname || "/app")}`);
  }, [ready, user, router, pathname]);

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "n" && (event.metaKey || event.ctrlKey) && event.shiftKey) {
        event.preventDefault();
        setQuickCreate(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const recent = useMemo(
    () => [...documents].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [documents],
  );

  const loading = !ready || (user && status === "loading");
  const activeBusiness = businesses.find((b) => b.isDefault) ?? businesses[0];

  if (ready && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-fg-muted">
          <Skeleton width={220} height={14} />
          <span className="text-[0.8125rem]">Taking you to sign in…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--canvas)" }}>
      {/* Sidebar — desktop */}
      <aside
        className="no-print sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col lg:flex"
        style={{ background: "var(--sidebar)", color: "var(--sidebar-fg)" }}
      >
        <SidebarContent
          pathname={pathname}
          unread={unread}
          businessName={activeBusiness?.name}
          onNavigate={() => undefined}
          onCommand={() => setPalette(true)}
        />
      </aside>

      {/* Drawer — mobile */}
      {drawer ? (
        <div className="no-print fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0" style={{ background: "var(--scrim)" }} onClick={() => setDrawer(false)} />
          <div className="animate-slide-in-right absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col" style={{ background: "var(--sidebar)", color: "var(--sidebar-fg)" }}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-white/40">Menu</span>
              <button type="button" className="btn btn-ghost btn-icon btn-sm text-white/70" onClick={() => setDrawer(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              unread={unread}
              businessName={activeBusiness?.name}
              onNavigate={() => setDrawer(false)}
              onCommand={() => {
                setDrawer(false);
                setPalette(true);
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="no-print sticky top-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "var(--glass)", backdropFilter: "saturate(180%) blur(14px)" }}>
          <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-3 py-2.5 sm:px-5">
            <button type="button" className="btn btn-ghost btn-icon lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>

            <button
              type="button"
              onClick={() => setPalette(true)}
              className="hidden h-9 flex-1 items-center gap-2 rounded-xl border px-3 text-left text-[0.8125rem] text-fg-subtle transition-colors hover:border-[var(--border-strong)] sm:flex sm:max-w-md"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Search size={15} />
              <span className="flex-1 truncate">Search documents, clients, templates…</span>
              <span className="kbd hidden sm:inline">⌘K</span>
            </button>

            <Link href="/app" className="flex items-center gap-2 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mark.svg" alt={APP_NAME} width={28} height={28} />
              <span className="text-[0.875rem] font-semibold tracking-tight text-fg">{APP_NAME}</span>
            </Link>

            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="brand"
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => setQuickCreate(true)}
                className="hidden sm:inline-flex"
              >
                New
              </Button>
              <Button variant="brand" size="icon" className="sm:hidden" onClick={() => setQuickCreate(true)} aria-label="New document">
                <Plus size={17} />
              </Button>

              <Dropdown
                width={340}
                trigger={({ toggle }) => (
                  <button type="button" onClick={toggle} className="btn btn-ghost btn-icon relative" aria-label="Notifications">
                    <Bell size={18} />
                    {unread ? (
                      <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold text-white" style={{ background: "#dc2626" }}>
                        {unread}
                      </span>
                    ) : null}
                  </button>
                )}
              >
                {(close) => (
                  <div className="max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-fg-subtle">Notifications</span>
                      {unread ? (
                        <button type="button" className="text-[0.6875rem] font-semibold text-[var(--brand)]" onClick={() => markRead()}>
                          Mark all read
                        </button>
                      ) : null}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[0.8125rem] text-fg-muted">You are all caught up.</p>
                    ) : (
                      notifications.slice(0, 6).map((item) => (
                        <div key={item.id} className="group flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-[var(--surface-3)]">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: item.read ? "var(--border-strong)" : item.tone === "warning" ? "#b45309" : item.tone === "success" ? "#047857" : "var(--brand)" }}
                          />
                          <Link href={item.href ?? "/app/activity"} className="min-w-0 flex-1" onClick={close}>
                            <div className="text-[0.8125rem] font-semibold text-fg">{item.title}</div>
                            <div className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{truncate(item.body, 96)}</div>
                            <div className="mt-1 text-[0.6875rem] text-fg-subtle">{relativeTime(item.createdAt)}</div>
                          </Link>
                          <button
                            type="button"
                            onClick={() => dismiss(item.id)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Dismiss notification"
                          >
                            <X size={13} className="text-fg-subtle" />
                          </button>
                        </div>
                      ))
                    )}
                    <div className="border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
                      <Link href="/app/activity" className="text-[0.75rem] font-semibold text-[var(--brand)]" onClick={close}>
                        View all activity
                      </Link>
                    </div>
                  </div>
                )}
              </Dropdown>

              <button
                type="button"
                onClick={() => setMode(mode === "light" ? "dark" : mode === "dark" ? "system" : "light")}
                className="btn btn-ghost btn-icon"
                aria-label={`Theme: ${mode}. Switch theme`}
                title={`Theme: ${mode}`}
              >
                {mode === "system" ? <SunMoon size={18} /> : resolved === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Dropdown
                width={252}
                trigger={({ toggle }) => (
                  <button type="button" onClick={toggle} className="flex items-center gap-2 rounded-xl px-1 py-1 transition-colors hover:bg-[var(--surface-3)]" aria-label="Account menu">
                    <Avatar name={user?.displayName} email={user?.email} size={32} src={user?.photoURL ? String(user.photoURL) : undefined} />
                  </button>
                )}
              >
                {(close) => (
                  <div>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <Avatar name={user?.displayName} email={user?.email} size={38} src={user?.photoURL ? String(user.photoURL) : undefined} />
                      <div className="min-w-0">
                        <div className="truncate text-[0.8125rem] font-semibold text-fg">{user?.displayName}</div>
                        <div className="truncate text-[0.75rem] text-fg-muted">{user?.email}</div>
                      </div>
                    </div>
                    <div className="divider my-1.5" />
                    <MenuItem icon={<Settings size={15} />} href="/app/settings" onClick={close}>
                      Settings
                    </MenuItem>
                    <MenuItem icon={<Building2 size={15} />} href="/app/businesses" onClick={close}>
                      Business profiles
                    </MenuItem>
                    <MenuItem icon={<CreditCard size={15} />} href="/app/subscription" onClick={close}>
                      Plan & billing
                    </MenuItem>
                    <MenuItem icon={<LifeBuoy size={15} />} href="/contact" onClick={close}>
                      Help & support
                    </MenuItem>
                    <div className="divider my-1.5" />
                    <MenuItem
                      icon={<LogOut size={15} />}
                      tone="danger"
                      onClick={async () => {
                        close();
                        await signOut();
                        router.replace("/");
                      }}
                    >
                      Sign out
                    </MenuItem>
                  </div>
                )}
              </Dropdown>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-3 pb-24 pt-4 sm:px-5 sm:pb-10 sm:pt-6">
          {syncError && <div role="alert" className="mb-4 rounded-xl border border-red-400 bg-red-50 p-4 text-sm text-red-900">Your data could not be synced: {syncError}. Check your connection and reload before continuing.</div>}
          {loading ? <ShellSkeleton /> : status === "error" ? null : children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t lg:hidden" style={{ borderColor: "var(--border)", background: "var(--glass)", backdropFilter: "saturate(180%) blur(14px)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {[
              { href: "/app", label: "Home", icon: <LayoutDashboard size={19} /> },
              { href: "/app/documents", label: "Docs", icon: <FolderOpen size={19} /> },
              { href: "/app/templates", label: "Designs", icon: <FileStack size={19} /> },
              { href: "/app/assist", label: "Write", icon: <PenLine size={19} /> },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-semibold" style={{ color: active ? "var(--brand)" : "var(--fg-subtle)" }}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button type="button" onClick={() => setDrawer(true)} className="flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-semibold" style={{ color: "var(--fg-subtle)" }}>
              <Menu size={19} />
              More
            </button>
          </div>
        </nav>
      </div>

      <CommandPalette
        open={palette}
        onClose={() => setPalette(false)}
        onNew={() => {
          setPalette(false);
          setQuickCreate(true);
        }}
      />
      <QuickCreate open={quickCreate} onClose={() => setQuickCreate(false)} />
    </div>
  );
}

function SidebarContent({
  pathname,
  unread,
  businessName,
  onNavigate,
  onCommand,
}: {
  pathname: string;
  unread: number;
  businessName?: string;
  onNavigate: () => void;
  onCommand: () => void;
}) {
  const { user, cloud } = useAuth();
  return (
    <>
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark-mono-white.svg" alt="" width={32} height={32} />
        <div className="min-w-0">
          <div className="truncate text-[0.9375rem] font-semibold tracking-tight text-white">{APP_NAME}</div>
          <div className="truncate text-[0.6875rem] uppercase tracking-[0.16em] text-white/40">{businessName ?? "No profile yet"}</div>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onCommand}
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[0.8125rem] text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
        >
          <Search size={15} />
          <span className="flex-1">Search…</span>
          <span className="rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[0.625rem]">⌘K</span>
        </button>
      </div>

      <nav className="mt-5 flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          <SidebarLabel>Workspace</SidebarLabel>
          {NAV_PRIMARY.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} unread={unread} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="space-y-0.5">
          <SidebarLabel>Manage</SidebarLabel>
          {user?.role === "admin" && <SidebarLink item={{ href: "/app/admin", label: "Admin dashboard", icon: <LayoutDashboard size={17} /> }} active={pathname.startsWith("/app/admin")} unread={0} onNavigate={onNavigate} />}
          {NAV_MANAGE.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} unread={unread} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-white">
            <BadgeCheck size={15} style={{ color: "#71e6dd" }} />
            {cloud ? "Cloud sync on" : "Service unavailable"}
          </div>
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-white/50">
            {cloud
              ? "Your documents sync across every device you sign in on."
              : "Firebase is required. Contact the site administrator."}
          </p>
          {!cloud ? (
            <Link href="/app/settings#sync" onClick={onNavigate} className="mt-2 inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-[#71e6dd]">
              Service configuration <ChevronRight size={12} />
            </Link>
          ) : null}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1 py-1">
          <Avatar name={user?.displayName} email={user?.email} size={34} src={user?.photoURL ? String(user.photoURL) : undefined} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.8125rem] font-semibold text-white">{user?.displayName}</div>
            <div className="truncate text-[0.6875rem] text-white/45">{user?.email}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pb-1.5 pt-1 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-white/35">{children}</div>;
}

function SidebarLink({ item, active, unread, onNavigate }: { item: NavItem; active: boolean; unread: number; onNavigate: () => void }) {
  return (
    <Link href={item.href} data-active={active} className="nav-link" onClick={onNavigate}>
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge === "unread" && unread ? (
        <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">{unread}</span>
      ) : null}
    </Link>
  );
}

function ShellSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={28} width={220} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={104} className="rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton height={320} className="rounded-2xl lg:col-span-2" />
        <Skeleton height={320} className="rounded-2xl" />
      </div>
      <p className="text-center text-[0.8125rem] text-fg-subtle">Loading your workspace…</p>
    </div>
  );
}

export { greeting };
