import { NextResponse } from 'next/server';
import sourcesData from '@/data/sources.json';

export const runtime = 'nodejs';

export async function GET() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim().length > 0
  );
  const geminiConfigured = Boolean(
    process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY.trim().length > 0
  );

  return NextResponse.json(
    {
      status: 'ok',
      app: 'TAGA-asK AI',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      sourcesIndexed: Array.isArray(sourcesData) ? sourcesData.length : 0,
      services: {
        geminiAi: geminiConfigured ? 'configured' : 'missing_api_key',
        googleOAuth: googleConfigured ? 'configured' : 'unconfigured_fallback_active',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
