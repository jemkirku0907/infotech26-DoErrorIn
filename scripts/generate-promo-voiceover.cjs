const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ELEVENLABS_API_KEY=(.+)/);
if (!match) {
  console.error('ELEVENLABS_API_KEY not found in .env');
  process.exit(1);
}
const apiKey = match[1].trim();

// Voice: Bella (hpp4J3VqNfWAUOO0d1Us) - Warm, confident, clear Taglish delivery
const VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us';

// Phonetically clear single-take script matching /script/voiceover.txt
const TTS_TEXT = `Introducing TAGA-asK A.I., your UMak A.I. companion.

May tanong ka? Pero sino ang sasagot? Hours of waiting in Facebook groups, still zero replies.

Meet TAGA-asK A.I.. Ask any campus question, and get instant answers grounded in official UMak documents.

Where is the C.I.T.? The Center for Information Technology is on the Second Floor, South Wing, Admin Building. And it shows the exact source: Source zero three, page one.

Have a class schedule, a form, or a notice? Upload an image or a PDF and ask right about it. Need directions? Open the interactive campus map.

Built-in security. Sign-in is strictly limited to UMak Google accounts, and smart rate limiting keeps it safe from spam and abuse.

Less waiting. Easier access to information. Ask smarter. Stay connected with UMak.`;

function normalizeDisplayWord(w) {
  let clean = w;
  clean = clean.replace(/TAGA-Ask/gi, 'TAGA-asK');
  clean = clean.replace(/A\.I\.\./g, 'AI.');
  clean = clean.replace(/A\.I\.,/g, 'AI,');
  clean = clean.replace(/A\.I\./g, 'AI');
  clean = clean.replace(/C\.I\.T\.\?/g, 'CIT?');
  clean = clean.replace(/C\.I\.T\./g, 'CIT');
  return clean;
}

async function run() {
  console.log('Requesting single-take voiceover with word timestamps from ElevenLabs...');
  const rawVoicePath = path.resolve(__dirname, '../video/public/voiceover_raw.mp3');
  const rawJsonPath = path.resolve(__dirname, '../video/public/voiceover_raw_align.json');

  let data;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: TTS_TEXT,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.82,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });

  if (res.ok) {
    data = await res.json();
    fs.writeFileSync(rawJsonPath, JSON.stringify(data, null, 2));
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    fs.writeFileSync(rawVoicePath, audioBuffer);
    console.log(`Saved raw ElevenLabs voiceover (${audioBuffer.length} bytes)`);
  } else {
    const errText = await res.text();
    console.warn(`ElevenLabs returned ${res.status}: ${errText}`);
    if (fs.existsSync(path.resolve(__dirname, '../video/public/voiceover.mp3')) && fs.existsSync(path.resolve(__dirname, '../video/public/voiceover.timings.json'))) {
      console.log('Falling back to existing verified single-take voiceover & timings.');
      return;
    }
    process.exit(1);
  }

  // Parse character alignment into words first
  const align = data.alignment;
  const chars = align.characters;
  const starts = align.character_start_times_seconds;
  const ends = align.character_end_times_seconds;

  const rawWords = [];
  let curWord = '';
  let wStart = null;
  let wEnd = null;

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === ' ' || c === '\n' || c === '\r') {
      if (curWord) {
        rawWords.push({
          word: normalizeDisplayWord(curWord),
          startSec: wStart,
          endSec: wEnd,
        });
        curWord = '';
        wStart = null;
        wEnd = null;
      }
    } else {
      if (wStart === null) wStart = starts[i];
      wEnd = ends[i];
      curWord += c;
    }
  }
  if (curWord) {
    rawWords.push({
      word: normalizeDisplayWord(curWord),
      startSec: wStart,
      endSec: wEnd,
    });
  }

  // Merge spoken "zero" + "three," -> "03," and "one." -> "1." if adjacent
  const mergedWords = [];
  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    const next = rawWords[i + 1];
    if (w.word.toLowerCase() === 'zero' && next && next.word.toLowerCase().startsWith('three')) {
      const punct = next.word.endsWith(',') ? ',' : '';
      mergedWords.push({
        word: `03${punct}`,
        startSec: w.startSec,
        endSec: next.endSec,
      });
      i++;
    } else if (w.word.toLowerCase() === 'one.' && i > 0 && rawWords[i - 1].word.toLowerCase() === 'page') {
      mergedWords.push({
        word: '1.',
        startSec: w.startSec,
        endSec: w.endSec,
      });
    } else {
      mergedWords.push(w);
    }
  }

  // Now apply surgical pause tightening (>700ms shortened to ~380ms) + 200ms leading/trailing room tone
  // and build an FFmpeg concat/atrim filter so the audio and word timestamps stay 100% locked!
  const ROOM_TONE_PAD = 0.20; // 200ms leading & trailing room tone
  const MAX_PAUSE = 0.70;
  const TARGET_PAUSE = 0.38;

  // Identify segments to keep from rawVoicePath
  const rawDuration = parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', rawVoicePath])
      .toString()
      .trim()
  );

  // Build piecewise time mapping where gaps > MAX_PAUSE between words are trimmed down to TARGET_PAUSE
  const segments = [];
  let cursorIn = 0;
  for (let i = 0; i < mergedWords.length - 1; i++) {
    const gapStart = mergedWords[i].endSec;
    const gapEnd = mergedWords[i + 1].startSec;
    const gap = gapEnd - gapStart;
    if (gap > MAX_PAUSE) {
      const keepBefore = TARGET_PAUSE * 0.5;
      const keepAfter = TARGET_PAUSE * 0.5;
      const segEnd = gapStart + keepBefore;
      segments.push({ start: cursorIn, end: segEnd });
      cursorIn = gapEnd - keepAfter;
    }
  }
  const lastEnd = Math.min(rawDuration, mergedWords[mergedWords.length - 1].endSec + 0.15);
  segments.push({ start: cursorIn, end: lastEnd });

  // Compute new timestamps for each word after segment splicing + leading ROOM_TONE_PAD
  function mapTime(t) {
    let acc = ROOM_TONE_PAD;
    for (const seg of segments) {
      if (t <= seg.start) return acc;
      if (t <= seg.end) return acc + (t - seg.start);
      acc += seg.end - seg.start;
    }
    return acc;
  }

  const allWords = mergedWords.map((w) => {
    const startSec = Number(mapTime(w.startSec).toFixed(4));
    const endSec = Number(mapTime(w.endSec).toFixed(4));
    return {
      word: w.word,
      startSec,
      endSec,
      startFrame: Math.round(startSec * 30),
      endFrame: Math.round(endSec * 30),
    };
  });

  // Build FFmpeg filtergraph for segment trimming with 12ms micro-fades + room tone pad + EQ/de-ess/compression + loudnorm to -16 LUFS
  const filterParts = [];
  filterParts.push(`aevalsrc=0:d=${ROOM_TONE_PAD}:s=48000:c=stereo[pad_start]`);
  const concatInputs = ['[pad_start]'];
  segments.forEach((seg, idx) => {
    const dur = Math.max(0.05, seg.end - seg.start);
    const fadeOutSt = Math.max(0, dur - 0.012);
    filterParts.push(
      `[0:a]atrim=start=${seg.start.toFixed(4)}:end=${seg.end.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.010,afade=t=out:st=${fadeOutSt.toFixed(4)}:d=0.012[s${idx}]`
    );
    concatInputs.push(`[s${idx}]`);
  });
  filterParts.push(`aevalsrc=0:d=${ROOM_TONE_PAD}:s=48000:c=stereo[pad_end]`);
  concatInputs.push('[pad_end]');

  const totalSpokenSec =
    ROOM_TONE_PAD * 2 + segments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const masterFadeOutStart = Math.max(0, totalSpokenSec - 0.10);

  // Voice cleanup chain:
  // - highpass=f=80 (80 Hz high-pass)
  // -afftdn=nf=-25 (gentle noise reduction)
  // - equalizer=f=3000:t=q:w=1.2:g=1.5 (+1.5 dB presence at 3 kHz)
  // - equalizer=f=6500:t=q:w=2.0:g=-3.0 (de-ess 5-8 kHz)
  // - acompressor=threshold=-18dB:ratio=2:attack=15:release=120 (light 2:1 compression)
  // - loudnorm=I=-16:TP=-1.5:LRA=7 (target -16 LUFS voice)
  // - 100ms master fade in/out
  filterParts.push(
    `${concatInputs.join('')}concat=n=${concatInputs.length}:v=0:a=1,aresample=48000,highpass=f=80,afftdn=nf=-25,equalizer=f=3000:t=q:w=1.2:g=1.5,equalizer=f=6500:t=q:w=2.0:g=-3.0,acompressor=threshold=-18dB:ratio=2:attack=15:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=in:st=0:d=0.10,afade=t=out:st=${masterFadeOutStart.toFixed(4)}:d=0.10[outa]`
  );

  const outVoicePaths = [
    path.resolve(__dirname, '../video/public/voiceover.mp3'),
    path.resolve(__dirname, '../public/voiceover.mp3'),
  ];

  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    rawVoicePath,
    '-filter_complex',
    filterParts.join(';'),
    '-map',
    '[outa]',
    '-ar',
    '48000',
    '-ac',
    '2',
    '-b:a',
    '192k',
    outVoicePaths[0],
  ]);
  fs.copyFileSync(outVoicePaths[0], outVoicePaths[1]);

  const actualVoiceDuration = parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outVoicePaths[0]])
      .toString()
      .trim()
  );
  console.log(`Processed clean voiceover: ${actualVoiceDuration.toFixed(2)}s`);

  // Segment words into 7 scenes by sentence endpoints
  const sceneSpecs = [
    { id: 'scene1', name: 'Intro', endWord: 'companion.' },
    { id: 'scene2', name: 'Problem', endWord: 'replies.' },
    { id: 'scene3', name: 'Solution', endWord: 'documents.' },
    { id: 'scene4', name: 'HeroCIT', endWord: '1.' },
    { id: 'scene5', name: 'UploadsAndMap', endWord: 'map.' },
    { id: 'scene6', name: 'Security', endWord: 'abuse.' },
    { id: 'scene7', name: 'Outro', endWord: 'UMak.' },
  ];

  const scenes = [];
  let wIdx = 0;
  for (let s = 0; s < sceneSpecs.length; s++) {
    const spec = sceneSpecs[s];
    const sWords = [];
    while (wIdx < allWords.length) {
      const w = allWords[wIdx];
      sWords.push(w);
      wIdx++;
      if (w.word.toLowerCase() === spec.endWord.toLowerCase()) {
        break;
      }
    }
    scenes.push({
      id: spec.id,
      name: spec.name,
      words: sWords,
    });
  }

  // Derive scene start/end frames directly from word timings:
  // Each scene ends at lastWord.endFrame + 15 frames (within the 12-18 frame rule)
  // Total duration = voice duration + 1.0s (30 frames)
  const totalDurationSeconds = Number((actualVoiceDuration + 1.0).toFixed(3));
  const totalDurationFrames = Math.round(totalDurationSeconds * 30);

  let frameCursor = 0;
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const lastWord = sc.words[sc.words.length - 1];
    const nextSceneFirstWord = i < scenes.length - 1 ? scenes[i + 1].words[0] : null;
    const startFrame = frameCursor;
    let endFrame = lastWord ? lastWord.endFrame + 15 : startFrame + 120;
    // Never let scene boundary cut into the first word of the next scene
    if (nextSceneFirstWord && endFrame > nextSceneFirstWord.startFrame - 2) {
      endFrame = Math.max(lastWord.endFrame + 4, nextSceneFirstWord.startFrame - 2);
    }
    if (i === scenes.length - 1) {
      endFrame = totalDurationFrames;
    }
    sc.startFrame = startFrame;
    sc.endFrame = endFrame;
    sc.durationInFrames = endFrame - startFrame;
    sc.fullText = sc.words.map((w) => w.word).join(' ');
    sc.words = sc.words.map((w) => ({
      ...w,
      localStartFrame: Math.max(0, w.startFrame - startFrame),
      localEndFrame: Math.max(0, w.endFrame - startFrame),
    }));
    frameCursor = endFrame;
  }

  const timingsData = {
    fps: 30,
    voiceDurationSeconds: Number(actualVoiceDuration.toFixed(3)),
    totalDurationSeconds,
    totalDurationFrames,
    voiceoverFile: 'voiceover.mp3',
    scenes,
    allWords,
  };

  const jsonPaths = [
    path.resolve(__dirname, '../video/public/voiceover.timings.json'),
    path.resolve(__dirname, '../public/voiceover.timings.json'),
  ];
  for (const p of jsonPaths) {
    fs.writeFileSync(p, JSON.stringify(timingsData, null, 2));
  }

  const tsPath = path.resolve(__dirname, '../video/src/voiceover-timings.ts');
  const tsContent = `// Auto-generated from public/voiceover.timings.json
export interface TimedWord {
  word: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  localStartFrame?: number;
  localEndFrame?: number;
}

export interface SceneTiming {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  fullText: string;
  words: TimedWord[];
}

export interface VoiceoverData {
  fps: number;
  voiceDurationSeconds: number;
  totalDurationSeconds: number;
  totalDurationFrames: number;
  voiceoverFile: string;
  scenes: SceneTiming[];
  allWords: TimedWord[];
}

export const VOICEOVER_DATA: VoiceoverData = ${JSON.stringify(timingsData, null, 2)};
`;
  fs.writeFileSync(tsPath, tsContent);

  console.log(`Total Video Duration: ${totalDurationSeconds}s (${totalDurationFrames} frames)`);
  scenes.forEach((s) => {
    console.log(
      `  ${s.id} (${s.name}): [${s.startFrame}..${s.endFrame}] (${s.durationInFrames}f / ${(s.durationInFrames / 30).toFixed(2)}s) -> "${s.fullText}"`
    );
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
