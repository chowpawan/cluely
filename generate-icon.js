// Generates iconTemplate.png — a 22x22 black "C"-ish dot, template-style (black + alpha).
const fs = require('fs');
const zlib = require('zlib');

const S = 22;
const raw = Buffer.alloc(S * (S * 4 + 1)); // 1 filter byte per row + RGBA

function setPx(x, y, a) {
  const rowStart = y * (S * 4 + 1);
  const i = rowStart + 1 + x * 4;
  raw[i] = 0;       // R
  raw[i + 1] = 0;   // G
  raw[i + 2] = 0;   // B
  raw[i + 3] = a;   // A
}

const cx = (S - 1) / 2, cy = (S - 1) / 2;
const rOuter = 9.5, rInner = 5.5;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - cx, y - cy);
    // Filled ring (donut) to read as a small dot/badge
    let a = 0;
    if (d <= rOuter && d >= rInner) a = 255;
    else if (d < rInner && d > rInner - 1.2) a = 150; // soft inner edge
    else if (d > rOuter && d < rOuter + 1.2) a = 150; // soft outer edge
    setPx(x, y, a);
  }
}

// --- minimal PNG encoder ---
function crc32(buf) {
  let c, table = crc32.t || (crc32.t = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 6;   // color type RGBA
const idat = zlib.deflateSync(raw);
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
]);
fs.writeFileSync(__dirname + '/iconTemplate.png', png);
console.log('wrote iconTemplate.png', png.length, 'bytes');
