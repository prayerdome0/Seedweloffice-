"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastTone = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push(toast) {
    const id = toast.id ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set({ toasts: [...get().toasts, { ...toast, id }].slice(-4) });
    const duration = toast.duration ?? (toast.tone === "error" ? 6500 : 4200);
    if (duration > 0 && typeof window !== "undefined") window.setTimeout(() => get().dismiss(id), duration);
    return id;
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
  clear() {
    set({ toasts: [] });
  },
}));

export const toast = {
  success: (title: string, description?: string, action?: Toast["action"]) => useToasts.getState().push({ title, description, tone: "success", action }),
  error: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: "error" }),
  info: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: "info" }),
  warning: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: "warning" }),
  raw: (t: Omit<Toast, "id">) => useToasts.getState().push(t),
};

const icons: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={17} />,
  error: <XCircle size={17} />,
  info: <Info size={17} />,
  warning: <AlertTriangle size={17} />,
};

const tones: Record<ToastTone, string> = {
  success: "#047857",
  error: "#b91c1c",
  info: "#0369a1",
  warning: "#b45309",
};

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  useEffect(() => {
    if (!toasts.length) return;
  }, [toasts.length]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:items-end sm:p-0">
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className="animate-slide-in-right pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-[var(--shadow-lift)]"
          style={{ borderColor: "var(--border)", borderLeft: `3px solid ${tones[item.tone]}` }}
        >
          <span className="mt-0.5 shrink-0" style={{ color: tones[item.tone] }}>
            {icons[item.tone]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.8125rem] font-semibold text-fg">{item.title}</div>
            {item.description ? <div className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{item.description}</div> : null}
            {item.action ? (
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
                className="mt-2 text-[0.75rem] font-semibold text-[var(--brand)] underline decoration-from-font underline-offset-2"
              >
                {item.action.label}
              </button>
            ) : null}
          </div>
          <button type="button" onClick={() => dismiss(item.id)} className="btn btn-ghost btn-icon btn-sm shrink-0" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
