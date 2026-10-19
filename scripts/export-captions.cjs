const fs = require('fs');
const path = require('path');

const timingsPath = path.resolve(__dirname, '../video/public/voiceover.timings.json');
const data = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
const words = data.allWords;

// Group words into readable subtitle cues (max 6 words or sentence end)
const cues = [];
let cur = [];
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  cur.push(w);
  const endsSentence = /[.?!]$/.test(w.word);
  const endsClause = /[,;:]$/.test(w.word) && cur.length >= 4;
  if (cur.length >= 6 || endsSentence || endsClause || i === words.length - 1) {
    cues.push({
      startSec: cur[0].startSec,
      endSec: cur[cur.length - 1].endSec,
      text: cur.map((x) => x.word).join(' '),
    });
    cur = [];
  }
}

function fmtSrtTime(sec) {
  const ms = Math.round((sec % 1) * 1000);
  const totalSec = Math.floor(sec);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function fmtVttTime(sec) {
  return fmtSrtTime(sec).replace(',', '.');
}

const srtLines = cues
  .map((c, idx) => `${idx + 1}\n${fmtSrtTime(c.startSec)} --> ${fmtSrtTime(c.endSec)}\n${c.text}\n`)
  .join('\n');

const vttLines =
  'WEBVTT\n\n' +
  cues
    .map((c, idx) => `${idx + 1}\n${fmtVttTime(c.startSec)} --> ${fmtVttTime(c.endSec)}\n${c.text}\n`)
    .join('\n');

const outDirs = [
  path.resolve(__dirname, '../out'),
  path.resolve(__dirname, '../video/out'),
];

for (const dir of outDirs) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'captions.srt'), srtLines, 'utf8');
  fs.writeFileSync(path.join(dir, 'captions.vtt'), vttLines, 'utf8');
}

console.log(`Exported ${cues.length} subtitle cues to out/captions.srt and out/captions.vtt`);
