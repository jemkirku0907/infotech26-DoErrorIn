const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const timingsPath = path.resolve(__dirname, '../video/public/voiceover.timings.json');
const voicePath = path.resolve(__dirname, '../video/public/voiceover.mp3');
const qaDir = path.resolve(__dirname, '../qa');
fs.mkdirSync(qaDir, { recursive: true });

const timings = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));

function measureLoudness(filePath) {
  try {
    const out = execFileSync(
      'ffmpeg',
      ['-hide_banner', '-i', filePath, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return out;
  } catch (e) {
    return (e.stdout || '') + '\n' + (e.stderr || '');
  }
}

function parseEbur128(logText) {
  const iMatch = logText.match(/I:\s*([-\d.]+)\s*LUFS/);
  const lraMatch = logText.match(/LRA:\s*([-\d.]+)\s*LU/);
  const tpMatch = logText.match(/Peak:\s*([-\d.]+)\s*dBFS/);
  return {
    integratedLufs: iMatch ? parseFloat(iMatch[1]) : null,
    lraLu: lraMatch ? parseFloat(lraMatch[1]) : null,
    truePeakDbtp: tpMatch ? parseFloat(tpMatch[1]) : null,
  };
}

// 1. Check voiceover loudness & word integrity against scene boundaries
const voiceEbu = parseEbur128(measureLoudness(voicePath));

const boundaryChecks = [];
for (let i = 0; i < timings.scenes.length - 1; i++) {
  const curScene = timings.scenes[i];
  const nextScene = timings.scenes[i + 1];
  const boundaryFrame = curScene.endFrame;
  const lastWord = curScene.words[curScene.words.length - 1];
  const nextFirstWord = nextScene.words[0];

  const cutsWord = timings.allWords.some(
    (w) => boundaryFrame > w.startFrame && boundaryFrame < w.endFrame
  );
  boundaryChecks.push({
    boundary: `${curScene.id} -> ${nextScene.id}`,
    boundaryFrame,
    lastWordEndFrame: lastWord.endFrame,
    nextWordStartFrame: nextFirstWord.startFrame,
    clearanceAfterLastWordFrames: boundaryFrame - lastWord.endFrame,
    clearanceBeforeNextWordFrames: nextFirstWord.startFrame - boundaryFrame,
    cutsWord,
  });
}

// 2. Check for abrupt drops (>25 dB within 20ms) inside active spoken words using raw PCM RMS windows
const rawPcm = execFileSync(
  'ffmpeg',
  ['-v', 'error', '-i', voicePath, '-f', 's16le', '-ac', '1', '-ar', '48000', '-'],
  { maxBuffer: 60 * 1024 * 1024 }
);
const samples = new Int16Array(rawPcm.buffer, rawPcm.byteOffset, Math.floor(rawPcm.byteLength / 2));
const windowSize = 960; // 20ms at 48kHz

let abruptCutCount = 0;
for (const w of timings.allWords) {
  const wDur = w.endSec - w.startSec;
  if (wDur < 0.12) continue;
  // Check interior core of the word (excluding leading/trailing 30ms consonant/stop releases)
  const startSample = Math.floor((w.startSec + 0.03) * 48000);
  const endSample = Math.floor((w.endSec - 0.03) * 48000);
  let prevDb = null;
  for (let s = startSample; s + windowSize < endSample; s += windowSize) {
    let sumSq = 0;
    for (let k = 0; k < windowSize; k++) {
      const val = samples[s + k] / 32768;
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / windowSize);
    const db = 20 * Math.log10(Math.max(rms, 1e-5));
    if (prevDb !== null && prevDb > -28 && prevDb - db > 25) {
      abruptCutCount++;
    }
    prevDb = db;
  }
}

const report = {
  timestamp: new Date().toISOString(),
  voiceover: {
    durationSeconds: timings.voiceDurationSeconds,
    totalVideoSeconds: timings.totalDurationSeconds,
    totalVideoFrames: timings.totalDurationFrames,
    loudness: voiceEbu,
    abruptCutCount,
  },
  boundaryChecks,
};

fs.writeFileSync(path.join(qaDir, 'audio-qa.json'), JSON.stringify(report, null, 2));
console.log('Audio QA Summary:', JSON.stringify(report, null, 2));
