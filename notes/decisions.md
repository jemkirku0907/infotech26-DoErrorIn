# Architecture & Design Decisions Log (`/notes/decisions.md`)

1. **Reference Mapping:**
   - Mapped uploaded and workspace reference videos into `./refs/`:
     - `glass-ai-landscape.mp4` (`cc732bef-ffad-40ca-8422-c501f95b3600.mp4`) — primary dark glassmorphism + 3D stacked cards + ring portal reference.
     - `chatgpt-style-vertical.mp4` (`7611d9b3-81d5-4882-921d-7408abc58cd0.mp4`) — glowing neon input, macro typing follow, send ripple, gradient kinetic type.
     - `reference.mp4` (`08834804-caa9-4a99-ba1c-969abf278c8a.mp4`) — 120/128 BPM rhythmic editing, pixel/block grid accents, 3D wireframe globe, tabular counter.
     - `reference-gemini-style.mp4` (`29be05c0-9728-44a7-a0d2-bc2c4c781461.mp4`) — right-angle neon connectors, selection drag handles, route map pin drop.
2. **Fresh Clean-Room Remotion Architecture:**
   - Replaced all previous composition code with a brand-new, modular dark-glassmorphism Remotion project in `/video` (with symlinks/outputs mirrored to `/out/taga-ask-ai-promo-v1-16x9.mp4` and `/out/taga-ask-ai-promo-v1-9x16.mp4`), ensuring zero reuse of earlier video code.
3. **Logo Layer Segmentation (`./logo-white-bg.png`):**
   - Segmented `./logo-white-bg.png` into 5 pixel-accurate transparent PNG layers matching the exact original bounding box (`taga.png`, `as.png`, `k.png`, `ai.png`, `heron.png`) so that when all layers settle at Beat 5 in Scene 1, their composite overlays with `< 0.5px` error against `./logo-white-bg.png`.
   - Added a crisp light-blue/white outer contour glow filter around the dark navy (`#2A3990`) layers (`TAGA-` and `K`) so they have strong AA+ contrast against the `#03061A` dark background.
4. **Audio Pipeline:**
   - Single-take voiceover via ElevenLabs `/with-timestamps` (or deterministic word-aligned synthesis if quota is restricted), post-processed with high-pass `80Hz`, `+1.5dB` presence at `3kHz`, de-ess at `6kHz`, `2:1` compression, breath/pause tightening, `200ms` room tone pad, and `100ms` master fade in/out.
   - Single `<Audio>` mounted at root composition outside `<Sequence>` wrappers so words can never be clipped at scene boundaries.
5. **Strict No-HUD Policy:**
   - Zero mono tech badges, zero category tags ("THE PROBLEM", "VERIFIED CITATION", etc.), zero timecodes or corner brackets. Verified automatically by `scripts/qa-text-scan.cjs`.
6. **Macro 3D Camera Choreography (`MacroCameraRig`, `OrbitalRingMark`, `FullScreenShockwave`, `NeonWaveformBar`):**
   - Upgraded all 7 scenes to replicate the extreme 3D macro camera choreography from the reference edits: curved neon blue laser arc opening with inline glowing word pill (`Scene1Intro`), steep 3D tilted sidebar dive (`rotateX: 28deg, rotateY: -22deg, scale: 1.48`) transitioning into vertically Z-stacked Rolodex glass cards beneath a glowing `[ Ask AI ]` bar (`Scene3Solution`), `1.78x` close-up horizontal panning input bar + full-screen neon shockwave ring on Send click + live pulsing audio/data waveform (`Scene4HeroCIT`), 3D tilted interactive `UMak Campus Map & Location Visualizer` (`Scene5UploadsAndMap`), and inline 3D spinning gyroscope ring inside typography + giant `220px` horizon-bleed metallic gradient headline (`Scene7Outro`).
7. **Authentic `taga-askai.vercel.app` Interface Integration:**
   - Integrated the user's authenticated live UI screenshots (`public/images/ui-chat-real.png` and `public/images/ui-map-real.png`) and recreated the exact sidebar (`+ New Conversation`, `where is cit`, `Scholarships & Exemption Guidelines`, `CCIS Computer Science GWA Rules`, `Source01`–`Source04` official PDFs), chat action pills (`Attach`, `Campus Map`), and `UMak Campus Map & Location Visualizer` (`Admin Building`, `HPSB Tower 12 Floors`, `Academic 1–3`, and `CIT Office • South Wing, 2F`).
8. **Pre-Launch QA, Security Hardening, and Release Decisions (October 19, 2026):**
   - **Authentication Diagnosis & Student Verification:**
     - Root cause of the "any password works for `@umak.edu.ph`" issue: on Vercel's stateless serverless infrastructure, the in-memory `userRegistry` is recreated on cold starts, causing `authenticateOrRegisterStudent()` to treat every login as a new registration and accept the supplied password.
     - Production Solution: Enable Google Workspace OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) with `hd: "umak.edu.ph"`. Since UMak provisions Google Workspace accounts for all enrolled students, Google reliably verifies identity, passwords, and 2FA. For fallback authentication, an email OTP challenge or persistent database with email confirmation is required.
   - **Substring False-Positive Remediation in Scope Filter:**
     - Discovered and eliminated a critical false-positive bug where `.includes('ust')` rejected valid student questions containing "must" (e.g. "What requirements must I meet?"), and `.includes('mit')` rejected questions containing "submit" (e.g. "Where do I submit my form?"). Replaced raw substring checks with word-boundary regexes (`/\bust\b/i`, `/\bmit\b/i`, `/\buk\b/i`) in `lib/retrieval.ts`.
   - **Overclaim Policy Compliance:**
     - Toned down "Zero hallucinations" claims in `components/CinematicLandingPage.tsx` and `app/page.tsx` to honest, defensible wording: "Answers are grounded strictly in official UMak documents (Source01–Source04) and cite their sources."
   - **Security Headers & Social Sharing Infrastructure:**
     - Added comprehensive OpenGraph and Twitter Card metadata to `app/layout.tsx` for social media previews.
     - Configured enterprise HTTP security headers in `next.config.js` (`HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`). Note: `X-Frame-Options` is intentionally set to `SAMEORIGIN` rather than `DENY` so the app's internal `PdfViewerModal.tsx` iframe can render `/sources/Source0[1-4].pdf`.
     - Added `public/robots.txt` and `/api/health` monitoring endpoint.
   - **Automated QA & Evaluation Benchmark (`eval/questions.json`):**
     - Authored a 40-question benchmark with 15 direct facts, 10 locations (<30 words, direct sentence), 5 multi-source synthesis, 5 out-of-scope abstentions, and 5 adversarial/injection prompts.
     - Validated 100% pass rate (40/40) via `scripts/run-eval.cjs` and recorded in `eval/results.json`.
     - Integrated `npm run test` (running auth, rag, and eval suites) and `npm run e2e` (Playwright cross-browser).


9. **Student Handbook as Primary Source & Mobile Experience Overhaul (October 20, 2026):**
   - **Task 1: Student Handbook as Primary Source of Truth (`Source05`):**
     - Assigned stable identifier `Source05` (display: "Student Handbook (Main Source)") with 287 pages (verified from document header: `Student-Handbook-2021Edition v2.pdf`, Page 33 / 287).
     - Defined central configuration in `config/sources.ts` and `src/config/sources.ts` ensuring uniform metadata (id, display name, page count, priority, role, viewer URL) across the entire application.
     - Ingestion & Retrieval Policy: Handbook chunks receive priority weighting and score boost of x1.3 (`lib/retrieval.ts`). Handbook prevails over supporting sources on any discrepancy, explicitly stating: "Based on the Student Handbook (main source)...". Exact numerical values, percentages, and sanctions are quoted verbatim.
     - Embedded responsive Google Drive preview iframe (`/preview`) inside `components/PdfViewerModal.tsx` with external link fallback and a dedicated notification banner specifying the cited page number.
     - Expanded evaluation dataset from 40 to 60 questions in `eval/questions.json` (35 handbook, 10 supporting, 5 conflict, 5 out-of-scope, 5 adversarial) achieving 100.0% pass rate.
   - **Task 2: Mobile Scrolling & App-Shell Architectural Fix:**
     - Replaced standard viewport heights with `100dvh` (`max-h-[100dvh]`) and `-webkit-fill-available` fallback to eliminate address-bar displacement on iOS Safari.
     - Implemented fixed-height app shell layout: `html, body { height: 100%; overflow: hidden; overscroll-behavior: none; }`.
     - Confined vertical scrolling exclusively to the message area using `.chat-scroll-container` (`overflow-y: auto`, `overscroll-behavior: contain`, `-webkit-overflow-scrolling: touch`).
     - Added `body.drawer-open` scroll lock, backdrop click dismissal, ESC key dismissal, and `visualViewport` dynamic keyboard resize handler.
     - Set mobile input font size to `16px` (`text-base md:text-sm`) to stop iOS Safari auto-zoom on focus.
   - **Task 3: Mobile Campus Map Visualizer Overhaul:**
     - On screens `< 768px`, map modal opens in true full-viewport view (`h-[100dvh]`, `inset-0`) with bottom navigation hidden.
     - Set `touch-action: none` on the SVG canvas container and implemented touch gesture engine supporting single-finger panning, two-finger pinch-to-zoom, double-tap zoom, and floating zoom controls (+, -, reset view).
     - Integrated draggable bottom sheet with collapsed (`h-14`), half (`h-[45vh]`), and full (`h-[80vh]`) states.
     - Ensured touch pins $\ge 44\text{px}$, building labels $\ge 14\text{px}$ bold, and deep-link auto-centering on target locations.
   - **Task 4: Authentication Security Hardening:**
     - Completely removed fake email/password form in `components/LoginModal.tsx`.
     - Retired `/api/auth/login` password endpoint with HTTP 403 Forbidden directing users to Google OAuth.
     - Enforced Google Workspace SSO exclusively for `@umak.edu.ph` accounts using configured `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
     - Updated UI badges to show "Verified UMak account" only for confirmed authenticated sessions, preventing guest misrepresentation.
