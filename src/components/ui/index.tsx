"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn, initials, titleCase } from "@/lib/utils";
import { AVATAR_COLORS, STATUS_META } from "@/lib/constants";
import type { DocStatus } from "@/lib/types";

/* ── Buttons ─────────────────────────────────────────────────────────────── */

export type ButtonVariant = "primary" | "brand" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  brand: "btn-brand",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizeClass: Record<ButtonSize, string> = { sm: "btn-sm", md: "", lg: "btn-lg", icon: "btn-icon" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", icon, trailingIcon, block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn("btn", variantClass[variant], sizeClass[size], block && "w-full", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]", className)}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export function ButtonLink({ href, variant = "primary", size = "md", icon, trailingIcon, block, className, children, ...rest }: ButtonLinkProps) {
  const classes = cn("btn", variantClass[variant], sizeClass[size], block && "w-full", className);
  if (/^(https?:|mailto:|tel:|#)/.test(href)) {
    return (
      <a href={href} className={classes} {...rest}>
        {icon}
        {children}
        {trailingIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {icon}
      {children}
      {trailingIcon}
    </Link>
  );
}

/* ── Surfaces ────────────────────────────────────────────────────────────── */

export function Card({ children, className, interactive, as: Tag = "div" }: { children: ReactNode; className?: string; interactive?: boolean; as?: "div" | "section" | "article" | "li" }) {
  return <Tag className={cn("card", interactive && "card-interactive", className)}>{children}</Tag>;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-fg sm:text-[1.0625rem]">{title}</h2>
        {description ? <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Badges ──────────────────────────────────────────────────────────────── */

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand" | "gold";

const toneStyles: Record<Tone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: "var(--surface-3)", fg: "var(--fg-muted)", border: "var(--border)" },
  info: { bg: "color-mix(in oklab, #0369a1 12%, var(--surface))", fg: "#0369a1", border: "color-mix(in oklab, #0369a1 26%, var(--border))" },
  success: { bg: "color-mix(in oklab, #047857 12%, var(--surface))", fg: "#047857", border: "color-mix(in oklab, #047857 26%, var(--border))" },
  warning: { bg: "color-mix(in oklab, #b45309 14%, var(--surface))", fg: "#b45309", border: "color-mix(in oklab, #b45309 28%, var(--border))" },
  danger: { bg: "color-mix(in oklab, #b91c1c 12%, var(--surface))", fg: "#b91c1c", border: "color-mix(in oklab, #b91c1c 26%, var(--border))" },
  brand: { bg: "color-mix(in oklab, var(--brand) 13%, var(--surface))", fg: "var(--brand)", border: "color-mix(in oklab, var(--brand) 30%, var(--border))" },
  gold: { bg: "color-mix(in oklab, var(--gold) 16%, var(--surface))", fg: "var(--gold)", border: "color-mix(in oklab, var(--gold) 32%, var(--border))" },
};

export function Badge({ children, tone = "neutral", className, dot }: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  const style = toneStyles[tone];
  return (
    <span
      className={cn("badge", className)}
      style={{ background: style.bg, color: style.fg, borderColor: style.border }}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: DocStatus; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <Badge tone={meta.tone} className={className} dot>
      {meta.label}
    </Badge>
  );
}

/* ── Form fields ─────────────────────────────────────────────────────────── */

export function Field({
  label,
  help,
  error,
  children,
  required,
  className,
  hint,
}: {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  required?: boolean;
  className?: string;
  hint?: ReactNode;
}) {
  return (
    <label className={cn("field", className)}>
      {label ? (
        <span className={cn("label flex items-center justify-between gap-2", required && "label-req")}>
          <span>{label}</span>
          {hint ? <span className="text-[0.6875rem] font-medium text-fg-subtle">{hint}</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="text-[0.75rem] font-medium text-[#b91c1c]">{error}</span> : help ? <span className="text-[0.75rem] text-fg-subtle">{help}</span> : null}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("textarea", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("select", className)} {...rest}>
      {children}
    </select>
  );
}

export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (next: boolean) => void; label?: ReactNode; description?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4", disabled && "pointer-events-none opacity-60")}>
      <span className="min-w-0">
        {label ? <span className="block text-[0.8125rem] font-semibold text-fg">{label}</span> : null}
        {description ? <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-fg-subtle">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors"
        style={{
          background: checked ? "var(--brand)" : "var(--surface-3)",
          borderColor: checked ? "var(--brand)" : "var(--border-strong)",
        }}
      >
        <span
          className="absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all"
          style={{ left: checked ? 24 : 3, width: 18, height: 18 }}
        />
      </button>
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options, size = "md" }: { value: T; onChange: (next: T) => void; options: { value: T; label: ReactNode; icon?: ReactNode }[]; size?: "sm" | "md" }) {
  return (
    <div className="segmented no-scrollbar max-w-full overflow-x-auto">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-active={option.value === value}
          onClick={() => onChange(option.value)}
          className={size === "sm" ? "!px-2.5 !py-1 !text-[0.75rem]" : undefined}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ── Overlays ────────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "center",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "center" | "sheet";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = ref.current?.querySelector<HTMLElement>("input, textarea, select, button, [href], [tabindex]:not([tabindex='-1'])");
    window.setTimeout(() => focusable?.focus({ preventScroll: true }), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  const sheet = variant === "sheet";

  return (
    <div className="fixed inset-0 z-[80] flex overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        style={{ background: "var(--scrim)", backdropFilter: "blur(2px)" }}
      />
      <div
        className={cn(
          "relative z-10 m-auto w-full",
          sheet ? "mt-auto sm:m-auto" : "",
          widths[size],
        )}
        style={{ padding: "max(0.75rem, env(safe-area-inset-left))" }}
      >
        <div
          ref={ref}
          className={cn("animate-scale-in overflow-hidden rounded-2xl border bg-surface shadow-[var(--shadow-lift)]", sheet && "rounded-b-none sm:rounded-2xl")}
          style={{ borderColor: "var(--border)" }}
        >
          {title ? (
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <h2 id={titleId} className="text-[1rem] font-semibold tracking-tight text-fg">{title}</h2>
                {description ? <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-muted">{description}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm shrink-0" aria-label="Close">
                <X size={16} />
              </button>
            </div>
          ) : null}
          {children ? <div className="px-5 py-4">{children}</div> : null}
          {footer ? (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-4" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  width = 232,
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  width?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open ? (
        <div
          className="animate-scale-in absolute z-50 mt-2 overflow-hidden rounded-xl border bg-surface py-1.5 shadow-[var(--shadow-lift)]"
          style={{ borderColor: "var(--border)", width, [align === "right" ? "right" : "left"]: 0 }}
          role="menu"
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  children,
  icon,
  onClick,
  href,
  tone = "default",
  disabled,
  trailing,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  trailing?: ReactNode;
}) {
  const classes = cn(
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors",
    disabled ? "cursor-not-allowed opacity-50" : "hover:bg-[var(--surface-3)]",
  );
  const body = (
    <>
      <span className="shrink-0 text-fg-subtle">{icon}</span>
      <span className="min-w-0 flex-1 truncate" style={{ color: tone === "danger" ? "#b91c1c" : "var(--fg)" }}>{children}</span>
      {trailing}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={classes} role="menuitem" onClick={onClick}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" className={classes} onClick={onClick} disabled={disabled}>
      {body}
    </button>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pb-1 pt-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-fg-subtle">{children}</div>;
}

/* ── Feedback ────────────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-10" : "px-6 py-16")}>
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--brand)" }}>
          {icon}
        </div>
      ) : null}
      <h3 className="text-[0.9375rem] font-semibold text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-fg-muted">{description}</p> : null}
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export function Skeleton({ className, height = 16, width }: { className?: string; height?: number | string; width?: number | string }) {
  return <div className={cn("skeleton", className)} style={{ height, width }} />;
}

export function ProgressBar({ value, tone = "brand", height = 8, label }: { value: number; tone?: "brand" | "gold" | "danger" | "success"; height?: number; label?: string }) {
  const color = tone === "gold" ? "var(--gold)" : tone === "danger" ? "#dc2626" : tone === "success" ? "#047857" : "var(--brand)";
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: "var(--surface-3)" }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Avatar({ name, email, size = 36, src }: { name?: string; email?: string; size?: number; src?: string }) {
  const seed = name || email || "Seedwel";
  const color = AVATAR_COLORS[Math.abs(seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % AVATAR_COLORS.length];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(seed) || titleCase(seed).slice(0, 2)}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  trend,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  trend?: { direction: "up" | "down" | "flat"; value: string };
}) {
  const style = toneStyles[tone];
  return (
    <div className="card card-interactive p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-subtle">{label}</div>
          <div className="mt-1.5 text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">{value}</div>
          {hint ? <div className="mt-1 text-[0.75rem] text-fg-muted">{hint}</div> : null}
        </div>
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border" style={{ background: style.bg, color: style.fg, borderColor: style.border }}>
            {icon}
          </span>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-2.5 inline-flex items-center gap-1 text-[0.75rem] font-semibold" style={{ color: trend.direction === "down" ? "#b91c1c" : trend.direction === "up" ? "#047857" : "var(--fg-muted)" }}>
          {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "■"} {trend.value}
        </div>
      ) : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-fg">
      <span
        className="flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-colors"
        style={{ width: 18, height: 18, background: checked ? "var(--brand)" : "var(--surface)", borderColor: checked ? "var(--brand)" : "var(--border-strong)" }}
        onClick={() => onChange(!checked)}
      >
        {checked ? <Check size={12} color="#fff" /> : null}
      </span>
      <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

export function useControlledInput(initial = "") {
  const [value, setValue] = useState(initial);
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue(event.target.value);
  return { value, setValue, onChange };
}

export { ChevronDown };
