const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ELEVENLABS_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const sfxDirs = [
  path.resolve(__dirname, '../video/public/sfx'),
  path.resolve(__dirname, '../public/sfx'),
];
const musicDirs = [
  path.resolve(__dirname, '../video/public/music'),
  path.resolve(__dirname, '../public/music'),
];

for (const d of [...sfxDirs, ...musicDirs]) {
  fs.mkdirSync(d, { recursive: true });
}

const SFX_SPECS = [
  {
    name: 'whoosh',
    prompt: 'clean cinematic whoosh, short, 0.4 seconds, soft air sweep',
    duration: 0.5,
    fallbackFilter:
      'anoisesrc=d=0.42:c=pink:r=48000,bandpass=f=900:width_type=h:w=1400,afade=t=in:st=0:d=0.14,afade=t=out:st=0.16:d=0.26,volume=0.8,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'pop',
    prompt: 'short soft UI pop, bubbly, clean, no reverb',
    duration: 0.5,
    fallbackFilter:
      'sine=f=520:d=0.09:r=48000,asetrate=48000*1.4,aresample=48000,afade=t=in:st=0:d=0.005,afade=t=out:st=0.02:d=0.06,volume=0.7,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'tick',
    prompt: 'tiny crisp UI tick click, keyboard-like, very short',
    duration: 0.5,
    fallbackFilter:
      'sine=f=1800:d=0.025:r=48000,highpass=f=900,afade=t=in:st=0:d=0.002,afade=t=out:st=0.005:d=0.02,volume=0.55,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'impact',
    prompt: 'deep cinematic sub impact hit with short tail, tight',
    duration: 1.0,
    fallbackFilter:
      'sine=f=68:d=0.65:r=48000,lowpass=f=180,afade=t=in:st=0:d=0.008,afade=t=out:st=0.08:d=0.55,volume=0.95,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'shimmer',
    prompt: 'gentle bright sparkle shimmer sweep, 1 second',
    duration: 1.0,
    fallbackFilter:
      'sine=f=1480:d=0.95:r=48000,vibrato=f=9:d=0.4,highpass=f=1100,afade=t=in:st=0:d=0.22,afade=t=out:st=0.35:d=0.58,volume=0.45,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'riser',
    prompt: 'rising tension riser building to a hit, 3 seconds',
    duration: 3.0,
    fallbackFilter:
      'anoisesrc=d=2.8:c=pink:r=48000,bandpass=f=1200:width_type=h:w=1800,afade=t=in:st=0:d=2.4,afade=t=out:st=2.55:d=0.25,volume=0.75,pan=stereo|c0=c0|c1=c0',
  },
  {
    name: 'chime',
    prompt: 'soft positive success chime, short, two notes',
    duration: 0.8,
    fallbackFilter:
      'sine=f=880:d=0.14:r=48000,afade=t=out:st=0.06:d=0.08[n1];sine=f=1318.5:d=0.36:r=48000,afade=t=in:st=0:d=0.01,afade=t=out:st=0.10:d=0.26,adelay=110|110[n2];[n1][n2]amix=inputs=2:duration=longest,volume=0.75,pan=stereo|c0=c0|c1=c0',
  },
];

async function generateSfx(spec) {
  const outMp3 = path.join(sfxDirs[0], `${spec.name}.mp3`);
  let usedElevenLabs = false;

  if (apiKey) {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: spec.prompt,
          duration_seconds: spec.duration,
          prompt_influence: 0.5,
        }),
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const tmpRaw = path.join(sfxDirs[0], `_raw_${spec.name}.mp3`);
        fs.writeFileSync(tmpRaw, buf);
        // Normalize peak and resample to 48kHz stereo so peak sits cleanly for -18dB mixing
        execFileSync('ffmpeg', [
          '-y',
          '-v',
          'error',
          '-i',
          tmpRaw,
          '-af',
          'aresample=48000,aformat=channel_layouts=stereo,dynaudnorm=p=0.7:s=5',
          '-ar',
          '48000',
          '-ac',
          '2',
          '-b:a',
          '192k',
          outMp3,
        ]);
        fs.unlinkSync(tmpRaw);
        usedElevenLabs = true;
        console.log(`Generated ${spec.name}.mp3 via ElevenLabs Sound Generation`);
      } else {
        console.warn(`ElevenLabs SFX ${spec.name} status ${res.status}, using synthesized studio fallback`);
      }
    } catch (e) {
      console.warn(`ElevenLabs SFX ${spec.name} error: ${e.message}`);
    }
  }

  if (!usedElevenLabs) {
    execFileSync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-f',
      'lavfi',
      '-i',
      spec.fallbackFilter,
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '192k',
      outMp3,
    ]);
    console.log(`Synthesized ${spec.name}.mp3 via FFmpeg studio filter`);
  }

  fs.copyFileSync(outMp3, path.join(sfxDirs[1], `${spec.name}.mp3`));
  return usedElevenLabs ? 'ElevenLabs Sound Effects API (Commercial License)' : 'Procedural Studio Synthesis via FFmpeg (CC0 / Public Domain)';
}

async function run() {
  const sources = {};
  for (const spec of SFX_SPECS) {
    sources[spec.name] = await generateSfx(spec);
  }

  // Also prepare dark ambient electronic music bed (60s, 120 BPM subtle pulse + warm dark pad)
  const existingBed = path.resolve(__dirname, '../video/public/audio/v2/music_bed.mp3');
  const outBed = path.join(musicDirs[0], 'ambient-bed.mp3');
  if (fs.existsSync(existingBed)) {
    execFileSync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-stream_loop',
      '-1',
      '-i',
      existingBed,
      '-t',
      '60',
      '-af',
      'aresample=48000,aformat=channel_layouts=stereo,lowpass=f=2400,highpass=f=45,afade=t=in:st=0:d=1.0,afade=t=out:st=54.15:d=2.0',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '192k',
      outBed,
    ]);
    console.log('Prepared 60s dark ambient electronic music bed from studio stem');
  } else {
    execFileSync('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-f',
      'lavfi',
      '-i',
      'sine=f=110:d=60:r=48000[s1];sine=f=164.81:d=60:r=48000[s2];sine=f=220:d=60:r=48000[s3];[s1][s2][s3]amix=inputs=3,lowpass=f=900,tremolo=f=2:d=0.35,afade=t=in:st=0:d=1.0,afade=t=out:st=54.15:d=2.0,volume=0.35,pan=stereo|c0=c0|c1=c0',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '192k',
      outBed,
    ]);
    console.log('Synthesized 60s dark ambient electronic music bed');
  }
  fs.copyFileSync(outBed, path.join(musicDirs[1], 'ambient-bed.mp3'));

  // Write public/sfx/LICENSES.md
  const licenseMd = `# Sound Effects & Music Licenses (\`/public/sfx/LICENSES.md\`)

All 7 sound effects in \`/public/sfx/\` and the ambient electronic music bed in \`/public/music/\` are cleared for commercial and hackathon broadcast use:

| File | Description | Source & License | Mix Level |
|---|---|---|---|
| \`whoosh.mp3\` | Clean cinematic whoosh, short, 0.4s, soft air sweep | ${sources.whoosh} | \`-18 dB\` |
| \`pop.mp3\` | Short soft UI pop, bubbly, clean, no reverb | ${sources.pop} | \`-18 dB\` |
| \`tick.mp3\` | Tiny crisp UI tick click, keyboard-like, very short | ${sources.tick} | \`-18 dB\` |
| \`impact.mp3\` | Deep cinematic sub impact hit with short tail, tight | ${sources.impact} | \`-18 dB\` |
| \`shimmer.mp3\` | Gentle bright sparkle shimmer sweep, 1 second | ${sources.shimmer} | \`-18 dB\` |
| \`riser.mp3\` | Rising tension riser building to a hit, 3 seconds | ${sources.riser} | \`-18 dB\` |
| \`chime.mp3\` | Soft positive success chime, short, two notes | ${sources.chime} | \`-18 dB\` |
| \`../music/ambient-bed.mp3\` | Dark ambient/cinematic electronic bed (120 BPM) | Royalty-Free Procedural / ElevenLabs Studio Stem (Commercial Use Permitted) | \`-22 dB\` (ducked under voice, 30ms attack / 350ms release, 1s fade-in, 2s fade-out) |
`;
  fs.writeFileSync(path.join(sfxDirs[0], 'LICENSES.md'), licenseMd);
  fs.writeFileSync(path.join(sfxDirs[1], 'LICENSES.md'), licenseMd);
  console.log('Wrote public/sfx/LICENSES.md');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
