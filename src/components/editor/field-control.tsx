"use client";

import { Sparkles } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui";
import type { FieldDef } from "@/lib/documents/schema";
import { CURRENCIES, FONTS } from "@/lib/constants";

interface FieldControlProps {
  def: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  onAssist?: (def: FieldDef) => void;
}

/** One schema-driven form control. Shared by the editor and the business form. */
export function FieldControl({ def, value, onChange, onAssist }: FieldControlProps) {
  const label = (
    <>
      {def.label}
      {def.ai && onAssist ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onAssist(def);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold"
          style={{ color: "var(--brand)", background: "color-mix(in oklab, var(--brand) 12%, transparent)" }}
          title="Draft this with the writing assistant"
        >
          <Sparkles size={11} /> Write
        </button>
      ) : null}
    </>
  );

  const className = def.span === 2 ? "sm:col-span-2" : undefined;

  if (def.type === "tags") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <Field label={label} help={def.help ?? "One item per line — each becomes a bullet or tag in the document."} className={className}>
        <Textarea
          rows={def.rows ?? 5}
          value={list.join("\n")}
          placeholder={def.placeholder}
          onChange={(event) => onChange(event.target.value.split("\n").map((line) => line).filter((line, i, arr) => line.trim() !== "" || i === arr.length - 1))}
        />
      </Field>
    );
  }

  if (def.type === "textarea") {
    return (
      <Field label={label} help={def.help} className={className}>
        <Textarea
          rows={def.rows ?? 4}
          value={(value as string) ?? ""}
          placeholder={def.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
    );
  }

  if (def.type === "select") {
    const options =
      def.options?.length
        ? def.options
        : def.key === "currency"
          ? CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.label}` }))
          : def.key === "fontHeading" || def.key === "fontBody"
            ? FONTS.map((f) => ({ value: f.key, label: f.label }))
            : [];
    return (
      <Field label={label} help={def.help} className={className}>
        <Select value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)}>
          {!options.some((option) => option.value === value) ? <option value="">Not specified</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
    );
  }

  if (def.type === "number" || def.type === "money") {
    return (
      <Field label={label} help={def.help} className={className}>
        <Input
          type="number"
          inputMode="decimal"
          step={def.type === "money" ? "0.01" : "1"}
          value={value === undefined || value === null ? "" : String(value)}
          placeholder={def.placeholder}
          onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        />
      </Field>
    );
  }

  if (def.type === "switch") {
    return (
      <Field label={label} help={def.help} className={className}>
        <Select value={value ? "yes" : "no"} onChange={(event) => onChange(event.target.value === "yes")}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>
      </Field>
    );
  }

  return (
    <Field label={label} help={def.help} className={className}>
      <Input
        type={def.type === "email" ? "email" : def.type === "tel" ? "tel" : def.type === "date" ? "date" : def.type === "url" ? "url" : "text"}
        value={(value as string) ?? ""}
        placeholder={def.placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={def.type === "email" ? "email" : def.type === "tel" ? "tel" : "off"}
      />
    </Field>
  );
}
