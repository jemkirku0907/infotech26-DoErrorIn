import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { searchSources } from '@/lib/retrieval';
import { generateGroundedAnswer } from '@/lib/generator';
import {
  isGreetingQuery,
  getGreetingResponse,
  isGradeComputationQuery,
  parseGradeInput,
  computeGWA,
  formatGWAExplanation,
  parseTargetGWAQuery,
  formatTargetGWAAdvice,
} from '@/lib/grade-calculator';
import { isDeveloperQuery, getDeveloperResponse } from '@/lib/team-info';
import { ChatResponse } from '@/lib/types';
import { verifySession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 0. Verify UMak Student Authentication
    const sessionCookie = req.cookies.get('umak_session')?.value;
    const session = verifySession(sessionCookie);
    if (!session) {
      return NextResponse.json(
        {
          answer: 'Access denied. You must be logged in with a valid verified @umak.edu.ph account to use TAGA-asK AI.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: 'Unauthorized: Valid verified @umak.edu.ph account required.',
        } as ChatResponse,
        { status: 401 }
      );
    }

    // 1. IP identification & Rate Limiting per verified user
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    
    const rateCheck = checkRateLimit(session.email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          answer: rateCheck.error || 'Rate limit exceeded.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: rateCheck.error,
        } as ChatResponse,
        {
          status: 429,
          headers: rateCheck.retryAfter
            ? { 'Retry-After': String(rateCheck.retryAfter) }
            : {},
        }
      );
    }

    // 2. Validate Request Body
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string') {
      return NextResponse.json(
        {
          answer: 'Invalid request body. A valid message string is required.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: 'Bad Request',
        } as ChatResponse,
        { status: 400 }
      );
    }

    const message = body.message.trim();
    if (message.length === 0) {
      return NextResponse.json(
        {
          answer: 'Message cannot be empty.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: 'Empty message',
        } as ChatResponse,
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        {
          answer: 'Message exceeds maximum allowed length of 500 characters.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: 'Message too long',
        } as ChatResponse,
        { status: 400 }
      );
    }

    // 3. Cloudflare Turnstile Verification
    const turnstileResult = await verifyTurnstileToken(body.turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          answer: turnstileResult.error || 'Bot verification failed.',
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'error',
          error: 'Forbidden',
        } as ChatResponse,
        { status: 403 }
      );
    }

    // 3.4 Team DoErrorIn Developer Information
    if (isDeveloperQuery(message)) {
      return NextResponse.json(
        {
          answer: getDeveloperResponse(),
          in_sources: true,
          conflict: false,
          citations: [],
          verification_status: 'verified',
        } as ChatResponse,
        { status: 200 }
      );
    }

    // 3.5 Conversational Greetings & Pleasantries ("hi hello ganun")
    if (isGreetingQuery(message)) {
      return NextResponse.json(
        {
          answer: getGreetingResponse(message),
          in_sources: true,
          conflict: false,
          citations: [],
          verification_status: 'verified',
        } as ChatResponse,
        { status: 200 }
      );
    }

    // 3.6 Official UMak GWA & Grade Computation Helper
    if (isGradeComputationQuery(message)) {
      // 1. Check if user is asking about current/target GWA advice (e.g. "my gwa is 2.50 what i can do to be my gwa turn into 1.75")
      const targetGwa = parseTargetGWAQuery(message);
      if (targetGwa) {
        return NextResponse.json(
          formatTargetGWAAdvice(targetGwa.currentGwa, targetGwa.targetGwa),
          { status: 200 }
        );
      }

      // 2. Check if student provided specific grades to compute
      const parsedGrades = parseGradeInput(message);
      if (parsedGrades.length >= 1) {
        const gwaResult = computeGWA(parsedGrades);
        return NextResponse.json(
          {
            answer: gwaResult.markdownAnswer,
            in_sources: true,
            conflict: false,
            citations: gwaResult.citations,
            verification_status: 'verified',
          } as ChatResponse,
          { status: 200 }
        );
      }

      // 3. General GWA formula and grading scale explanation
      return NextResponse.json(formatGWAExplanation(), { status: 200 });
    }

    // 4. Retrieve Grounded Sources with Intent Routing (Prioritizes Student Handbook Source05)
    const retrievedChunks = searchSources(message, 4);

    // If no sufficiently relevant evidence found, explicitly abstain
    if (retrievedChunks.length === 0) {
      return NextResponse.json(
        {
          answer: "I couldn't find that in the official UMak sources. Please check with the concerned office.",
          in_sources: false,
          conflict: false,
          citations: [],
          verification_status: 'not_found',
        } as ChatResponse,
        { status: 200 }
      );
    }

    // Validate optional attachment
    let validAttachment = undefined;
    if (body.attachment && typeof body.attachment === 'object') {
      const { name, type, data, size } = body.attachment;
      if (typeof data === 'string' && data.length < 10 * 1024 * 1024) {
        validAttachment = {
          name: String(name || 'attachment'),
          type: String(type || 'image/jpeg'),
          size: Number(size || 0),
          data,
        };
      }
    }

    // 5. Generate Grounded AI Answer & Verify Citations
    const responseData = await generateGroundedAnswer(message, retrievedChunks, validAttachment);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('API /chat error:', error);
    return NextResponse.json(
      {
        answer: 'An unexpected internal error occurred. Please try again.',
        in_sources: false,
        conflict: false,
        citations: [],
        verification_status: 'error',
        error: 'Internal Server Error',
      } as ChatResponse,
      { status: 500 }
    );
  }
}
