// Generates the SVG graphics for the GitHub profile README, one dark and one
// light variant of each, from Navo's own palette. No dependencies: the SVGs
// are strings, and the only things that move are SMIL animations, which run
// inside an <img> where GitHub puts them (no scripts, no external fonts).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`;

const THEMES = {
  dark: {
    bg: "#161513",
    border: "#2b2926",
    panel: "#1f1e1b",
    panelBorder: "#34322e",
    ink: "#fdfcfa",
    ink2: "#c9c6c1",
    muted: "#82807c",
    line: "#3d3b37",
    accent: "#7ccdd6",
    accentInk: "#a6e0e5",
    accentDeep: "#206f78",
    coral: "#f2a592",
    glowTeal: "#206f78",
    glowCoral: "#d98a80",
    glowOpacity: 0.34,
    rowFill: "#1f1e1b",
    chipFill: "#1f1e1b",
  },
  light: {
    bg: "#fdfcfa",
    border: "#e6e4e0",
    panel: "#ffffff",
    panelBorder: "#e6e4e0",
    ink: "#1f1e1b",
    ink2: "#4a4844",
    muted: "#82807c",
    line: "#d6d3ce",
    accent: "#206f78",
    accentInk: "#0d2e32",
    accentDeep: "#64bbc4",
    coral: "#d98a80",
    glowTeal: "#a6e0e5",
    glowCoral: "#f2a592",
    glowOpacity: 0.5,
    rowFill: "#ffffff",
    chipFill: "#ffffff",
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------------ Orbi */

/** Orbi, mood "hello": the same drawing as the app's component, stood still
 *  except for a float, a blink, and a wave every few seconds. */
function orbi(p, { x, y, scale, wave = true, blink = true, float = true }) {
  const g = (name) => `url(#${p}-${name})`;
  const tilt = -18;
  const eye = (cx) => `
    <ellipse cx="${cx + 1}" cy="94" rx="12" ry="12" fill="#0d2e32" opacity="0.22"/>
    <ellipse cx="${cx}" cy="92" rx="9" ry="9" fill="#1f1e1b"/>
    <ellipse cx="${cx}" cy="93" rx="6.7" ry="6.7" fill="${g("iris")}"/>
    <ellipse cx="${cx}" cy="93.5" rx="3.8" ry="3.8" fill="#0e0d0c"/>
    <ellipse cx="${cx - 3.1}" cy="88.8" rx="2.7" ry="2.7" fill="#ffffff" opacity="0.96"/>
    <circle cx="${cx + 3.2}" cy="95.6" r="1.1" fill="#ffffff" opacity="0.8"/>`;

  const floatAnim = float
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="4.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
    : "";
  const shadeAnim = float
    ? `<animate attributeName="rx" values="46;41;46" dur="4.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
    : "";
  const waveAnim = wave
    ? `<animateTransform attributeName="transform" type="rotate" values="0 48 84;0 48 84;20 48 84;-8 48 84;18 48 84;-4 48 84;0 48 84;0 48 84" keyTimes="0;0.08;0.15;0.22;0.29;0.36;0.42;1" dur="6.5s" begin="0.8s" repeatCount="indefinite"/>`
    : "";
  const blinkAnim = blink
    ? `<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.06;1 1;1 1" keyTimes="0;0.86;0.9;0.94;1" dur="5.3s" repeatCount="indefinite"/>`
    : "";

  return `
  <defs>
    <radialGradient id="${p}-body" cx="36%" cy="30%" r="78%">
      <stop offset="0" stop-color="#a6e0e5"/><stop offset="0.28" stop-color="#4fa9b3"/>
      <stop offset="0.68" stop-color="#206f78"/><stop offset="1" stop-color="#0d2e32"/>
    </radialGradient>
    <radialGradient id="${p}-rim" cx="100" cy="100" r="56" gradientUnits="userSpaceOnUse">
      <stop offset="0.8" stop-color="#7ccdd6" stop-opacity="0"/><stop offset="0.94" stop-color="#7ccdd6" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#a6e0e5" stop-opacity="0.55"/>
    </radialGradient>
    <radialGradient id="${p}-limb" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#5db3bc"/><stop offset="0.55" stop-color="#1f6b74"/><stop offset="1" stop-color="#0d2e32"/>
    </radialGradient>
    <radialGradient id="${p}-iris" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#3a8f99"/><stop offset="0.55" stop-color="#155056"/><stop offset="1" stop-color="#0a2226"/>
    </radialGradient>
    <radialGradient id="${p}-moon" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#c6ecf0"/><stop offset="0.5" stop-color="#64bbc4"/><stop offset="1" stop-color="#206f78"/>
    </radialGradient>
    <radialGradient id="${p}-cheek" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#f2a592" stop-opacity="0.78"/><stop offset="0.65" stop-color="#f2a592" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#f2a592" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}-spec" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.92"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#1f1e1b" stop-opacity="0.3"/><stop offset="0.6" stop-color="#1f1e1b" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#1f1e1b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${p}-ring" x1="20" y1="60" x2="180" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fdfcfa"/><stop offset="0.45" stop-color="#e6e4e0"/><stop offset="1" stop-color="#a8a5a0"/>
    </linearGradient>
    <linearGradient id="${p}-ringback" x1="20" y1="60" x2="180" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c9c6c1"/><stop offset="1" stop-color="#8f8c87"/>
    </linearGradient>
    <clipPath id="${p}-clip"><circle cx="100" cy="100" r="56"/></clipPath>
  </defs>
  <g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="100" cy="190" rx="46" ry="8" fill="${g("shadow")}">${shadeAnim}</ellipse>
    <g>${floatAnim}
      <g transform="rotate(${tilt} 100 106)">
        <ellipse cx="100" cy="106" rx="92" ry="30" fill="none" stroke="${g("ringback")}" stroke-width="14"/>
      </g>
      <ellipse cx="84" cy="158" rx="10.5" ry="6.5" fill="${g("limb")}"/>
      <ellipse cx="116" cy="158" rx="10.5" ry="6.5" fill="${g("limb")}"/>
      <ellipse cx="156" cy="112" rx="7" ry="11" fill="${g("limb")}" transform="rotate(-20 156 112)"/>
      <g>${waveAnim}
        <ellipse cx="37" cy="73" rx="7.5" ry="16" fill="${g("limb")}" transform="rotate(-45 37 73)"/>
      </g>
      <circle cx="100" cy="100" r="56" fill="${g("body")}"/>
      <path d="M155.8,104.9 A56,56 0 0 1 67.9,145.9 Q113,127.9 155.8,104.9 Z" fill="${g("rim")}"/>
      <ellipse cx="76" cy="70" rx="14" ry="20" fill="${g("spec")}" transform="rotate(30 76 70)"/>
      <circle cx="73" cy="62" r="3.6" fill="#ffffff" opacity="0.95"/>
      <g clip-path="url(#${p}-clip)">
        <g transform="rotate(${tilt} 100 106)">
          <path d="M8,106 A92,30 0 0 0 192,106" fill="none" stroke="#0b2a2e" stroke-width="22" stroke-opacity="0.3" transform="translate(0 6)"/>
          <path d="M8,106 A92,30 0 0 0 192,106" fill="none" stroke="#0b2a2e" stroke-width="12" stroke-opacity="0.22" transform="translate(0 3)"/>
        </g>
      </g>
      <g transform="rotate(${tilt} 100 106)">
        <path d="M8,106 A92,30 0 0 0 192,106" fill="none" stroke="${g("ring")}" stroke-width="14"/>
        <path d="M8,106 A92,30 0 0 0 192,106" fill="none" stroke="#82807c" stroke-width="3.5" stroke-opacity="0.6" transform="translate(0 5)"/>
        <path d="M8,106 A92,30 0 0 0 192,106" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.65" stroke-linecap="round" transform="translate(0 -4)"/>
        <circle cx="35.9" cy="129.2" r="7" fill="#1f1e1b" opacity="0.18"/>
        <circle cx="34.9" cy="127.2" r="6.5" fill="${g("moon")}"/>
        <circle cx="32.7" cy="124.8" r="1.6" fill="#ffffff" opacity="0.9"/>
      </g>
      <ellipse cx="66" cy="105" rx="9" ry="6" fill="${g("cheek")}"/>
      <ellipse cx="134" cy="105" rx="9" ry="6" fill="${g("cheek")}"/>
      <g transform="translate(100 93)"><g>${blinkAnim}<g transform="translate(-100 -93)">${eye(84)}${eye(116)}</g></g></g>
      <path d="M94,112 Q100,117 106,112" fill="none" stroke="#1f1e1b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>`;
}

/* ------------------------------------------------------------------ hero */

function hero(t) {
  const W = 1200;
  const H = 440;

  // Every channel, one list: three sources, three paths, one list.
  const sources = [
    { label: "new lead", y: 128, color: t.accent },
    { label: "text", y: 208, color: t.accent },
    { label: "missed call", y: 288, color: t.coral },
  ];
  const SX = 656; // source pill left
  const SW = 124; // source pill width
  const LX = 876; // list left
  const LW = 146; // list width
  const ROW_Y = [112, 160, 208, 256, 304];
  const ROW_H = 36;
  const ARRIVE = { x: LX, y: ROW_Y[0] + ROW_H / 2 };
  const CYCLE = 7.5;
  const TRAVEL = 2.3;

  const paths = sources
    .map((s, i) => {
      const x0 = SX + SW;
      const y0 = s.y + 17;
      const d = `M${x0},${y0} C${x0 + 50},${y0} ${ARRIVE.x - 52},${ARRIVE.y} ${ARRIVE.x},${ARRIVE.y}`;
      return `<path id="p${i}" d="${d}" fill="none" stroke="${t.line}" stroke-width="1.5"/>`;
    })
    .join("\n");

  const dots = sources
    .map((s, i) => {
      const begin = (i * CYCLE) / 3;
      const k = TRAVEL / CYCLE;
      const kt = `0;${k.toFixed(3)};1`;
      const op = `0;1;1;0;0`;
      const opt = `0;0.02;${(k - 0.02).toFixed(3)};${k.toFixed(3)};1`;
      return `
      <g opacity="0">
        <animate attributeName="opacity" values="${op}" keyTimes="${opt}" dur="${CYCLE}s" begin="${begin}s" repeatCount="indefinite"/>
        <animateMotion dur="${CYCLE}s" begin="${begin}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="${kt}" calcMode="linear" rotate="none"><mpath href="#p${i}"/></animateMotion>
        <circle r="11" fill="${s.color}" opacity="0.22"/>
        <circle r="5" fill="${s.color}"/>
      </g>`;
    })
    .join("\n");

  // The top row lights up when a dot lands. One flash element per arrival,
  // because two animations on one attribute fight.
  const flashes = sources
    .map((s, i) => {
      const begin = (i * CYCLE) / 3 + TRAVEL;
      return `<rect x="${LX}" y="${ROW_Y[0]}" width="${LW}" height="${ROW_H}" rx="10" fill="${s.color}" opacity="0">
        <animate attributeName="opacity" values="0;0.38;0" keyTimes="0;0.06;0.3" dur="${CYCLE}s" begin="${begin}s" repeatCount="indefinite"/>
      </rect>
      <rect x="${LX}" y="${ROW_Y[0]}" width="${LW}" height="${ROW_H}" rx="10" fill="none" stroke="${s.color}" stroke-width="1.5" opacity="0">
        <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.05;0.4" dur="${CYCLE}s" begin="${begin}s" repeatCount="indefinite"/>
      </rect>`;
    })
    .join("\n");

  const rows = ROW_Y.map((y, i) => {
    const first = i === 0;
    const w1 = [58, 46, 64, 40, 52][i];
    return `
    <rect x="${LX}" y="${y}" width="${LW}" height="${ROW_H}" rx="10" fill="${t.rowFill}" stroke="${first ? t.accent : t.panelBorder}" stroke-width="${first ? 1.5 : 1}"${first ? "" : ` opacity="${(0.95 - i * 0.14).toFixed(2)}"`}/>
    <circle cx="${LX + 20}" cy="${y + ROW_H / 2}" r="8" fill="${first ? t.accent : t.line}"${first ? "" : ' opacity="0.9"'}/>
    <rect x="${LX + 36}" y="${y + 11}" width="${w1}" height="6" rx="3" fill="${first ? t.ink : t.muted}" opacity="${first ? 0.9 : 0.55}"/>
    <rect x="${LX + 36}" y="${y + 22}" width="${Math.round(w1 * 0.62)}" height="4" rx="2" fill="${t.muted}" opacity="0.5"/>`;
  }).join("\n");

  const pills = sources
    .map(
      (s) => `
    <rect x="${SX}" y="${s.y}" width="${SW}" height="34" rx="17" fill="${t.chipFill}" stroke="${t.panelBorder}"/>
    <circle cx="${SX + 19}" cy="${s.y + 17}" r="4.5" fill="${s.color}"/>
    <text x="${SX + 32}" y="${s.y + 22}" font-family='${FONT}' font-size="14" font-weight="500" fill="${t.ink2}">${esc(s.label)}</text>`,
    )
    .join("\n");

  const glow = (id, color, x, y, drift) => `
    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${color}" stop-opacity="${t.glowOpacity}"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
    <circle cx="${x}" cy="${y}" r="330" fill="url(#${id})">
      <animateTransform attributeName="transform" type="translate" values="0 0;${drift};0 0" dur="18s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Samuel Hernandez</title>
  <desc id="d">I build the tools insurance agencies run on. Every channel, one list.</desc>
  <defs>
    <clipPath id="frame"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="24"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="24" fill="${t.bg}" stroke="${t.border}"/>
  <g clip-path="url(#frame)">
    ${glow("gt", t.glowTeal, 1010, 40, "-70 60")}
    ${glow("gc", t.glowCoral, 120, 480, "90 -50")}
  </g>

  <!-- Words -->
  <text x="64" y="84" font-family='${FONT}' font-size="13" font-weight="600" letter-spacing="2.6" fill="${t.muted}">SAMUEL HERNANDEZ  ·  MIAMI, FL</text>
  <text font-family='${FONT}' font-size="54" font-weight="800" letter-spacing="-1.6" fill="${t.ink}">
    <tspan x="62" y="150">I build the tools</tspan>
    <tspan x="62" y="208">insurance agencies</tspan>
    <tspan x="62" y="266" fill="${t.accent}">run on.</tspan>
  </text>
  <text font-family='${FONT}' font-size="17" font-weight="400" fill="${t.ink2}">
    <tspan x="64" y="314">Eight years inside an agency, running Salesforce, data and product.</tspan>
    <tspan x="64" y="340">Now I ship the CRM, dialer and paperwork agents use every day.</tspan>
  </text>

  <!-- Now building -->
  <g>
    <rect x="64" y="374" width="188" height="36" rx="18" fill="${t.chipFill}" stroke="${t.panelBorder}"/>
    <circle cx="86" cy="392" r="9" fill="${t.accent}" opacity="0.25">
      <animate attributeName="r" values="6;11;6" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="86" cy="392" r="4.5" fill="${t.accent}"/>
    <text x="102" y="397" font-family='${FONT}' font-size="14" font-weight="600" fill="${t.ink}">Now building <tspan fill="${t.accent}">Navo</tspan></text>
  </g>

  <!-- Every channel, one list -->
  <text x="${SX}" y="96" font-family='${FONT}' font-size="11" font-weight="700" letter-spacing="2.2" fill="${t.muted}">EVERY CHANNEL</text>
  <text x="${LX}" y="96" font-family='${FONT}' font-size="11" font-weight="700" letter-spacing="2.2" fill="${t.muted}">ONE LIST</text>
  ${paths}
  ${pills}
  ${rows}
  ${flashes}
  ${dots}

  ${orbi("ho", { x: 1028, y: 232, scale: 0.8 })}
</svg>
`;
}

/* ------------------------------------------------------------------ cards */

function card(t, { eyebrow, title, lines, art }) {
  const W = 588;
  const H = 168;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.panel}" stroke="${t.panelBorder}"/>
  <text x="28" y="40" font-family='${FONT}' font-size="11" font-weight="700" letter-spacing="2" fill="${t.accent}">${esc(eyebrow)}</text>
  <text x="27" y="76" font-family='${FONT}' font-size="26" font-weight="800" letter-spacing="-0.6" fill="${t.ink}">${esc(title)}</text>
  <text font-family='${FONT}' font-size="14" font-weight="400" fill="${t.ink2}">
    ${lines.map((l, i) => `<tspan x="28" y="${104 + i * 21}">${esc(l)}</tspan>`).join("")}
  </text>
  ${art}
</svg>
`;
}

function navoArt(t) {
  // A small list with the top row lit, and Orbi beside it.
  const x = 418;
  const rows = [36, 66, 96, 126].map((y, i) => {
    const first = i === 0;
    return `
    <rect x="${x}" y="${y}" width="96" height="22" rx="7" fill="${t.rowFill}" stroke="${first ? t.accent : t.panelBorder}" stroke-width="${first ? 1.5 : 1}"${first ? "" : ` opacity="${0.9 - i * 0.18}"`}/>
    <circle cx="${x + 12}" cy="${y + 11}" r="5" fill="${first ? t.accent : t.line}"/>
    <rect x="${x + 23}" y="${y + 7}" width="${[46, 34, 50, 30][i]}" height="4" rx="2" fill="${first ? t.ink : t.muted}" opacity="${first ? 0.85 : 0.5}"/>
    <rect x="${x + 23}" y="${y + 14}" width="${[28, 22, 30, 18][i]}" height="3" rx="1.5" fill="${t.muted}" opacity="0.45"/>`;
  }).join("");
  return rows + orbi("nc", { x: 506, y: 44, scale: 0.44, wave: true });
}

function quoteflowArt(t) {
  // Three pipeline columns; the cards drift one column to the right.
  const cols = [
    { x: 404, label: "new", n: 3 },
    { x: 462, label: "due", n: 2 },
    { x: 520, label: "quoted", n: 1 },
  ];
  const parts = cols.map((c) => {
    const cards = Array.from({ length: c.n }, (_, i) => {
      const y = 50 + i * 26;
      return `<rect x="${c.x}" y="${y}" width="44" height="18" rx="5" fill="${t.rowFill}" stroke="${t.panelBorder}"/>
        <rect x="${c.x + 7}" y="${y + 7}" width="${[26, 18, 22][i]}" height="4" rx="2" fill="${t.muted}" opacity="0.55"/>`;
    }).join("");
    return `<text x="${c.x}" y="40" font-family='${FONT}' font-size="9" font-weight="700" letter-spacing="1.2" fill="${t.muted}">${esc(c.label.toUpperCase())}</text>${cards}`;
  });
  const mover = `
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;58 0;58 0;116 0;116 0;0 0" keyTimes="0;0.2;0.3;0.55;0.65;0.9;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;0.2 0.8 0.2 1;0 0 1 1;0.2 0.8 0.2 1;0 0 1 1;0 0 1 1"/>
      <animate attributeName="opacity" values="1;1;1;1;1;0;0;1" keyTimes="0;0.2;0.55;0.65;0.9;0.93;0.98;1" dur="9s" repeatCount="indefinite"/>
      <rect x="404" y="128" width="44" height="18" rx="5" fill="${t.rowFill}" stroke="${t.accent}" stroke-width="1.5"/>
      <circle cx="412" cy="137" r="3" fill="${t.coral}"/>
      <rect x="418" y="135" width="22" height="4" rx="2" fill="${t.ink}" opacity="0.8"/>
    </g>`;
  return parts.join("") + mover;
}

/* ------------------------------------------------------------------ stack */

function stack(t) {
  const items = [
    "TypeScript",
    "Next.js",
    "React",
    "Supabase",
    "Postgres",
    "Tailwind",
    "Twilio",
    "Vercel",
    "Salesforce",
    "Snowflake",
  ];
  // Chips wrap into rows at the README's own width, so the strip renders
  // 1:1 on a desktop profile instead of being scaled down to fit.
  const W = 880;
  const H = 44;
  const PAD = 16;
  const DOT = 14;
  const GAP = 10;
  const approx = (s) => Math.round(s.length * 8.1); // 14px, weight 500
  let x = 0;
  let row = 0;
  const chips = items.map((label, i) => {
    const w = PAD + DOT + approx(label) + PAD;
    if (x + w > W) {
      x = 0;
      row += 1;
    }
    const y = row * (H + GAP);
    const chip = `
    <g transform="translate(${x} ${y})">
      <rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="${H / 2}" fill="${t.chipFill}" stroke="${t.panelBorder}"/>
      <circle cx="${PAD + 4}" cy="${H / 2}" r="4" fill="${i < 8 ? t.accent : t.coral}"/>
      <text x="${PAD + DOT}" y="${H / 2 + 5}" font-family='${FONT}' font-size="14" font-weight="500" fill="${t.ink}" textLength="${approx(label)}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>
    </g>`;
    x += w + GAP;
    return chip;
  });
  const TOTAL_H = (row + 1) * H + row * GAP;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${TOTAL_H}" width="${W}" height="${TOTAL_H}" role="img" aria-label="${esc(items.join(", "))}">
  ${chips.join("")}
</svg>
`;
}

/* ------------------------------------------------------------------ write */

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `hero-${name}.svg`), hero(t));
  writeFileSync(
    join(OUT, `card-navo-${name}.svg`),
    card(t, {
      eyebrow: "LIVE  ·  NAVOCRM.COM",
      title: "Navo",
      lines: ["The CRM for insurance agencies. Every new lead,", "text and missed call on one list, so agents", "always know who to call next."],
      art: navoArt(t),
    }),
  );
  writeFileSync(
    join(OUT, `card-quoteflow-${name}.svg`),
    card(t, {
      eyebrow: "OPEN SOURCE  ·  NEXT.JS + SUPABASE",
      title: "QuoteFlow",
      lines: ["A follow-up queue and lead pipeline for", "independent agents. Import leads, set the next", "touch, work the day's list."],
      art: quoteflowArt(t),
    }),
  );
  writeFileSync(join(OUT, `stack-${name}.svg`), stack(t));
}
console.log("wrote", OUT);
