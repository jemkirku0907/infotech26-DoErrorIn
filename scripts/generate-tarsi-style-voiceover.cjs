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

// Exact voice from reference video ab849a66-d285-4e7d-a59e-ac8276327ea5.mp4:
// Sarah (EXAVITQu4vr4xnSDxMaL) - Mature, Reassuring, Confident, Warm Studio Delivery
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

// Short, punchy, staccato phrases modeled 1:1 on the @frameonvis reference cadence
const TTS_TEXT = `Campus life moves fast. Too fast to follow. Meet TAGA-Ask A.I.

Schedules, rooms, policies... all scattered. All unclear.

But what if every answer... just made sense? One place to ask, to verify, to understand.

Ask: Where is the C.I.T.? Second Floor, South Wing, Admin Building. Source zero three, page one.

Upload a schedule, or a photo. Need directions? Open the campus map.

UMak accounts only. Protected from spam. No noise, no waiting...

just clarity. TAGA-Ask A.I. Ask smarter.`;

function normalizeDisplayWord(w) {
  let clean = w;
  clean = clean.replace(/TAGA-Ask/gi, 'TAGA-asK');
  clean = clean.replace(/A\.I\.\./g, 'AI.');
  clean = clean.replace(/A\.I\.,/g, 'AI,');
  clean = clean.replace(/A\.I\./g, 'AI.');
  clean = clean.replace(/C\.I\.T\.\?/g, 'CIT?');
  clean = clean.replace(/C\.I\.T\./g, 'CIT');
  return clean;
}

async function run() {
  console.log(`Requesting Sarah (${VOICE_ID}) voiceover with word timestamps from ElevenLabs...`);
  const rawVoicePath = path.resolve(__dirname, '../video/public/voiceover_sarah_raw.mp3');
  const rawJsonPath = path.resolve(__dirname, '../video/public/voiceover_sarah_align.json');

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
        stability: 0.58,
        similarity_boost: 0.85,
        style: 0.22,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`ElevenLabs returned ${res.status}: ${errText}`);
    process.exit(1);
  }

  const data = await res.json();
  fs.writeFileSync(rawJsonPath, JSON.stringify(data, null, 2));
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  fs.writeFileSync(rawVoicePath, audioBuffer);
  console.log(`Saved raw Sarah voiceover (${audioBuffer.length} bytes)`);

  // Parse character alignment into words
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

  // Merge spoken "zero" + "three," -> "03," and "one." -> "1."
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

  // Keep natural rhythmic SFX pockets (0.42s - 0.55s) between phrases so whooshes, pops, and chimes breathe!
  const ROOM_TONE_PAD = 0.25;
  const MAX_PAUSE = 0.72;
  const TARGET_PAUSE = 0.48;

  const rawDuration = parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', rawVoicePath])
      .toString()
      .trim()
  );

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
  const lastEnd = Math.min(rawDuration, mergedWords[mergedWords.length - 1].endSec + 0.18);
  segments.push({ start: cursorIn, end: lastEnd });

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

  // Build FFmpeg filtergraph for warm studio vocal chain
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

  // Studio warmth & presence EQ matching the @frameonvis Sarah vocal mix
  filterParts.push(
    `${concatInputs.join('')}concat=n=${concatInputs.length}:v=0:a=1,aresample=48000,highpass=f=75,equalizer=f=180:t=q:w=1.2:g=1.2,equalizer=f=3200:t=q:w=1.2:g=1.8,equalizer=f=6800:t=q:w=2.0:g=-2.5,acompressor=threshold=-18dB:ratio=2.4:attack=12:release=110,loudnorm=I=-15.5:TP=-1.5:LRA=6,afade=t=in:st=0:d=0.08,afade=t=out:st=${masterFadeOutStart.toFixed(4)}:d=0.10[outa]`
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
  console.log(`Processed Sarah studio voiceover: ${actualVoiceDuration.toFixed(2)}s`);

  // Segment words into 7 scenes
  // Scene 1 ends at first "AI." ("Meet TAGA-asK AI.")
  // Scene 2 ends at "unclear."
  // Scene 3 ends at "understand."
  // Scene 4 ends at "1."
  // Scene 5 ends at "map."
  // Scene 6 ends at "waiting..."
  // Scene 7 ends at "smarter."
  const sceneSpecs = [
    { id: 'scene1', name: 'Intro', endWord: 'AI.' },
    { id: 'scene2', name: 'Problem', endWord: 'unclear.' },
    { id: 'scene3', name: 'Solution', endWord: 'understand.' },
    { id: 'scene4', name: 'HeroCIT', endWord: '1.' },
    { id: 'scene5', name: 'UploadsAndMap', endWord: 'map.' },
    { id: 'scene6', name: 'Security', endWord: 'waiting...' },
    { id: 'scene7', name: 'Outro', endWord: 'smarter.' },
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

  // Add a 2.4s instrumental outro tail (just like the @frameonvis reference where the beat rides out at the end!)
  const totalDurationSeconds = Number((actualVoiceDuration + 2.4).toFixed(3));
  const totalDurationFrames = Math.round(totalDurationSeconds * 30);

  let frameCursor = 0;
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const lastWord = sc.words[sc.words.length - 1];
    const nextSceneFirstWord = i < scenes.length - 1 ? scenes[i + 1].words[0] : null;
    const startFrame = frameCursor;
    let endFrame = lastWord ? lastWord.endFrame + 10 : startFrame + 120;
    if (nextSceneFirstWord && endFrame > nextSceneFirstWord.startFrame - 2) {
      endFrame = Math.max(lastWord.endFrame + 2, nextSceneFirstWord.startFrame - 2);
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

  // Also save /script/voiceover.txt
  fs.writeFileSync(path.resolve(__dirname, '../script/voiceover.txt'), TTS_TEXT + '\n');

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
