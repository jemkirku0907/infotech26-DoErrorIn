# TAGA-asK AI Application Architecture & Audit Map
**Date**: October 19, 2026
**Production Domain**: `https://taga-askai.vercel.app/`
**Target Framework**: Next.js 14.2.24 (App Router), React 18.3.1, TailwindCSS 3.4.17, TypeScript 5.7.3

---

## 1. Features Inventory
1. **Cinematic Landing Page (`components/CinematicLandingPage.tsx`)**:
   - Institutional poster background with UMak Administration Building photo (`public/images/umak-building.jpg`).
   - Branded royal blue overlay, vignette, slow ambient drift animation, reduced-motion fallback.
   - 3-stage animated reveal: Mascot silhouette (300ms) -> Wordmark impact (1100ms) with synthesized Web Audio sub-bass boom -> Content & CTA reveal (1800ms).
   - Audio toggle (Mute/Unmute) and "Skip Intro" button.
   - "Remember choice & skip intro next time" checkbox (`localStorage: taga_ask_skip_intro`).
   - Primary "Get Started" CTA initiating session validation / Google OAuth or opening LoginModal.
   - Overclaim note: Hero text claims "Zero hallucinations" (must be toned down to honest, grounded wording).

2. **Institutional Authentication (`components/LoginModal.tsx`, `lib/auth.ts`, `middleware.ts`)**:
   - Google Workspace OAuth flow (`/api/auth/google`, `/api/auth/callback/google`) targeting `@umak.edu.ph`.
   - Direct UMak credential login modal (`/api/auth/login`) with scrypt password hashing and in-memory registry fallback.
   - Session management via signed HMAC-SHA256 JWT cookie (`umak_session`), 24h TTL, httpOnly, sameSite=lax.
   - Institutional domain restriction enforcing `@umak.edu.ph` strictly (preventing subdomains and lookalike domains like `umak.edu.ph.evil.com`).
   - Session validation and logout (`/api/auth/session`, `/api/auth/logout`).
   - Critical Auth finding: In serverless environments, in-memory `userRegistry` does not persist between lambda instances, allowing arbitrary password registration for any `@umak.edu.ph` email when Google OAuth is unconfigured.

3. **Grounding & Chat Engine (`app/api/chat/route.ts`, `lib/generator.ts`, `lib/retrieval.ts`, `lib/validator.ts`)**:
   - Grounded RAG system restricted exclusively to 4 official UMak PDF documents:
     - `Source01.pdf` (Scholarships & Token Fee Exemption - 14 pages)
     - `Source02.pdf` (CCIS Programs & Retention Guidelines - 2 pages)
     - `Source03.pdf` (Campus Building & Office Directory Map - 6 pages)
     - `Source04.pdf` (University Administrative & Academic Offices - 14 pages)
   - Deterministic location query handler (<30 words, direct building/floor/wing format).
   - Gemini 1.5 Flash LLM integration (`@google/generative-ai`) with JSON structured output and strict system instructions.
   - Citation verification engine (`lib/validator.ts`) validating quote exactness and page mapping against pre-indexed `data/sources.json`.
   - Server-side fallback response formatter if Gemini API key is missing or quotas are exhausted.

4. **Multimodal File Attachments**:
   - In-chat file upload supporting PNG, JPG, WebP, and PDF (client reads via base64, size limit 10MB).
   - Attachment passed directly to Gemini inlineData for multimodal reasoning.

5. **Interactive Campus Map Modal (`components/InteractiveCampusMapModal.tsx`)**:
   - Custom SVG-based interactive campus vector map with Admin Building, HPSB, Academic Buildings 1-3, and UMak Stadium.
   - Multi-floor navigation (Basement to 12th Floor) with North/South Wing breakdowns.
   - Deep-linking from chat answers: Location cards feature a "📍 View on Campus Map" button that automatically opens the map and highlights the specific building and floor.

6. **In-App PDF Citation Viewer & Quote Modal (`components/PdfViewerModal.tsx`, `components/QuoteModal.tsx`)**:
   - Native iframe/modal viewer for `public/sources/Source0[1-4].pdf` with exact page jumping.
   - Exact quote inspection modal displaying full cited excerpt and verification status.

---

## 2. API Routes Specification
| Route | Method | Auth Required | Rate Limited | Handler | Purpose |
|---|---|---|---|---|---|
| `/api/auth/google` | GET, POST | No | No | `app/api/auth/google/route.ts` | Initiates Google OAuth redirect URL or verifies Google ID token |
| `/api/auth/callback/google` | GET | No | No | `app/api/auth/callback/google/route.ts` | Exchanges OAuth code for tokens, validates institutional domain, signs session |
| `/api/auth/login` | POST | No | Yes (5/15min) | `app/api/auth/login/route.ts` | Authenticates UMak student credentials, sets `umak_session` cookie |
| `/api/auth/logout` | POST | No | No | `app/api/auth/logout/route.ts` | Clears `umak_session` cookie |
| `/api/auth/session` | GET | No (Reads cookie) | No | `app/api/auth/session/route.ts` | Returns current active student session info |
| `/api/chat` | POST | Yes (`umak_session`) | Yes (15/min, 150/hr) | `app/api/chat/route.ts` | Main RAG chat endpoint with Turnstile verification, retrieval, and LLM generation |

---

## 3. Third-Party Services & Dependencies
1. **Google Gemini Generative AI (`@google/generative-ai`)**:
   - Model: `gemini-1.5-flash`
   - Role: Grounded answer synthesis, multimodal reasoning on user attachments.
2. **Google OAuth 2.0 (`accounts.google.com`)**:
   - Scope: `openid email profile`
   - Hosted Domain constraint: `hd: "umak.edu.ph"`
3. **Cloudflare Turnstile (`challenges.cloudflare.com`)**:
   - Role: Bot mitigation and captcha validation.
4. **Vercel Edge & Serverless Infrastructure**:
   - Hosting, SSL, edge routing, serverless execution.

---

## 4. Environment Variables Map
| Variable Name | Client / Server | Required | Current Live Status | Security Classification |
|---|---|---|---|---|
| `GOOGLE_AI_API_KEY` | Server | Yes (for AI generation) | Configured | SECRET (API Key) |
| `ELEVENLABS_API_KEY` | Server | No (for promo video generation only) | Local only | SECRET (API Key) |
| `AUTH_SECRET` | Server | Yes (for JWT HMAC) | Default fallback in code | CRITICAL SECRET (Must be set in env) |
| `ALLOWED_EMAIL_DOMAINS` | Server | Optional (defaults to `umak.edu.ph`) | Not set (uses default) | Public config |
| `GOOGLE_CLIENT_ID` | Server | Yes (for Google OAuth) | Missing on Vercel | Public Identifier |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Client | Yes (for frontend Google OAuth) | Missing on Vercel | Public Identifier |
| `GOOGLE_CLIENT_SECRET` | Server | Yes (for OAuth code exchange) | Missing on Vercel | SECRET (OAuth Secret) |
| `TURNSTILE_SECRET_KEY` | Server | Optional (bypassed if empty) | Missing on Vercel | SECRET |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`| Client | Optional (bypassed if empty) | Missing on Vercel | Public Identifier |

---

## 5. End-to-End Data Flows
```
[User Browser]
       │
       ▼
[Edge Middleware (`middleware.ts`)]
  ├── Reads `umak_session` cookie
  ├── Validates HMAC-SHA256 signature using `AUTH_SECRET`
  └── Enforces `@umak.edu.ph` institutional domain check
       │ (Pass)
       ▼
[Route: `POST /api/chat`]
  ├── 1. Session verification
  ├── 2. Sliding window Rate Limiter (`lib/rate-limiter.ts`: 15 req/min, 150 req/hr)
  ├── 3. Input validation (whitespace check, 500-character ceiling)
  ├── 4. Bot mitigation (Cloudflare Turnstile token check)
  ├── 5. BM25 / Keyword Retrieval (`lib/retrieval.ts` against `data/sources.json`)
  ├── 6. Deterministic Office Location Router (handles single office & floor directory queries directly)
  ├── 7. LLM Grounded Generation (Gemini 1.5 Flash via `@google/generative-ai`)
  ├── 8. Citation Verification (`lib/validator.ts` checks exact quote presence & page match)
  └── 9. Structured JSON Return (`ChatResponse` with citations, location coordinates, verification status)
```
