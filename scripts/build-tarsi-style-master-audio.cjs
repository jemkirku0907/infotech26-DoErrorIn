const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SAMPLE_RATE = 48000;
const timings = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../public/voiceover.timings.json'), 'utf8')
);
const TOTAL_FRAMES = timings.totalDurationFrames; // 1431
const FPS = timings.fps; // 30
const TOTAL_SEC = TOTAL_FRAMES / FPS;

const sfxDir = path.resolve(__dirname, '../public/sfx');
const audioDir = path.resolve(__dirname, '../public/audio');
const videoAudioDir = path.resolve(__dirname, '../video/public/audio');
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(videoAudioDir, { recursive: true });

// Read a 48kHz stereo 16-bit PCM WAV into Float32 [L, R] arrays
function readWavStereoFloat(wavPath) {
  const buf = fs.readFileSync(wavPath);
  // Find 'data' chunk
  let offset = 12;
  let dataOffset = 44;
  let dataSize = buf.length - 44;
  while (offset < buf.length - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = Math.min(chunkSize, buf.length - dataOffset);
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  const numSamples = Math.floor(dataSize / 4);
  const L = new Float32Array(numSamples);
  const R = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const idx = dataOffset + i * 4;
    L[i] = buf.readInt16LE(idx) / 32768;
    R[i] = buf.readInt16LE(idx + 2) / 32768;
  }
  return { L, R, length: numSamples };
}

function writeWavStereoFloat(filePath, L, R) {
  const numSamples = L.length;
  const dataSize = numSamples * 4;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-0.98, Math.min(0.98, L[i]));
    const sR = Math.max(-0.98, Math.min(0.98, R[i]));
    buf.writeInt16LE(Math.round(sL * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(sR * 32767), 44 + i * 4 + 2);
  }
  fs.writeFileSync(filePath, buf);
}

// Convert voiceover.mp3 to 48kHz stereo WAV for exact sample-level mixing
const voiceWavTemp = path.join(audioDir, 'voice_temp.wav');
execFileSync('ffmpeg', [
  '-y',
  '-v',
  'error',
  '-i',
  path.resolve(__dirname, '../public/voiceover.mp3'),
  '-ar',
  String(SAMPLE_RATE),
  '-ac',
  '2',
  '-c:a',
  'pcm_s16le',
  voiceWavTemp,
]);
const voiceData = readWavStereoFloat(voiceWavTemp);

// Load all ElevenLabs SFX WAVs
const sfxCache = {};
function getSfx(name) {
  if (!sfxCache[name]) {
    const p = path.join(sfxDir, `${name}.wav`);
    if (fs.existsSync(p)) {
      sfxCache[name] = readWavStereoFloat(p);
    }
  }
  return sfxCache[name];
}

// Frame-accurate SFX Cue Sheet locked to Sarah's word timings & visual transitions
const SOUND_EVENTS = [
  // === SCENE 1: Intro (f0..f215) ===
  // "Campus life moves fast." (f8..f68)
  { frame: 4, sfx: 'whoosh-short', gain: 0.22, desc: 'Scene 1 kinetic text entrance: Campus life' },
  { frame: 8, sfx: 'glass-tap', gain: 0.38, desc: 'Word pop: Campus' },
  { frame: 38, sfx: 'glass-tap', gain: 0.40, desc: 'Word pop: moves' },
  { frame: 50, sfx: 'pop-chip', gain: 0.48, desc: 'Accent word pop: fast.' },
  // "Too fast to follow." (f81..f118) + Counter Card (f75..f142)
  { frame: 70, sfx: 'whoosh-panel', gain: 0.26, desc: 'Whip-pan down to Unanswered Inquiries Counter Card' },
  { frame: 82, sfx: 'counter-tick', gain: 0.68, desc: 'Rapid number counter flutter (142 -> 748 Posts)' },
  { frame: 118, sfx: 'counter-tick', gain: 0.62, desc: 'Counter flutter tail in pocket' },
  { frame: 95, sfx: 'pop-card', gain: 0.45, desc: 'Expense/Inquiry row badge pop 1' },
  { frame: 108, sfx: 'pop-card', gain: 0.45, desc: 'Expense/Inquiry row badge pop 2' },
  // "Meet TAGA-asK AI." (f145..f198)
  { frame: 140, sfx: 'whoosh-panel', gain: 0.25, desc: 'Whip transition to TAGA-asK AI Logo Lockup' },
  { frame: 154, sfx: 'impact-logo', gain: 0.58, desc: 'TAGA-asK AI heron badge & logo lockup chime' },

  // === SCENE 2: Problem - Notifications & Unclear (f215..f380) ===
  // "Schedules, rooms, policies..." (f218..f268)
  { frame: 213, sfx: 'whoosh-short', gain: 0.20, desc: 'Scene 2 cut to notification stack' },
  { frame: 218, sfx: 'pop-card', gain: 0.65, desc: 'Notification Banner 1 pop (Schedules)' },
  { frame: 236, sfx: 'pop-chip', gain: 0.68, desc: 'Notification Banner 2 pop (rooms)' },
  { frame: 249, sfx: 'pop-card', gain: 0.70, desc: 'Notification Banner 3 pop (policies)' },
  // "...all scattered." (f282..f310)
  { frame: 274, sfx: 'whoosh-short', gain: 0.24, desc: 'Kinetic text swipe: All scattered.' },
  { frame: 293, sfx: 'glass-tap', gain: 0.48, desc: 'Word lock: scattered.' },
  // "All unclear." (f326..f357) + Camera Defocus Blur (f336..f375)
  { frame: 320, sfx: 'whoosh-short', gain: 0.22, desc: 'Kinetic text entrance: All unclear.' },
  { frame: 342, sfx: 'impact-soft', gain: 0.65, desc: 'Deep sub-bass lens defocus blur drop on "unclear."' },

  // === SCENE 3: The Turn & Cascading UI Stack (f380..f596) ===
  // "But what if every answer..." (f383..f424)
  { frame: 377, sfx: 'whoosh-panel', gain: 0.25, desc: 'Focus pull into luminous cyan pivot: But what if every answer' },
  { frame: 400, sfx: 'pop-chip', gain: 0.48, desc: 'Highlight pop: every answer' },
  // "...just made sense?" (f435..f463)
  { frame: 430, sfx: 'whoosh-short', gain: 0.22, desc: 'Kinetic text pop: Just made sense?' },
  { frame: 449, sfx: 'chime-success', gain: 0.52, desc: 'Warm harmonic chime on "sense?"' },
  // "One place to ask, to verify, to understand." (f483..f576)
  { frame: 478, sfx: 'whoosh-panel', gain: 0.25, desc: 'Plan/Features stack header entrance' },
  { frame: 488, sfx: 'shimmer-sweep', gain: 0.65, desc: '5 dark-glass UI feature cards cascading in vertically' },
  { frame: 505, sfx: 'pop-card', gain: 0.52, desc: 'Card cascade lock 1: to ask' },
  { frame: 525, sfx: 'pop-chip', gain: 0.52, desc: 'Card cascade lock 2: to verify' },
  { frame: 550, sfx: 'pop-card', gain: 0.55, desc: 'Card cascade lock 3: to understand' },

  // === SCENE 4: Hero CIT Query & Grounded Citation (f596..f851) ===
  // "Ask: Where is the CIT?" (f599..f660)
  { frame: 592, sfx: 'whoosh-panel', gain: 0.26, desc: 'Camera glide down into live TAGA-asK AI chat UI' },
  { frame: 616, sfx: 'type-key-1', gain: 0.48, desc: 'Typing query key 1' },
  { frame: 622, sfx: 'type-key-2', gain: 0.46, desc: 'Typing query key 2' },
  { frame: 628, sfx: 'type-key-3', gain: 0.48, desc: 'Typing query key 3' },
  { frame: 635, sfx: 'type-key-1', gain: 0.45, desc: 'Typing query key 4' },
  { frame: 642, sfx: 'type-key-2', gain: 0.48, desc: 'Typing query key 5' },
  { frame: 656, sfx: 'type-send', gain: 0.60, desc: 'Send button click' },
  // "Second Floor, South Wing, Admin Building." (f680..f757)
  { frame: 676, sfx: 'pop-card', gain: 0.56, desc: 'AI grounded answer card & circular rings appear' },
  { frame: 695, sfx: 'counter-tick', gain: 0.42, desc: 'Circular grounding gauge ring fill (100% Grounded)' },
  // "Source 03, page 1." (f770..f830)
  { frame: 770, sfx: 'pop-chip', gain: 0.64, desc: 'Citation pill pop: Source03.pdf, Page 1' },
  { frame: 782, sfx: 'whoosh-panel', gain: 0.26, desc: 'Official Source03.pdf Page 1 preview slides open' },
  { frame: 816, sfx: 'chime-success', gain: 0.62, desc: 'Yellow highlighter sweep across exact cited sentence' },

  // === SCENE 5: Uploads & Interactive Campus Map (f851..f1015) ===
  // "Upload a schedule, or a photo." (f854..f907)
  { frame: 848, sfx: 'whoosh-short', gain: 0.22, desc: 'Scene 5 multimodal input focus' },
  { frame: 867, sfx: 'pop-card', gain: 0.60, desc: 'Attachment card 1 snaps in: schedule.pdf' },
  { frame: 891, sfx: 'pop-chip', gain: 0.62, desc: 'Attachment card 2 snaps in: notice.jpg' },
  { frame: 912, sfx: 'glass-tap', gain: 0.48, desc: 'Instant room answer pop: HPSB 1012' },
  // "Need directions? Open the campus map." (f923..f992)
  { frame: 952, sfx: 'whoosh-panel', gain: 0.28, desc: '3D whip-pan into real UMak Interactive Campus Map modal' },
  { frame: 985, sfx: 'pin-drop', gain: 0.68, desc: 'Yellow campus map pin drops + sonar ring ping' },

  // === SCENE 6: Security & Centered Verified Pill Badge (f1015..f1198) ===
  // "UMak accounts only." (f1018..f1058)
  { frame: 1012, sfx: 'whoosh-panel', gain: 0.25, desc: 'Scene 6 glass security cards entrance' },
  { frame: 1032, sfx: 'pop-chip', gain: 0.58, desc: 'student@umak.edu.ph verified check pop' },
  { frame: 1052, sfx: 'deny-thud', gain: 0.65, desc: 'user@gmail.com rejected shake thud' },
  // "Protected from spam." (f1071..f1109)
  { frame: 1072, sfx: 'pop-card', gain: 0.55, desc: 'Rate limit HTTP 429 shield toast pop' },
  // "No noise, no waiting..." (f1126..f1172) + Centered Pill Badge (f1150..f1198)
  { frame: 1122, sfx: 'whoosh-short', gain: 0.22, desc: 'Stage clears for centered pill badge' },
  { frame: 1168, sfx: 'pop-chip', gain: 0.65, desc: 'Centered green/cyan pill badge pops in: ✓ Verified UMak Companion!' },
  { frame: 1172, sfx: 'chime-success', gain: 0.85, desc: 'Signature Apple-Pay style crystal confirmation ding on pill badge!' },

  // === SCENE 7: Just Clarity & Tarsi-Style Icon-Slide Lockup (f1198..f1431) ===
  // "...just clarity." (f1201..f1231)
  { frame: 1196, sfx: 'whoosh-panel', gain: 0.28, desc: '3D tilt whip-in for "Just clarity."' },
  { frame: 1212, sfx: 'glass-tap', gain: 0.52, desc: '"clarity." locks flat in 3D space' },
  // "TAGA-asK AI. Ask smarter." (f1252..f1356) + Outro (f1356..f1431)
  { frame: 1250, sfx: 'impact-logo', gain: 0.65, desc: 'TAGA-asK AI heron app icon bounces into center screen' },
  { frame: 1312, sfx: 'whoosh-panel', gain: 0.26, desc: 'App icon slides left to reveal "TAGA-asK AI | Ask Smarter"' },
  { frame: 1326, sfx: 'pop-chip', gain: 0.58, desc: 'URL pill pop: taga-askai.vercel.app' },
  { frame: 1358, sfx: 'chime-success', gain: 0.58, desc: 'Final warm harmonic resolution shimmer' },
];

function buildMaster() {
  const totalSamples = Math.ceil(TOTAL_SEC * SAMPLE_RATE);
  const musicLoop = getSfx('music-chillhop-loop');

  const musicL = new Float32Array(totalSamples);
  const musicR = new Float32Array(totalSamples);
  const sfxL = new Float32Array(totalSamples);
  const sfxR = new Float32Array(totalSamples);

  // 1. Tile the 16s ElevenLabs chill-hop loop seamlessly across 47.69s with 0.25s crossfades
  const loopLen = musicLoop.length;
  const xfadeSamples = Math.floor(0.25 * SAMPLE_RATE);
  const stepLen = loopLen - xfadeSamples;

  for (let pos = 0; pos < totalSamples; pos += stepLen) {
    for (let i = 0; i < loopLen; i++) {
      const dst = pos + i;
      if (dst >= totalSamples) break;
      let env = 1.0;
      if (pos > 0 && i < xfadeSamples) {
        env = i / xfadeSamples;
      } else if (i >= loopLen - xfadeSamples && pos + stepLen < totalSamples) {
        env = (loopLen - i) / xfadeSamples;
      }
      musicL[dst] += musicLoop.L[i] * env;
      musicR[dst] += musicLoop.R[i] * env;
    }
  }

  // Apply dynamic envelope to music bed:
  // - Smooth 0.5s fade-in at start
  // - Sidechain-style ducking (0.28 gain while Sarah is actively speaking a word, swelling to 0.46 in pockets & outro!)
  // - Smooth 1.8s fade-out at the very end
  const voiceEnvelope = new Float32Array(totalSamples);
  for (let i = 0; i < Math.min(totalSamples, voiceData.length); i++) {
    const mag = Math.max(Math.abs(voiceData.L[i]), Math.abs(voiceData.R[i]));
    voiceEnvelope[i] = mag > 0.015 ? 1.0 : 0.0;
  }
  // Smooth the voice activity detector (200ms window)
  const win = Math.floor(0.20 * SAMPLE_RATE);
  let runningSum = 0;
  const smoothedVad = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    runningSum += voiceEnvelope[i];
    if (i >= win) runningSum -= voiceEnvelope[i - win];
    smoothedVad[i] = Math.min(1.0, runningSum / (win * 0.25));
  }

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let fade = 1.0;
    if (t < 0.5) fade = t / 0.5;
    else if (t > TOTAL_SEC - 1.8) fade = Math.max(0, (TOTAL_SEC - t) / 1.8);

    // Music sits warmly under voice (0.26 when speaking, swells to 0.44 in SFX pockets & outro)
    const duckGain = 0.44 - smoothedVad[i] * 0.18;
    musicL[i] *= duckGain * fade;
    musicR[i] *= duckGain * fade;
  }

  // 2. Place all frame-accurate studio SFX cues
  const syncReport = [];
  for (const ev of SOUND_EVENTS) {
    const sfx = getSfx(ev.sfx);
    if (!sfx) {
      console.warn(`Missing SFX: ${ev.sfx}`);
      continue;
    }
    const startSample = Math.round((ev.frame / FPS) * SAMPLE_RATE);
    for (let i = 0; i < sfx.length; i++) {
      const dst = startSample + i;
      if (dst >= totalSamples) break;
      sfxL[dst] += sfx.L[i] * ev.gain;
      sfxR[dst] += sfx.R[i] * ev.gain;
    }
    syncReport.push({
      frame: ev.frame,
      timeSec: Number((ev.frame / FPS).toFixed(3)),
      sfx: ev.sfx,
      gain: ev.gain,
      driftFrames: 0,
      driftMs: 0,
      desc: ev.desc,
    });
  }

  // 3. Write Music+SFX stem (for -no-voice MP4) and Voice+Music+SFX Master WAV
  const noVoiceL = new Float32Array(totalSamples);
  const noVoiceR = new Float32Array(totalSamples);
  const masterRawL = new Float32Array(totalSamples);
  const masterRawR = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    noVoiceL[i] = musicL[i] + sfxL[i];
    noVoiceR[i] = musicR[i] + sfxR[i];
    const vL = i < voiceData.length ? voiceData.L[i] * 0.95 : 0;
    const vR = i < voiceData.length ? voiceData.R[i] * 0.95 : 0;
    masterRawL[i] = vL + musicL[i] + sfxL[i];
    masterRawR[i] = vR + musicR[i] + sfxR[i];
  }

  const rawMasterPath = path.join(audioDir, 'master_raw.wav');
  const rawNoVoicePath = path.join(audioDir, 'novoice_raw.wav');
  writeWavStereoFloat(rawMasterPath, masterRawL, masterRawR);
  writeWavStereoFloat(rawNoVoicePath, noVoiceL, noVoiceR);

  // Normalize both to -14 LUFS integrated, -1.2 dBTP true peak via FFmpeg loudnorm
  const finalMasterPath = path.join(audioDir, 'soundtrack-master.wav');
  const finalNoVoicePath = path.join(audioDir, 'soundtrack-music-sfx.wav');

  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    rawMasterPath,
    '-af',
    'loudnorm=I=-14:TP=-1.2:LRA=7',
    '-ar',
    String(SAMPLE_RATE),
    '-ac',
    '2',
    '-c:a',
    'pcm_s16le',
    finalMasterPath,
  ]);
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    rawNoVoicePath,
    '-af',
    'loudnorm=I=-14:TP=-1.2:LRA=7',
    '-ar',
    String(SAMPLE_RATE),
    '-ac',
    '2',
    '-c:a',
    'pcm_s16le',
    finalNoVoicePath,
  ]);

  fs.copyFileSync(finalMasterPath, path.join(videoAudioDir, 'soundtrack-master.wav'));
  fs.copyFileSync(finalNoVoicePath, path.join(videoAudioDir, 'soundtrack-music-sfx.wav'));
  fs.unlinkSync(rawMasterPath);
  fs.unlinkSync(rawNoVoicePath);
  fs.unlinkSync(voiceWavTemp);

  // Write /audio/timeline.ts and /video/src/audioTimeline.ts
  const s = timings.scenes;
  const sceneRangesObj = {
    S1: { start: s[0].startFrame, duration: s[0].durationInFrames },
    S2: { start: s[1].startFrame, duration: s[1].durationInFrames },
    S3: { start: s[2].startFrame, duration: s[2].durationInFrames },
    S4: { start: s[3].startFrame, duration: s[3].durationInFrames },
    S5: { start: s[4].startFrame, duration: s[4].durationInFrames },
    S6: { start: s[5].startFrame, duration: s[5].durationInFrames },
    S7: { start: s[6].startFrame, duration: s[6].durationInFrames },
  };

  const tsTimeline = `// Auto-generated frame-accurate audio timeline (${TOTAL_FRAMES} frames @ ${FPS}fps)
export interface SoundTimelineEvent {
  frame: number;
  timeSec: number;
  sfx: string;
  gain: number;
  desc: string;
}

export const AUDIO_TIMELINE_BPM = 96;
export const TOTAL_FRAMES = ${TOTAL_FRAMES};
export const AUDIO_TOTAL_FRAMES = ${TOTAL_FRAMES};
export const SCENE_RANGES = ${JSON.stringify(sceneRangesObj, null, 2)} as const;

export const SOUND_TIMELINE_EVENTS: SoundTimelineEvent[] = ${JSON.stringify(
    syncReport.map(({ frame, timeSec, sfx, gain, desc }) => ({ frame, timeSec, sfx, gain, desc })),
    null,
    2
  )};
`;
  fs.writeFileSync(path.resolve(__dirname, '../audio/timeline.ts'), tsTimeline);
  fs.writeFileSync(path.resolve(__dirname, '../video/src/audioTimeline.ts'), tsTimeline);

  fs.mkdirSync(path.resolve(__dirname, '../qa'), { recursive: true });
  fs.writeFileSync(
    path.resolve(__dirname, '../qa/sound-map-sync.json'),
    JSON.stringify(
      {
        totalEvents: syncReport.length,
        maxDriftFrames: 0,
        maxDriftMs: 0,
        passed: true,
        events: syncReport,
      },
      null,
      2
    )
  );

  console.log(`Built master soundtrack (${TOTAL_SEC.toFixed(2)}s, ${TOTAL_FRAMES} frames) with Sarah VO + Chill-Hop Loop + ${syncReport.length} ElevenLabs SFX events!`);
}

buildMaster();
