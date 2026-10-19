const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ELEVENLABS_API_KEY=(.+)/);
if (!match) {
  console.error('ELEVENLABS_API_KEY not found');
  process.exit(1);
}
const apiKey = match[1].trim();

const outDir = path.resolve(__dirname, '../public/sfx');
const videoOutDir = path.resolve(__dirname, '../video/public/sfx');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(videoOutDir, { recursive: true });

const SOUND_SPECS = [
  {
    name: 'music-chillhop-loop',
    duration: 16.0,
    prompt: 'Warm modern chill-hop lo-fi R&B instrumental beat, 96 BPM, crisp punchy kick drum and tight rimshot snare, smooth Rhodes electric piano seventh chords, deep warm sub bass, clean minimalist fintech commercial groove, no vocals',
  },
  {
    name: 'whoosh-short',
    duration: 1.0,
    prompt: 'Soft airy modern UI text whoosh transition, clean minimal fabric air swipe, warm low-mid swoosh for motion graphics kinetic typography',
  },
  {
    name: 'whoosh-long',
    duration: 1.2,
    prompt: 'Crisp punchy camera whip pan whoosh with subtle soft thud, modern UI motion graphics transition',
  },
  {
    name: 'whoosh-panel',
    duration: 1.2,
    prompt: 'Smooth glass panel slide whoosh with soft tactile air movement, modern interface transition',
  },
  {
    name: 'counter-tick',
    duration: 2.0,
    prompt: 'Fast digital number counter ticker flutter, rapid smooth mechanical UI scroll wheel ticks counting up quickly, clean modern fintech sound',
  },
  {
    name: 'pop-card',
    duration: 1.0,
    prompt: 'Crisp modern iOS notification banner pop sound, warm glass bubble pluck with subtle soft marimba tone',
  },
  {
    name: 'pop-chip',
    duration: 1.0,
    prompt: 'Clean modern app notification pop sound, bright warm wooden glass tap pluck, slightly higher pitch',
  },
  {
    name: 'glass-tap',
    duration: 0.8,
    prompt: 'Subtle crisp glass UI tap click, warm modern minimal interface touch sound',
  },
  {
    name: 'impact-soft',
    duration: 1.5,
    prompt: 'Deep warm sub bass defocus drop whoosh, camera lens going out of focus low-pass vacuum swoosh',
  },
  {
    name: 'shimmer-sweep',
    duration: 2.0,
    prompt: 'Rapid sequence of 5 soft velvety UI cards stacking and popping into place, smooth tactile modern interface cascade',
  },
  {
    name: 'chime-success',
    duration: 1.5,
    prompt: 'Crystal clear Apple Pay style success confirmation chime ding, warm harmonic two-tone glass bell with gentle sparkle',
  },
  {
    name: 'impact-logo',
    duration: 1.8,
    prompt: 'Playful warm modern app logo reveal pop with subtle soft shimmer chime and smooth slide swoosh',
  },
  {
    name: 'type-key-1',
    duration: 0.6,
    prompt: 'Single crisp soft tactile laptop key press click, clean modern UI',
  },
  {
    name: 'pin-drop',
    duration: 1.2,
    prompt: 'Crisp map pin drop pop followed by a gentle sonar ring ping, modern UI sound effect',
  },
  {
    name: 'deny-thud',
    duration: 1.0,
    prompt: 'Soft muted double bass thud error shake sound, modern iOS UI rejection',
  },
];

async function generateOne(spec) {
  const wavPath = path.join(outDir, `${spec.name}.wav`);
  const mp3Temp = path.join(outDir, `${spec.name}_raw.mp3`);
  console.log(`Generating ${spec.name} (${spec.duration}s)...`);
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: spec.prompt,
      duration_seconds: spec.duration,
      prompt_influence: 0.65,
    }),
  });
  if (!res.ok) {
    console.warn(`Failed ${spec.name}: ${res.status} ${await res.text()}`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(mp3Temp, buf);

  // Convert to 48kHz stereo WAV with clean fade-in/out
  const fadeOutSt = Math.max(0.05, spec.duration - 0.08);
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    mp3Temp,
    '-af',
    `aresample=48000,afade=t=in:st=0:d=0.01,afade=t=out:st=${fadeOutSt.toFixed(3)}:d=0.08`,
    '-ar',
    '48000',
    '-ac',
    '2',
    '-c:a',
    'pcm_s16le',
    wavPath,
  ]);
  fs.copyFileSync(wavPath, path.join(videoOutDir, `${spec.name}.wav`));
  fs.unlinkSync(mp3Temp);
  console.log(`  -> Saved ${wavPath}`);
  return true;
}

async function run() {
  for (const spec of SOUND_SPECS) {
    await generateOne(spec);
  }
  // Also copy type-key-1 variants to type-key-2, type-key-3, type-send
  const k1 = path.join(outDir, 'type-key-1.wav');
  if (fs.existsSync(k1)) {
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', k1, '-af', 'asetrate=48000*1.06,aresample=48000', path.join(outDir, 'type-key-2.wav')]);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', k1, '-af', 'asetrate=48000*0.95,aresample=48000', path.join(outDir, 'type-key-3.wav')]);
    fs.copyFileSync(path.join(outDir, 'type-key-2.wav'), path.join(videoOutDir, 'type-key-2.wav'));
    fs.copyFileSync(path.join(outDir, 'type-key-3.wav'), path.join(videoOutDir, 'type-key-3.wav'));
  }
  const pc = path.join(outDir, 'pop-chip.wav');
  if (fs.existsSync(pc)) {
    fs.copyFileSync(pc, path.join(outDir, 'type-send.wav'));
    fs.copyFileSync(pc, path.join(videoOutDir, 'type-send.wav'));
  }
  console.log('All ElevenLabs studio SFX generated successfully.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
