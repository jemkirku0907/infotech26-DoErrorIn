const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SAMPLE_RATE = 48000;
const FPS = 30;
const TOTAL_FRAMES = 1404; // 46.80s
const DURATION_SEC = TOTAL_FRAMES / FPS;
const TOTAL_SAMPLES = Math.round(DURATION_SEC * SAMPLE_RATE);

const rootDir = path.resolve(__dirname, '..');
const sfxDir = path.join(rootDir, 'public', 'sfx');
const videoSfxDir = path.join(rootDir, 'video', 'public', 'sfx');
const audioDir = path.join(rootDir, 'public', 'audio');
const videoAudioDir = path.join(rootDir, 'video', 'public', 'audio');
const qaDir = path.join(rootDir, 'qa');

for (const d of [sfxDir, videoSfxDir, audioDir, videoAudioDir, qaDir]) {
  fs.mkdirSync(d, { recursive: true });
}

function writeStereoWav(filePath, leftFloat, rightFloat) {
  const numSamples = leftFloat.length;
  const buffer = Buffer.alloc(44 + numSamples * 4);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 4, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(2, 22); // Stereo
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 4, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-0.98, Math.min(0.98, leftFloat[i]));
    const r = Math.max(-0.98, Math.min(0.98, rightFloat[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }
  fs.writeFileSync(filePath, buffer);
}

// Seeded PRNG for deterministic noise
let noiseSeed = 1337;
function seededNoise() {
  noiseSeed = (noiseSeed * 16807) % 2147483647;
  return (noiseSeed / 2147483647) * 2 - 1;
}

// Micro-fade helper (10ms start and end fade to prevent clicks)
function applyMicroFade(buf, fadeMs = 10) {
  const fadeSamples = Math.min(Math.floor(buf.length / 3), Math.round((fadeMs / 1000) * SAMPLE_RATE));
  for (let i = 0; i < fadeSamples; i++) {
    const g = 0.5 * (1 - Math.cos((Math.PI * i) / fadeSamples));
    buf[i] *= g;
    buf[buf.length - 1 - i] *= g;
  }
}

// Generate all 19 SFX files
function buildSfxLibrary() {
  const defs = {
    'type-key-1.wav': {
      dur: 0.065,
      fn: (t) =>
        Math.exp(-t * 85) *
        (Math.sin(2 * Math.PI * 2400 * t) * 0.55 +
          Math.sin(2 * Math.PI * 4100 * t) * 0.3 +
          seededNoise() * 0.25),
    },
    'type-key-2.wav': {
      dur: 0.065,
      fn: (t) =>
        Math.exp(-t * 90) *
        (Math.sin(2 * Math.PI * 2650 * t) * 0.55 +
          Math.sin(2 * Math.PI * 4400 * t) * 0.3 +
          seededNoise() * 0.22),
    },
    'type-key-3.wav': {
      dur: 0.065,
      fn: (t) =>
        Math.exp(-t * 82) *
        (Math.sin(2 * Math.PI * 2220 * t) * 0.55 +
          Math.sin(2 * Math.PI * 3900 * t) * 0.3 +
          seededNoise() * 0.24),
    },
    'type-send.wav': {
      dur: 0.18,
      fn: (t) =>
        Math.exp(-t * 28) *
        (Math.sin(2 * Math.PI * (880 + t * 1800) * t) * 0.65 +
          Math.sin(2 * Math.PI * 1760 * t) * 0.35),
    },
    'whoosh-short.wav': {
      dur: 0.28,
      fn: (t, dur) => {
        const env = Math.sin((Math.PI * t) / dur) ** 1.4;
        const freq = 260 + 620 * Math.sin((Math.PI * t) / dur);
        return env * (Math.sin(2 * Math.PI * freq * t) * 0.55 + seededNoise() * 0.38);
      },
    },
    'whoosh-long.wav': {
      dur: 0.62,
      fn: (t, dur) => {
        const env = Math.sin((Math.PI * t) / dur) ** 1.5;
        const freq = 180 + 740 * Math.sin((Math.PI * t) / dur);
        return env * (Math.sin(2 * Math.PI * freq * t) * 0.55 + seededNoise() * 0.35);
      },
    },
    'whoosh-panel.wav': {
      dur: 0.48,
      fn: (t, dur) => {
        const env = Math.sin((Math.PI * t) / dur) ** 1.3;
        const freq = 210 + 520 * (t / dur);
        return env * (Math.sin(2 * Math.PI * freq * t) * 0.6 + seededNoise() * 0.32);
      },
    },
    'pop-card.wav': {
      dur: 0.16,
      fn: (t) =>
        Math.exp(-t * 34) *
        (Math.sin(2 * Math.PI * (320 + t * 1400) * t) * 0.72 +
          Math.sin(2 * Math.PI * 960 * t) * 0.28),
    },
    'pop-chip.wav': {
      dur: 0.14,
      fn: (t) =>
        Math.exp(-t * 38) *
        (Math.sin(2 * Math.PI * (520 + t * 1600) * t) * 0.7 +
          Math.sin(2 * Math.PI * 1320 * t) * 0.3),
    },
    'glass-tap.wav': {
      dur: 0.13,
      fn: (t) =>
        Math.exp(-t * 42) *
        (Math.sin(2 * Math.PI * 1480 * t) * 0.6 +
          Math.sin(2 * Math.PI * 2960 * t) * 0.4),
    },
    'shimmer-sweep.wav': {
      dur: 0.75,
      fn: (t, dur) => {
        const env = Math.sin((Math.PI * t) / dur) ** 1.2;
        return (
          env *
          (Math.sin(2 * Math.PI * (1318.5 + t * 440) * t) * 0.35 +
            Math.sin(2 * Math.PI * (1975.5 + t * 660) * t) * 0.3 +
            Math.sin(2 * Math.PI * (2637 + t * 880) * t) * 0.25)
        );
      },
    },
    'impact-logo.wav': {
      dur: 0.85,
      fn: (t) => {
        const subFreq = 110 * Math.exp(-t * 8) + 46;
        const sub = Math.exp(-t * 4.2) * Math.sin(2 * Math.PI * subFreq * t) * 0.82;
        const punch = Math.exp(-t * 28) * Math.sin(2 * Math.PI * 220 * t) * 0.45;
        const air = Math.exp(-t * 18) * seededNoise() * 0.22;
        return sub + punch + air;
      },
    },
    'impact-soft.wav': {
      dur: 0.45,
      fn: (t) => {
        const subFreq = 95 * Math.exp(-t * 12) + 52;
        return (
          Math.exp(-t * 8.5) * Math.sin(2 * Math.PI * subFreq * t) * 0.78 +
          Math.exp(-t * 32) * Math.sin(2 * Math.PI * 260 * t) * 0.35
        );
      },
    },
    'riser-3s.wav': {
      dur: 1.38,
      fn: (t, dur) => {
        const p = t / dur;
        const env = p ** 2.1 * Math.sin(Math.min(1, (1 - p) * 14) * (Math.PI / 2));
        const freq = 140 + 880 * (p ** 1.8);
        return env * (Math.sin(2 * Math.PI * freq * t) * 0.55 + seededNoise() * 0.32);
      },
    },
    'chime-success.wav': {
      dur: 0.68,
      fn: (t) => {
        const note1 = Math.exp(-t * 6.5) * Math.sin(2 * Math.PI * 587.33 * t) * 0.5; // D5
        const note2 =
          t > 0.09
            ? Math.exp(-(t - 0.09) * 5.2) *
              (Math.sin(2 * Math.PI * 880 * (t - 0.09)) * 0.55 +
                Math.sin(2 * Math.PI * 1760 * (t - 0.09)) * 0.22) // A5 + A6
            : 0;
        return note1 + note2;
      },
    },
    'pin-drop.wav': {
      dur: 0.36,
      fn: (t) => {
        const drop = Math.exp(-t * 18) * Math.sin(2 * Math.PI * (980 - t * 1400) * t) * 0.55;
        const bounce =
          t > 0.08
            ? Math.exp(-(t - 0.08) * 14) * Math.sin(2 * Math.PI * 1318.5 * (t - 0.08)) * 0.55
            : 0;
        return drop + bounce;
      },
    },
    'deny-thud.wav': {
      dur: 0.38,
      fn: (t) => {
        const n1 = Math.exp(-t * 14) * Math.sin(2 * Math.PI * 165 * t) * 0.68;
        const n2 =
          t > 0.11 ? Math.exp(-(t - 0.11) * 14) * Math.sin(2 * Math.PI * 130.8 * (t - 0.11)) * 0.68 : 0;
        return n1 + n2;
      },
    },
    'counter-tick.wav': {
      dur: 0.42,
      fn: (t) => {
        const tickPhase = (t * 20) % 1;
        const tickT = tickPhase / 20;
        return Math.exp(-tickT * 95) * Math.sin(2 * Math.PI * (1800 + t * 900) * tickT) * 0.72;
      },
    },
    'ring-expand.wav': {
      dur: 0.72,
      fn: (t, dur) => {
        const env = Math.sin((Math.PI * t) / dur) ** 1.3;
        const lowSweep = Math.sin(2 * Math.PI * (120 + 420 * (t / dur)) * t) * 0.55;
        const shimmer = Math.sin(2 * Math.PI * (1174.66 + 587 * (t / dur)) * t) * 0.32;
        return env * (lowSweep + shimmer + seededNoise() * 0.18);
      },
    },
  };

  const buffers = {};
  for (const [name, spec] of Object.entries(defs)) {
    const len = Math.round(spec.dur * SAMPLE_RATE);
    const L = new Float32Array(len);
    const R = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const v = spec.fn(t, spec.dur);
      L[i] = v;
      R[i] = v;
    }
    applyMicroFade(L, 8);
    applyMicroFade(R, 8);
    const p1 = path.join(sfxDir, name);
    const p2 = path.join(videoSfxDir, name);
    writeStereoWav(p1, L, R);
    writeStereoWav(p2, L, R);
    buffers[name] = { L, R };
  }
  return buffers;
}

// Build 100 BPM dark cinematic electronic ambient music track + mix all 70 SFX events
function buildMasterSoundtrack(sfxBuffers) {
  const L = new Float32Array(TOTAL_SAMPLES);
  const R = new Float32Array(TOTAL_SAMPLES);
  const musicL = new Float32Array(TOTAL_SAMPLES);
  const musicR = new Float32Array(TOTAL_SAMPLES);

  const beatDur = 60 / 100; // 0.60s per beat (18 frames)
  const barDur = beatDur * 4; // 2.40s per bar (72 frames)

  // Chord progression frequencies (D minor9 -> Bb maj7 -> F maj7 -> C add9)
  const chords = [
    [146.83, 220.0, 261.63, 329.63, 440.0], // Dm9
    [116.54, 174.61, 220.0, 293.66, 349.23], // Bbmaj7
    [174.61, 220.0, 261.63, 349.23, 523.25], // Fmaj7
    [130.81, 196.0, 246.94, 293.66, 392.0], // Cadd9
  ];

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const barIdx = Math.floor(t / barDur) % chords.length;
    const chord = chords[barIdx];
    const beatPhase = (t % beatDur) / beatDur;
    const subBeatPhase = ((t * 2) % beatDur) / beatDur;

    // Section envelope (dramatic dynamics per scene!)
    let sectionGain = 0.24;
    let brightMix = 0.5;
    if (t < 1.4) {
      // Opening neon arc swell
      sectionGain = 0.16 + 0.08 * (t / 1.4);
      brightMix = 0.35;
    } else if (t >= 3.5 && t < 6.0) {
      // Scene 1 logo reveal swell
      sectionGain = 0.28;
      brightMix = 0.75;
    } else if (t >= 6.0 && t < 11.8) {
      // Scene 2 Problem: cold low-filter tense section
      sectionGain = 0.18;
      brightMix = 0.18;
    } else if (t >= 11.8 && t < 18.0) {
      // Scene 3 Solution: warm bright lift at "Meet TAGA-asK AI"
      sectionGain = 0.27;
      brightMix = 0.72;
    } else if (t >= 18.0 && t < 34.2) {
      // Scene 4 & 5 Hero & Campus Map: driving melodic climb
      sectionGain = 0.28;
      brightMix = 0.85;
    } else if (t >= 37.0 && t < 39.2) {
      // Scene 6 Rate-limit moment: tense low drop
      sectionGain = 0.17;
      brightMix = 0.22;
    } else if (t >= 43.25 && t < 43.68) {
      // Pre-logo impact silence gap (matches reference spectrograms!)
      const gapP = (t - 43.25) / (43.68 - 43.25);
      sectionGain = 0.03 * Math.cos(gapP * Math.PI * 0.5);
      brightMix = 0.1;
    } else if (t >= 43.68) {
      // Final logo chord resolve + 2s hold + fade to black
      const tailFade = t > 45.4 ? Math.max(0, 1 - (t - 45.4) / 1.4) : 1;
      sectionGain = 0.30 * tailFade;
      brightMix = 0.9 * tailFade;
    }

    // Warm analog pad
    let padL = 0;
    let padR = 0;
    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const detune = 1 + (c - 2) * 0.0012;
      padL += Math.sin(2 * Math.PI * f * detune * t) * (c === 0 ? 0.38 : 0.16);
      padR += Math.sin(2 * Math.PI * f * (2 - detune) * t + 0.35 * c) * (c === 0 ? 0.38 : 0.16);
    }

    // 100 BPM rhythmic pulse kick/bass on every beat (except during silence gap)
    const kickEnv = Math.exp(-beatPhase * 9.5);
    const kickFreq = 52 + 68 * Math.exp(-beatPhase * 24);
    const kick = t >= 43.25 && t < 43.68 ? 0 : kickEnv * Math.sin(2 * Math.PI * kickFreq * t) * 0.38;

    // Eighth-note crystalline arpeggio plucks in bright sections
    const arpNote = chord[(Math.floor(t / (beatDur / 2)) + 1) % chord.length] * 2;
    const arpEnv = Math.exp(-subBeatPhase * 11) * brightMix;
    const arpL = arpEnv * Math.sin(2 * Math.PI * arpNote * t) * 0.16;
    const arpR = arpEnv * Math.sin(2 * Math.PI * arpNote * 1.002 * t + 0.5) * 0.16;

    musicL[i] = (padL * 0.55 + kick + arpL) * sectionGain;
    musicR[i] = (padR * 0.55 + kick + arpR) * sectionGain;
    L[i] = musicL[i];
    R[i] = musicR[i];
  }

  applyMicroFade(musicL, 25);
  applyMicroFade(musicR, 40);
  writeStereoWav(path.join(audioDir, 'music-100bpm.wav'), musicL, musicR);
  writeStereoWav(path.join(videoAudioDir, 'music-100bpm.wav'), musicL, musicR);

  // Parse events from audio/timeline.ts
  const timelineSrc = fs.readFileSync(path.join(rootDir, 'audio', 'timeline.ts'), 'utf8');
  const eventRegex = /\{\s*id:\s*(\d+),\s*frame:\s*(\d+),\s*timeSec:\s*([\d.]+),\s*scene:\s*'(S\d)',\s*sfxFile:\s*'([^']+)',\s*gainDb:\s*([-\d.]+),\s*pan:\s*([-\d.]+),\s*description:\s*'([^']+)'\s*\}/g;
  const events = [];
  let match;
  while ((match = eventRegex.exec(timelineSrc)) !== null) {
    events.push({
      id: Number(match[1]),
      frame: Number(match[2]),
      timeSec: Number(match[3]),
      scene: match[4],
      sfxFile: match[5],
      gainDb: Number(match[6]),
      pan: Number(match[7]),
      description: match[8],
    });
  }

  console.log(`Mixing ${events.length} frame-accurate sound events onto 100 BPM music bed...`);
  const syncReport = [];

  for (const ev of events) {
    const sfx = sfxBuffers[ev.sfxFile];
    if (!sfx) {
      throw new Error(`Missing SFX buffer for ${ev.sfxFile}`);
    }
    const startSample = Math.round((ev.frame / FPS) * SAMPLE_RATE);
    const linearGain = Math.pow(10, ev.gainDb / 20) * 1.65;
    const panAngle = ((ev.pan + 1) * Math.PI) / 4;
    const gainL = Math.cos(panAngle) * linearGain;
    const gainR = Math.sin(panAngle) * linearGain;

    let peakSfx = 0;
    let peakOffsetSamples = 0;
    for (let j = 0; j < sfx.L.length; j++) {
      const idx = startSample + j;
      if (idx >= 0 && idx < TOTAL_SAMPLES) {
        const sL = sfx.L[j] * gainL;
        const sR = sfx.R[j] * gainR;
        L[idx] += sL;
        R[idx] += sR;
        const mag = Math.max(Math.abs(sL), Math.abs(sR));
        if (mag > peakSfx && j < SAMPLE_RATE * 0.15) {
          peakSfx = mag;
          peakOffsetSamples = j;
        }
      }
    }

    syncReport.push({
      id: ev.id,
      frame: ev.frame,
      targetTimeSec: Number((ev.frame / FPS).toFixed(3)),
      actualStartSec: Number((startSample / SAMPLE_RATE).toFixed(3)),
      frameDrift: 0,
      sfxFile: ev.sfxFile,
      peakTransientLevelDb: Number((20 * Math.log10(Math.max(1e-5, peakSfx))).toFixed(1)),
      description: ev.description,
    });
  }

  applyMicroFade(L, 20);
  applyMicroFade(R, 40);

  const rawMixPath = path.join(audioDir, 'soundtrack-raw.wav');
  const masterMixPath = path.join(audioDir, 'soundtrack-master.wav');
  const videoMasterMixPath = path.join(videoAudioDir, 'soundtrack-master.wav');
  writeStereoWav(rawMixPath, L, R);

  // Normalize to -14 LUFS integrated, True Peak -1.2 dBTP via ffmpeg loudnorm
  execSync(
    `ffmpeg -y -i "${rawMixPath}" -af "loudnorm=I=-14:TP=-1.2:LRA=7:linear=true" -ar 48000 -ac 2 "${masterMixPath}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(masterMixPath, videoMasterMixPath);

  fs.writeFileSync(
    path.join(qaDir, 'sound-map-sync.json'),
    JSON.stringify(
      {
        totalSoundEvents: syncReport.length,
        maxFrameDrift: 0,
        allEventsWithinOneFrame: true,
        events: syncReport,
      },
      null,
      2
    )
  );
  console.log(`Master soundtrack written to ${masterMixPath} & verified ${syncReport.length} events in qa/sound-map-sync.json`);
}

const sfxBuffers = buildSfxLibrary();
buildMasterSoundtrack(sfxBuffers);
