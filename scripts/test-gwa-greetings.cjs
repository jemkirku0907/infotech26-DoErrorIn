const assert = require('assert');
const sourcesData = require('../data/sources.json');

// Stopwords
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'what', 'where', 'who', 'how',
  'does', 'do', 'can', 'i', 'my', 'you', 'your', 'please', 'tell', 'me', 'about'
]);

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

function isGreetingQuery(text) {
  const q = text.toLowerCase().trim();

  const substantiveKeywords = [
    'where', 'saan', 'location', 'located', 'floor', 'building', 'wing', 'cit', 'registrar', 'cashier',
    'president', 'clinic', 'dress code', 'uniform', 'grooming', 'haircut', 'id policy', 'wear id',
    'offense', 'penalty', 'penalties', 'sanction', 'attendance', 'absence', 'absent', 'tardy',
    'probation', 'delinquency', 'dismissal', 'dropping', 'shifting', 'loa', 'clearance',
    'scholar', 'token fee', 'exemption', 'deans lister', "dean's lister", 'ccis', 'tuition',
    'admission', 'enrollment', 'olea', 'scan-to-pay', 'cmat', 'hazing', 'cheating', 'dishonesty'
  ];

  if (substantiveKeywords.some(kw => q.includes(kw))) {
    return false;
  }

  const greetingRegexes = [
    /^(hi|hello|hey|yo|howdy|good day)\b/i,
    /^(good\s+(morning|afternoon|evening))\b/i,
    /^(magandang\s+(araw|umaga|tanghali|hapon|gabi))\b/i,
    /^(kumusta|kamusta|musta)(\s+po|\s+ka|\s+kayo)?\b/i,
    /^(salamat|maraming salamat|thank you|thanks|ty)(\s+po|\s+so much|\s+a lot)?\b/i,
    /^(bye|goodbye|paalam|see you|cya)\b/i,
    /^(who are you|sino ka|what is taga-ask|ano ang taga-ask)\b/i,
    /^(what can you do|ano (ang )?kaya mong gawin|ano maitutulong mo|help me|patulong)\b/i
  ];

  return greetingRegexes.some(regex => regex.test(q)) || /^(hi|hello|hey)[!.]*$/i.test(q);
}

function getGreetingResponse(text) {
  const q = text.toLowerCase().trim();

  if (/^(salamat|maraming salamat|thank you|thanks|ty)/i.test(q)) {
    return `You are very welcome! If you have more questions about University of Makati policies, campus navigation, scholarships, or need assistance computing your GWA, feel free to ask anytime.`;
  }

  if (/^(bye|goodbye|paalam|see you|cya)/i.test(q)) {
    return `Goodbye! Study well and have a productive day at the University of Makati. Do not hesitate to return if you need further assistance.`;
  }

  return `Hello! I am TAGA-asK AI, your verified AI knowledge assistant for the University of Makati (UMak).

I am here to assist you with:
- **Student Handbook Policies:** Admission, enrollment, dress code, student ID policy, attendance limits, and disciplinary sanctions.
- **Campus Navigation:** Directions to university offices, colleges, and facilities across campus buildings.
- **Scholarships & Grants:** Dean's Lister token fee exemptions, student assistantships, and athletic grants.
- **GWA & Grade Computation:** Step-by-step General Weighted Average calculation, Dean's Lister qualification checks, and academic standing reviews.

How may I assist you today? You can ask any university-related question or provide your course grades and units to calculate your GWA.`;
}

function isGradeComputationQuery(text) {
  const q = text.toLowerCase().trim();

  const gradeKeywords = [
    'compute my gwa', 'calculate my gwa', 'compute gwa', 'calculate gwa',
    'paano mag compute ng gwa', 'paano compute gwa', 'pano mag compute ng gwa',
    'gwa computation', 'grade computation', 'compute my grade', 'calculate my grade',
    'gwa calculator', 'grade calculator', 'pa-compute ng gwa', 'pacompute ng gwa',
    'how to compute gwa', 'how do i compute my gwa', 'formula for gwa', 'formula ng gwa',
    'paano i-calculate ang gwa', 'paano icompute gwa'
  ];

  if (gradeKeywords.some(kw => q.includes(kw))) {
    return true;
  }

  const parsed = parseGradeInput(text);
  return parsed.length >= 2;
}

function parseGradeInput(text) {
  const items = [];
  const lines = text.split(/[\n,;]|(?:\band\b)/i).map(s => s.trim()).filter(Boolean);

  for (const line of lines) {
    const gradeMatch = line.match(/\b([1-5](?:\.\d{1,2})?)\b/);
    if (!gradeMatch) continue;

    const gradeVal = parseFloat(gradeMatch[1]);
    if (gradeVal < 1.0 || gradeVal > 5.0) continue;

    const withoutGrade = line.replace(gradeMatch[0], ' ');
    const unitMatch = withoutGrade.match(/\b([1-9])\s*(?:units?|u|credits?|credit units?)?\b/i);

    let units = 3;
    if (unitMatch) {
      units = parseInt(unitMatch[1], 10);
    }

    let courseName = line
      .replace(new RegExp(`\\b${gradeMatch[1]}\\b`), '')
      .replace(/\b\d+\s*(?:units?|u|credits?)\b/gi, '')
      .replace(/[():\-–—=]/g, ' ')
      .replace(/\b(?:grade|units?|with|in|for|my|compute|gwa|pa|paki|ko|grades)\b/gi, '')
      .trim()
      .replace(/\s+/g, ' ');

    if (!courseName || courseName.length < 2) {
      courseName = `Course ${items.length + 1}`;
    }

    items.push({ course: courseName, grade: gradeVal, units });
  }

  return items;
}

function computeGWA(items) {
  let totalPoints = 0;
  let totalUnits = 0;
  let failingCount = 0;
  let hasLowAcademic = false;
  let hasLowPeNstp = false;

  for (const item of items) {
    const points = item.grade * item.units;
    totalPoints += points;
    totalUnits += item.units;

    if (item.grade === 5.0) {
      failingCount++;
    }

    const isPeNstp = /(?:pe|p\.e|nstp|cwts|rotc)/i.test(item.course);
    if (isPeNstp) {
      if (item.grade > 2.50) hasLowPeNstp = true;
    } else {
      if (item.grade > 2.00) hasLowAcademic = true;
    }
  }

  const rawGwa = totalUnits > 0 ? totalPoints / totalUnits : 0;
  const gwa = Math.round(rawGwa * 100) / 100;
  const gwaFormatted = gwa.toFixed(2);

  let deansLister = {
    eligible: false,
    type: 'None',
    note: "Not eligible for Dean's Lister (requires a GWA of 1.00 to 1.75 with no grade below 2.00 in academic courses and no grade below 2.50 in PE/NSTP)."
  };

  if (gwa <= 1.75 && !hasLowAcademic && !hasLowPeNstp && failingCount === 0) {
    if (gwa <= 1.25) {
      deansLister = {
        eligible: true,
        type: 'Full Exemption',
        note: 'Qualified for Full Token Fee Exemption (GWA between 1.00 and 1.25 with no academic grade below 2.00 and no PE/NSTP grade below 2.50).'
      };
    } else {
      deansLister = {
        eligible: true,
        type: 'Partial Exemption',
        note: 'Qualified for Partial Token Fee Exemption (GWA between 1.26 and 1.75 with no academic grade below 2.00 and no PE/NSTP grade below 2.50).'
      };
    }
  }

  let academicStanding = 'Good Standing';
  let standingNote = 'Good Standing: All enrolled courses have passing grades.';
  if (failingCount >= 3) {
    academicStanding = 'Academic Delinquency';
    standingNote = 'Warning: Obtaining three (3) failing grades (9 units) leads to academic delinquency and permanent disqualification under Section 2.3.';
  } else if (failingCount === 2) {
    academicStanding = 'Probationary Status';
    standingNote = 'Caution: Obtaining failing grades in two (2) courses places a student on probationary status (at-risk) under Section 2.2, requiring college intervention.';
  }

  let latinHonors = 'None';
  if (gwa >= 1.00 && gwa <= 1.15 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Summa Cum Laude';
  } else if (gwa > 1.15 && gwa <= 1.30 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Magna Cum Laude';
  } else if (gwa > 1.30 && gwa <= 1.45 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Cum Laude';
  }

  const tableRows = items.map(it => {
    const pts = (it.grade * it.units).toFixed(2);
    return `| ${it.course} | ${it.grade.toFixed(2)} | ${it.units} | ${pts} |`;
  }).join('\n');

  const honorsText = latinHonors !== 'None'
    ? `\n- **Latin Honors Track (Graduating):** **${latinHonors}** (requires maintaining load and completing 75% of units at UMak) [Source05, p.68].`
    : '';

  const markdownAnswer = `### Official UMak GWA Computation & Academic Standing

Based on the **Student Handbook (Main Source)**, Article IV, Section 13 (Policy on Grading System) [Source05, p.59] and Article V, Section 1 (Dean's Lister Token Fee Exemption Grant) [Source05, p.73]:

| Course / Subject | Numerical Grade | Credit Units | Grade Points (Grade x Units) |
| :--- | :---: | :---: | :---: |
${tableRows}
| **Total** | | **${totalUnits}** | **${totalPoints.toFixed(2)}** |

#### GWA Formula & Step-by-Step Calculation
- **Formula:** Sum of (Grade x Units) / Total Enrolled Units
- **Calculation:** ${totalPoints.toFixed(2)} / ${totalUnits} = **${gwaFormatted}**
- **General Weighted Average (GWA):** **${gwaFormatted}**

#### Academic Standing & Dean's Lister Evaluation
- **Academic Standing:** **${academicStanding}** (${standingNote}) [Source05, p.54].
- **Dean's Lister Status:** **${deansLister.type === 'None' ? 'Not Eligible' : deansLister.type}** — ${deansLister.note} [Source05, p.73].${honorsText}

*Note: For final grade validation and token fee exemption endorsements, submit your official Report of Grades to the Center for Admission and Scholarship (CAS) via OLEA.*`;

  const citations = [
    {
      source: 'Source05.pdf',
      page: 59,
      quote: 'POLICY ON GRADING SYSTEM: Numerical Percentage & Adjectival Equivalent: 1.00 = 97-100%',
      claim: 'Official UMak grading system scale and numerical equivalents',
      verified: true
    },
    {
      source: 'Source05.pdf',
      page: 73,
      quote: "Dean's Lister Token Fee Exemption Grant: Awarded to both Makati and non-Makati residents who obtained a GWA within 1.00 to 1.75",
      claim: "Dean's Lister scholarship GWA threshold and grade requirements",
      verified: true
    }
  ];

  return {
    courses: items,
    totalUnits,
    totalPoints,
    gwa,
    gwaFormatted,
    deansLister,
    academicStanding,
    standingNote,
    latinHonors,
    markdownAnswer,
    citations
  };
}

function hasEmoji(text) {
  // Regex matching standard unicode emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
  return emojiRegex.test(text);
}

console.log('=== Running TAGA-asK AI Greeting & GWA Helper Test Suite ===\n');

// 1. Pure Greetings
const greetings = ['hi', 'hello', 'hey', 'magandang umaga', 'kumusta po', 'good morning', 'salamat po', 'bye'];
for (const g of greetings) {
  assert(isGreetingQuery(g), `Expected "${g}" to be detected as a greeting`);
  const reply = getGreetingResponse(g);
  assert(reply.length > 20, `Expected reply for "${g}" to be informative`);
  assert(!hasEmoji(reply), `Expected NO EMOJIS in reply for "${g}"`);
}
console.log('[PASS] 1. Conversational greetings recognized and answered with professional, emoji-free responses.');

// 2. Greetings with policy question must NOT be intercepted as pure greeting
assert(!isGreetingQuery('Hi, where is the CIT office located?'), 'Should not intercept location query');
assert(!isGreetingQuery('Hello, ano ang dress code sa campus?'), 'Should not intercept dress code query');
assert(!isGreetingQuery('Good morning, what is the policy on absences?'), 'Should not intercept absence query');
console.log('[PASS] 2. Hybrid queries (greeting + institutional question) correctly routed to document RAG.');

// 3. GWA Inquiry Intent
const gwaQueries = [
  'How to compute GWA?',
  'Paano mag compute ng GWA sa UMak?',
  'Formula for GWA in the student handbook',
  'GWA calculator'
];
for (const q of gwaQueries) {
  assert(isGradeComputationQuery(q), `Expected "${q}" to be recognized as GWA query`);
}
console.log('[PASS] 3. GWA inquiry intents correctly classified.');

// 4. Grade Parsing
const sampleText = 'CS101 1.25 (3 units), Math101 1.50 (3 units), Eng 1.75 (3 units)';
const parsed = parseGradeInput(sampleText);
assert.strictEqual(parsed.length, 3);
assert.strictEqual(parsed[0].grade, 1.25);
assert.strictEqual(parsed[0].units, 3);
assert.strictEqual(parsed[1].grade, 1.50);
assert.strictEqual(parsed[2].grade, 1.75);
console.log('[PASS] 4. Multi-subject grades and units successfully parsed from natural language.');

// 5. GWA Computation & Dean's Lister Verification
const result1 = computeGWA(parsed);
assert.strictEqual(result1.gwaFormatted, '1.50');
assert.strictEqual(result1.totalUnits, 9);
assert.strictEqual(result1.deansLister.eligible, true);
assert.strictEqual(result1.deansLister.type, 'Partial Exemption');
assert.strictEqual(result1.academicStanding, 'Good Standing');
assert(!hasEmoji(result1.markdownAnswer), 'Expected NO EMOJIS in GWA answer');

// Verify Citations
assert(result1.citations.length >= 2);
for (const c of result1.citations) {
  assert(verifyCitation(c), `Citation failed verification: ${JSON.stringify(c)}`);
}
console.log('[PASS] 5. Accurate GWA calculation (1.50) with verified Dean\'s Lister Partial Exemption and Handbook citations.');

// 6. Full Exemption Dean's Lister & Latin Honors
const highGrades = [
  { course: 'CS101', grade: 1.00, units: 3 },
  { course: 'CS102', grade: 1.25, units: 3 },
  { course: 'MATH', grade: 1.00, units: 3 }
];
const result2 = computeGWA(highGrades);
assert.strictEqual(result2.gwaFormatted, '1.08');
assert.strictEqual(result2.deansLister.eligible, true);
assert.strictEqual(result2.deansLister.type, 'Full Exemption');
assert.strictEqual(result2.latinHonors, 'Summa Cum Laude');
console.log('[PASS] 6. High honor grades correctly trigger Full Exemption (1.08) and Summa Cum Laude Latin Honors track.');

// 7. Academic Probation Detection
const probationGrades = [
  { course: 'Course 1', grade: 5.00, units: 3 },
  { course: 'Course 2', grade: 5.00, units: 3 },
  { course: 'Course 3', grade: 1.75, units: 3 }
];
const result3 = computeGWA(probationGrades);
assert.strictEqual(result3.academicStanding, 'Probationary Status');
assert.strictEqual(result3.deansLister.eligible, false);
console.log('[PASS] 7. Failing grades correctly trigger Academic Probation under Handbook Section 2.2.');

console.log('\nAll Greeting and Grade Computation tests passed successfully!');
