import { shade, readableOn, withAlpha } from "./utils";

export type ThemeMode = "light" | "dark" | "system";

export interface AccentChoice {
  id: string;
  name: string;
  hex: string;
  /** Deep partner tone used for gradients and the "solid" surfaces. */
  deep: string;
  note: string;
}

/** Eight curated accents, each with a matching deep tone so gradients stay rich. */
export const ACCENTS: AccentChoice[] = [
  { id: "seedwel-teal", name: "Seedwel Teal", hex: "#0e908f", deep: "#107273", note: "The house colour — trustworthy and calm." },
  { id: "midnight-navy", name: "Midnight Navy", hex: "#1d4ed8", deep: "#1e3a8a", note: "Corporate and formal, ideal for contracts." },
  { id: "royal-violet", name: "Royal Violet", hex: "#7c3aed", deep: "#5b21b6", note: "Creative studios and design work." },
  { id: "rose-plum", name: "Rose Plum", hex: "#be185d", deep: "#831843", note: "Bold and distinctive for retail brands." },
  { id: "copper-gold", name: "Copper Gold", hex: "#b45309", deep: "#92400e", note: "Warm and premium — pairs with navy." },
  { id: "forest", name: "Forest Green", hex: "#047857", deep: "#065f46", note: "Agriculture, energy and sustainability." },
  { id: "sky-blue", name: "Sky Blue", hex: "#0369a1", deep: "#075985", note: "Logistics, healthcare and technology." },
  { id: "charcoal", name: "Charcoal", hex: "#334155", deep: "#1e293b", note: "Understated professional monochrome." },
];

export const accentById = (id: string): AccentChoice => ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];

export interface AccentTokens {
  brand: string;
  brandDeep: string;
  brandFg: string;
  ring: string;
  soft: string;
  mid: string;
  light: string;
}

/** CSS custom properties applied to <html> so every component follows the accent. */
export const accentTokens = (hex: string, dark: boolean): AccentTokens => {
  const brand = dark ? shade(hex, 0.22) : hex;
  const deep = dark ? shade(hex, 0.05) : shade(hex, -0.18);
  return {
    brand,
    brandDeep: deep,
    brandFg: readableOn(brand),
    ring: brand,
    soft: withAlpha(hex, 0.1),
    mid: shade(hex, dark ? 0.35 : -0.08),
    light: shade(hex, dark ? 0.55 : 0.4),
  };
};

export const applyAccent = (hex: string, dark: boolean): void => {
  if (typeof document === "undefined") return;
  const tokens = accentTokens(hex, dark);
  const root = document.documentElement;
  root.style.setProperty("--brand", tokens.brand);
  root.style.setProperty("--brand-fg", tokens.brandFg);
  root.style.setProperty("--ring", tokens.ring);
  root.style.setProperty("--color-brand-500", tokens.brand);
  root.style.setProperty("--color-brand-600", tokens.brandDeep);
  root.style.setProperty("--color-brand-700", shade(hex, dark ? -0.05 : -0.32));
  root.style.setProperty("--color-brand-400", tokens.light);
  root.style.setProperty("--color-brand-300", shade(hex, dark ? 0.65 : 0.55));
  root.style.setProperty("--accent-soft", tokens.soft);
};

export const THEME_KEY = "seedwel.theme";
export const ACCENT_KEY = "seedwel.accent";

/**
 * Inline script that prevents a flash of the wrong theme before hydration.
 *
 * The stored accent is an accent *id*, not a colour, so the map of ids to hex
 * values is embedded here — writing the raw id into `--brand` would produce an
 * invalid colour and the browser would ignore it. A legacy hex value (anything
 * starting with "#") is still honoured.
 */
export const themeBootstrapScript = (() => {
  const accentMap = Object.fromEntries(ACCENTS.map((accent) => [accent.id, accent.hex]));
  return `
(function(){
  try {
    var root = document.documentElement;
    var mode = localStorage.getItem('${THEME_KEY}') || 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) root.classList.add('dark');
    var accents = ${JSON.stringify(accentMap)};
    var stored = localStorage.getItem('${ACCENT_KEY}');
    var accent = stored && (stored.charAt(0) === '#' ? stored : accents[stored]);
    if (accent) {
      root.style.setProperty('--brand', accent);
      root.style.setProperty('--ring', accent);
      root.style.setProperty('--color-brand-500', accent);
      root.style.setProperty('--color-brand-600', accent);
    }
  } catch (e) {}
})();
`;
})();
