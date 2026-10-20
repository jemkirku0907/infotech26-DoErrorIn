const fs = require('fs');
const assert = require('assert');
const path = require('path');

const sourcesData = require('../data/sources.json');

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function verifyCitation(citation) {
  const pageChunks = sourcesData.filter(
    s => s.source.toLowerCase() === citation.source.toLowerCase().trim() && s.page === Number(citation.page)
  );

  if (pageChunks.length === 0) return false;

  const normalizedQuote = normalizeText(citation.quote);
  return pageChunks.some(chunk => {
    return normalizeText(chunk.content).includes(normalizedQuote);
  });
}

function hasEmoji(text) {
  return /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]/u.test(text);
}

// Extract and dynamically evaluate lib/taglish-resolver.ts logic in CommonJS
const tsSource = fs.readFileSync(path.join(__dirname, '../lib/taglish-resolver.ts'), 'utf8');

// Strip TypeScript type annotations to evaluate cleanly in Node
const jsSource = tsSource
  .replace(/import\s+[^;]+;/g, '')
  .replace(/export\s+function/g, 'function')
  .replace(/:\s*string\b/g, '')
  .replace(/:\s*ChatResponse\s*\|\s*null/g, '')
  .replace(/:\s*boolean\b/g, '')
  .replace(/:\s*number\b/g, '')
  .replace(/as\s+ChatResponse/g, '');

const evalContext = {};
const runner = new Function(
  'sourcesData',
  'normalizeText',
  'verifyCitation',
  `${jsSource}\nreturn { expandTaglishQuery, resolveComplexTaglishScenario };`
);
const { expandTaglishQuery, resolveComplexTaglishScenario } = runner(sourcesData, normalizeText, verifyCitation);

console.log('========================================================');
console.log('TAGA-asK AI: Colloquial Taglish & Situational Test Suite');
console.log('========================================================\n');

// 1. Verify all citations in lib/taglish-resolver.ts against data/sources.json
const citationRegex = /source:\s*'([^']+)',\s*page:\s*(\d+),\s*quote:\s*(['"`])([\s\S]*?)\3/g;
let match;
let totalCitations = 0;
let passedCitations = 0;

while ((match = citationRegex.exec(tsSource)) !== null) {
  totalCitations++;
  const citation = {
    source: match[1],
    page: parseInt(match[2]),
    quote: match[4]
  };
  if (verifyCitation(citation)) {
    passedCitations++;
  } else {
    console.error(`FAILED citation on ${citation.source} p.${citation.page}: "${citation.quote}"`);
  }
}
assert.strictEqual(passedCitations, totalCitations, 'All citations in taglish-resolver.ts must verify 100% against data/sources.json');
console.log(`[PASS] 1. Verified all ${totalCitations} citations in taglish-resolver.ts against official UMak sources.`);

// 2. Test expandTaglishQuery
const expansions = [
  { input: 'pano pumunta sa cit', expected: ['procedure', 'how'] },
  { input: 'may dalawang singko ako', expected: ['5.0', 'failure', 'probation'] },
  { input: 'nahulihan ng kodigo', expected: ['cheating', 'academic dishonesty'] },
  { input: 'pwede ba mag shorts at tsinelas', expected: ['dress code', 'slippers'] },
  { input: 'ilang liban bago ma drop', expected: ['attendance', 'absences', '20 percent'] },
  { input: 'magkano bayad sa tuition', expected: ['token fee', '1000', '3000'] },
  { input: 'gusto ko mag-shift ng kurso', expected: ['shifting', 'degree program'] },
  { input: 'mag-stop muna ako mag-loa', expected: ['leave of absence', 'loa'] },
  { input: 'pwede mag-overload ang graduating', expected: ['academic load', 'overload', '28 units'] },
  { input: 'naiwan ko ang id ko', expected: ['no id no entry', 'gate pass'] }
];

for (const exp of expansions) {
  const expanded = expandTaglishQuery(exp.input);
  for (const kw of exp.expected) {
    assert(expanded.includes(kw), `Expanded "${exp.input}" should contain "${kw}", got: "${expanded}"`);
  }
}
console.log('[PASS] 2. expandTaglishQuery correctly maps 10 common Filipino slang and contraction patterns to official keywords.');

// 3. Test Scenario 1: Dalawang Singko vs Dismissal
const s1 = resolveComplexTaglishScenario('pano pag may dalawa akong singko ngayong sem ma-kick out na ba ako?');
assert(s1 !== null, 'Scenario 1 must be handled');
assert(s1.answer.includes('Probationary Status'), 'Must mention Probationary Status');
assert(s1.answer.includes('HINDI ito agarang expulsion'), 'Must reassure student that it is not immediate dismissal');
assert(s1.answer.includes('[Source05, p.54]'), 'Must cite p.54');
assert(s1.citations.length >= 2, 'Must have at least 2 citations');
assert(!hasEmoji(s1.answer), 'Must have no emojis');
for (const c of s1.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 3. Scenario 1 (Dalawang Singko -> Probation, not Kick-out) answered with verified Handbook citations.');

// 4. Test Scenario 1b: Dismissal Threshold
const s1b = resolveComplexTaglishScenario('ilang bagsak bago ma kick out sa umak?');
assert(s1b !== null, 'Scenario 1b must be handled');
assert(s1b.answer.includes('tatlong (3) failing grades') || s1b.answer.includes('Tatlong (3) Bagsak'), 'Must mention 3 failing grades');
assert(s1b.answer.includes('limang (5) failing grades') || s1b.answer.includes('Limang (5) Naipong Bagsak'), 'Must mention 5 failing grades accumulated');
assert(s1b.answer.includes('[Source05, p.55]'), 'Must cite p.55');
assert(!hasEmoji(s1b.answer), 'Must have no emojis');
for (const c of s1b.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 4. Scenario 1b (Delinquency and Disqualification thresholds) answered accurately.');

// 5. Test Scenario 2: Dean's Lister with 2.25 Grade Floor
const s2 = resolveComplexTaglishScenario('makati resident ako pero may 2.25 ako sa major pasok pa ba ako sa deans lister?');
assert(s2 !== null, 'Scenario 2 must be handled');
assert(s2.answer.includes('Hindi Kuwalipikado'), 'Must state disqualified');
assert(s2.answer.includes('2.00'), 'Must explain the 2.00 academic floor');
assert(s2.answer.includes('[Source05, p.73]'), 'Must cite p.73');
assert(!hasEmoji(s2.answer), 'Must have no emojis');
for (const c of s2.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 5. Scenario 2 (Dean\'s Lister with 2.25 grade floor check) correctly resolved.');

// 6. Test Scenario 3: Wash Day Shorts & Tsinelas Prohibition
const s3 = resolveComplexTaglishScenario('pwede ba pumasok pag wash day kahit naka-shorts at t-shirt?');
assert(s3 !== null, 'Scenario 3 must be handled');
assert(s3.answer.includes('IPINAGBABAWAL ang pagsuot ng shorts at tsinelas'), 'Must state shorts & tsinelas are prohibited');
assert(s3.answer.includes('[Source05, p.79]'), 'Must cite p.79');
assert(s3.answer.includes('CSFD') || s3.answer.includes('violation slip'), 'Must mention CSFD / violation slip');
assert(!hasEmoji(s3.answer), 'Must have no emojis');
for (const c of s3.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 6. Scenario 3 (Wash Day civilian attire and prohibited garments) correctly resolved.');

// 7. Test Scenario 4: Naiwan ang ID sa Bahay
const s4 = resolveComplexTaglishScenario('naiwan ko id ko sa bahay papapasukin ba ako sa gate?');
assert(s4 !== null, 'Scenario 4 must be handled');
assert(s4.answer.includes('No ID, No Entry'), 'Must explain No ID No Entry');
assert(s4.answer.includes('Certificate of Registration (COR)') || s4.answer.includes('COR'), 'Must explain presenting COR for temporary pass');
assert(s4.answer.includes('Php 200'), 'Must mention Php 200 replacement fee for lost ID');
assert(!hasEmoji(s4.answer), 'Must have no emojis');
for (const c of s4.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 7. Scenario 4 (Left ID at home gate protocol and replacement fee) correctly resolved.');

// 8. Test Scenario 5: Official Drop (OD) vs Unofficial Drop (UD)
const s5 = resolveComplexTaglishScenario('ano pinagkaiba ng od sa ud sa grades?');
assert(s5 !== null, 'Scenario 5 must be handled');
assert(s5.answer.includes('Official Drop (OD)') && s5.answer.includes('Unofficial Drop (UD)'), 'Must compare OD and UD');
assert(s5.answer.includes('5.00') || s5.answer.includes('failing grade'), 'Must explain UD counts as failing mark');
assert(s5.answer.includes('[Source05, p.55]'), 'Must cite p.55');
assert(!hasEmoji(s5.answer), 'Must have no emojis');
for (const c of s5.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 8. Scenario 5 (OD vs UD distinction and 5 UD disqualification rule) correctly resolved.');

// 9. Test Scenario 6: Absences Limit and 20% Threshold
const s6 = resolveComplexTaglishScenario('ilang absent bago ma-drop sa umak?');
assert(s6 !== null, 'Scenario 6 must be handled');
assert(s6.answer.includes('20%'), 'Must state 20% limit');
assert(s6.answer.includes('11 oras') || s6.answer.includes('11 hours'), 'Must mention 11 hours for 3-unit subject');
assert(s6.answer.includes('[Source05, p.58]'), 'Must cite p.58');
assert(!hasEmoji(s6.answer), 'Must have no emojis');
for (const c of s6.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 9. Scenario 6 (20% absence threshold and clinic excuse policy) correctly resolved.');

// 10. Test Scenario 7: Old Student Enrollment & Scan-to-Pay
const s7 = resolveComplexTaglishScenario('pano mag enroll ang old student sa olea at magbayad sa scan to pay?');
assert(s7 !== null, 'Scenario 7 must be handled');
assert(s7.answer.includes('OLEA') && s7.answer.includes('Block Section'), 'Must mention OLEA block section');
assert(s7.answer.includes('Scan-to-Pay') || s7.answer.includes('QR'), 'Must mention Scan-to-Pay QR');
assert(s7.answer.includes('[Source05, p.45]'), 'Must cite p.45');
assert(!hasEmoji(s7.answer), 'Must have no emojis');
for (const c of s7.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 10. Scenario 7 (Old student enrollment steps on OLEA and Scan-to-Pay) correctly resolved.');

// 11. Test Scenario 8: Makati vs Non-Makati Resident Fees
const s8 = resolveComplexTaglishScenario('magkano bayad sa umak pag makati resident vs non-makati resident?');
assert(s8 !== null, 'Scenario 8 must be handled');
assert(s8.answer.includes('Php 1,000') && s8.answer.includes('Php 3,000'), 'Must give Php 1000 and Php 3000');
assert(s8.answer.includes('[Source05, p.47]'), 'Must cite p.47');
assert(!hasEmoji(s8.answer), 'Must have no emojis');
for (const c of s8.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 11. Scenario 8 (Makati Php 1,000 vs Non-Makati Php 3,000 token fees) correctly resolved.');

// 12. Test Scenario 9: Kodigo and Academic Dishonesty
const s9 = resolveComplexTaglishScenario('ano parusa pag nahulihan ng kodigo sa exam?');
assert(s9 !== null, 'Scenario 9 must be handled');
assert(s9.answer.includes('5.00') || s9.answer.includes('5.0'), 'Must state automatic 5.0 grade');
assert(s9.answer.includes('suspensiyon') || s9.answer.includes('Major Offenses'), 'Must state suspension / major offense');
assert(s9.answer.includes('[Source05, p.58]'), 'Must cite p.58');
assert(!hasEmoji(s9.answer), 'Must have no emojis');
for (const c of s9.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 12. Scenario 9 (Exam cheating, kodigo penalties, and SDC hearing) correctly resolved.');

// 13. Test Scenario 10: Shifting Rules
const s10 = resolveComplexTaglishScenario('paano mag-shift ng kurso o magpalit ng course sa umak?');
assert(s10 !== null, 'Scenario 10 must be handled');
assert(s10.answer.includes('UNANG SEMESTRE') || s10.answer.includes('1st Semester'), 'Must state 1st semester only');
assert(s10.answer.includes('Releasing College') && s10.answer.includes('Accepting College'), 'Must state both deans must approve');
assert(s10.answer.includes('[Source05, p.58]'), 'Must cite p.58');
assert(!hasEmoji(s10.answer), 'Must have no emojis');
for (const c of s10.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 13. Scenario 10 (Degree shifting requirements and 1st semester window) correctly resolved.');

// 14. Test Scenario 11: Leave of Absence (LOA)
const s11 = resolveComplexTaglishScenario('paano mag-file ng loa o mag-stop ng aral sa umak?');
assert(s11 !== null, 'Scenario 11 must be handled');
assert(s11.answer.includes('College Dean') && s11.answer.includes('guro'), 'Must state teacher and dean approval');
assert(s11.answer.includes('denied readmission') || s11.answer.includes('pagtanggi sa readmission'), 'Must warn of denied readmission');
assert(s11.answer.includes('[Source05, p.56]'), 'Must cite p.56');
assert(!hasEmoji(s11.answer), 'Must have no emojis');
for (const c of s11.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 14. Scenario 11 (LOA filing procedures, dean endorsement, and AWOL penalty) correctly resolved.');

// 15. Test Scenario 12: Overload for Graduating Students
const s12 = resolveComplexTaglishScenario('pwede ba mag-overload ng units ang graduating student sa umak?');
assert(s12 !== null, 'Scenario 12 must be handled');
assert(s12.answer.includes('anim (6) na units') || s12.answer.includes('6 units'), 'Must state max 6 units excess');
assert(s12.answer.includes('28 units') || s12.answer.includes('28 Units'), 'Must state up to 28 units');
assert(s12.answer.includes('[Source05, p.56]'), 'Must cite p.56');
assert(!hasEmoji(s12.answer), 'Must have no emojis');
for (const c of s12.citations) assert(verifyCitation(c), `Citation failed: ${c.quote}`);
console.log('[PASS] 15. Scenario 12 (Graduating student overload limits up to 28 units) correctly resolved.');

// 16. Out-of-Scope Non-UMak Filipino Queries
const outOfScopeQueries = [
  'sino ang presidente ng pilipinas?',
  'paano magluto ng sinigang na baboy?',
  'ano ang weather ngayon sa taguig?'
];
for (const oos of outOfScopeQueries) {
  const result = resolveComplexTaglishScenario(oos);
  assert.strictEqual(result, null, `Out-of-scope Taglish query "${oos}" must return null`);
}
console.log('[PASS] 16. Out-of-scope non-UMak Filipino queries safely ignored by Taglish resolver.');

console.log('\nAll 16 Colloquial Taglish & Situational Inquiry tests passed successfully!\n');
