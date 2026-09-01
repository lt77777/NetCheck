import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createHash } from "node:crypto";

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function png(width, height, paint) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a = 255] = paint(x, y, width, height);
      const o = row + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const body = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  createHash("sha1").update(body).digest("hex");
  return body;
}

function inRect(x, y, x0, y0, x1, y1) {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function onLine(x, y, x0, y0, x1, y1, w) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const t = ((x - x0) * dx + (y - y0) * dy) / (len * len);
  if (t < 0 || t > 1) return false;
  const px = x0 + t * dx;
  const py = y0 + t * dy;
  return Math.hypot(x - px, y - py) <= w;
}

function paintIcon(x, y, size, maskable) {
  const pad = maskable ? size * 0.12 : 0;
  const bg = [20, 51, 40];
  const cream = [246, 239, 224];
  const copper = [231, 176, 137];
  if (maskable && (x < pad || y < pad || x >= size - pad || y >= size - pad)) return bg;
  const s = size;
  const x0 = s * 0.2;
  const y0 = s * 0.3;
  const x1 = s * 0.8;
  const y1 = s * 0.7;
  const stroke = Math.max(2, s * 0.028);
  const envelope =
    inRect(x, y, x0, y0, x0 + stroke, y1) ||
    inRect(x, y, x1 - stroke, y0, x1, y1) ||
    inRect(x, y, x0, y0, x1, y0 + stroke) ||
    inRect(x, y, x0, y1 - stroke, x1, y1) ||
    onLine(x, y, x0, y0, s * 0.5, s * 0.52, stroke * 0.7) ||
    onLine(x, y, x1, y0, s * 0.5, s * 0.52, stroke * 0.7);
  const check =
    onLine(x, y, s * 0.28, s * 0.64, s * 0.42, s * 0.78, stroke * 1.15) ||
    onLine(x, y, s * 0.42, s * 0.78, s * 0.74, s * 0.42, stroke * 1.15);
  if (check) return copper;
  if (envelope) return cream;
  return bg;
}

const dir = path.resolve("public/icons");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "icon-192.png"), png(192, 192, (x, y, w, h) => paintIcon(x, y, w, false)));
fs.writeFileSync(path.join(dir, "icon-512.png"), png(512, 512, (x, y, w, h) => paintIcon(x, y, w, false)));
fs.writeFileSync(
  path.join(dir, "icon-512-maskable.png"),
  png(512, 512, (x, y, w, h) => paintIcon(x, y, w, true))
);
fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), png(180, 180, (x, y, w, h) => paintIcon(x, y, w, false)));
console.log("Wrote PWA icons to public/icons");
