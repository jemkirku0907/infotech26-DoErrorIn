const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = "C:\\Users\\Cyril Jhune.CYRIL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe";
const VIDEO_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(VIDEO_DIR, 'public');
const STEMS_DIR = path.join(VIDEO_DIR, 'src', 'audio', 'stems');
const PUBLIC_STEMS_DIR = path.join(PUBLIC_DIR, 'audio', 'stems');

if (!fs.existsSync(STEMS_DIR)) fs.mkdirSync(STEMS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_STEMS_DIR)) fs.mkdirSync(PUBLIC_STEMS_DIR, { recursive: true });

console.log('--- 1. GENERATING VOICE STEM ---');
const rawVoice = path.join(PUBLIC_DIR, 'voiceover.mp3');
const voiceStem = path.join(STEMS_DIR, 'voice_stem.wav');

// Voice DSP:
// 1. adeclip, adeclick
// 2. afftdn (light hiss removal)
// 3. highpass 80Hz
// 4. de-ess 6500Hz gentle cut (-3dB)
// 5. presence boost 3000Hz (+1.5dB)
// 6. compression (2.5:1)
// 7. pad to 50.667s, micro-fades at start and voice-end
const voiceFilter = [
  'adeclip',
  'adeclick=w=55:o=75:a=2:m=a',
  'afftdn=nr=10:nf=-50:tn=1',
  'highpass=f=80',
  'equalizer=f=6500:t=q:w=1.5:g=-3.0',
  'equalizer=f=3000:t=q:w=1.2:g=1.5',
  'compand=attacks=0.02:decays=0.15:points=-80/-80|-45/-45|-20/-17|0/-3:gain=1',
  'afade=t=in:ss=0:d=0.015',
  'afade=t=out:st=48.14:d=0.02',
  'apad=whole_dur=50.667',
  'alimiter=limit=-1.5dB:attack=5:release=50:asc=1'
].join(',');

execSync(`"${FFMPEG}" -y -i "${rawVoice}" -af "${voiceFilter}" -ar 48000 -ac 2 "${voiceStem}"`, { stdio: 'inherit' });

console.log('--- 2. GENERATING DUCKED MUSIC STEM ---');
const musicRaw = path.join(PUBLIC_DIR, 'audio', 'v2', 'music_bed.mp3');
const musicStem = path.join(STEMS_DIR, 'music_stem.wav');

// Music DSP:
// 1. Loop to 51s
// 2. lowpass 12kHz
// 3. sidechaincompress with voiceStem (duck by 8-10 dB when speech occurs)
// 4. 1.5s fade-in, 2.0s fade-out (st=48.667 d=2.0) to absolute silence
const musicFilter = [
  '[0:a]aloop=loop=-1:size=2e+09,atrim=0:50.667,lowpass=f=12000[music]',
  '[music][1:a]sidechaincompress=threshold=0.025:ratio=6:attack=30:release=350:makeup=1[ducked]',
  '[ducked]afade=t=in:ss=0:d=1.5,afade=t=out:st=48.667:d=2.0,volume=-6dB[out]'
].join(';');

execSync(`"${FFMPEG}" -y -i "${musicRaw}" -i "${voiceStem}" -filter_complex "${musicFilter}" -map "[out]" -ar 48000 -ac 2 "${musicStem}"`, { stdio: 'inherit' });

console.log('--- 3. GENERATING MASTERED SFX STEM ---');
const sfxStem = path.join(STEMS_DIR, 'sfx_stem.wav');

// Aggregate SFX with exact delays in milliseconds (frame / 30 * 1000)
const sfxEvents = [
  { frame: 42, file: 'audio/v2/sfx_impact.mp3', gain: 0.5 },
  { frame: 141, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 187, file: 'audio/v2/sfx_impact_soft.mp3', gain: 0.4 },
  { frame: 311, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 325, file: 'audio/v2/sfx_rise.mp3', gain: 0.35 },
  { frame: 500, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 564, file: 'audio/v2/sfx_pop.mp3', gain: 0.4 },
  { frame: 716, file: 'audio/v2/sfx_rise.mp3', gain: 0.35 },
  { frame: 843, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 884, file: 'audio/v2/sfx_pop.mp3', gain: 0.4 },
  { frame: 1049, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 1065, file: 'audio/v2/sfx_shield.mp3', gain: 0.4 },
  { frame: 1105, file: 'audio/v2/sfx_deny.mp3', gain: 0.4 },
  { frame: 1280, file: 'audio/v2/sfx_whoosh.mp3', gain: 0.35 },
  { frame: 1291, file: 'audio/v2/sfx_impact_soft.mp3', gain: 0.45 },
  { frame: 1426, file: 'audio/v2/sfx_pop.mp3', gain: 0.4 },
];

let inputArgs = [];
let filterGraph = [];
let mixLabels = [];

sfxEvents.forEach((ev, idx) => {
  const filePath = path.join(PUBLIC_DIR, ev.file);
  inputArgs.push(`-i "${filePath}"`);
  const delayMs = Math.round((ev.frame / 30) * 1000);
  filterGraph.push(`[${idx}:a]highpass=f=120,volume=${ev.gain},adelay=${delayMs}|${delayMs}[sfx${idx}]`);
  mixLabels.push(`[sfx${idx}]`);
});

filterGraph.push(`${mixLabels.join('')}amix=inputs=${sfxEvents.length}:duration=longest:normalize=0,apad=whole_dur=50.667,atrim=0:50.667,alimiter=limit=-3dB:attack=5:release=50:asc=1[sfx_out]`);

execSync(`"${FFMPEG}" -y ${inputArgs.join(' ')} -filter_complex "${filterGraph.join(';')}" -map "[sfx_out]" -ar 48000 -ac 2 "${sfxStem}"`, { stdio: 'inherit' });

console.log('--- 4. MASTER BUS MIX & LOUDNORM PASS ---');
const rawMix = path.join(STEMS_DIR, 'raw_mix.wav');
execSync(`"${FFMPEG}" -y -i "${voiceStem}" -i "${musicStem}" -i "${sfxStem}" -filter_complex "[0:a]volume=1.05[v];[1:a]volume=0.9[m];[2:a]volume=0.85[s];[v][m][s]amix=inputs=3:duration=first:normalize=0[mix]" -map "[mix]" -ar 48000 -ac 2 "${rawMix}"`, { stdio: 'inherit' });

// Pass 1: Measure raw mix loudnorm parameters
console.log('Measuring loudnorm on raw mix...');
const measureOutput = execSync(`"${FFMPEG}" -i "${rawMix}" -af "loudnorm=I=-14.0:TP=-1.0:LRA=6.0:print_format=json" -f null - 2>&1`).toString();
const jsonMatch = measureOutput.match(/\{[\s\S]*"input_i"[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('Failed to parse loudnorm JSON: ' + measureOutput);
}
const stats = JSON.parse(jsonMatch[0]);
console.log('Measured loudnorm stats:', stats);

// Pass 2: Precise Two-Pass Loudnorm into final master WAV & MP3
const masterWav = path.join(STEMS_DIR, 'master_mix.wav');
const masterMp3 = path.join(STEMS_DIR, 'master_mix.mp3');
const publicMasterWav = path.join(PUBLIC_STEMS_DIR, 'master_mix.wav');
const publicMasterMp3 = path.join(PUBLIC_STEMS_DIR, 'master_mix.mp3');

const loudnormPass2 = `alimiter=limit=0.82:level=false,loudnorm=I=-14.0:TP=-1.2:LRA=6.0,alimiter=limit=0.82:level=false,afade=t=out:st=50.2:d=0.467`;

execSync(`"${FFMPEG}" -y -i "${rawMix}" -af "${loudnormPass2}" -ar 48000 -ac 2 "${masterWav}"`, { stdio: 'inherit' });
execSync(`"${FFMPEG}" -y -i "${masterWav}" -b:a 320k "${masterMp3}"`, { stdio: 'inherit' });

// Copy to public stems
fs.copyFileSync(voiceStem, path.join(PUBLIC_STEMS_DIR, 'voice_stem.wav'));
fs.copyFileSync(musicStem, path.join(PUBLIC_STEMS_DIR, 'music_stem.wav'));
fs.copyFileSync(sfxStem, path.join(PUBLIC_STEMS_DIR, 'sfx_stem.wav'));
fs.copyFileSync(masterWav, publicMasterWav);
fs.copyFileSync(masterMp3, publicMasterMp3);

console.log('--- 5. FINAL VERIFICATION OF MASTERED AUDIO ---');
const verifyOutput = execSync(`"${FFMPEG}" -i "${masterWav}" -af "loudnorm=print_format=json" -f null - 2>&1`).toString();
const verifyMatch = verifyOutput.match(/\{[\s\S]*"input_i"[\s\S]*\}/);
console.log('FINAL MASTER METRICS:');
console.log(verifyMatch ? verifyMatch[0] : verifyOutput);
