# TAGA-asK AI — Product Launch Promo Film (Remotion)

Brand-new dark glassmorphism product-launch film (`1920x1080` at `30fps`, `56.15s`, plus responsive re-composed `1080x1920` vertical edition) built with Remotion (`React 18` + `TypeScript`).

## Render Commands

From the repository root (`c:\Users\Cyril Jhune.CYRIL\Documents\antigravity\Hackathon2026`):

```bash
# 1. Regenerate single-take voiceover + word timings (optional, already generated in /public)
node scripts/generate-promo-voiceover.cjs

# 2. Render 16:9 Landscape Master (H.264 High, CRF 16, yuv420p, 30fps, BT.709, faststart, AAC 192k 48kHz)
npx --prefix video remotion render src/index.ts TagaAskPromo16x9 ../out/taga-ask-ai-promo-v1-16x9.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p --audio-Bitrate=192k

# 3. Render 9:16 Vertical Master (1080x1920 responsive re-composition)
npx --prefix video remotion render src/index.ts TagaAskPromo9x16 ../out/taga-ask-ai-promo-v1-9x16.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p --audio-Bitrate=192k

# 4. Export Thumbnail PNG (Logo Lockup)
npx --prefix video remotion still src/index.ts TagaAskPromo16x9 ../out/thumbnail.png --frame=120

# 5. Export SRT & VTT Captions
node scripts/export-captions.cjs

# 6. Run Full QA Verification Suite
node scripts/qa-text-scan.cjs
node scripts/qa-verify.cjs
```

---

## Project Structure

- `/notes/analysis.md` — Frame-by-frame timing, camera, easing, and glow/blur breakdown of the 4 reference videos.
- `/notes/plan.md` — Script, 120 BPM beat grid, 7-scene breakdown, transition map, SFX map, and asset list.
- `/notes/decisions.md` — Architecture and design decisions log.
- `/script/voiceover.txt` — Final single-take Taglish voiceover script.
- `/video/src/layout.ts` — Layout source of truth (`8px` base grid, `12-column` layout, `96px` safe margins, color tokens).
- `/video/src/presets.tsx` — Shared spring physics, easings, `GlassPanel`, `KineticHeadline`, `HeronRingMark`, `GlowingCursor`, `RingPortalOverlay`, `NeonConnector`.
- `/video/src/scenes/` — `Scene1Intro.tsx`, `Scene2Problem.tsx`, `Scene3Solution.tsx`, `Scene4HeroCIT.tsx`, `Scene5UploadsAndMap.tsx`, `Scene6Security.tsx`, `Scene7Outro.tsx`.
- `/video/src/components/` — `AtmosphericBackground.tsx`, `KaraokeCaptions.tsx`, `MasterAudioTrack.tsx`.
- `/out/` — Rendered MP4 deliverables (`taga-ask-ai-promo-v1-16x9.mp4`, `taga-ask-ai-promo-v1-9x16.mp4`), `captions.srt`, `captions.vtt`, `thumbnail.png`.

---

## Assets & Licenses

| Category | Asset | Source & License |
|---|---|---|
| **Typography** | `Plus Jakarta Sans` (500, 600, 700, 800) | Google Fonts via `@remotion/google-fonts` — **OFL-1.1** (Commercial Use Permitted) |
| **Brand Assets** | `logo-white-bg.png`, `logo-badge.png`, `umak-seal.png`, `umak-building.jpg`, segmented `public/logo-layers/*.png` | Official TAGA-asK AI / University of Makati Hackathon Project Assets |
| **Voiceover** | `public/voiceover.mp3` + `public/voiceover.timings.json` | ElevenLabs `/v1/text-to-speech/{voice_id}/with-timestamps` (`eleven_multilingual_v2`, Bella) — **Commercial License** |
| **Sound Effects** | `public/sfx/{whoosh,pop,tick,impact,shimmer,riser,chime}.mp3` | ElevenLabs Sound Generation API — **Commercial License** (see `/public/sfx/LICENSES.md`) |
| **Music Bed** | `public/music/ambient-bed.mp3` | Royalty-Free Dark Ambient Electronic Studio Stem — **Commercial Use Permitted** (see `/public/sfx/LICENSES.md`) |
| **Lottie Icons** | `public/lottie/{check,shield,map-pin,upload-progress}.json` | Custom-authored Bodymovin vector animations — **CC0 1.0 Public Domain** (see `/public/lottie/LICENSES.md`) |
