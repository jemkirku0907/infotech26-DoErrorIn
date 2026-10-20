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

// 8. Team DoErrorIn Developer Inquiries
function isDeveloperQuery(text) {
  const q = text.toLowerCase().trim();

  if (
    q.includes('president') ||
    q.includes('dean') ||
    q.includes('registrar') ||
    q.includes('director') ||
    q.includes('vice president')
  ) {
    return false;
  }

  const patterns = [
    /\b(who\s+(developed|created|made|built|programmed|authored|coded|designed)\s+(you|this|taga-?ask|the app|the system|the chatbot|the bot))\b/i,
    /\b(who\s+are\s+(the\s+)?(developers|creators|authors|makers|programmers|proponents|team\s+behind))\b/i,
    /\b(sino|sinong)\s+(ang\s+)?(nag\s*develop|gumawa|nag\s*code|nag\s*create|nag\s*program|may\s*gawa)\b/i,
    /\b(sino(-sino)?\s+(ang\s+)?(mga\s+)?(developer|developers|creator|creators|gumawa|authors?))\b/i,
    /\b(team\s*doerrorin|doerror!n|doerrorin)\b/i,
    /^(credits?|developers?|creators?|authors?|proponents?)[!.]*$/i,
    /\b(sino\s+ang\s+team\s+doerrorin|sino\s+si\s+doerrorin)\b/i
  ];

  return patterns.some(p => p.test(q));
}

function getDeveloperResponse() {
  return `### Developers of TAGA-asK AI

TAGA-asK AI was developed by **Team DoErrorIn** from the University of Makati (UMak):

1. **Utana, Jemkirk L.** | DoErrorIn
2. **Bautista, John Michael** | DoErrorIn
3. **Tan, Kirk Stanley** | DoErrorIn
4. **Sison, Romaine** | DoErrorIn
5. **Jalea, Jhon Loyd** | DoErrorIn

TAGA-asK AI was engineered to serve as an official AI knowledge assistant for University of Makati students, providing verified answers grounded strictly in the official Student Handbook, campus map directory, scholarships, and academic policies.`;
}

const devQueries = [
  'sino nag develop sayo?',
  'who developed you?',
  'who are the developers?',
  'sino mga developers?',
  'sinong gumawa ng taga-ask ai?',
  'who created taga-ask ai?',
  'team doerrorin',
  'developers',
  'credits'
];

for (const dq of devQueries) {
  assert(isDeveloperQuery(dq), `Expected "${dq}" to be recognized as developer query`);
}

// Disambiguation: University leadership must not be treated as bot developer
assert(!isDeveloperQuery('Who is the university president?'), 'University president must not be treated as developer query');
assert(!isDeveloperQuery('Who is the dean of CCIS?'), 'College dean must not be treated as developer query');

const devReply = getDeveloperResponse();
assert(devReply.includes('Utana, Jemkirk L.'), 'Must credit Jemkirk Utana');
assert(devReply.includes('Bautista, John Michael'), 'Must credit John Michael Bautista');
assert(devReply.includes('Tan, Kirk Stanley'), 'Must credit Kirk Stanley Tan');
assert(devReply.includes('Sison, Romaine'), 'Must credit Romaine Sison');
assert(devReply.includes('Jalea, Jhon Loyd'), 'Must credit Jhon Loyd Jalea');
assert(devReply.includes('DoErrorIn'), 'Must credit Team DoErrorIn');
assert(!hasEmoji(devReply), 'Must not contain any emojis');
console.log('[PASS] 8. Team DoErrorIn developer queries correctly identified and answered with full developer roster.');

// 9. Target GWA & Grade Improvement Advice (User's Real Screenshot Query)
function parseTargetGWAQuery(text) {
  const q = text.toLowerCase();

  const currentMatch =
    q.match(/\b(?:my\s+gwa\s+is|current\s+gwa(?:\s+is)?|gwa\s+ko(?:\s+ay|\s+is)?|from(?:\s+a)?)\s*([1-5](?:\.\d{1,2})?)\b/i) ||
    q.match(/\b([1-5]\.\d{1,2})\s*(?:ang\s+)?gwa\b/i) ||
    q.match(/\bgwa\s*(?:of\s*|na\s*)?([1-5]\.\d{1,2})\b/i);

  const targetMatch =
    q.match(/\b(?:turn\s+into|make\s+it|reach|become|target(?:\s+gwa)?|maging|to\s+be(?:\s+my\s+gwa)?|to)\s*([1-5](?:\.\d{1,2})?)\b/i);

  if (currentMatch) {
    const currentGwa = parseFloat(currentMatch[1]);
    let targetGwa = 1.75;
    if (targetMatch && targetMatch[1]) {
      targetGwa = parseFloat(targetMatch[1]);
    } else if (q.includes('summa')) {
      targetGwa = 1.15;
    } else if (q.includes('magna')) {
      targetGwa = 1.30;
    } else if (q.includes('cum laude')) {
      targetGwa = 1.45;
    }
    return { currentGwa, targetGwa };
  }

  if (q.includes('gwa') && targetMatch && targetMatch[1]) {
    return { currentGwa: 2.50, targetGwa: parseFloat(targetMatch[1]) };
  }

  return null;
}

function formatTargetGWAAdvice(currentGwa, targetGwa = 1.75) {
  const currentFormatted = currentGwa.toFixed(2);
  const targetFormatted = targetGwa.toFixed(2);

  const prevUnits = 20;
  const prevPoints = prevUnits * currentGwa;

  const sem1NewUnits = 20;
  const sem1TotalUnits = prevUnits + sem1NewUnits;
  const sem1RequiredTotalPoints = sem1TotalUnits * targetGwa;
  const sem1RequiredNewPoints = sem1RequiredTotalPoints - prevPoints;
  const sem1RequiredTermGwa = sem1RequiredNewPoints / sem1NewUnits;

  const sem1Text = sem1RequiredTermGwa >= 1.00 && sem1RequiredTermGwa <= 3.00
    ? `**${sem1RequiredTermGwa.toFixed(2)}** (requires achieving mostly Excellent 1.00–1.25 grades in all enrolled courses)`
    : sem1RequiredTermGwa < 1.00
    ? `**1.00** (a 1-semester leap is mathematically demanding since 1.00 is the highest grade; requires 2 semesters to pull cumulative average down)`
    : `**${sem1RequiredTermGwa.toFixed(2)}**`;

  const answer = `### How to Reach a Target GWA of ${targetFormatted} from ${currentFormatted}

Based on the **University of Makati Student Handbook (Main Source)**, Article IV, Section 13 (Policy on Grading System) [Source05, p.59] and Article V, Section 1 (Dean's Lister Token Fee Exemption Grant) [Source05, p.73]:

#### 1. Crucial Rule: Dean's Lister is Awarded Per Semester (Not Cumulative Lifetime!)
At the University of Makati, you **do not** need your cumulative lifetime GWA to immediately reach ${targetFormatted} to receive scholarship privileges:
- Under **Article V, Section 1 (Page 73)**, the Dean's Lister Token Fee Exemption Grant is awarded on a **semester-by-semester basis** based on the **previous semester's term grades**, not your cumulative average across all years!
- **Good news:** Even if your past semester GWA was **${currentFormatted}**, you can qualify for the Dean's Lister tuition discount next semester if your **term GWA for the upcoming semester** is between **1.00 and 1.75** (provided you have no grade lower than 2.00 in any academic course and no grade lower than 2.50 in PE/NSTP)!
  - **GWA 1.00 to 1.25:** Full Token Fee Exemption (100% free token fee).
  - **GWA 1.26 to 1.75:** Partial Token Fee Exemption.

#### 2. Cumulative GWA Mathematical Breakdown
If you want to pull your **overall cumulative GWA** from **${currentFormatted}** down to **${targetFormatted}** (for permanent academic standing or graduation Latin Honors [Source05, p.68]):
$$\\text{Target Cumulative GWA} = \\frac{\\text{Previous Grade Points} + \\text{New Grade Points}}{\\text{Previous Units} + \\text{New Units}}$$

Assuming a standard semestral load of 20 credit units:
- **Previous Record:** 20 units x ${currentFormatted} = **${prevPoints.toFixed(1)} Grade Points**.
- **1 Upcoming Semester (20 new units):** Target term GWA required is ${sem1Text}.

#### 3. Strategic Action Plan from the Student Handbook
1. **Prioritize High-Credit Courses [Source05, p.59]:** Focus on 3-unit lecture and 4-unit lab/major computing courses where 1.00/1.25 exerts the highest weight.
2. **Never Drop Below the 2.00 Floor [Source05, p.73]:** For Dean's Lister, you cannot have any grade below 2.00 in academic courses, and no grade below 2.50 in PE/NSTP.
3. **Avoid Marks of 4.0, INC, and Dropped Courses [Source05, pp.57–59]:** Clear any conditional or incomplete marks within official deadlines.
4. **Comply with the 20% Attendance Threshold [Source05, p.58]:** Avoid unexcused absences exceeding 20% of class hours.
5. **Seek College Academic Counseling [Source05, p.54]:** Utilize college mentoring and guidance tutorials.`;

  return {
    answer,
    in_sources: true,
    citations: [
      {
        source: 'Source05.pdf',
        page: 73,
        quote: "Dean's Lister Token Fee Exemption Grant: Awarded to both Makati and non-Makati residents who obtained a GWA within 1.00 to 1.75",
        claim: "Dean's Lister semestral qualification criteria",
        verified: true,
      },
      {
        source: 'Source05.pdf',
        page: 59,
        quote: "POLICY ON GRADING SYSTEM: Numerical Percentage & Adjectival Equivalent: 1.00 = 97-100%",
        claim: "Official UMak grading system scale",
        verified: true,
      },
      {
        source: 'Source05.pdf',
        page: 54,
        quote: "Probationary Status or at risk student: Students who at end of semester obtain failing grades in TWO",
        claim: "Academic standing and guidance intervention",
        verified: true,
      }
    ]
  };
}

const userScreenshotQuery = 'my gwa is 2.50 what i can do to be my gwa turn into 1.75';
const parsedTarget = parseTargetGWAQuery(userScreenshotQuery);
assert(parsedTarget !== null, 'Target GWA query must be parsed successfully');
assert.strictEqual(parsedTarget.currentGwa, 2.5);
assert.strictEqual(parsedTarget.targetGwa, 1.75);

const targetAdvice = formatTargetGWAAdvice(parsedTarget.currentGwa, parsedTarget.targetGwa);
assert(targetAdvice.answer.includes("Dean's Lister is Awarded Per Semester"), 'Must explain that Dean\'s Lister is semestral');
assert(targetAdvice.answer.includes("1.75 from 2.50"), 'Must address 2.50 to 1.75 specifically');
assert(targetAdvice.answer.includes("Target Cumulative GWA"), 'Must explain the cumulative formula');
assert(!hasEmoji(targetAdvice.answer), 'Must not contain any emojis');

for (const c of targetAdvice.citations) {
  assert(verifyCitation(c), `Citation verification failed for ${c.source} p.${c.page}`);
}
console.log('[PASS] 9. User\'s screenshot query ("my gwa is 2.50 what i can do to be my gwa turn into 1.75") answered with verified math and handbook advice.');

console.log('\nAll Greeting, Grade Computation, and Developer Credit tests passed successfully!');
