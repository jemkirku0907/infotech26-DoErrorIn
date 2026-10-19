const fs = require('fs');
const path = require('path');

const lottieDirs = [
  path.resolve(__dirname, '../video/public/lottie'),
  path.resolve(__dirname, '../public/lottie'),
];
for (const d of lottieDirs) fs.mkdirSync(d, { recursive: true });

// Helper to create valid Bodymovin/Lottie v5.7 JSON animations
function makeCheckLottie() {
  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 45,
    w: 120,
    h: 120,
    nm: 'VerifiedCheck',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'CheckStroke',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [60, 60, 100], e: [112, 112, 100], i: { x: [0.2], y: [1] }, o: { x: [0.3], y: [0] } },
              { t: 14, s: [112, 112, 100], e: [100, 100, 100], i: { x: [0.3], y: [1] }, o: { x: [0.3], y: [0] } },
              { t: 24, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ind: 0,
                ty: 'sh',
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-24, 2], [-6, 20], [28, -16]],
                    c: false,
                  },
                },
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 0, s: [0], e: [100], i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] } },
                    { t: 18, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.133, 0.671, 0.89, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 10 },
                lc: 2,
                lj: 2,
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
          {
            ty: 'gr',
            it: [
              {
                ty: 'el',
                s: { a: 0, k: [96, 96] },
                p: { a: 0, k: [0, 0] },
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.957, 0.922, 0.165, 1] },
                o: { a: 0, k: 90 },
                w: { a: 0, k: 4 },
              },
              {
                ty: 'fl',
                c: { a: 0, k: [0.133, 0.671, 0.89, 0.18] },
                o: { a: 0, k: 100 },
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
        ip: 0,
        op: 45,
        st: 0,
      },
    ],
  };
}

function makeShieldLottie() {
  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 60,
    w: 140,
    h: 140,
    nm: 'SecurityShield',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'ShieldOutline',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [70, 70, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [80, 80, 100], e: [105, 105, 100], i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] } },
              { t: 20, s: [105, 105, 100], e: [100, 100, 100], i: { x: [0.3], y: [1] }, o: { x: [0.3], y: [0] } },
              { t: 35, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ind: 0,
                ty: 'sh',
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [-14, 18], [0, 0], [14, 18]],
                    o: [[0, 0], [0, 22], [14, -18], [0, -22], [0, 0]],
                    v: [[0, -48], [42, -30], [36, 12], [0, 50], [-36, 12], [-42, -30]],
                    c: true,
                  },
                },
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 0, s: [0], e: [100], i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] } },
                    { t: 24, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.231, 0.424, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 2,
              },
              {
                ty: 'fl',
                c: { a: 0, k: [0.133, 0.671, 0.89, 0.15] },
                o: { a: 0, k: 80 },
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
      },
    ],
  };
}

function makeMapPinLottie() {
  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 60,
    w: 120,
    h: 120,
    nm: 'MapPinBounce',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Pin',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 0, s: [60, 15, 0], e: [60, 68, 0], i: { x: 0.2, y: 1 }, o: { x: 0.4, y: 0 } },
              { t: 14, s: [60, 68, 0], e: [60, 52, 0], i: { x: 0.3, y: 1 }, o: { x: 0.3, y: 0 } },
              { t: 24, s: [60, 52, 0], e: [60, 60, 0], i: { x: 0.3, y: 1 }, o: { x: 0.3, y: 0 } },
              { t: 34, s: [60, 60, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ind: 0,
                ty: 'sh',
                ks: {
                  a: 0,
                  k: {
                    i: [[-18, 0], [0, -18], [0, 0], [0, 18]],
                    o: [[18, 0], [0, 18], [0, 0], [0, -18]],
                    v: [[0, -36], [28, -8], [0, 34], [-28, -8]],
                    c: true,
                  },
                },
              },
              {
                ty: 'fl',
                c: { a: 0, k: [0.957, 0.922, 0.165, 1] },
                o: { a: 0, k: 100 },
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.165, 0.224, 0.565, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 5 },
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
      },
    ],
  };
}

function makeUploadProgressLottie() {
  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 45,
    w: 120,
    h: 120,
    nm: 'UploadProgressRing',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Ring',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: -90 },
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'el',
                s: { a: 0, k: [88, 88] },
                p: { a: 0, k: [0, 0] },
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 0, s: [0], e: [100], i: { x: [0.25], y: [1] }, o: { x: [0.25], y: [0] } },
                    { t: 30, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.133, 0.671, 0.89, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 9 },
                lc: 2,
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
        ip: 0,
        op: 45,
        st: 0,
      },
    ],
  };
}

const files = {
  'check.json': makeCheckLottie(),
  'shield.json': makeShieldLottie(),
  'map-pin.json': makeMapPinLottie(),
  'upload-progress.json': makeUploadProgressLottie(),
};

for (const dir of lottieDirs) {
  for (const [name, json] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(json, null, 2));
  }
  fs.writeFileSync(
    path.join(dir, 'LICENSES.md'),
    `# Lottie Animation Licenses (\`/public/lottie/LICENSES.md\`)\n\n| File | Purpose | License |\n|---|---|---|\n| \`check.json\` | Verified source & login check mark pop | CC0 1.0 Universal (Public Domain / Custom Authored Vector JSON) |\n| \`shield.json\` | UMak security & rate-limit shield stroke | CC0 1.0 Universal (Public Domain / Custom Authored Vector JSON) |\n| \`map-pin.json\` | Interactive campus map pin bounce | CC0 1.0 Universal (Public Domain / Custom Authored Vector JSON) |\n| \`upload-progress.json\` | File upload radial progress ring | CC0 1.0 Universal (Public Domain / Custom Authored Vector JSON) |\n`
  );
}
console.log('Generated all Lottie animations and public/lottie/LICENSES.md');
