/**
 * Seedwel Office — brand asset generator.
 *
 * Source of truth: the vector geometry below (identical to public/brand/mark.svg).
 * Running `npm run brand` regenerates every logo variation, app icon, favicon and
 * social image so the identity can never drift out of sync.
 *
 * Usage: npm run brand
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { PNG } from "pngjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "public", "brand");
const iconDir = path.join(root, "public", "icons");
const fontDir = path.join(root, "src", "assets", "fonts");

/* ── Vector geometry (48 × 48 grid) ──────────────────────────────────────── */
const PAGE = "M12.5 3.5h17L44 17.5V40a5 5 0 0 1-5 5H12.5a5 5 0 0 1-5-5V8.5a5 5 0 0 1 5-5z";
const FLAP = "M29.5 3.5 44 17.5H33.5a4 4 0 0 1-4-4V3.5z";
const STEM = "M25 40.5V20.5";
const LEAF_R = "M26.6 21.6c0-7.2 5.3-11.9 13.6-13 0 7.9-5.4 12.7-13.6 13z";
const LEAF_L = "M23.4 27c0-6.6-4.8-10.9-12.6-11.9 0 7.1 4.6 11.4 12.6 11.9z";

const NAVY = "#0F1C33";
const WHITE = "#FFFFFF";
const GOLD = "#FBC53C";

const FONT_STACK =
  "Inter, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const grad = (id, from, to, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>`;

/** Full-colour glyph: teal document with folded corner, white + gold sprout. */
function glyphColor(prefix, { page = ["#2BD5CD", "#0B6E70"], leaf = ["#FFFFFF", "#D9FCF6"], gold = GOLD } = {}) {
  return {
    defs: grad(`${prefix}-page`, page[0], page[1]) + grad(`${prefix}-leaf`, leaf[0], leaf[1]),
    body: `
    <path d="${PAGE}" fill="url(#${prefix}-page)"/>
    <path d="${FLAP}" fill="#0A6062"/>
    <path d="${STEM}" stroke="url(#${prefix}-leaf)" stroke-width="3.2" stroke-linecap="round"/>
    <path d="${LEAF_R}" fill="url(#${prefix}-leaf)"/>
    <path d="${LEAF_L}" fill="${gold}"/>`,
  };
}

/** Single-colour glyph (embroidery / stamp / watermark friendly). */
function glyphMono(color, opacity = 1) {
  return {
    defs: "",
    body: `
    <path d="${PAGE}" fill="none" stroke="${color}" stroke-width="3.1" stroke-linejoin="round" stroke-opacity="${opacity}"/>
    <path d="${FLAP}" fill="${color}" fill-opacity="${0.3 * opacity}"/>
    <path d="${STEM}" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-opacity="${opacity}"/>
    <path d="${LEAF_R}" fill="${color}" fill-opacity="${opacity}"/>
    <path d="${LEAF_L}" fill="${color}" fill-opacity="${0.55 * opacity}"/>`,
  };
}

const svg = (w, h, inner, { title = "Seedwel Office" } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">${inner}</svg>`;

/* ── Variations ──────────────────────────────────────────────────────────── */
const tiled = (size, radius, glyphScale, bg) => `
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#tile-bg)"/>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#tile-glow)"/>
  <rect x="${size * 0.004}" y="${size * 0.004}" width="${size * 0.992}" height="${size * 0.992}" rx="${radius * 0.97}"
        fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="${size * 0.006}"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${((size / 48) * glyphScale).toFixed(4)}) translate(-24 -24)">
    ${glyphColor("ic").body}
  </g>`;

const iconDefs = (prefix, stops) =>
  grad(`${prefix}-bg`, stops[0], stops[1], 0, 0, 1, 1) +
  `<radialGradient id="${prefix}-glow" cx="0.26" cy="0.04" r="0.9">
      <stop offset="0" stop-color="#38D0C9" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#38D0C9" stop-opacity="0"/>
    </radialGradient>` +
  grad(`${prefix}-page`, "#2BD5CD", "#0B6E70", 14, 10, 52, 56) +
  grad(`${prefix}-leaf`, "#FFFFFF", "#D9FCF6");

const roundedSquareIcon = (size, { radius = size * 0.23, glyphScale = 0.74, glow = true } = {}) =>
  svg(
    size,
    size,
    `<defs>${iconDefs("ic", ["#17223C", "#07101F"])}</defs>` +
      `<rect width="${size}" height="${size}" fill="url(#ic-bg)"/>` +
      (glow ? `<rect width="${size}" height="${size}" fill="url(#ic-glow)"/>` : "") +
      `<rect x="${size * 0.003}" y="${size * 0.003}" width="${size * 0.994}" height="${size * 0.994}" rx="${radius}"
        fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="${size * 0.006}"/>` +
      `<g transform="translate(${size / 2} ${size / 2}) scale(${((size / 48) * glyphScale).toFixed(4)}) translate(-24 -24)">
        ${glyphColor("ic").body}
      </g>`,
    { title: "Seedwel Office" }
  );

const transparentGlyph = (size, color, opacity = 1) =>
  svg(
    size,
    size,
    `<defs>${glyphMono(color, opacity).defs}</defs>${glyphMono(color, opacity).body}`,
    { title: "Seedwel Office mark" }
  );

const markColor = (size = 256) =>
  svg(size, size, `<defs>${glyphColor("mk").defs}</defs>${glyphColor("mk").body}`, {
    title: "Seedwel Office mark",
  });

/**
 * Horizontal lockup: mark + "Seedwel Office" wordmark in one text run, so the
 * gap between the two words is correct regardless of the renderer's metrics.
 * Rendered oversized on purpose — the raster step crops it tight.
 */
function horizontalLockup({ titleColor = NAVY, subColor = "#536A93", mark = 104, fontSize = 64 } = {}) {
  const gap = Math.round(mark * 0.26);
  const height = mark + 8;
  const width = Math.round(mark + gap + fontSize * 9.6);
  return svg(
    width,
    height,
    `<defs>${glyphColor("lk").defs}</defs>
     <g transform="translate(4 ${(height - mark) / 2}) scale(${mark / 48})">${glyphColor("lk").body}</g>
     <text x="${mark + gap}" y="${height / 2 + fontSize * 0.35}" font-family="${FONT_STACK}" font-size="${fontSize}"
           font-weight="700" letter-spacing="-0.035em" fill="${titleColor}">Seedwel<tspan
           font-weight="400" letter-spacing="-0.03em" fill="${subColor}" dx="${fontSize * 0.3}">Office</tspan></text>`,
    { title: "Seedwel Office" }
  );
}

function stackedLockup({ titleColor = NAVY, subColor = "#536A93" } = {}) {
  return svg(
    360,
    240,
    `<defs>${glyphColor("st").defs}</defs>
     <g transform="translate(148 20) scale(1.35)">${glyphColor("st").body}</g>
     <text x="180" y="160" text-anchor="middle" font-family="${FONT_STACK}" font-size="42" font-weight="700" letter-spacing="-0.03em" fill="${titleColor}">Seedwel</text>
     <text x="180" y="196" text-anchor="middle" font-family="${FONT_STACK}" font-size="24" font-weight="400" letter-spacing="0.22em" fill="${subColor}">OFFICE</text>`,
    { title: "Seedwel Office" }
  );
}

/* ── Rasterise ───────────────────────────────────────────────────────────── */
const fonts = fs
  .readdirSync(fontDir)
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => path.join(fontDir, f));

function render(svgString, width, background) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Inter" },
    background: background ?? "rgba(0,0,0,0)",
  });
  return Buffer.from(resvg.render().asPng());
}

/* ── Write SVGs ──────────────────────────────────────────────────────────── */
fs.mkdirSync(brandDir, { recursive: true });
fs.mkdirSync(iconDir, { recursive: true });

const svgs = {
  "mark.svg": markColor(256),
  "app-icon.svg": roundedSquareIcon(512),
  "favicon.svg": roundedSquareIcon(64, { glyphScale: 0.86 }),
  "mark-mono-navy.svg": transparentGlyph(256, NAVY),
  "mark-mono-white.svg": transparentGlyph(256, WHITE),
  "logo-full.svg": horizontalLockup({ titleColor: NAVY, subColor: "#536A93" }),
  "logo-full-dark.svg": horizontalLockup({ titleColor: WHITE, subColor: "#A7B7D3" }),
  "logo-stacked.svg": stackedLockup(),
  "logo-stacked-dark.svg": stackedLockup({ titleColor: WHITE, subColor: "#A7B7D3" }),
  "logo-transparent.svg": transparentGlyph(256, WHITE),
  "logo-mono.svg": transparentGlyph(256, NAVY),
};

for (const [name, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(brandDir, name), content + "\n");
}

/**
 * Rewrites a lockup SVG so its viewBox hugs the artwork exactly: the file is
 * rasterised at high resolution, the ink bounds are measured, and the viewBox
 * is offset and resized to match. Logos never ship with ragged whitespace.
 */
function tightenSvgFile(name, renderWidth = 1600) {
  const file = path.join(brandDir, name);
  const source = fs.readFileSync(file, "utf8");
  const opening = source.slice(0, source.indexOf(">") + 1);
  const vb = /viewBox="([\d.\- ]+)"/.exec(opening);
  const [vx, vy, vw, vh] = vb[1].trim().split(/\s+/).map(Number);
  const bounds = trim(render(source, renderWidth), 0);
  const pxPerUnit = renderWidth / vw;
  const w = +(bounds.width / pxPerUnit).toFixed(2);
  const h = +(bounds.height / pxPerUnit).toFixed(2);
  const minX = +(vx + bounds.left / pxPerUnit).toFixed(2);
  const minY = +(vy + bounds.top / pxPerUnit).toFixed(2);
  const header = opening
    .replace(/viewBox="[^"]*"/, `viewBox="${minX} ${minY} ${w} ${h}"`)
    .replace(/width="[^"]*"/, `width="${w}"`)
    .replace(/height="[^"]*"/, `height="${h}"`);
  fs.writeFileSync(file, header + source.slice(opening.length) + "\n");
  return { w, h, minX, minY };
}

for (const name of [
  "logo-full.svg",
  "logo-full-dark.svg",
  "logo-stacked.svg",
  "logo-stacked-dark.svg",
  "logo-transparent.svg",
  "logo-mono.svg",
  "mark.svg",
  "mark-mono-navy.svg",
  "mark-mono-white.svg",
]) {
  tightenSvgFile(name, name.startsWith("logo") ? 1600 : 800);
}

const png = (name, buffer) => {
  fs.writeFileSync(path.join(brandDir, name), buffer);
  return buffer;
};

const iconPng = (name, buffer) => {
  fs.writeFileSync(path.join(iconDir, name), buffer);
  return buffer;
};

const appIcon = roundedSquareIcon(1024);
const maskable = roundedSquareIcon(1024, { radius: 0, glyphScale: 0.56, glow: false });

png("mark-512.png", render(markColor(512), 512));
png("logo-full.png", trim(render(horizontalLockup(), 1440), 8).data);
png("logo-full-dark.png", trim(render(horizontalLockup({ titleColor: WHITE, subColor: "#A7B7D3" }), 1440), 8).data);
png("logo-stacked.png", trim(render(stackedLockup(), 1080), 12).data);
png("logo-stacked-dark.png", trim(render(stackedLockup({ titleColor: WHITE, subColor: "#A7B7D3" }), 1080), 12).data);

iconPng("icon-192.png", render(appIcon, 192));
iconPng("icon-512.png", render(appIcon, 512));
iconPng("icon-maskable-192.png", render(maskable, 192));
iconPng("icon-maskable-512.png", render(maskable, 512));
iconPng("apple-touch-icon.png", render(appIcon, 180));
iconPng("icon-1024.png", render(appIcon, 1024));

/* ── PNG trim (vector text metrics differ from browser line boxes) ──────── */
/**
 * Crops a uniform background to the content bounds (plus `pad`).
 * SVG text metrics differ per renderer, so every lockup is tightly cropped
 * instead of hand-guessed — logos must never carry ragged whitespace.
 */
function trim(buffer, pad = 0) {
  const img = PNG.sync.read(buffer);
  const { width: w, height: h, data } = img;
  const stride = w << 2;
  const isBg = (x, y) => {
    const i = y * stride + (x << 2);
    return data[i + 3] < 14;
  };
  let top = h, left = w, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isBg(x, y)) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (bottom < 0) return { data: buffer, width: w, height: h, left: 0, top: 0 };
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  bottom = Math.min(h - 1, bottom + pad);
  right = Math.min(w - 1, right + pad);
  const nw = right - left + 1;
  const nh = bottom - top + 1;
  const out = new PNG({ width: nw, height: nh });
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const si = ((y + top) * w + (x + left)) << 2;
      const di = (y * nw + x) << 2;
      out.data[di] = data[si];
      out.data[di + 1] = data[si + 1];
      out.data[di + 2] = data[si + 2];
      out.data[di + 3] = data[si + 3];
    }
  }
  return { data: PNG.sync.write(out), width: nw, height: nh, left, top };
}

/* ── favicon.ico (PNG-in-ICO container, 16 / 32 / 48) ────────────────────── */
const faviconSvg = roundedSquareIcon(64, { glyphScale: 0.86, radius: 15 });
const icoSizes = [16, 32, 48];
const images = icoSizes.map((s) => ({ size: s, data: render(faviconSvg, s) }));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map(({ size, data }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0);
  e.writeUInt8(size === 256 ? 0 : size, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});
fs.writeFileSync(
  path.join(root, "public", "favicon.ico"),
  Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
);

/* ── Open Graph / social card (1200 × 630) ───────────────────────────────── */
const og = svg(
  1200,
  630,
  `<defs>
    ${grad("og-bg", "#101B2F", "#050C18", 0, 0, 1, 1)}
    <radialGradient id="og-teal" cx="0.18" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#23C9C2" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#23C9C2" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="og-gold" cx="0.92" cy="0.9" r="0.6">
      <stop offset="0" stop-color="#F0A90E" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#F0A90E" stop-opacity="0"/>
    </radialGradient>
    ${grad("og-line", "#1E3A5F", "#132A45")}
    ${glyphColor("og", {}).defs}
  </defs>
  <rect width="1200" height="630" fill="url(#og-bg)"/>
  <rect width="1200" height="630" fill="url(#og-teal)"/>
  <rect width="1200" height="630" fill="url(#og-gold)"/>
  <g transform="translate(84 96)">
    <g transform="scale(1.5)">${glyphColor("og").body}</g>
    <text x="104" y="46" font-family="${FONT_STACK}" font-size="46" font-weight="700" letter-spacing="-0.03em" fill="#FFFFFF">Seedwel</text>
    <text x="292" y="46" font-family="${FONT_STACK}" font-size="46" font-weight="400" fill="#8FA3C0">Office</text>
  </g>
  <text x="84" y="268" font-family="${FONT_STACK}" font-size="72" font-weight="700" letter-spacing="-0.035em" fill="#FFFFFF">Business documents,</text>
  <text x="84" y="352" font-family="${FONT_STACK}" font-size="72" font-weight="700" letter-spacing="-0.035em" fill="#2BD5CD">beautifully done.</text>
  <text x="84" y="418" font-family="${FONT_STACK}" font-size="28" font-weight="400" fill="#93A6C2">Invoices · Quotations · Receipts · CVs · Proposals · Contracts</text>
  <g transform="translate(84 470)">
    <rect width="262" height="58" rx="14" fill="#12A5A2"/>
    <text x="131" y="37" text-anchor="middle" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="#FFFFFF">Start free — no card</text>
  </g>
  <g opacity="0.5">
    <rect x="700" y="120" width="416" height="270" rx="18" fill="#0D1A2C" stroke="#22355A"/>
    <rect x="736" y="164" width="150" height="18" rx="6" fill="#2BD5CD" opacity="0.85"/>
    <rect x="736" y="200" width="248" height="12" rx="6" fill="#2A3E60"/>
    <rect x="736" y="224" width="200" height="12" rx="6" fill="#2A3E60"/>
    <rect x="736" y="284" width="344" height="10" rx="5" fill="#22355A"/>
    <rect x="736" y="308" width="344" height="10" rx="5" fill="#22355A"/>
    <rect x="736" y="332" width="240" height="10" rx="5" fill="#22355A"/>
    <rect x="940" y="356" width="140" height="16" rx="8" fill="#F0A90E" opacity="0.8"/>
  </g>`,
  { title: "Seedwel Office" }
);
png("og-image.png", render(og, 1200));

/* ── Report ──────────────────────────────────────────────────────────────── */
const listing = [
  ...fs.readdirSync(brandDir).map((f) => `brand/${f}`),
  ...fs.readdirSync(iconDir).map((f) => `icons/${f}`),
  "favicon.ico",
];
console.log(`✓ brand assets generated — ${listing.length} files`);
for (const f of listing) console.log(`  public/${f}`);
