const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rawVoicePath = path.resolve(__dirname, '../video/public/voiceover_sarah_raw.mp3');
const rawJsonPath = path.resolve(__dirname, '../video/public/voiceover_sarah_align.json');

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

function run() {
  const data = JSON.parse(fs.readFileSync(rawJsonPath, 'utf8'));
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

  // Log all words and natural gaps
  const rawDuration = parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', rawVoicePath])
      .toString()
      .trim()
  );

  // Define custom SFX/visual breathing pockets after specific phrase-ending words
  // modeled 1:1 on @frameonvis (ab849a66-d285-4e7d-a59e-ac8276327ea5.mp4):
  // - After "fast." -> 0.45s (whip to Expense/Hours Counter card)
  // - After "follow." -> 0.90s (let the fast number counter tick up clearly!)
  // - After first "AI." -> 0.65s (hold logo lockup before notification stack)
  // - After "Schedules," -> 0.35s (Notification 1 pop)
  // - After "rooms," -> 0.35s (Notification 2 pop)
  // - After "policies..." -> 0.45s (Notification 3 pop)
  // - After "scattered." -> 0.55s ("All scattered" hold)
  // - After "unclear." -> 0.85s ("All unclear" defocus blur drop!)
  // - After "answer..." -> 0.40s
  // - After "sense?" -> 0.65s ("Just made sense" hold before UI stack)
  // - After "understand." -> 0.75s (let the 5 stacked UI cards settle & glide)
  // - After "CIT?" -> 0.65s (let chat query send & stream)
  // - After "Building." -> 0.45s
  // - After "1." -> 0.80s (let Source03.pdf Page 1 highlight sweep!)
  // - After "photo." -> 0.55s (let uploaded files snap in)
  // - After "map." -> 0.85s (let 3D campus map pin drop & route animate!)
  // - After "only." -> 0.45s (UMak sign-in check)
  // - After "spam." -> 0.55s (Rate limit 429 toast resolve)
  // - After "waiting..." -> 0.95s (Center green/cyan pill badge "✓ Verified UMak Companion!" pops + chimes!)
  // - After "clarity." -> 0.70s ("Just clarity" 3D tilt locks in)
  const customPocketsAfterWord = {
    'fast.': 0.45,
    'follow.': 0.90,
    'policies...': 0.45,
    'scattered.': 0.55,
    'unclear.': 0.85,
    'answer...': 0.38,
    'sense?': 0.65,
    'understand.': 0.75,
    'CIT?': 0.65,
    'Building.': 0.45,
    '1.': 0.80,
    'photo.': 0.55,
    'map.': 0.85,
    'only.': 0.45,
    'spam.': 0.55,
    'waiting...': 0.95,
    'clarity.': 0.70,
  };

  // Slice raw audio into phrase chunks where we either trim or pad silence to exact target pocket
  const chunks = [];
  let segStart = 0;
  for (let i = 0; i < mergedWords.length - 1; i++) {
    const w = mergedWords[i];
    const next = mergedWords[i + 1];
    const naturalGap = next.startSec - w.endSec;

    // First "AI." vs second "AI."
    let targetPocket = customPocketsAfterWord[w.word];
    if (w.word === 'AI.') {
      targetPocket = i < 20 ? 0.65 : 0.45;
    }

    if (targetPocket !== undefined || naturalGap > 0.45) {
      const desiredGap = targetPocket !== undefined ? targetPocket : 0.42;
      const tailKeep = Math.min(0.08, Math.max(0.02, naturalGap * 0.4));
      const headKeep = Math.min(0.06, Math.max(0.02, naturalGap * 0.4));
      const segEnd = w.endSec + tailKeep;
      const silenceInsert = Math.max(0.05, desiredGap - tailKeep - headKeep);
      chunks.push({
        start: segStart,
        end: segEnd,
        silenceAfter: silenceInsert,
        wordsInChunk: [],
      });
      segStart = next.startSec - headKeep;
    }
  }
  chunks.push({
    start: segStart,
    end: Math.min(rawDuration, mergedWords[mergedWords.length - 1].endSec + 0.18),
    silenceAfter: 0.25,
    wordsInChunk: [],
  });

  // Assign words to chunks and compute exact mapped timestamps
  const LEADING_PAD = 0.25;
  function mapTime(t) {
    let outT = LEADING_PAD;
    for (const ch of chunks) {
      if (t <= ch.start) return outT;
      if (t <= ch.end) return outT + (t - ch.start);
      outT += (ch.end - ch.start) + ch.silenceAfter;
    }
    return outT;
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

  // Build FFmpeg filtergraph to assemble the chunks with smooth micro-fades and studio vocal chain
  const filterParts = [];
  filterParts.push(`aevalsrc=0:d=${LEADING_PAD}:s=48000:c=stereo[lead]`);
  const concatInputs = ['[lead]'];
  chunks.forEach((ch, idx) => {
    const dur = Math.max(0.04, ch.end - ch.start);
    const fadeOutSt = Math.max(0, dur - 0.012);
    filterParts.push(
      `[0:a]atrim=start=${ch.start.toFixed(4)}:end=${ch.end.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.010,afade=t=out:st=${fadeOutSt.toFixed(4)}:d=0.012[c${idx}]`
    );
    concatInputs.push(`[c${idx}]`);
    if (ch.silenceAfter > 0) {
      filterParts.push(`aevalsrc=0:d=${ch.silenceAfter.toFixed(4)}:s=48000:c=stereo[sil${idx}]`);
      concatInputs.push(`[sil${idx}]`);
    }
  });

  const totalSpokenSec =
    LEADING_PAD + chunks.reduce((sum, ch) => sum + (ch.end - ch.start) + ch.silenceAfter, 0);
  const masterFadeOutStart = Math.max(0, totalSpokenSec - 0.10);

  filterParts.push(
    `${concatInputs.join('')}concat=n=${concatInputs.length}:v=0:a=1,aresample=48000,highpass=f=75,equalizer=f=180:t=q:w=1.2:g=1.4,equalizer=f=3200:t=q:w=1.2:g=1.8,equalizer=f=6800:t=q:w=2.0:g=-2.5,acompressor=threshold=-18dB:ratio=2.4:attack=12:release=110,loudnorm=I=-15.5:TP=-1.5:LRA=6,afade=t=in:st=0:d=0.08,afade=t=out:st=${masterFadeOutStart.toFixed(4)}:d=0.10[outa]`
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

  // 2.5s instrumental tail after "Ask smarter."
  const totalDurationSeconds = Number((actualVoiceDuration + 2.5).toFixed(3));
  const totalDurationFrames = Math.round(totalDurationSeconds * 30);

  let frameCursor = 0;
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const lastWord = sc.words[sc.words.length - 1];
    const nextSceneFirstWord = i < scenes.length - 1 ? scenes[i + 1].words[0] : null;
    const startFrame = frameCursor;
    // Place scene boundary right before nextSceneFirstWord (leaving the SFX pocket inside the current scene!)
    let endFrame = nextSceneFirstWord ? nextSceneFirstWord.startFrame - 3 : totalDurationFrames;
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

  for (const p of [
    path.resolve(__dirname, '../video/public/voiceover.timings.json'),
    path.resolve(__dirname, '../public/voiceover.timings.json'),
  ]) {
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

  console.log(`Refined Sarah voiceover with SFX pockets: ${actualVoiceDuration.toFixed(2)}s, Total Video: ${totalDurationSeconds}s (${totalDurationFrames} frames)`);
  scenes.forEach((s) => {
    console.log(`  ${s.id} [${s.startFrame}..${s.endFrame}] (${s.durationInFrames}f): ${s.fullText}`);
  });
}

run();
