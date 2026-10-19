const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  /DOMAIN-RESTRICTED/i,
  /VERIFIED CITATION/i,
  /THE PROBLEM/i,
  /THE SOLUTION/i,
  /TOOLS\s*&\s*GROUNDING/i,
  /ACCESS CONTROL/i,
  /0[1-7]\s*\/\//i,
  /TikTok/i,
  /@maxmill/i,
  /robi\.vizualist/i,
  /mvxmotionn/i,
  /ChatGPT/i,
  /Glass Health/i,
  /Gemini/i,
];

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.resolve(__dirname, '../video/src');
const files = walk(srcDir);
let violations = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.test(content)) {
      console.error(`Violation in ${path.relative(srcDir, file)}: matched ${pat}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`FAILED: ${violations} forbidden text violations found.`);
  process.exit(1);
} else {
  console.log(`PASSED: Scanned ${files.length} source files in video/src — 0 forbidden HUD/tech/reference labels found.`);
}
