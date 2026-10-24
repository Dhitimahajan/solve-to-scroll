// Pure Node.js PNG generator with zlib
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generateIconPNG(size) {
  const width = size;
  const height = size;
  // Raw uncompressed RGBA with scanline filter byte (0)
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r) {
        // Gradient from top-left (purple #7C5CFF) to bottom-right (amber #FFB45C)
        const t = (x + y) / (width + height);
        // Purple (124, 92, 255) -> Pink (255, 92, 170) -> Amber (255, 180, 92)
        let red, green, blue;
        if (t < 0.5) {
          const st = t * 2;
          red = Math.round(124 + (255 - 124) * st);
          green = 92;
          blue = Math.round(255 + (170 - 255) * st);
        } else {
          const st = (t - 0.5) * 2;
          red = 255;
          green = Math.round(92 + (180 - 92) * st);
          blue = Math.round(170 + (92 - 170) * st);
        }

        // Add a central flame/scroll glyph silhouette in white/dark
        const innerDx = Math.abs(dx) / (r * 0.5);
        const innerDy = (y - (cy - r * 0.2)) / (r * 0.8);
        const isCore = (innerDx * innerDx + innerDy * innerDy) < 0.35 && y >= cy - r * 0.3;

        // Anti-aliasing border
        let alpha = 255;
        if (dist > r - 1.5) {
          alpha = Math.round(255 * (r - dist) / 1.5);
          if (alpha < 0) alpha = 0;
        }

        if (isCore) {
          raw[pxOffset] = 255;
          raw[pxOffset + 1] = 255;
          raw[pxOffset + 2] = 255;
          raw[pxOffset + 3] = alpha;
        } else {
          raw[pxOffset] = red;
          raw[pxOffset + 1] = green;
          raw[pxOffset + 2] = blue;
          raw[pxOffset + 3] = alpha;
        }
      } else {
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 79, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

[16, 32, 48, 128].forEach(size => {
  const png = generateIconPNG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png`);
});
