const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'out');
const QA_DIR = path.join(ROOT, 'qa');
fs.mkdirSync(QA_DIR, { recursive: true });

const mp4_16x9 = path.join(OUT_DIR, 'taga-ask-ai-promo-v1-16x9.mp4');
const mp4_9x16 = path.join(OUT_DIR, 'taga-ask-ai-promo-v1-9x16.mp4');

function probeFile(filePath) {
  const out = execSync(
    `ffprobe -v error -show_format -show_streams -of json "${filePath}"`,
    { encoding: 'utf8' }
  );
  return JSON.parse(out);
}

function measureLoudness(filePath) {
  const cmd = `ffmpeg -hide_banner -nostats -i "${filePath}" -af ebur128=peak=true -f null - 2>&1`;
  const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const summaryIdx = out.lastIndexOf('Summary:');
  const summary = summaryIdx >= 0 ? out.slice(summaryIdx) : out;
  const iMatch = summary.match(/I:\s*([-\d.]+)\s*LUFS/);
  const tpMatch = summary.match(/Peak:\s*([-\d.]+)\s*dBFS/);
  const lraMatch = summary.match(/LRA:\s*([-\d.]+)\s*LU/);
  return {
    integratedLufs: iMatch ? parseFloat(iMatch[1]) : null,
    truePeakDbtp: tpMatch ? parseFloat(tpMatch[1]) : null,
    lraLu: lraMatch ? parseFloat(lraMatch[1]) : null,
  };
}

console.log('1. Running ffprobe & EBU R128 Summary loudness on both deliverables...');
const probe16 = probeFile(mp4_16x9);
const probe9 = probeFile(mp4_9x16);
const loud16 = measureLoudness(mp4_16x9);
const loud9 = measureLoudness(mp4_9x16);

// 2. Frame-diff motion check: sample every 5 frames (6 fps) and compute mean pixel difference via tblend+signalstats+metadata=mode=print
console.log('2. Running frame-diff motion check (sampling every 5 frames)...');
const diffOut = execSync(
  `ffmpeg -hide_banner -i "${mp4_16x9}" -vf "select='not(mod(n\\,5))',setpts=N/TB,tblend=all_mode=difference,signalstats,metadata=mode=print" -f null - 2>&1`,
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);
const yavgMatches = [...diffOut.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((m) => parseFloat(m[1]));
let maxStaticStreakSamples = 0;
let currentStreak = 0;
for (let i = 1; i < yavgMatches.length; i++) {
  const val = yavgMatches[i];
  if (val < 0.05) {
    currentStreak++;
    if (currentStreak > maxStaticStreakSamples) maxStaticStreakSamples = currentStreak;
  } else {
    currentStreak = 0;
  }
}

const v16 = probe16.streams.find((s) => s.codec_type === 'video');
const a16 = probe16.streams.find((s) => s.codec_type === 'audio');
const v9 = probe9.streams.find((s) => s.codec_type === 'video');
const a9 = probe9.streams.find((s) => s.codec_type === 'audio');

const report = {
  timestamp: new Date().toISOString(),
  video16x9: {
    path: 'out/taga-ask-ai-promo-v1-16x9.mp4',
    sizeMB: +(fs.statSync(mp4_16x9).size / (1024 * 1024)).toFixed(2),
    durationSec: parseFloat(probe16.format.duration),
    video: {
      codec: v16.codec_name,
      profile: v16.profile,
      width: v16.width,
      height: v16.height,
      pix_fmt: v16.pix_fmt,
      color_space: v16.color_space,
      r_frame_rate: v16.r_frame_rate,
      nb_frames: v16.nb_frames,
    },
    audio: {
      codec: a16.codec_name,
      sample_rate: a16.sample_rate,
      channels: a16.channels,
      bit_rate: a16.bit_rate,
    },
    loudness: loud16,
  },
  video9x16: {
    path: 'out/taga-ask-ai-promo-v1-9x16.mp4',
    sizeMB: +(fs.statSync(mp4_9x16).size / (1024 * 1024)).toFixed(2),
    durationSec: parseFloat(probe9.format.duration),
    video: {
      codec: v9.codec_name,
      profile: v9.profile,
      width: v9.width,
      height: v9.height,
      pix_fmt: v9.pix_fmt,
      color_space: v9.color_space,
      r_frame_rate: v9.r_frame_rate,
      nb_frames: v9.nb_frames,
    },
    audio: {
      codec: a9.codec_name,
      sample_rate: a9.sample_rate,
      channels: a9.channels,
      bit_rate: a9.bit_rate,
    },
    loudness: loud9,
  },
  motionDiffCheck: {
    sampledFramesCount: yavgMatches.length,
    minYAvgDiff: +(Math.min(...yavgMatches.slice(1))).toFixed(3),
    avgYAvgDiff: +(yavgMatches.slice(1).reduce((a, b) => a + b, 0) / Math.max(1, yavgMatches.length - 1)).toFixed(3),
    maxYAvgDiff: +(Math.max(...yavgMatches.slice(1))).toFixed(3),
    maxStaticStreakSamples,
    maxStaticDurationSec: +((maxStaticStreakSamples * 5) / 30).toFixed(3),
    passedNoStaticStretchOverHalfSec: (maxStaticStreakSamples * 5) / 30 <= 0.5,
  },
};

fs.writeFileSync(path.join(QA_DIR, 'final-qa-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
