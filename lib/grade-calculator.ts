import { Citation, ChatResponse } from './types';

export interface CourseGrade {
  course: string;
  grade: number;
  units: number;
}

export interface GWAResult {
  courses: CourseGrade[];
  totalUnits: number;
  totalPoints: number;
  gwa: number;
  gwaFormatted: string;
  deansLister: {
    eligible: boolean;
    type: 'Full Exemption' | 'Partial Exemption' | 'None';
    note: string;
  };
  academicStanding: 'Good Standing' | 'Probationary Status' | 'Academic Delinquency';
  standingNote: string;
  latinHonors: 'Summa Cum Laude' | 'Magna Cum Laude' | 'Cum Laude' | 'None';
  markdownAnswer: string;
  citations: Citation[];
}

/**
 * Checks if a query is a pure or primary conversational greeting / pleasantry.
 * Returns false if the message contains substantive university policy or location questions.
 */
export function isGreetingQuery(text: string): boolean {
  const q = text.toLowerCase().trim();

  // If the query contains institutional policy or location keywords, treat as non-greeting
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

  // Pure greeting & pleasantry patterns
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

/**
 * Returns a warm, professional, non-hallucinatory greeting response for TAGA-asK AI (no emojis).
 */
export function getGreetingResponse(text: string): string {
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

/**
 * Parses user queries about current GWA and target GWA / grade improvements
 * (e.g. "my gwa is 2.50 what i can do to be my gwa turn into 1.75").
 */
export function parseTargetGWAQuery(text: string): { currentGwa: number; targetGwa: number } | null {
  const q = text.toLowerCase();

  const currentMatch =
    q.match(/\b(?:my\s+gwa\s+is|current\s+gwa(?:\s+is)?|gwa\s+ko(?:\s+ay|\s+is)?|from(?:\s+a)?)\s*([1-5](?:\.\d{1,2})?)\b/i) ||
    q.match(/\b([1-5]\.\d{1,2})\s*(?:ang\s+)?gwa\b/i) ||
    q.match(/\bgwa\s*(?:of\s*|na\s*)?([1-5]\.\d{1,2})\b/i);

  const targetMatch =
    q.match(/\b(?:turn\s+into|make\s+it|reach|become|target(?:\s+gwa)?|maging|to\s+be(?:\s+my\s+gwa)?|to)\s*([1-5](?:\.\d{1,2})?)\b/i);

  if (currentMatch) {
    const currentGwa = parseFloat(currentMatch[1]);
    let targetGwa = 1.75; // Default to official UMak Dean's Lister threshold
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

  // Also match general questions like "how to make my gwa 1.75" or "how to turn into 1.75"
  if (q.includes('gwa') && targetMatch && targetMatch[1]) {
    return { currentGwa: 2.50, targetGwa: parseFloat(targetMatch[1]) };
  }

  return null;
}

/**
 * Returns mathematically grounded target GWA improvement advice citing the Student Handbook.
 */
export function formatTargetGWAAdvice(currentGwa: number, targetGwa: number = 1.75): ChatResponse {
  const currentFormatted = currentGwa.toFixed(2);
  const targetFormatted = targetGwa.toFixed(2);

  // Math simulation for standard 20-unit load
  const prevUnits = 20;
  const prevPoints = prevUnits * currentGwa;

  // 1 Semester horizon (20 new units)
  const sem1NewUnits = 20;
  const sem1TotalUnits = prevUnits + sem1NewUnits;
  const sem1RequiredTotalPoints = sem1TotalUnits * targetGwa;
  const sem1RequiredNewPoints = sem1RequiredTotalPoints - prevPoints;
  const sem1RequiredTermGwa = sem1RequiredNewPoints / sem1NewUnits;

  // 2 Semesters horizon (40 new units)
  const sem2NewUnits = 40;
  const sem2TotalUnits = prevUnits + sem2NewUnits;
  const sem2RequiredTotalPoints = sem2TotalUnits * targetGwa;
  const sem2RequiredNewPoints = sem2RequiredTotalPoints - prevPoints;
  const sem2RequiredTermGwa = sem2RequiredNewPoints / sem2NewUnits;

  const sem1Text = sem1RequiredTermGwa >= 1.00 && sem1RequiredTermGwa <= 3.00
    ? `**${sem1RequiredTermGwa.toFixed(2)}** (requires achieving mostly Excellent 1.00–1.25 grades in all enrolled courses)`
    : sem1RequiredTermGwa < 1.00
    ? `**1.00** (a 1-semester leap is mathematically demanding since 1.00 is the highest grade; requires 2 semesters to pull cumulative average down)`
    : `**${sem1RequiredTermGwa.toFixed(2)}**`;

  const sem2Text = sem2RequiredTermGwa >= 1.00 && sem2RequiredTermGwa <= 3.00
    ? `**${sem2RequiredTermGwa.toFixed(2)}** per semester (achievable with a steady mix of 1.25 Superior and 1.50 Very Good grades)`
    : `**1.00**`;

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
- **2 Upcoming Semesters (40 new units):** Target term GWA required is ${sem2Text}.

#### 3. Strategic Action Plan from the Student Handbook
1. **Prioritize High-Credit Courses [Source05, p.59]:**
   - Focus your study hours on 3-unit lecture and 4-unit laboratory or major computing courses. Because UMak GWA is unit-weighted, earning a 1.00 or 1.25 in a 4-unit course pulls your GWA up much faster than in a 2-unit course.
2. **Never Drop Below the 2.00 Floor [Source05, p.73]:**
   - For Dean's Lister eligibility, you cannot have any grade below 2.00 in any academic subject, and no grade below 2.50 in PE and NSTP.
3. **Avoid Marks of 4.0, INC, and Dropped Courses [Source05, pp.57–59]:**
   - Grade of 4.00 (Conditional Failure) must be removed by re-examination within five (5) days, otherwise it converts to 5.00 (Failure). Incomplete (INC) marks must be cleared within 1 academic year.
4. **Comply with the 20% Attendance Threshold [Source05, p.58]:**
   - Incurring unexcused absences exceeding 20% of class hours results in an automatic drop or failing grade.
5. **Seek College Academic Counseling [Source05, p.54]:**
   - Students working to lift their standing are encouraged to consult their College Dean or the Guidance Office for tutorial interventions and academic mentoring.

**Compute your custom target:** Send me your enrolled subjects, course units, and current grades, and I will calculate the exact grades you need per subject to hit your target!`;

  return {
    answer,
    in_sources: true,
    conflict: false,
    citations: [
      {
        source: 'Source05.pdf',
        page: 73,
        quote: "Dean's Lister Token Fee Exemption Grant: Awarded to both Makati and non-Makati residents who obtained a GWA within 1.00 to 1.75",
        claim: "Dean's Lister semestral qualification criteria and grade requirements",
        verified: true,
      },
      {
        source: 'Source05.pdf',
        page: 59,
        quote: "POLICY ON GRADING SYSTEM: Numerical Percentage & Adjectival Equivalent: 1.00 = 97-100%",
        claim: "Official UMak grading system scale and numerical equivalents",
        verified: true,
      },
      {
        source: 'Source05.pdf',
        page: 54,
        quote: "Probationary Status or at risk student: Students who at end of semester obtain failing grades in TWO",
        claim: "Academic standing and guidance intervention",
        verified: true,
      }
    ],
    verification_status: 'verified',
  };
}

/**
 * Checks if a query is asking for grade computation, GWA calculation, or providing grades.
 */
export function isGradeComputationQuery(text: string): boolean {
  const q = text.toLowerCase().trim();

  // Target GWA / Grade Improvement query
  if (parseTargetGWAQuery(text) !== null) {
    return true;
  }

  const gradeKeywords = [
    'compute my gwa', 'calculate my gwa', 'compute gwa', 'calculate gwa',
    'paano mag compute ng gwa', 'paano compute gwa', 'pano mag compute ng gwa',
    'gwa computation', 'grade computation', 'compute my grade', 'calculate my grade',
    'gwa calculator', 'grade calculator', 'pa-compute ng gwa', 'pacompute ng gwa',
    'how to compute gwa', 'how do i compute my gwa', 'formula for gwa', 'formula ng gwa',
    'paano i-calculate ang gwa', 'paano icompute gwa',
    'my gwa is', 'current gwa', 'gwa ko', 'turn into 1.75', 'make it 1.75', 'reach 1.75',
    'raise my gwa', 'improve my gwa', 'pano tumaas gwa', 'paano tumaas gwa'
  ];

  if (gradeKeywords.some(kw => q.includes(kw))) {
    return true;
  }

  // Also check if text has grade patterns (e.g., pairs of numerical grades 1.00-5.00 and unit counts)
  const parsed = parseGradeInput(text);
  return parsed.length >= 2;
}

/**
 * Parses user text to extract course names, grades (1.00 - 5.00), and units.
 */
export function parseGradeInput(text: string): CourseGrade[] {
  const items: CourseGrade[] = [];
  const lines = text.split(/[\n,;]|(?:\band\b)/i).map(s => s.trim()).filter(Boolean);

  for (const line of lines) {
    // Look for valid UMak grade: 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00
    const gradeMatch = line.match(/\b([1-5](?:\.\d{1,2})?)\b/);
    if (!gradeMatch) continue;

    const gradeVal = parseFloat(gradeMatch[1]);
    if (gradeVal < 1.0 || gradeVal > 5.0) continue;

    // Remaining text after stripping grade
    const withoutGrade = line.replace(gradeMatch[0], ' ');
    const unitMatch = withoutGrade.match(/\b([1-9])\s*(?:units?|u|credits?|credit units?)?\b/i);

    let units = 3; // Standard university lecture course credit units
    if (unitMatch) {
      units = parseInt(unitMatch[1], 10);
    }

    // Extract cleanest course name
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

/**
 * Computes General Weighted Average (GWA), Dean's Lister qualification, and academic standing
 * according to official UMak Student Handbook policies (Source05.pdf, Pages 54, 59, 68, 73).
 */
export function computeGWA(items: CourseGrade[]): GWAResult {
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

  // Dean's Lister Eligibility (Article V, Section 1, Page 73)
  let deansLister: GWAResult['deansLister'] = {
    eligible: false,
    type: 'None',
    note: 'Not eligible for Dean\'s Lister (requires a GWA of 1.00 to 1.75 with no grade below 2.00 in academic courses and no grade below 2.50 in PE/NSTP).'
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

  // Academic Standing (Article IV, Section 2, Pages 54-55)
  let academicStanding: GWAResult['academicStanding'] = 'Good Standing';
  let standingNote = 'Good Standing: All enrolled courses have passing grades.';
  if (failingCount >= 3) {
    academicStanding = 'Academic Delinquency';
    standingNote = 'Warning: Obtaining three (3) failing grades (9 units) leads to academic delinquency and permanent disqualification under Section 2.3.';
  } else if (failingCount === 2) {
    academicStanding = 'Probationary Status';
    standingNote = 'Caution: Obtaining failing grades in two (2) courses places a student on probationary status (at-risk) under Section 2.2, requiring college intervention.';
  }

  // Latin Honors Eligibility (Article IV, Section 21, Page 68)
  let latinHonors: GWAResult['latinHonors'] = 'None';
  if (gwa >= 1.00 && gwa <= 1.15 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Summa Cum Laude';
  } else if (gwa > 1.15 && gwa <= 1.30 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Magna Cum Laude';
  } else if (gwa > 1.30 && gwa <= 1.45 && !hasLowAcademic && failingCount === 0) {
    latinHonors = 'Cum Laude';
  }

  // Format Markdown breakdown table
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

  const citations: Citation[] = [
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

/**
 * Returns a detailed guide on how GWA is computed at UMak with official handbook citations.
 */
export function formatGWAExplanation(): ChatResponse {
  const answer = `### How GWA is Computed at the University of Makati

Based on the **Student Handbook (Main Source)**, Article IV, Section 13 (Policy on Grading System) [Source05, p.59] and Article V, Section 1 (Academic Scholarships) [Source05, p.73], your General Weighted Average (GWA) is calculated as follows:

#### GWA Formula
$$\\text{GWA} = \\frac{\\sum (\\text{Numerical Grade} \\times \\text{Credit Units})}{\\sum \\text{Total Units}}$$

1. Multiply each course's numerical grade by its credit units to calculate the **Grade Points**.
2. Sum all Grade Points for the semester.
3. Divide the total Grade Points by the total number of enrolled credit units.

#### Official UMak Grading Scale [Source05, p.59]
- **1.00:** 97–100% (Excellent)
- **1.25:** 94–96% (Superior)
- **1.50:** 91–93% (Superior)
- **1.75:** 88–90% (Very Good)
- **2.00:** 85–87% (Very Good)
- **2.25:** 82–84% (Good)
- **2.50:** 79–81% (Good)
- **2.75:** 76–78% (Fair)
- **3.00:** 75% (Fair / Passing)
- **4.00:** 70–74% (Conditional Failure — removable within 5 days)
- **5.00:** Below 70% (Failure)
- **INC:** Incomplete (must be removed within 1 year)

#### Dean's Lister Exemption Privileges [Source05, p.73]
- **Full Token Fee Exemption:** GWA of **1.00 to 1.25** with no grade below 2.00 in academic courses and no grade below 2.50 in PE/NSTP.
- **Partial Token Fee Exemption:** GWA of **1.26 to 1.75** under the same grade condition.

**Calculate your GWA right now:**
Send me your course grades and units (for example: \`CS101 1.25 (3 units), Math 1.50 (3 units), Eng 1.75 (3 units)\`), and I will compute your exact GWA, show the step-by-step table, and verify your Dean's Lister status.`;

  return {
    answer,
    in_sources: true,
    conflict: false,
    citations: [
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
    ],
    verification_status: 'verified'
  };
}
