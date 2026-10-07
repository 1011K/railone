import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createPng(width, height, colorFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines: width * 4 bytes + 1 filter byte per line
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Generate RailOne icon, splash, adaptive-icon, favicon
const assetsDir = path.resolve('apps/mobile/assets');
fs.mkdirSync(assetsDir, { recursive: true });

// 1. icon.png (1024x1024) - Deep navy #0f172a background, blue circle #2563eb, white train symbol
const iconBuf = createPng(1024, 1024, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  // Outer circle
  if (dist < 420) {
    // Train silhouette in white
    const tx = Math.abs(x - cx);
    const ty = y - cy;
    if (tx < 180 && ty > -180 && ty < 180) {
      // Windshield
      if (ty > -120 && ty < -30 && tx < 130) {
        return [15, 23, 42, 255]; // dark window
      }
      // Headlights
      if (ty > 80 && ty < 120 && tx > 70 && tx < 120) {
        return [234, 179, 8, 255]; // amber light
      }
      return [255, 255, 255, 255];
    }
    return [37, 99, 235, 255]; // RailOne blue
  }
  return [15, 23, 42, 255]; // Dark background #0f172a
});
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuf);
console.log('Created icon.png');

// 2. adaptive-icon.png (1024x1024) - Transparent background, center emblem
const adaptiveBuf = createPng(1024, 1024, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist < 320) {
    const tx = Math.abs(x - cx);
    const ty = y - cy;
    if (tx < 140 && ty > -140 && ty < 140) {
      if (ty > -90 && ty < -20 && tx < 100) {
        return [15, 23, 42, 255];
      }
      if (ty > 60 && ty < 90 && tx > 50 && tx < 90) {
        return [234, 179, 8, 255];
      }
      return [255, 255, 255, 255];
    }
    return [37, 99, 235, 255];
  }
  return [0, 0, 0, 0]; // Transparent
});
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveBuf);
console.log('Created adaptive-icon.png');

// 3. splash.png (1284x2778) - Dark navy with centered emblem
const splashBuf = createPng(1284, 2778, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist < 260) {
    const tx = Math.abs(x - cx);
    const ty = y - cy;
    if (tx < 110 && ty > -110 && ty < 110) {
      if (ty > -70 && ty < -15 && tx < 80) {
        return [15, 23, 42, 255];
      }
      if (ty > 50 && ty < 75 && tx > 40 && tx < 70) {
        return [234, 179, 8, 255];
      }
      return [255, 255, 255, 255];
    }
    return [37, 99, 235, 255];
  }
  return [15, 23, 42, 255];
});
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuf);
console.log('Created splash.png');

// 4. favicon.png (192x192)
const favBuf = createPng(192, 192, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist < 80) {
    return [37, 99, 235, 255];
  }
  return [15, 23, 42, 255];
});
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favBuf);
console.log('Created favicon.png');
