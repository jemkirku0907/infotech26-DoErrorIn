# TAGA-asK AI — 16:9 Product-Launch Motion Graphics Film (Remotion)

Premium dark-glassmorphism (`1920x1080`, `30fps`, `46.80s` / `1404 frames`, `100 BPM`) product-launch film for **TAGA-asK AI** (University of Makati Verified AI Knowledge Companion).

## Highlights
- **Visual-First Storytelling (No Continuous Narrator / No Lower-Third Subtitle Bar):** Carried by giant gradient kinetic typography, authentic `taga-askai.vercel.app` 3D glass UI choreography, a `100 BPM` dark ambient electronic score, and `70` frame-accurate tactile sound effects (`0.00ms` transient drift).
- **Macro 3D Camera Rig (`MacroCameraRig`):** Deep `1.15x–1.72x` 3D camera zooms, steep perspective tilts (`rotateX: 14°–30°`, `rotateY: -20°–18°`), horizontal camera pans following live input typing, full-screen neon shockwave rings on Send clicks, and optical edge-vignette depth of field.

---

## Deliverables
- **Primary 16:9 Master (`1920x1080`, 30fps, H.264 High CRF 16, BT.709, `-14 LUFS`):**
  - `out/taga-ask-ai-promo-v1-16x9.mp4`
- **Music + SFX No-Voice Master (`1920x1080`, 30fps):**
  - `out/taga-ask-ai-promo-v1-16x9-no-voice.mp4`
- **High-Res Logo Lockup Thumbnail (`1920x1080` PNG):**
  - `out/thumbnail.png`

---

## Render & QA Commands

```bash
# 1. Synthesize all 19 stereo 48kHz SFX WAVs + 100 BPM music bed + -14 LUFS master soundtrack
node scripts/build-music-sfx-master.cjs

# 2. Run zero-HUD / forbidden-label source scan
node scripts/qa-text-scan.cjs

# 3. Render & master 16:9 MP4 + no-voice copy + thumbnail.png
node scripts/render-and-master.cjs

# 4. Run full ffprobe, EBU R128 loudness, frame-diff motion, and contact-sheet QA suite
node scripts/qa-full-suite.cjs
```

---

## Documentation & Scripts
- `/notes/analysis.md` — Visual + audio spectrogram analysis of the reference edits
- `/notes/plan.md` — 7-scene structure, `100 BPM` beat grid, transition map, and asset list
- `/notes/decisions.md` — Architecture and design decision log
- `/script/onscreen.md` — Complete scene-by-scene on-screen text script
- `/audio/sound-map.md` — Frame-accurate sound map (`70` sound events across `1404` frames)
- `/audio/timeline.ts` — TypeScript source of truth for scene ranges and sound events

---

## Assets & Licenses
- **Brand Assets (`./logo-white-bg.png`, `./logo-badge.png`, `video/public/logo-layers/layer_*.png`, `public/images/umak-building.jpg`, `public/images/ui-chat-real.png`, `public/images/ui-map-real.png`):** First-party University of Makati / TAGA-asK AI project assets.
- **Fonts (`@remotion/google-fonts/PlusJakartaSans`):** SIL Open Font License (OFL 1.1).
- **SFX & Music (`public/sfx/*.wav`, `public/audio/music-100bpm.wav`):** Procedurally synthesized in-project (`scripts/build-music-sfx-master.cjs`), CC0 / 100% commercial-use cleared. See `public/sfx/LICENSES.md`.
- **Animated Vector Icons (`video/src/presets.tsx` & `public/lottie/LICENSES.md`):** Deterministic frame-driven SVG vector icons + CC0 Lottie assets.
