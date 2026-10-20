import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Password-based authentication endpoint retired for security hardening.
 * All UMak students and faculty authenticate exclusively through Google Workspace OAuth.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Password-based authentication has been retired for security hardening. Please sign in with your verified UMak Google Workspace account (@umak.edu.ph).',
      requiresGoogleOAuth: true,
    },
    { status: 403 }
  );
}
