/**
 * One-time script: regenerates public/favicon.ico with the amber brand mark
 * (matches the landing page's warm cream/amber/teal palette).
 *
 * Usage:
 *   node scripts/generate-favicon.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '..', 'public', 'favicon.ico');

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#D98C2B"/>
  <path d="M9 22 L20 9 L24 13 L13 26 L7 27 Z" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M18 11 L22 15" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
</svg>
`;

const SIZES = [16, 32, 48];

// Minimal ICO writer: modern ICO files can embed PNG data directly per entry.
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  const images = [];
  let offset = headerSize;

  pngBuffers.forEach(({ size, buffer }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    entries.push(entry);
    images.push(buffer);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...entries, ...images]);
}

async function main() {
  const pngBuffers = await Promise.all(
    SIZES.map(async (size) => ({
      size,
      buffer: await sharp(Buffer.from(SVG)).resize(size, size).png().toBuffer(),
    }))
  );

  const ico = buildIco(pngBuffers);
  fs.writeFileSync(OUT_FILE, ico);
  console.log(`Wrote ${OUT_FILE} (${(ico.length / 1024).toFixed(1)} KB, sizes: ${SIZES.join(', ')})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
