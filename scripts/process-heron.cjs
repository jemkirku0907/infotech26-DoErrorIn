const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\Cyril Jhune.CYRIL\\.gemini\\antigravity\\brain\\f2d5bac1-4660-4834-b712-89e17dd51ec7\\.user_uploaded\\media_1792411715320_2ffd86a2.png';

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function() {
    let minX = this.width, maxX = 0, minY = this.height, maxY = 0;

    // Mathematical alpha un-matting against pure white (255, 255, 255)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        // Background is pure white (255, 255, 255).
        // Distance from white:
        const dr = 255 - r;
        const dg = 255 - g;
        const db = 255 - b;
        const maxDist = Math.max(dr, dg, db);

        if (maxDist <= 6) {
          // Pure white background
          this.data[idx + 3] = 0;
        } else {
          // Estimate alpha from distance: if maxDist < 40, partial alpha
          let alpha = 1.0;
          if (maxDist < 50) {
            alpha = maxDist / 50;
          }
          
          // Un-matte color: C_fg = (C_obs - (1 - a) * 255) / a
          if (alpha < 0.99 && alpha > 0.05) {
            this.data[idx] = Math.max(0, Math.min(255, Math.round((r - (1 - alpha) * 255) / alpha)));
            this.data[idx + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - alpha) * 255) / alpha)));
            this.data[idx + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - alpha) * 255) / alpha)));
          }
          this.data[idx + 3] = Math.round(alpha * 255);

          if (this.data[idx + 3] > 15) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    console.log(`Heron bounding box: x=[${minX}, ${maxX}] (${maxX - minX + 1}px), y=[${minY}, ${maxY}] (${maxY - minY + 1}px)`);

    // Pad by 20px
    const pad = 20;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(this.width - cropX, (maxX - minX + 1) + pad * 2);
    const cropH = Math.min(this.height - cropY, (maxY - minY + 1) + pad * 2);

    const cropped = new PNG({ width: cropW, height: cropH });

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const srcIdx = (this.width * (cropY + y) + (cropX + x)) << 2;
        const dstIdx = (cropW * y + x) << 2;
        cropped.data[dstIdx] = this.data[srcIdx];
        cropped.data[dstIdx + 1] = this.data[srcIdx + 1];
        cropped.data[dstIdx + 2] = this.data[srcIdx + 2];
        cropped.data[dstIdx + 3] = this.data[srcIdx + 3];
      }
    }

    const out1 = path.join(__dirname, '..', 'public', 'heron-clean.png');
    const out2 = path.join(__dirname, '..', 'video', 'public', 'heron-clean.png');
    const outArtifact = 'C:\\Users\\Cyril Jhune.CYRIL\\.gemini\\antigravity\\brain\\f2d5bac1-4660-4834-b712-89e17dd51ec7\\heron-clean.png';

    const buffer = PNG.sync.write(cropped);
    fs.writeFileSync(out1, buffer);
    fs.writeFileSync(out2, buffer);
    fs.writeFileSync(outArtifact, buffer);

    console.log(`Optimized un-matted heron saved: ${cropW}x${cropH}`);
  });
