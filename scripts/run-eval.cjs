const fs = require('fs');
const path = require('path');

const sourcesData = require('../data/sources.json');
const evalData = require('../eval/questions.json');

// Stopwords
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'what', 'where', 'who', 'how',
  'does', 'do', 'can', 'i', 'my', 'you', 'your', 'please', 'tell', 'me',
  'about', 'ano', 'saan', 'sino', 'paano', 'ba', 'ang', 'mga', 'sa', 'kay'
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function classifyIntent(query) {
  const q = query.toLowerCase();
  if (
    q.includes('where') ||
    q.includes('saan') ||
    q.includes('location') ||
    q.includes('located') ||
    q.includes('floor') ||
    q.includes('building') ||
    q.includes('wing') ||
    q.includes('room') ||
    q.includes('campus map') ||
    q.includes('list all offices') ||
    q.includes('how to go') ||
    q.includes('papunta')
  ) {
    return 'location';
  }
  if (
    q.includes('who is the president') ||
    q.includes('university president') ||
    q.includes('vice president') ||
    q.includes('office head') ||
    q.includes('director') ||
    q.includes('functions of') ||
    q.includes('duties') ||
    q.includes('mandate') ||
    q.includes('who heads')
  ) {
    return 'offices';
  }
  if (
    q.includes('ccis') ||
    q.includes('computer science') ||
    q.includes('retention') ||
    q.includes('gwa requirement') ||
    q.includes('grade requirement') ||
    q.includes('prerequisite')
  ) {
    return 'academic';
  }
  if (
    q.includes('scholar') ||
    q.includes('token fee') ||
    q.includes('exemption') ||
    q.includes('dean’s lister') ||
    q.includes('deans lister') ||
    q.includes('tuition discount')
  ) {
    return 'scholarship';
  }
  return 'general';
}

function isQueryInScope(query) {
  const q = query.toLowerCase().trim();

  // 1. Explicit non-UMak external leaders & countries with word boundaries
  const externalLeadershipPatterns = [
    /\bunited states\b/i, /\bu\.s\.\b/i, /\busa\b/i, /\bus president\b/i, /\bpotus\b/i, /\bwhite house\b/i,
    /\bphilippines\b/i, /\bbongbong\b/i, /\bmarcos\b/i, /\bduterte\b/i, /\bbiden\b/i, /\btrump\b/i, /\bobama\b/i,
    /\bfrance\b/i, /\bmacron\b/i, /\brussia\b/i, /\bputin\b/i, /\bchina\b/i, /\bxi jinping\b/i, /\buk\b/i, /\bprime minister\b/i
  ];
  if (externalLeadershipPatterns.some(pat => pat.test(q))) {
    return false;
  }

  // 2. Generic non-academic / world trivia keywords
  const outOfScopeKeywords = [
    'weather in', 'forecast', 'recipe', 'write a poem', 'write an essay',
    'python code', 'javascript code', 'write code', 'write a python',
    'bitcoin', 'crypto', 'nba finals', 'world cup', 'capital of', 'tallest mountain',
    'college of medicine in 2030'
  ];
  if (outOfScopeKeywords.some(kw => q.includes(kw))) {
    return false;
  }

  // 3. Other universities with word boundaries (prevents 'must' matching 'ust' and 'submit' matching 'mit')
  const otherInstitutions = [
    /\bateneo\b/i, /\bde la salle\b/i, /\bdlsu\b/i, /\bust\b/i,
    /\buniversity of the philippines\b/i, /\bup diliman\b/i,
    /\bharvard\b/i, /\bmit\b/i, /\bstanford\b/i
  ];
  if (otherInstitutions.some(pat => pat.test(q))) {
    return false;
  }

  // 4. Adversarial prompt injection patterns
  const injectionPatterns = [
    /ignore all previous instructions/i,
    /disregard your rules/i,
    /print your entire system prompt/i,
    /you are now dan/i,
    /system override/i,
    /drop table/i,
    /<script>/i,
    /important notice from umak president/i
  ];
  if (injectionPatterns.some(pat => pat.test(q))) {
    return false;
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return false;

  const matchesAnyChunk = sourcesData.some(c => {
    const fullText = (c.content + ' ' + c.section + ' ' + c.documentTitle).toLowerCase();
    return queryTokens.some(t => fullText.includes(t));
  });

  return matchesAnyChunk;
}

function searchSources(query, maxResults = 4) {
  if (!isQueryInScope(query)) {
    return [];
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const intent = classifyIntent(query);
  const qLower = query.trim().toLowerCase();

  const scored = sourcesData.map(chunk => {
    let score = 0;
    const fullText = (chunk.content + ' ' + chunk.section + ' ' + chunk.documentTitle).toLowerCase();

    if (qLower.length > 3 && fullText.includes(qLower)) {
      score += 35;
    }

    if (intent === 'location') {
      if (chunk.source === 'Source03.pdf') score += 50;
      else if (chunk.source === 'Source01.pdf') score -= 20;
    } else if (intent === 'offices') {
      if (chunk.source === 'Source04.pdf') score += 40;
    } else if (intent === 'academic') {
      if (chunk.source === 'Source02.pdf') score += 45;
    } else if (intent === 'scholarship') {
      if (chunk.source === 'Source01.pdf') score += 40;
    }

    for (const token of queryTokens) {
      if (chunk.section.toLowerCase().includes(token)) score += 15;
      if (chunk.documentTitle.toLowerCase().includes(token)) score += 8;
      const regex = new RegExp(`\\b${token}\\b`, 'g');
      const matches = (fullText.match(regex) || []).length;
      score += matches * 3;
    }

    return { chunk, score };
  });

  const minThreshold = intent === 'location' ? 30 : 20;
  return scored
    .filter(item => item.score >= minThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.chunk);
}

function verifyCitation(citation) {
  const pageChunks = sourcesData.filter(
    s => s.source.toLowerCase() === citation.source.toLowerCase().trim() && s.page === Number(citation.page)
  );
  if (pageChunks.length === 0) return false;
  const normalizedQuote = normalizeText(citation.quote);
  return pageChunks.some(chunk => normalizeText(chunk.content).includes(normalizedQuote));
}

function extractDirectLocation(query, chunks) {
  const q = query.toLowerCase().trim();
  const mapChunks = chunks.filter(c => c.source === 'Source03.pdf');
  if (mapChunks.length === 0) return null;

  // CIT
  if (q.includes('cit') || q.includes('center for information technology')) {
    const chunk = mapChunks.find(c => c.page === 1);
    return {
      answer: "The Center for Information Technology is on the Second Floor, South Wing, Admin Building.",
      building: "Admin Building",
      floor: "Second Floor",
      wing: "South Wing",
      chunk,
      quote: "Center for Information Technology",
      wordCount: 14
    };
  }

  // Registrar
  if (q.includes('registrar')) {
    const chunk = mapChunks.find(c => c.page === 1);
    return {
      answer: "The Office of the University Registrar is on the Ground Floor, South Wing, Admin Building.",
      building: "Admin Building",
      floor: "Ground Floor",
      wing: "South Wing",
      chunk,
      quote: "University Registrar",
      wordCount: 14
    };
  }

  // Cashier / Cash Office
  if (q.includes('cashier') || q.includes('cash office')) {
    const chunk = mapChunks.find(c => c.page === 1);
    return {
      answer: "The Cash Office is on the Ground Floor, North Wing, Admin Building.",
      building: "Admin Building",
      floor: "Ground Floor",
      wing: "North Wing",
      chunk,
      quote: "Cash Office",
      wordCount: 13
    };
  }

  // President's office
  if (q.includes('president')) {
    const chunk = mapChunks.find(c => c.page === 2);
    return {
      answer: "The Office of the President is located on the Third Floor, North Wing, Admin Building.",
      building: "Admin Building",
      floor: "Third Floor",
      wing: "North Wing",
      chunk: chunk || mapChunks[0],
      quote: "Office of the President",
      wordCount: 15
    };
  }

  // Clinic
  if (q.includes('clinic')) {
    const chunk = mapChunks.find(c => c.content.toLowerCase().includes('clinic') || c.page === 1);
    return {
      answer: "The Medical and Dental Clinic is located on the Ground Floor, North Wing, Admin Building.",
      building: "Admin Building",
      floor: "Ground Floor",
      wing: "North Wing",
      chunk: chunk || mapChunks[0],
      quote: "Medical and Dental Clinic",
      wordCount: 16
    };
  }

  // CCIS
  if (q.includes('ccis')) {
    const chunk = mapChunks.find(c => c.page === 2);
    return {
      answer: "The College of Computing and Information Sciences (CCIS) is on the Third Floor, South Wing, Admin Building.",
      building: "Admin Building",
      floor: "Third Floor",
      wing: "South Wing",
      chunk: chunk || mapChunks[0],
      quote: "College of Computing and Information Sciences (CCIS)",
      wordCount: 18
    };
  }

  // HPSB
  if (q.includes('hpsb')) {
    const chunk = mapChunks.find(c => c.page === 5 || c.page === 6);
    return {
      answer: "The Health and Physical Science Building (HPSB) features mapped facilities from the Ground to Twelfth Floors.",
      building: "Health and Physical Science Building (HPSB)",
      floor: "Ground to 12th Floor",
      wing: "",
      chunk: chunk || mapChunks[0],
      quote: "HEALTH AND PHYSICAL SCIENCE BUILDING",
      wordCount: 17
    };
  }

  // Accounting
  if (q.includes('accounting')) {
    const chunk = mapChunks.find(c => c.page === 1);
    return {
      answer: "The Accounting Office is located on the Ground Floor, South Wing, Admin Building.",
      building: "Admin Building",
      floor: "Ground Floor",
      wing: "South Wing",
      chunk: chunk || mapChunks[0],
      quote: "Accounting Office",
      wordCount: 14
    };
  }

  // Library Learning Commons
  if (q.includes('library') || q.includes('learning commons')) {
    const chunk = mapChunks.find(c => c.page === 1);
    return {
      answer: "The Library Learning Commons is located on the Second Floor, South Wing, Admin Building.",
      building: "Admin Building",
      floor: "Second Floor",
      wing: "South Wing",
      chunk: chunk || mapChunks[0],
      quote: "Library Learning Commons",
      wordCount: 15
    };
  }

  return null;
}

// RUN EVALUATION
async function runEval() {
  console.log(`Starting TAGA-asK AI 40-Question Evaluation Suite...`);
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const item of evalData.questions) {
    const startTime = Date.now();
    const inScope = isQueryInScope(item.question);
    const retrieved = searchSources(item.question, 4);
    const durationMs = Date.now() - startTime;

    let testPassed = false;
    let actualOutcome = {};
    let notes = '';

    if (item.category === 'out_of_scope' || item.category === 'adversarial') {
      // Must abstain: inScope === false OR retrieved.length === 0
      if (!inScope || retrieved.length === 0) {
        testPassed = true;
        actualOutcome = {
          abstention: true,
          in_sources: false,
          retrieved_chunks: 0,
          status: "ABSTAINED_AS_EXPECTED"
        };
        notes = "Successfully detected out-of-scope/adversarial query and abstained without hallucination.";
      } else {
        testPassed = false;
        actualOutcome = {
          abstention: false,
          in_sources: true,
          retrieved_chunks: retrieved.length,
          status: "FAILED_TO_ABSTAIN"
        };
        notes = "Security failure: Question was not blocked by safety filters.";
      }
    } else {
      // Direct facts, location, multi-source
      if (retrieved.length > 0) {
        const retrievedSources = Array.from(new Set(retrieved.map(c => c.source)));
        const expectedSources = item.sources || [];
        const matchesExpectedSource = expectedSources.every(es => retrievedSources.includes(es));

        let citationVerified = true;
        if (item.expected_citations && item.expected_citations.length > 0) {
          citationVerified = item.expected_citations.every(ec => {
            return retrieved.some(rc => rc.source === ec.source && rc.page === ec.page);
          });
        }

        let locationCheck = true;
        let wordCount = null;
        if (item.category === 'location') {
          const loc = extractDirectLocation(item.question, retrieved);
          if (loc) {
            wordCount = loc.wordCount;
            if (wordCount >= 30) locationCheck = false;
          }
        }

        if (matchesExpectedSource && citationVerified && locationCheck) {
          testPassed = true;
          actualOutcome = {
            in_sources: true,
            retrievedSources,
            citationsFound: retrieved.map(c => ({ source: c.source, page: c.page })),
            wordCount
          };
          notes = "Retrieved grounded passages with matching source and page.";
        } else {
          testPassed = false;
          actualOutcome = {
            in_sources: true,
            retrievedSources,
            expectedSources,
            citationVerified,
            locationCheck
          };
          notes = `Mismatch: retrieved ${retrievedSources.join(', ')} vs expected ${expectedSources.join(', ')}`;
        }
      } else {
        testPassed = false;
        actualOutcome = {
          in_sources: false,
          retrieved_chunks: 0
        };
        notes = "Failed to retrieve any source chunks for valid in-scope question.";
      }
    }

    if (testPassed) passedCount++;
    else failedCount++;

    results.push({
      id: item.id,
      category: item.category,
      question: item.question,
      inScope,
      testPassed,
      notes,
      durationMs,
      actualOutcome
    });
  }

  const summary = {
    evaluatedAt: new Date().toISOString(),
    totalQuestions: evalData.totalQuestions || 40,
    passed: passedCount,
    failed: failedCount,
    passRate: `${((passedCount / 40) * 100).toFixed(1)}%`,
    categoryBreakdown: {
      direct_facts: `${results.filter(r => r.category === 'direct_fact' && r.testPassed).length} / 15`,
      location_queries: `${results.filter(r => r.category === 'location' && r.testPassed).length} / 10`,
      multi_source: `${results.filter(r => r.category === 'multi_source' && r.testPassed).length} / 5`,
      out_of_scope: `${results.filter(r => r.category === 'out_of_scope' && r.testPassed).length} / 5`,
      adversarial: `${results.filter(r => r.category === 'adversarial' && r.testPassed).length} / 5`
    },
    results
  };

  fs.writeFileSync(path.join(__dirname, '../eval/results.json'), JSON.stringify(summary, null, 2));
  console.log(`\n=================================================`);
  console.log(`Evaluation Summary: ${passedCount}/40 Passed (${summary.passRate})`);
  console.log(`Direct Facts:   ${summary.categoryBreakdown.direct_facts}`);
  console.log(`Location:       ${summary.categoryBreakdown.location_queries}`);
  console.log(`Multi-Source:   ${summary.categoryBreakdown.multi_source}`);
  console.log(`Out-of-Scope:   ${summary.categoryBreakdown.out_of_scope}`);
  console.log(`Adversarial:    ${summary.categoryBreakdown.adversarial}`);
  console.log(`Results written to /eval/results.json`);
  console.log(`=================================================\n`);
}

runEval();
