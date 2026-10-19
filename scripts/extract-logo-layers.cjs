const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const w = 1024;
const h = 819;
const raw = execFileSync(
  'ffmpeg',
  ['-v', 'error', '-i', 'logo-white-bg.png', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
  { maxBuffer: 50 * 1024 * 1024 }
);
const d = new Uint8Array(raw);

// Clean white background -> alpha while preserving colors and decontaminating anti-aliased edges
for (let i = 0; i < d.length; i += 4) {
  const r = d[i];
  const g = d[i + 1];
  const b = d[i + 2];
  const a = d[i + 3];
  const dist = Math.hypot(255 - r, 255 - g, 255 - b);
  const alpha = Math.max(0, Math.min(1, (dist - 22) / 42)) * (a / 255);
  if (alpha > 0.02 && alpha < 0.96) {
    d[i] = Math.round(Math.max(0, Math.min(255, (r - (1 - alpha) * 255) / Math.max(alpha, 0.12))));
    d[i + 1] = Math.round(Math.max(0, Math.min(255, (g - (1 - alpha) * 255) / Math.max(alpha, 0.12))));
    d[i + 2] = Math.round(Math.max(0, Math.min(255, (b - (1 - alpha) * 255) / Math.max(alpha, 0.12))));
  }
  d[i + 3] = Math.round(alpha * 255);
}

// Find connected components
const visited = new Uint8Array(w * h);
const compId = new Int32Array(w * h).fill(-1);
const comps = [];
const dirs = [-1, 0, 1, 0, 0, -1, 0, 1, -1, -1, 1, -1, -1, 1, 1, 1];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    if (visited[idx] || d[idx * 4 + 3] <= 8) continue;
    const id = comps.length;
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let count = 0;
    const q = [idx];
    visited[idx] = 1;
    compId[idx] = id;
    while (q.length > 0) {
      const cur = q.pop();
      const cy = Math.floor(cur / w);
      const cx = cur % w;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
      count++;
      for (let k = 0; k < 16; k += 2) {
        const nx = cx + dirs[k];
        const ny = cy + dirs[k + 1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!visited[nidx] && d[nidx * 4 + 3] > 8) {
            visited[nidx] = 1;
            compId[nidx] = id;
            q.push(nidx);
          }
        }
      }
    }
    comps.push({ id, minX, maxX, minY, maxY, count });
  }
}

const layerMap = { heron: [], taga: [], as: [], k: [], ai: [] };
for (const c of comps) {
  if (c.count <= 15) continue;
  if (c.minY < 150) layerMap.heron.push(c.id);
  else if (c.minY >= 250 && c.maxY <= 480) layerMap.taga.push(c.id);
  else if (c.minY >= 530 && c.maxX <= 285) layerMap.as.push(c.id);
  else if (c.minY >= 485 && c.minX >= 285 && c.maxX <= 460) layerMap.k.push(c.id);
  else if (c.minY >= 485 && c.minX >= 460 && c.maxX <= 700) layerMap.ai.push(c.id);
}

console.log('Mapped component IDs:', layerMap);

const outDirs = ['video/public/logo-layers', 'public/logo-layers'];
for (const dir of outDirs) fs.mkdirSync(dir, { recursive: true });

function savePng(buf, filename) {
  for (const dir of outDirs) {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-v',
        'error',
        '-f',
        'rawvideo',
        '-pix_fmt',
        'rgba',
        '-s',
        `${w}x${h}`,
        '-i',
        '-',
        path.join(dir, filename),
      ],
      { input: Buffer.from(buf) }
    );
  }
}

savePng(d, 'logo_full.png');

const bounds = {};
for (const [name, ids] of Object.entries(layerMap)) {
  const idSet = new Set(ids);
  const layerBuf = new Uint8Array(w * h * 4);
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  for (let i = 0; i < w * h; i++) {
    if (idSet.has(compId[i])) {
      const cy = Math.floor(i / w);
      const cx = i % w;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
      layerBuf[i * 4] = d[i * 4];
      layerBuf[i * 4 + 1] = d[i * 4 + 1];
      layerBuf[i * 4 + 2] = d[i * 4 + 2];
      layerBuf[i * 4 + 3] = d[i * 4 + 3];
    }
  }
  bounds[name] = { minX, maxX, minY, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  savePng(layerBuf, `layer_${name}.png`);
}

fs.writeFileSync('video/public/logo-layers/bounds.json', JSON.stringify({ width: w, height: h, bounds }, null, 2));
console.log('Saved bounds.json:', bounds);
