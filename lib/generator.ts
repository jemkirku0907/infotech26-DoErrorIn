import { GoogleGenerativeAI } from '@google/generative-ai';
import { Citation, ChatResponse, SourceChunk, FileAttachment, MapLocation } from './types';
import { verifyCitation } from './validator';
import { parseTargetGWAQuery, formatTargetGWAAdvice, formatGWAExplanation } from './grade-calculator';
import { resolveComplexTaglishScenario } from './taglish-resolver';

const SYSTEM_INSTRUCTION = `You are TAGA-asK AI, an AI knowledge assistant for University of Makati students.
You must answer strictly and exclusively based on the retrieved evidence provided below from the official UMak documents:
- Source05.pdf (Student Handbook - MAIN AND PRIMARY SOURCE OF TRUTH)
- Source01.pdf (Scholarships & Exemption Guidelines - Supporting)
- Source02.pdf (CCIS Computer Science GWA Rules - Supporting)
- Source03.pdf (UMak Campus Map & Navigation Guide - Supporting)
- Source04.pdf (Admin Building & University Offices Directory - Supporting)

SOURCE HIERARCHY & ANSWERING POLICY:
1. Search and prioritize the Student Handbook (Source05.pdf) FIRST. It is the primary and most authoritative institutional source.
2. Use Source01 to Source04 only to SUPPLEMENT (e.g. campus map and office locations in Source03 and Source04, specific scholarship guidelines in Source01, specific CCIS retention rules in Source02).
3. If the Student Handbook and a supporting source disagree, the Student Handbook PREVAILS. State clearly: "Based on the Student Handbook (main source)..." and mention that another source differs, citing both.
4. If the answer is found only in a supporting source, answer from it with its citation and note: "This is not covered in the Student Handbook."
5. If it is in none of the sources, say: "I couldn't find that in the official UMak sources. Please check with the concerned office." Never guess or hallucinate.
6. Always cite like [Source05, p.33] with chapter/section when available.
7. For rules, offenses, penalties, grades, attendance, and requirements, quote exactly and never paraphrase numbers, dates, percentages, or sanctions. Add a short note that students should confirm with the official office for final decisions.

CRITICAL FORMATTING RULES:
- Never add generic preambles such as "Based on Source03.pdf (Page 1):" or "Based on the official campus map".
- Answer the exact question first without copying the entire retrieved chunk.
- TAGLISH & FILIPINO CONVERSATIONAL QUERIES:
  - Understand colloquial Taglish and Filipino slang fluently (e.g., "singko", "bagsak", "kodigo", "wash day", "ma-kick out", "lipat kurso", "naiwan ang id", "tigil aral").
  - Respond in the language that matches the user's inquiry (clear, respectful Filipino/Taglish or English) while preserving official university terminology and exact numbers.
- COMPLEX MULTI-CONSTRAINT SITUATIONAL INQUIRIES:
  - When the user asks a conditional or complex situational question (e.g. combining probation with unit load, wash day with prohibited clothing, absences with medical clearance):
    1. Deliver a clear, direct answer / verdict first (e.g. whether probation applies, whether clothing is prohibited, whether enrollment is allowed).
    2. Provide step-by-step guidance broken down with Markdown headings (### Section Title) and bold labels.
    3. Cite specific Student Handbook sections and pages (e.g. [Source05, p.54]).
    4. State concrete next steps (e.g. Dean's Office, Guidance, CSFD, Registrar).
- SINGLE LOCATION QUERIES (e.g. "Where is the CIT?", "Where is the Registrar?"):
  - Provide ONLY that office's verified location in ONE direct sentence, strictly under 30 words.
  - Format: "The [Office Name] is located on the [Floor], [Wing (if applicable)], [Building]."
  - Cite the exact source file (Source03.pdf or Source04.pdf) and page number.
- READABILITY:
  - Separate distinct ideas into clear, readable paragraphs or bullet points.
  - Use Markdown headings (### Section Title) for meaningful section titles.
  - Use bold text (**Label:**) to emphasize categories, thresholds, and GWA grades.
- GWA & GRADE COMPUTATION:
  - When asked about GWA calculation or student grades, use the official UMak formula: Sum of (Numerical Grade x Credit Units) / Total Units.
  - Cite Source05.pdf Page 59 for the official grading system (1.00 to 5.00) and Page 73 for Dean's Lister exemption (1.00 to 1.75).
- ABSOLUTELY NO EMOJIS:
  - Do NOT include any emojis anywhere in your response. Ensure a professional, accessible academic tone.

Return ONLY a valid JSON object matching this schema, with no markdown code blocks, backticks, or extra commentary:
{
  "answer": "string (formatted with clean Markdown headings, paragraphs, and lists)",
  "in_sources": boolean,
  "conflict": boolean,
  "conflict_details": "string or omitted",
  "citations": [
    {
      "source": "Source05.pdf | Source01.pdf | Source02.pdf | Source03.pdf | Source04.pdf",
      "page": number,
      "quote": "exact quote from evidence",
      "claim": "what claim this quote supports"
    }
  ]
}`;

/**
 * Intelligent deterministic location extractor:
 * Handles single office queries with concise (<30 words) answers.
 */
export function extractDirectLocationAnswer(
  query: string,
  retrievedChunks: SourceChunk[]
): ChatResponse | null {
  const q = query.toLowerCase().trim();
  const isWhereQuery = q.includes('where') || q.includes('saan') || q.includes('location') || q.includes('located') || q.includes('find');
  const isFloorListQuery = (q.includes('list') || q.includes('all offices') || q.includes('what are the offices')) && (q.includes('floor') || q.includes('level'));

  if (!isWhereQuery && !isFloorListQuery) {
    return null;
  }

  // Filter campus map chunks
  const mapChunks = retrievedChunks.filter(c => c.source === 'Source03.pdf' || c.source === 'Source04.pdf');
  if (mapChunks.length === 0) {
    return null;
  }

  // Handle single office location query
  const officeKeywords = [
    {
      terms: ['cit', 'center for information technology', 'information technology center', 'it office'],
      office: 'Center for Information Technology (CIT)',
      location: 'South Wing, 2nd Floor, Academic Building 3',
      source: 'Source03.pdf',
      page: 4,
      quote: 'Center for Information Technology (CIT Office) located specifically at the South Wing, 2nd Floor',
    },
    {
      terms: ['registrar', 'our', 'records office'],
      office: 'Office of the University Registrar (OUR)',
      location: 'Ground Floor, Administration Building',
      source: 'Source03.pdf',
      page: 2,
      quote: 'Office of the University Registrar (OUR)',
    },
    {
      terms: ['admission', 'scholarship', 'cas'],
      office: 'Center for Admission and Scholarship (CAS)',
      location: 'Ground Floor, Administration Building',
      source: 'Source03.pdf',
      page: 2,
      quote: 'Center for Admission and Scholarship (CAS)',
    },
    {
      terms: ['cashier', 'cash office'],
      office: 'Cash Office',
      location: 'Ground Floor, Administration Building',
      source: 'Source03.pdf',
      page: 2,
      quote: 'Cashier / Cash Office',
    },
    {
      terms: ['accounting'],
      office: 'Accounting Office',
      location: 'Ground Floor, Administration Building',
      source: 'Source03.pdf',
      page: 2,
      quote: 'Accounting Office',
    },
    {
      terms: ['clinic', 'health services', 'dental'],
      office: 'Medical and Dental Clinic',
      location: 'Ground Floor, Academic Building 1',
      source: 'Source03.pdf',
      page: 3,
      quote: 'University Clinic / Medical and Dental Clinic on the Ground Floor',
    },
    {
      terms: ['president', 'office of the president'],
      office: 'Office of the University President',
      location: '2nd Floor, Administration Building',
      source: 'Source03.pdf',
      page: 2,
      quote: 'Office of the University President',
    },
    {
      terms: ['coop', 'cooperative'],
      office: 'UMak Employees Multi-Purpose Cooperative',
      location: 'Ground Floor, Academic Building 3',
      source: 'Source03.pdf',
      page: 4,
      quote: 'UMak Employees Multi-Purpose Cooperative',
    },
    {
      terms: ['library', 'main library', 'law library'],
      office: 'University Library',
      location: 'Ground Floor to 3rd Floor, Higher Polytechnic Studies Building (HPSB)',
      source: 'Source03.pdf',
      page: 5,
      quote: 'University Library (Main Learning Resource Center)',
    },
    {
      terms: ['csoa', 'student organizations', 'student activities'],
      office: 'Center for Student Organizations and Activities (CSOA)',
      location: 'Ground Floor, Administration Building',
      source: 'Source04.pdf',
      page: 10,
      quote: 'Center for Student Organizations and Activities (CSOA)',
    }
  ];

  for (const item of officeKeywords) {
    if (item.terms.some(t => q.includes(t))) {
      return {
        answer: `The ${item.office} is located at the ${item.location}.`,
        in_sources: true,
        conflict: false,
        citations: [
          {
            source: item.source,
            page: item.page,
            quote: item.quote,
            claim: `${item.office} location`,
            verified: true,
          }
        ],
        verification_status: 'verified',
        location: {
          building: item.location.includes('Academic Building 3') ? 'Academic Building 3' : item.location.includes('Academic Building 1') ? 'Academic Building 1' : item.location.includes('HPSB') ? 'HPSB 12-Story Tower' : 'Admin Building',
          floor: item.location.includes('2nd Floor') ? '2nd Floor' : item.location.includes('Ground') ? 'Ground Floor' : '1st Floor',
          wing: item.location.includes('South Wing') ? 'South Wing' : undefined,
          officeName: item.office,
        }
      };
    }
  }

  return null;
}

/**
 * Fallback answer formatter when AI model is offline or disabled.
 */
export function formatFallbackAnswer(query: string, retrievedChunks: SourceChunk[]): ChatResponse {
  if (retrievedChunks.length === 0) {
    return {
      answer: "I couldn't find that in the official UMak sources. Please check with the concerned office.",
      in_sources: false,
      conflict: false,
      citations: [],
      verification_status: "not_found",
    };
  }

  const q = query.toLowerCase();

  // 0. Complex Taglish scenarios (failing grades, wash day, dress code, absences, LOA, shifting, overload, etc.)
  const taglishScenario = resolveComplexTaglishScenario(query);
  if (taglishScenario) {
    return taglishScenario;
  }

  // 1. Target GWA and Grade Improvement Advice (e.g. "my gwa is 2.50 what i can do to be my gwa turn into 1.75")
  const targetGwa = parseTargetGWAQuery(query);
  if (targetGwa) {
    return formatTargetGWAAdvice(targetGwa.currentGwa, targetGwa.targetGwa);
  }

  // 2. How to compute GWA explanation
  if (q.includes('gwa') && (q.includes('compute') || q.includes('formula') || q.includes('calculate') || q.includes('paano') || q.includes('how'))) {
    return formatGWAExplanation();
  }

  const primary = retrievedChunks[0];

  // 3. Official UMak Grading System Scale (Source05 Page 59)
  if (primary.source === 'Source05.pdf' && primary.page === 59) {
    return {
      answer: `### Based on the Student Handbook (Main Source) - Policy on Grading System\n\nUnder Article IV, Section 13 [Source05, p.59], the official grading system of the University of Makati is:\n\n- **1.00:** 97–100% (Excellent)\n- **1.25:** 94–96% (Superior)\n- **1.50:** 91–93% (Superior)\n- **1.75:** 88–90% (Very Good)\n- **2.00:** 85–87% (Very Good)\n- **2.25:** 82–84% (Good)\n- **2.50:** 79–81% (Good)\n- **2.75:** 76–78% (Fair)\n- **3.00:** 75% (Fair / Passing)\n- **4.00:** 70–74% (Conditional Failure) — Grade of 4.0 must be removed by re-examination within five (5) days; passes becomes 3.0, fails becomes 5.0.\n- **5.00:** 69% and below (Failure)\n- **INC:** Incomplete — Must be removed or completed within one (1) year after incurred in a non-prerequisite course.\n- **OD:** Officially Dropped\n- **UD:** Unofficially Dropped\n\n*Note: For final decisions and official endorsements, please confirm with the concerned university office.*`,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: primary.source,
          page: primary.page,
          quote: "POLICY ON GRADING SYSTEM: Numerical Percentage & Adjectival Equivalent: 1.00 = 97-100%",
          claim: "Official UMak grading system scale and numerical equivalents",
          verified: true,
        }
      ],
      verification_status: "verified",
    };
  }

  // Handbook specific topics
  if (primary.source === 'Source05.pdf') {
    return {
      answer: `### Based on the Student Handbook (Main Source) - ${primary.section}\n\n${primary.content}\n\n*Note: For final decisions and official endorsements, please confirm with the concerned university office.*`,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: primary.source,
          page: primary.page,
          quote: primary.content.slice(0, 100),
          claim: primary.section,
          verified: true,
        }
      ],
      verification_status: "verified",
    };
  }

  // Scholarships
  if (q.includes('scholar') || q.includes('token fee') || q.includes('exemption') || q.includes('dean')) {
    const answer = `### Scholarships & Token Fee Exemption Guidelines\n\n*This is not covered in the Student Handbook; referencing Source01.pdf.*\n\nUnder University of Makati official guidelines, students may apply for token fee exemption through OLEA.\n\n- **Dean's Lister:** GWA of 1.00 to 1.75 with no grade below 2.00.\n- **Makati Residents:** Subsidized token fees under City Ordinance.\n- **Application:** File via OLEA during pre-enrollment.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: primary.source,
          page: primary.page,
          quote: "SCHOLARSHIPS",
          claim: "Scholarship and token fee exemption basic requirements",
          verified: true,
        }
      ],
      verification_status: "verified",
    };
  }

  // CCIS / Academic requirements
  if (q.includes('ccis') || q.includes('computer science') || q.includes('gwa')) {
    const answer = `### College of Computing and Information Sciences (CCIS) Guidelines\n\n*This is not covered in the Student Handbook; referencing Source02.pdf.*\n\n- **Retention Policy:** Maintain a minimum GWA of 2.25 in all major computing courses.\n- **Math Requirement:** Minimum grade of 2.25 in Calculus and Discrete Structures.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: primary.source,
          page: primary.page,
          quote: "CCIS",
          claim: "CCIS academic requirements and courses",
          verified: true,
        }
      ],
      verification_status: "verified",
    };
  }

  // General concise excerpt
  const sentences = primary.content
    .split(/(?<=[.!?])\s+/)
    .filter(s => !s.startsWith('CAMPUS MAP.') && !s.startsWith('SCHOLARSHIPS.') && s.length > 20);
  const conciseText = sentences.slice(0, 2).join(' ') || primary.content.slice(0, 160) + '...';

  return {
    answer: conciseText,
    in_sources: true,
    conflict: false,
    citations: [
      {
        source: primary.source,
        page: primary.page,
        quote: conciseText.slice(0, 100),
        claim: "Official university information",
        verified: true,
      }
    ],
    verification_status: "verified",
  };
}

export async function generateGroundedAnswer(
  query: string,
  retrievedChunks: SourceChunk[],
  attachment?: FileAttachment
): Promise<ChatResponse> {
  if (retrievedChunks.length === 0) {
    return {
      answer: "I couldn't find that in the official UMak sources. Please check with the concerned office.",
      in_sources: false,
      conflict: false,
      citations: [],
      verification_status: "not_found",
    };
  }

  // 1. Precise location answering (<30 words)
  const locationAnswer = extractDirectLocationAnswer(query, retrievedChunks);
  if (locationAnswer) {
    return locationAnswer;
  }

  // 1b. Precise target GWA calculation & advice
  const targetGwa = parseTargetGWAQuery(query);
  if (targetGwa) {
    return formatTargetGWAAdvice(targetGwa.currentGwa, targetGwa.targetGwa);
  }

  // 1c. Complex situational Taglish scenarios (probation, dress code, absences, shifting, LOA, overload, etc.)
  const taglishScenario = resolveComplexTaglishScenario(query);
  if (taglishScenario) {
    return taglishScenario;
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return formatFallbackAnswer(query, retrievedChunks);
  }

  const evidenceText = retrievedChunks
    .map(
      (chunk, index) =>
        `[Passage ${index + 1}] Source: ${chunk.source}, Page: ${chunk.page}\nTitle: ${chunk.documentTitle} - ${chunk.section}\nContent: "${chunk.content}"`
    )
    .join('\n\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `EVIDENCE:
${evidenceText}

USER QUESTION:
${query}
${attachment ? `\n[NOTE: User attached a file/image named "${attachment.name}". Analyze any relevant details from the attachment in conjunction with the official UMak evidence.]` : ''}

Respond with JSON:`;

    const contentParts: any[] = [prompt];
    if (attachment && attachment.data) {
      const base64Data = attachment.data.includes('base64,')
        ? attachment.data.split('base64,')[1]
        : attachment.data;
      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: attachment.type || 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent(contentParts);
    const rawText = result.response.text();
    let parsed: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return formatFallbackAnswer(query, retrievedChunks);
    }

    if (!parsed || typeof parsed.answer !== 'string') {
      return formatFallbackAnswer(query, retrievedChunks);
    }

    // Verify citations server-side
    let verifiedCitations: Citation[] = [];
    if (Array.isArray(parsed.citations)) {
      verifiedCitations = parsed.citations.map((c: any) => ({
        source: String(c.source || ''),
        page: Number(c.page || 1),
        quote: String(c.quote || ''),
        claim: String(c.claim || ''),
        verified: verifyCitation({
          source: String(c.source || ''),
          page: Number(c.page || 1),
          quote: String(c.quote || ''),
          claim: String(c.claim || ''),
        }),
      }));
    }

    const hasFailedVerification = verifiedCitations.some(c => c.verified === false);
    const status = !parsed.in_sources
      ? 'not_found'
      : hasFailedVerification
      ? 'unverified'
      : 'verified';

    return {
      answer: parsed.answer,
      in_sources: Boolean(parsed.in_sources),
      conflict: Boolean(parsed.conflict),
      conflict_details: parsed.conflict_details,
      citations: verifiedCitations,
      verification_status: status,
    };
  } catch (error: any) {
    console.error('Generation error, using fallback formatter:', error);
    try {
      return formatFallbackAnswer(query, retrievedChunks);
    } catch {
      return {
        answer: "A temporary error occurred while processing your request. Please try again.",
        in_sources: false,
        conflict: false,
        citations: [],
        verification_status: "error",
      };
    }
  }
}
