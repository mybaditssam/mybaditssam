// Draws the graphics for the profile README: a title card that boots, a
// record that spins, a sequencer that runs. No dependencies. Everything
// that moves is SMIL inside the SVG, which is what runs where GitHub puts
// images: no scripts, no external fonts. `node scripts/build-assets.mjs`
// rewrites assets/.
//
// Every "appear" animation starts at t=0 and holds the element hidden until
// its cue, with the element's own attributes set to the finished state. A
// viewer without SMIL (rare) sees the finished page; one with it sees the
// boot.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

// Black, orange, white. One world, so one theme: the cards carry their own
// ground on either GitHub theme.
const C = {
  bg: "#0a0a0a",
  frame: "#262626",
  cell: "#161616",
  cellLine: "#2a2a2a",
  ink: "#f4f1ec",
  dim: "#8a8782",
  orange: "#ff7a1a",
  ember: "#ff4d1f",
  green: "#39d98a",
};

const MONO = `"SF Mono", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace`;
// A heavy Mincho where one exists, a heavy serif where it doesn't.
const SERIF = `"Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK JP", "Times New Roman", Times, serif`;

const BPM = 122;
const BAR = (60 / BPM) * 4; // one bar of 4/4, in seconds
const STEP = BAR / 16;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r3 = (n) => Math.round(n * 1000) / 1000;

/* ------------------------------------------------------------- motion */

/** Hidden from t=0, shown at `at` seconds, in one cut. */
const cutIn = (at) =>
  `<animate attributeName="opacity" values="0;0;1" keyTimes="0;${r3(at / (at + 0.01))};1" dur="${r3(at + 0.01)}s" calcMode="discrete" fill="freeze"/>`;

/** Monospace text typed out one character at a time, from `at` seconds. */
function typed(x, y, text, { size = 12, fill = C.orange, opacity = 1, spacing = 2, at = 0, cps = 28, id }) {
  const adv = size * 0.6 + spacing;
  const w = r3(text.length * adv);
  const total = r3(at + text.length / cps);
  const widths = ["0", "0", ...Array.from({ length: text.length }, (_, i) => r3((i + 1) * adv))];
  const times = ["0", r3(at / total), ...Array.from({ length: text.length }, (_, i) => r3((at + (i + 1) / cps) / total))];
  const clipId = `clip-${id}`;
  return `<clipPath id="${clipId}"><rect x="${x - 1}" y="${y - size}" width="${w + 4}" height="${size * 1.5}">
      <animate attributeName="width" values="${widths.join(";")}" keyTimes="${times.join(";")}" dur="${total}s" calcMode="discrete" fill="freeze"/>
    </rect></clipPath>
    <text x="${x}" y="${y}" font-family='${MONO}' font-size="${size}" letter-spacing="${spacing}" fill="${fill}" fill-opacity="${opacity}" textLength="${w}" lengthAdjust="spacing" clip-path="url(#${clipId})">${esc(text)}</text>`;
}

/* ------------------------------------------------------------ atmosphere */

function hexPattern(id, r = 26, opacity = 0.1) {
  const w = Math.sqrt(3) * r;
  const h = 3 * r;
  const hex = (cx, cy) =>
    Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 180) * (60 * k - 90);
      return `${r3(cx + r * Math.cos(a))},${r3(cy + r * Math.sin(a))}`;
    }).join(" ");
  const poly = (pts) => `<polygon points="${pts}" fill="none" stroke="${C.orange}" stroke-opacity="${opacity}" stroke-width="1"/>`;
  return `<pattern id="${id}" width="${r3(w)}" height="${h}" patternUnits="userSpaceOnUse">
    ${poly(hex(w / 2, r))}${poly(hex(0, 2.5 * r))}${poly(hex(w, 2.5 * r))}
  </pattern>`;
}

function frame(W, H, { glow = null } = {}) {
  return `<defs>
    ${hexPattern("hex")}
    <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#ffffff" fill-opacity="0.045"/></pattern>
    <pattern id="hazard" width="28" height="10" patternUnits="userSpaceOnUse" patternTransform="skewX(-45)">
      <rect width="14" height="10" fill="${C.orange}"/><rect x="14" width="14" height="10" fill="#111111"/>
    </pattern>
    <clipPath id="frame"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18"/></clipPath>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.orange}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.orange}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.orange}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.orange}" stop-opacity="0.10"/><stop offset="1" stop-color="${C.orange}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${C.bg}" stroke="${C.frame}"/>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#hex)"/>
    ${glow ? `<circle cx="${glow[0]}" cy="${glow[1]}" r="${glow[2]}" fill="url(#glow)"/>` : ""}
    <rect width="${W}" height="${H}" fill="url(#scan)"/>
  </g>`;
}

const hazard = (W, y, h, dir) => `<g clip-path="url(#frame)">
    <rect x="-80" y="${y}" width="${W + 160}" height="${h}" fill="url(#hazard)" opacity="0.9">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="${dir * 28} 0" dur="1.6s" repeatCount="indefinite"/>
    </rect>
  </g>`;

/* --------------------------------------------------------------- pieces */

/** A bar of 16 steps across three voices, the playhead walking it at
 *  122 BPM and each hit lighting as it is passed. */
function sequencer({ x, y, stepW = 56, cellH = 18, gap = 6 }) {
  const voices = [
    { label: "KICK", hits: [0, 4, 8, 12] },
    { label: "HAT", hits: [2, 6, 10, 14] },
    { label: "CLAP", hits: [4, 12] },
  ];
  const gridX = x + 62;
  const rowH = cellH + gap;
  const H = voices.length * rowH - gap;
  const cells = voices
    .map((v, row) => {
      const cy = y + row * rowH;
      const label = `<text x="${x}" y="${cy + cellH - 5}" font-family='${MONO}' font-size="11" letter-spacing="1.5" fill="${C.orange}" fill-opacity="0.85">${v.label}</text>`;
      const steps = Array.from({ length: 16 }, (_, i) => {
        const cx = gridX + i * stepW;
        if (!v.hits.includes(i)) {
          return `<rect x="${cx}" y="${cy}" width="${stepW - 8}" height="${cellH}" rx="2" fill="${C.cell}" stroke="${C.cellLine}"/>`;
        }
        return `<rect x="${cx}" y="${cy}" width="${stepW - 8}" height="${cellH}" rx="2" fill="${C.orange}" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5;0.5" keyTimes="0;0.02;0.09;1" dur="${r3(BAR)}s" begin="${r3(i * STEP)}s" repeatCount="indefinite"/>
        </rect>`;
      }).join("");
      return label + steps;
    })
    .join("");
  const positions = Array.from({ length: 16 }, (_, i) => gridX + i * stepW - 4).join(";");
  const playhead = `<rect x="${gridX - 4}" y="${y - 6}" width="${stepW}" height="${H + 12}" rx="3" fill="${C.orange}" opacity="0.16">
      <animate attributeName="x" values="${positions}" dur="${r3(BAR)}s" calcMode="discrete" repeatCount="indefinite"/>
    </rect>`;
  return cells + playhead;
}

/** Bars that dance: each one its own loop, no two alike. */
function eq({ x, y, n = 24, w = 7, gap = 3, max = 56 }) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: n }, (_, i) => {
    const hs = Array.from({ length: 4 }, () => Math.round(8 + rnd() * max));
    hs.push(hs[0]);
    const dur = r3(0.45 + rnd() * 0.5);
    return `<rect x="${x + i * (w + gap)}" y="${y - hs[0]}" width="${w}" height="${hs[0]}" rx="1" fill="${C.orange}" opacity="${r3(0.55 + (i % 3) * 0.15)}">
      <animate attributeName="height" values="${hs.join(";")}" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${hs.map((h) => y - h).join(";")}" dur="${dur}s" repeatCount="indefinite"/>
    </rect>`;
  }).join("");
}

/** A targeting ring, drawn about the origin: it locks on, then turns. */
function reticle(r, lockAt) {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (Math.PI / 180) * (i * 10);
    const long = i % 9 === 0;
    const r1 = r - (long ? 14 : 7);
    return `<line x1="${r3(r1 * Math.cos(a))}" y1="${r3(r1 * Math.sin(a))}" x2="${r3(r * Math.cos(a))}" y2="${r3(r * Math.sin(a))}" stroke="${C.orange}" stroke-opacity="${long ? 0.9 : 0.45}" stroke-width="${long ? 1.5 : 1}"/>`;
  }).join("");
  const lockDur = r3(lockAt + 0.7);
  const k = r3(lockAt / lockDur);
  return `<g>
    <animateTransform attributeName="transform" type="scale" values="1.7;1.7;1" keyTimes="0;${k};1" dur="${lockDur}s" calcMode="spline" keySplines="0 0 1 1;0.1 0.9 0.2 1" fill="freeze"/>
    <animate attributeName="opacity" values="0;0;1" keyTimes="0;${k};1" dur="${lockDur}s" fill="freeze"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/>
      <circle r="${r}" fill="none" stroke="${C.orange}" stroke-opacity="0.5"/>
      ${ticks}
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="90s" repeatCount="indefinite"/>
      <circle r="${r - 30}" fill="none" stroke="${C.orange}" stroke-opacity="0.35" stroke-dasharray="18 10"/>
    </g>
    <circle r="${r - 62}" fill="none" stroke="${C.orange}" stroke-opacity="0.25"/>
    <line x1="${-r - 10}" y1="0" x2="${-r + 40}" y2="0" stroke="${C.orange}" stroke-opacity="0.5"/>
    <line x1="${r - 40}" y1="0" x2="${r + 10}" y2="0" stroke="${C.orange}" stroke-opacity="0.5"/>
    <line x1="0" y1="${-r - 10}" x2="0" y2="${-r + 40}" stroke="${C.orange}" stroke-opacity="0.5"/>
    <line x1="0" y1="${r - 40}" x2="0" y2="${r + 10}" stroke="${C.orange}" stroke-opacity="0.5"/>
  </g>`;
}

/** Two offset copies that flash for a few frames every so often. */
function glitch(x, y, text, { size, spacing, anchor = "start", period = 6.5, at = 0.52 }) {
  const t = [0, at, at + 0.014, at + 0.04, at + 0.054, at + 0.09].map((v) => r3(v));
  const anim = `<animate attributeName="opacity" values="0;0;0.9;0;0.9;0;0" keyTimes="${t.join(";")};1" dur="${period}s" calcMode="discrete" repeatCount="indefinite"/>`;
  const copy = (dx, fill) =>
    `<text x="${x + dx}" y="${y}" font-family='${SERIF}' font-size="${size}" font-weight="800" letter-spacing="${spacing}" fill="${fill}" text-anchor="${anchor}" opacity="0">${anim}${esc(text)}</text>`;
  return copy(-5, C.orange) + copy(5, C.ember);
}

const mono = (x, y, text, { size = 12, fill = C.orange, opacity = 1, anchor = "start", spacing = 2, extra = "" } = {}) =>
  `<text x="${x}" y="${y}" font-family='${MONO}' font-size="${size}" letter-spacing="${spacing}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}">${extra}${esc(text)}</text>`;

const serif = (x, y, text, { size = 64, fill = C.ink, anchor = "start", spacing = -1, extra = "" } = {}) =>
  `<text x="${x}" y="${y}" font-family='${SERIF}' font-size="${size}" font-weight="800" letter-spacing="${spacing}" fill="${fill}" text-anchor="${anchor}">${extra}${esc(text)}</text>`;

/** A line that scrolls forever, seamlessly, because its width is pinned. */
function marquee({ x, y, width, items, size = 12, speed = 70 }) {
  // Non-breaking spaces: ordinary ones collapse at the ends of a text run,
  // and the seam between the two copies would lose its gap.
  const NB = " ";
  const text = items.map((s) => `${s.replace(/ {2}/g, NB + NB)}${NB.repeat(3)}///${NB.repeat(3)}`).join("");
  const adv = size * 0.6 + 2;
  const w = r3(text.length * adv);
  const dur = r3(w / speed);
  return `<clipPath id="marquee"><rect x="${x}" y="${y - size}" width="${width}" height="${size * 1.6}"/></clipPath>
  <g clip-path="url(#marquee)">
    <g>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="${-w} 0" dur="${dur}s" repeatCount="indefinite"/>
      <text x="${x}" y="${y}" font-family='${MONO}' font-size="${size}" letter-spacing="2" fill="${C.dim}" textLength="${w}" lengthAdjust="spacing">${esc(text)}</text>
      <text x="${x + w}" y="${y}" font-family='${MONO}' font-size="${size}" letter-spacing="2" fill="${C.dim}" textLength="${w}" lengthAdjust="spacing">${esc(text)}</text>
    </g>
  </g>`;
}

/* ---------------------------------------------------------------- hero */

function hero() {
  const W = 1200;
  const H = 580;
  const kana = ["サ", "ミ", "ュ", "エ", "ル"];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Samuel Hernandez</title>
  <desc id="d">Miami, FL. Online. Sync 100 percent. Now playing Solomun, rewatching all 26 episodes again, a sequencer running at ${BPM} BPM.</desc>
  ${frame(W, H, { glow: [980, 60, 460] })}
  <g clip-path="url(#frame)">
    <rect x="0" y="-90" width="${W}" height="90" fill="url(#sweep)">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${H + 180}" dur="7s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- HUD: types itself out -->
  ${typed(48, 46, "SAMUEL HERNANDEZ", { at: 0.2, id: "name" })}
  ${typed(330, 46, "MIAMI, FL", { at: 0.95, fill: C.dim, id: "city" })}
  ${typed(470, 46, "UTC-4", { at: 1.35, fill: C.dim, id: "tz" })}
  <g opacity="1">${cutIn(1.7)}
    <circle cx="606" cy="42" r="3.5" fill="${C.green}">
      <animate attributeName="opacity" values="1;0.35;1" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    ${mono(618, 46, "ONLINE", { fill: C.green })}
  </g>
  <g opacity="1">${cutIn(1.9)}
    ${mono(930, 46, "SYNC", { fill: C.dim })}
    <rect x="982" y="36" width="118" height="7" fill="${C.cell}" stroke="${C.cellLine}"/>
    <rect x="982" y="36" width="118" height="7" fill="${C.orange}">
      <animate attributeName="width" values="0;0;118" keyTimes="0;0.5;1" dur="4s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;0.2 0.8 0.2 1"/>
    </rect>
    ${mono(1152, 46, "100%", { anchor: "end", extra: cutIn(3.9) })}
  </g>
  <line x1="48" y1="62" x2="1152" y2="62" stroke="${C.orange}" stroke-opacity="0.35">
    <animate attributeName="x2" values="48;48;1152" keyTimes="0;0.1;1" dur="1.4s" fill="freeze"/>
  </line>

  <!-- Title card: hard cuts, the way they do it -->
  ${mono(48, 118, "EPISODE 00", { spacing: 4, extra: cutIn(0.7) })}
  ${serif(42, 302, "SAM", { size: 196, spacing: -8, extra: cutIn(0.95) })}
  ${glitch(42, 302, "SAM", { size: 196, spacing: -8 })}
  ${serif(48, 386, "HERNANDEZ", { size: 76, spacing: -2, extra: cutIn(1.15) })}
  <rect x="48" y="403" width="472" height="2" fill="${C.orange}">
    <animate attributeName="width" values="0;0;472" keyTimes="0;0.65;1" dur="2s" fill="freeze"/>
  </rect>
  <g font-family='${SERIF}' font-size="40" font-weight="800" fill="${C.ink}" text-anchor="middle">
    ${kana.map((k, i) => `<text x="598" y="${150 + i * 48}">${cutIn(1.4 + i * 0.12)}${k}</text>`).join("")}
  </g>
  <line x1="598" y1="100" x2="598" y2="112" stroke="${C.orange}" stroke-width="2">${cutIn(1.4)}</line>

  <!-- Reticle, with the tempo in it -->
  <g transform="translate(940 236)">
    ${reticle(148, 1.0)}
    <text x="0" y="-10" font-family='${MONO}' font-size="58" letter-spacing="-1" fill="${C.ink}" text-anchor="middle">${cutIn(1.75)}${BPM}</text>
    <text x="0" y="16" font-family='${MONO}' font-size="12" letter-spacing="5" fill="${C.orange}" text-anchor="middle">${cutIn(1.85)}BPM</text>
    <text x="0" y="170" font-family='${MONO}' font-size="11" letter-spacing="3" fill="${C.orange}" fill-opacity="0.8" text-anchor="middle">${cutIn(2.0)}PATTERN  ORANGE</text>
  </g>

  <!-- What's on -->
  ${marquee({ x: 48, y: 438, width: 1104, items: ["NOW PLAYING  SOLOMUN", "REWATCHING  ALL 26 EPISODES, AGAIN", `${BPM} BPM`, "MIAMI AFTER HOURS", "ANIME RECS OPEN", "STATUS  ONLINE"] })}

  <!-- Sequencer -->
  ${sequencer({ x: 48, y: 470 })}
  ${eq({ x: 1012, y: 536, n: 14, w: 7, gap: 3, max: 48 })}

  ${hazard(W, H - 9, 9, 1)}
</svg>
`;
}

/* ---------------------------------------------------------- on rotation */

function onRotation() {
  const W = 1200;
  const H = 250;
  const cx = 640;
  const cy = 125;
  const grooves = Array.from({ length: 9 }, (_, i) => `<circle cx="${cx}" cy="${cy}" r="${88 - i * 6}" fill="none" stroke="#1c1c1c" stroke-width="1"/>`).join("");
  const px = cx + 128; // tonearm pivot
  const py = cy - 92;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Episode 01, on rotation: Solomun. Techno, melodic, all night long.">
  ${frame(W, H, { glow: [cx, cy, 240] })}
  ${mono(48, 56, "EPISODE 01", { spacing: 4, extra: cutIn(0.3) })}
  ${serif(46, 118, "ON ROTATION", { size: 52, spacing: -1.5, extra: cutIn(0.5) })}
  ${typed(48, 152, "33 1/3 RPM", { at: 0.8, fill: C.dim, id: "rpm" })}
  ${typed(48, 176, "SIDE A", { at: 1.3, fill: C.dim, id: "side" })}
  ${typed(48, 200, "REPEAT  ALL", { at: 1.6, fill: C.dim, id: "rep" })}

  <!-- The record -->
  <circle cx="${cx}" cy="${cy}" r="100" fill="#0f0f0f" stroke="${C.frame}"/>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="1.8s" repeatCount="indefinite"/>
    ${grooves}
    <path d="M${cx},${cy} L${cx + 96},${cy - 28} A100,100 0 0 1 ${cx + 100},${cy} Z" fill="#ffffff" fill-opacity="0.05"/>
    <path d="M${cx},${cy} L${cx - 96},${cy + 28} A100,100 0 0 1 ${cx - 100},${cy} Z" fill="#ffffff" fill-opacity="0.05"/>
    <circle cx="${cx}" cy="${cy}" r="34" fill="${C.orange}"/>
    <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#000000" stroke-opacity="0.25"/>
    <text x="${cx}" y="${cy - 6}" font-family='${MONO}' font-size="9" letter-spacing="2" fill="#0a0a0a" text-anchor="middle">SOLOMUN</text>
    <text x="${cx}" y="${cy + 14}" font-family='${MONO}' font-size="7" letter-spacing="1" fill="#0a0a0a" fill-opacity="0.75" text-anchor="middle">${BPM} BPM</text>
    <circle cx="${cx}" cy="${cy}" r="3.5" fill="#0a0a0a"/>
  </g>
  <!-- Tonearm: drops onto the record -->
  <g>
    <animateTransform attributeName="transform" type="rotate" values="-16 ${px} ${py};-16 ${px} ${py};0 ${px} ${py}" keyTimes="0;0.35;1" dur="2s" calcMode="spline" keySplines="0 0 1 1;0.3 0 0.2 1" fill="freeze"/>
    <line x1="${px}" y1="${py}" x2="${cx + 44}" y2="${cy + 2}" stroke="#2f2f2f" stroke-width="4" stroke-linecap="round"/>
    <line x1="${px}" y1="${py}" x2="${cx + 44}" y2="${cy + 2}" stroke="#555555" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="${cx + 36}" y="${cy - 4}" width="12" height="12" rx="2" fill="#3a3a3a" transform="rotate(-48 ${cx + 42} ${cy + 2})"/>
  </g>
  <circle cx="${px}" cy="${py}" r="9" fill="#1a1a1a" stroke="${C.frame}"/>

  <!-- Who -->
  ${mono(820, 96, "SOLOMUN", { size: 38, fill: C.ink, spacing: 7, extra: cutIn(0.6) })}
  ${typed(820, 124, "techno. melodic. all night long.", { size: 13, fill: C.dim, spacing: 1, at: 0.9, cps: 32, id: "sub" })}
  ${eq({ x: 820, y: 196, n: 30, w: 7, gap: 4, max: 50 })}
  <rect x="820" y="210" width="326" height="3" fill="${C.cell}"/>
  <rect x="820" y="210" width="0" height="3" fill="${C.orange}">
    <animate attributeName="width" values="0;326" dur="90s" repeatCount="indefinite"/>
  </rect>
  ${mono(820, 232, "NOW PLAYING", { size: 10, spacing: 3, opacity: 0.8 })}
  <circle cx="914" cy="228" r="3" fill="${C.ember}">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
  </circle>
  ${mono(1146, 232, "LIVE", { size: 10, spacing: 3, anchor: "end", fill: C.ember })}
</svg>
`;
}

/* ------------------------------------------------------------ on screen */

function onScreen() {
  const W = 1200;
  const H = 330;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Episode 02, on screen: a title card in Japanese. Rewatching, always. Anime in general; recommendations open.">
  ${frame(W, H, { glow: [220, 300, 300] })}
  ${hazard(W, 0, 7, -1)}
  ${mono(48, 56, "EPISODE 02", { spacing: 4, extra: cutIn(0.3) })}
  ${serif(46, 118, "ON SCREEN", { size: 52, spacing: -1.5, extra: cutIn(0.5) })}
  <circle cx="54" cy="160" r="4" fill="${C.ember}">
    <animate attributeName="opacity" values="1;0.15;1" dur="1.6s" repeatCount="indefinite"/>
  </circle>
  ${typed(66, 164, "REWATCHING. ALWAYS.", { at: 0.9, fill: C.dim, id: "re" })}
  ${typed(48, 190, "ANIME IN GENERAL. RECOMMENDATIONS OPEN.", { at: 1.7, fill: C.dim, id: "recs" })}

  <!-- The title card. If you know, you know. -->
  ${mono(1152, 150, "第弐拾六話、また", { size: 13, anchor: "end", spacing: 6, fill: C.dim, extra: cutIn(0.5) })}
  ${serif(1156, 250, "新世紀エヴァンゲリオン", { size: 66, anchor: "end", spacing: 3, extra: cutIn(0.8) })}
  ${glitch(1156, 250, "新世紀エヴァンゲリオン", { size: 66, spacing: 3, anchor: "end", period: 9, at: 0.4 })}
  <rect x="700" y="276" width="452" height="2" fill="${C.orange}">
    <animate attributeName="width" values="0;0;452" keyTimes="0;0.55;1" dur="1.8s" fill="freeze"/>
  </rect>
</svg>
`;
}

/* ---------------------------------------------------------------- write */

writeFileSync(join(OUT, "hero.svg"), hero());
writeFileSync(join(OUT, "on-rotation.svg"), onRotation());
writeFileSync(join(OUT, "on-screen.svg"), onScreen());
console.log("wrote", OUT);
