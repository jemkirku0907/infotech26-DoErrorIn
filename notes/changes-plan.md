# TAGA-asK AI Enhancement Plan
1. Ingest Student Handbook as Source05 (Primary x1.3 weight) and unify config in src/config/sources.ts.
2. Provide responsive Google Drive preview iframe with page deep-linking and self-hosted fallback.
3. Fix mobile app-shell: 100dvh, overscroll-behavior: none, isolated chat scroll, safe-area insets.
4. Enhance mobile drawer: body scroll lock, backdrop dismissal, ESC key, focus trap, >=44px touch targets.
5. Prevent iOS zoom: input font-size >= 16px, visualViewport keyboard resize handler.
6. Overhaul campus map for <768px: full-screen modal, touch-action: none, pan/pinch zoom, draggable sheet.
7. Enforce touch targets >=44px, legible building labels (>=14px), and deep-link auto-zoom/pan.
8. Harden auth: eliminate fake email/password form, enforce strict @umak.edu.ph Google OAuth only.
9. Verify all features with Playwright across Desktop, iPhone 13, iPhone SE, Pixel 7.
10. Deploy and verify on Vercel preview, produce /qa/CHANGES_REPORT.md.
