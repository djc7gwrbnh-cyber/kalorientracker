/**
 * Erzeugt die App-Icons als PNG ohne externe Bibliothek.
 * Aufruf: node scripts/generate-icons.mjs
 *
 * Motiv: dunkles Quadrat mit dem Kalorienring der App.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const BG_TOP = [28, 28, 30];
const BG_BOTTOM = [10, 10, 11];
const TRACK = [255, 255, 255, 0.14];
const ARC = [48, 209, 88, 1];

const SAMPLES = 4;
const TAU = Math.PI * 2;

/** Anteil des Rings, der gefuellt ist. */
const PROGRESS = 0.72;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Signed distance zu einem abgerundeten Rechteck (negativ = innen). */
function roundedBoxDistance(px, py, cx, cy, halfW, halfH, radius) {
  const qx = Math.abs(px - cx) - (halfW - radius);
  const qy = Math.abs(py - cy) - (halfH - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Winkel ab 12 Uhr im Uhrzeigersinn, normiert auf [0, 1). */
function angleFraction(px, py, cx, cy) {
  const a = Math.atan2(px - cx, cy - py);
  return (a < 0 ? a + TAU : a) / TAU;
}

function ringDistance(px, py, cx, cy, radius, halfWidth, progress) {
  const dx = px - cx;
  const dy = py - cy;
  const d = Math.hypot(dx, dy);
  const bandDistance = Math.abs(d - radius) - halfWidth;

  if (progress >= 1) return bandDistance;

  const f = angleFraction(px, py, cx, cy);
  if (f <= progress) return bandDistance;

  // Ausserhalb des Bogens: runde Enden als Kreise ergaenzen.
  const endAngle = progress * TAU;
  const ends = [
    [cx, cy - radius],
    [cx + Math.sin(endAngle) * radius, cy - Math.cos(endAngle) * radius],
  ];
  let best = Infinity;
  for (const [ex, ey] of ends) {
    best = Math.min(best, Math.hypot(px - ex, py - ey) - halfWidth);
  }
  return best;
}

function renderIcon(size, { rounded }) {
  const px = new Uint8Array(size * size * 4);
  const c = size / 2;
  const radius = size * (rounded ? 0.3 : 0.28);
  const halfWidth = size * (rounded ? 0.05 : 0.046);
  const cornerRadius = size * 0.225;
  const half = size / 2;
  const step = 1 / SAMPLES;
  const offset = step / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgCov = 0;
      let trackCov = 0;
      let arcCov = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const fx = x + offset + sx * step;
          const fy = y + offset + sy * step;

          bgCov += rounded
            ? roundedBoxDistance(fx, fy, c, c, half, half, cornerRadius) <= 0
              ? 1
              : 0
            : 1;

          const d = Math.hypot(fx - c, fy - c);
          if (Math.abs(d - radius) <= halfWidth) trackCov++;
          if (ringDistance(fx, fy, c, c, radius, halfWidth, PROGRESS) <= 0) arcCov++;
        }
      }

      const total = SAMPLES * SAMPLES;
      const bgA = clamp01(bgCov / total);
      const trackA = clamp01(trackCov / total) * TRACK[3] * bgA;
      const arcA = clamp01(arcCov / total) * ARC[3] * bgA;

      const t = y / (size - 1);
      let r = BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t;
      let g = BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t;
      let b = BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t;

      r = r + (TRACK[0] - r) * trackA;
      g = g + (TRACK[1] - g) * trackA;
      b = b + (TRACK[2] - b) * trackA;

      r = r + (ARC[0] - r) * arcA;
      g = g + (ARC[1] - g) * arcA;
      b = b + (ARC[2] - b) * arcA;

      const i = (y * size + x) * 4;
      px[i] = Math.round(r);
      px[i + 1] = Math.round(g);
      px[i + 2] = Math.round(b);
      px[i + 3] = Math.round(bgA * 255);
    }
  }

  return px;
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  { file: 'icon-192.png', size: 192, rounded: true },
  { file: 'icon-512.png', size: 512, rounded: true },
  { file: 'icon-maskable-512.png', size: 512, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
];

mkdirSync(outDir, { recursive: true });
for (const { file, size, rounded } of targets) {
  writeFileSync(join(outDir, file), encodePng(size, renderIcon(size, { rounded })));
  console.log(`${file} (${size}x${size})`);
}
