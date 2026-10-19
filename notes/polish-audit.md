# TAGA-asK AI Promo Video: Comprehensive Polish Audit

**Project**: TAGA-asK AI Promo Video (`PromoVideoV3Landscape`)  
**Resolution**: 1920x1080 @ 30fps | Total Duration: 1520 frames (50.67s)  
**Audit Date**: October 15, 2026  
**Auditor**: Antigravity Polish QA System  

---

## 1. Executive Summary & Baseline Metrics

A complete forensic audit of the rendered master composition (`video/out/taga-ask-ai-promo-v3.mp4`), extracted audio (`video/out/audit_audio.wav`), full-resolution contact sheets (`video/out/contact_sheets/*.png`), waveform (`video/out/audit_waveform.png`), and spectrogram (`video/out/audit_spectrogram.png`) was performed.

### Baseline Audio Measurements vs Target Standards
| Metric | Current Value | Target Specification | Status | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Integrated Loudness** | **-17.05 LUFS** | **-14.0 LUFS (±1.0 LUFS)** | ❌ FAILS (3.05 dB too quiet) | **CRITICAL** |
| **Maximum True Peak** | **-0.58 dBTP** | **≤ -1.0 dBTP (Never > 0 dBTP)** | ❌ FAILS (Exceeds limit by +0.42 dBTP) | **CRITICAL** |
| **Loudness Range (LRA)** | **7.30 LU** | **4.0 to 8.0 LU** | ✅ PASSES (Within target range) | Pass |
| **Threshold** | -28.01 LUFS | Relative -10 LU | ✅ PASSES | Pass |
| **Music Ducking** | Static (vol = 0.14) | -8 to -10 dB ducking under dialogue | ❌ FAILS (No dynamic ducking) | **MAJOR** |
| **Music Head/Tail** | Abrupt start & cut | 1.5s fade-in, 2.0s fade-out to -inf dB | ❌ FAILS (Cuts off at frame 1520) | **MAJOR** |
| **Dialogue Conditioning** | Unfiltered raw stem | HPF 80Hz, De-ess 5-8kHz, +1.5dB @ 3kHz | ❌ FAILS (Sub-80Hz rumble, sibilance) | **MAJOR** |
| **SFX Treatment** | Raw peaks (-0.58 dBTP) | HPF 120Hz, peaks -6 to -12 dBTP rel to voice | ❌ FAILS (Transients overpower mix) | **MAJOR** |

### Baseline Layout & Safe Margin Checks (1920x1080)
| Scene | Element Checked | Distance from Frame Edge | Safe Margin (≥ 96px) | Status | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Scene 1** | Top UMak Seal Pill | Top: 72px | 72px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 1** | Tagline vs Karaoke Box | Bottom: 155px vs 70px | Visual collision & overlap | ❌ FAILS | **CRITICAL** |
| **Scene 2** | Kinetic Karaoke Box | Bottom: 70px | 70px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 3** | 4-Card Text Baseline | Variable title line-breaks | Misaligned footers across columns | ❌ FAILS | **MAJOR** |
| **Scene 3** | Kinetic Karaoke Box | Bottom: 70px | 70px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 4** | Section Headline | Top: 55px | 55px < 96px | ❌ FAILS | **CRITICAL** |
| **Scene 4** | App Window vs Karaoke | Window bottom overlaps prompt bar | Overlaps input box & footer | ❌ FAILS | **CRITICAL** |
| **Scene 4** | Kinetic Karaoke Box | Bottom: 70px | 70px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 5** | Section Headline | Top: 80px | 80px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 5** | Map Highlight Box | Text padding on CIT line | Left edge clipping text | ❌ FAILS | **MINOR** |
| **Scene 6** | Section Headline | Top: 85px | 85px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 6** | BentoCard Vertical Space | Bottom 190px of cards empty | Excessive dead space / unbalanced | ❌ FAILS | **MAJOR** |
| **Scene 7** | Kinetic Karaoke Box | Bottom: 70px | 70px < 96px | ❌ FAILS | **MAJOR** |
| **Scene 7** | Mouse Cursor Motion | Linear to click | Abrupt stop on click | ❌ FAILS | **MINOR** |
| **Global** | `src/layout.ts` System | Not implemented | Missing single source of truth | ❌ FAILS | **CRITICAL** |

---

## 2. Detailed Findings by Priority & Scene

### PRIORITY 1: CRITICAL ISSUES

1. **[CRITICAL - AUDIO] Master Loudness & True Peak Non-Compliance**
   - **Timecode**: Entire video (00:00.000 - 00:50.667 | frames 0 - 1520)
   - **Measurement**: Integrated loudness is **-17.05 LUFS** (target is **-14.0 LUFS ± 1.0 LUFS**). True Peak reaches **-0.58 dBTP** (target is **≤ -1.0 dBTP**).
   - **Root Cause**: The raw voiceover is played at static volume 1.0 without bus mastering, while SFX hits (`sfx_impact.mp3`) burst up to -0.58 dBTP. Without a mastered bus limiter and gain stage, the overall video sounds noticeably quiet on web/mobile, yet individual SFX distort.
   - **Required Fix**: Build reproducible mix bus in `/video/src/audio/mix.ts` with stems in `/video/src/audio/stems`. Master output to exactly -14.0 LUFS with true peak capped at -1.0 dBTP using two-stage limiter.

2. **[CRITICAL - LAYOUT] Scene 4 App Window Collides with Bottom Karaoke Box**
   - **Timecode**: 00:16.533 - 00:27.967 (frames 496 - 839)
   - **Location**: Scene 4 (`Scene4CitationDemoV3.tsx`)
   - **Defect**: The App Window height is 680px positioned at `marginTop: 20` below the headline at `top: 55px`. The bottom input prompt bar ("Ask about UMak scholarships...") and the footer ("Developed by DoErrorIn") extend down to `y = 820px`, where the semi-translucent Kinetic Karaoke container (`bottom: 70px`, `y = 910px` with vertical padding and scaling) directly covers the bottom prompt bar.
   - **Required Fix**: Resize App Window to fit within standard safe bounds (height 590px, width 1320px). Shift headline down to safe margin (top: 96px), adjust vertical flex so prompt bar and footer sit cleanly above the karaoke baseline.

3. **[CRITICAL - LAYOUT] Scene 1 Tagline Subtitle Collides with Karaoke Box**
   - **Timecode**: 00:02.500 - 00:04.567 (frames 75 - 137)
   - **Location**: Scene 1 (`Scene1IntroV3.tsx`)
   - **Defect**: The tagline subtitle pill ("YOUR UMAK AI COMPANION") is positioned at `bottom: 155px`. The Kinetic Karaoke box (`bottom: 70px`) with height ~84px extends to `bottom: 154px`, creating direct overlap where the top border of the karaoke box clashes with the bottom of the tagline pill.
   - **Required Fix**: Optically integrate the tagline cleanly into the central logo lockup hierarchy or anchor it at `bottom: 180px`, giving at least 48px breathing room above the karaoke container.

4. **[CRITICAL - LAYOUT] Scene 4 Headline Violates Top Safe Margin (Top: 55px)**
   - **Timecode**: 00:16.533 - 00:27.967 (frames 496 - 839)
   - **Location**: Scene 4 (`Scene4CitationDemoV3.tsx`)
   - **Defect**: `Zero Hallucinations. Strictly Verified.` headline is hardcoded at `top: 55px`, violating the 96px safe margin rule by 41px.
   - **Required Fix**: Move headline to `top: 96px` (using `LAYOUT.safeMargin`).

5. **[CRITICAL - SYSTEM] Missing `src/layout.ts` Layout Token System**
   - **Location**: Entire video codebase
   - **Defect**: No central layout token file. Hardcoded numbers (`gap: 36`, `padding: 28`, `borderRadius: 22`, `top: 72`, etc.) are scattered across 7 scene files, causing stroke, radius, and margin divergence.
   - **Required Fix**: Author `/video/src/layout.ts` defining 8px base grid, 12-column grid geometry, 96px safe margins, 40px gutters, spacing tokens (8, 16, 24, 32, 48, 64, 96), radii (card 16, chip 12, pill 9999), strokes (1px subtle, 2px active), and shadow tokens.

---

### PRIORITY 2: MAJOR ISSUES

6. **[MAJOR - AUDIO] Static Music Bed Without Dynamic Voice Ducking**
   - **Timecode**: 00:00.000 - 00:50.667 (frames 0 - 1520)
   - **Defect**: `PromoVideoV3Landscape.tsx` plays `music_bed.mp3` at constant volume 0.14 via `<Loop>`. In scene pauses (between scenes 1 and 2, 2 and 3, etc.), the music does not rise; during dense voiceover segments, the music masks vocal clarity around 1 kHz - 2.5 kHz.
   - **Required Fix**: Implement dynamic frame-based audio ducking (or offline ducked master stem) with 30ms attack, 350ms release, lowering music bed by 9 dB whenever voiceover is active, and returning smoothly during pauses.

7. **[MAJOR - AUDIO] Music Bed Lacks Clean 1.5s Fade-In and 2.0s Fade-Out**
   - **Timecode**: 00:00.000 - 00:01.500 and 00:48.000 - 00:50.667
   - **Defect**: Music starts abruptly at frame 0 and cuts off suddenly at frame 1520 without trailing out to -inf dB.
   - **Required Fix**: Apply exponential 1.5s fade-in on frame 0..45, and 2.0s fade-out across frames 1460..1520 to absolute digital silence.

8. **[MAJOR - AUDIO] Voiceover Low Rumble, Harsh Sibilance & Mouth Clicks**
   - **Timecode**: Full voiceover stem
   - **Defect**: Spectrogram displays energy below 80 Hz and harsh sibilance peaks between 5.5 kHz and 7.8 kHz on words like "sources", "requests", "sign-in".
   - **Required Fix**: High-pass at 80 Hz (18 dB/oct), gentle presence boost (+1.5 dB @ 3 kHz, Q=1.2), de-ess notch at 6.4 kHz (-3 dB, gentle bandwidth), subtle transparent optical compression (2.5:1, fast attack, 100ms release).

9. **[MAJOR - AUDIO] SFX Levels & Sub-Bass Thump**
   - **Timecode**: Frames 42 (`sfx_impact.mp3`), 220 (`sfx_rise.mp3`), 1110 (`sfx_impact_soft.mp3`)
   - **Defect**: SFX assets contain unfiltered sub-100Hz thumps that drive true-peak levels to -0.58 dBTP, overpowering dialogue.
   - **Required Fix**: High-pass all SFX at 120 Hz, calibrate peak gain between -8 dBTP and -12 dBTP relative to dialogue, add 10ms micro-fades.

10. **[MAJOR - LAYOUT] Kinetic Karaoke Safe Margin Violation Across All Scenes**
    - **Timecode**: Frames 0 - 1520
    - **Defect**: `KineticKaraoke.tsx` has hardcoded `bottom: 70px`. This is 26px inside the mandatory 96px safe margin.
    - **Required Fix**: Standardize `KineticKaraoke.tsx` to `bottom: 96px` (`LAYOUT.safeMargin`).

11. **[MAJOR - LAYOUT] Scene 1 UMak Seal Pill Violates Top Safe Margin**
    - **Timecode**: Frames 0 - 137
    - **Defect**: `Scene1IntroV3.tsx` top badge is at `top: 72px` (72px < 96px).
    - **Required Fix**: Adjust to `top: 96px`.

12. **[MAJOR - LAYOUT] Scene 3 Text Baseline Misalignment Across 4 Columns**
    - **Timecode**: Frames 307 - 496
    - **Defect**: In `Scene3SolutionV3.tsx`, Card 1 & 2 titles are 2 lines tall, while Card 3 & 4 titles are 1 line tall. This causes descriptions and bottom badges to bounce up and down across the 4 side-by-side cards.
    - **Required Fix**: Set a fixed min-height for title container (64px) and use flex-1 column distribution so descriptions and footers align to identical pixel baselines across all 4 cards.

13. **[MAJOR - LAYOUT] Scene 5 & Scene 6 Headline Top Margins Violate Safe Margin**
    - **Timecode**: Scene 5 (frames 839 - 1045), Scene 6 (frames 1045 - 1276)
    - **Defect**: Scene 5 headline is at `top: 80px`; Scene 6 headline is at `top: 85px`. Both violate 96px safe margin.
    - **Required Fix**: Set all scene headlines to `top: 96px` uniformly.

14. **[MAJOR - LAYOUT] Scene 6 BentoCards Excessive Bottom Dead Space**
    - **Timecode**: Frames 1045 - 1276
    - **Defect**: Both BentoCards have fixed `height: 430px`, but content occupies only 240px, leaving 190px of empty space at the bottom of the card, looking unpolished.
    - **Required Fix**: Adjust card height to 370px or vertically center card content, aligning text baselines across both cards.

---

### PRIORITY 3: MINOR ISSUES

15. **[MINOR - LAYOUT] Scene 1 Logo Visual Weight Center Offset**
    - **Timecode**: Frames 0 - 137
    - **Defect**: Heron mascot tail feathers pull visual weight downward and rightward.
    - **Required Fix**: Apply an optical center compensation (`transform: translateY(-8px)`) to balance the lockup against the geometric viewport center.

16. **[MINOR - LAYOUT] Scene 5 Map Modal Highlight Box Left Padding**
    - **Timecode**: Frames 944 - 1045
    - **Defect**: Yellow highlight border around CIT on the campus map image clips slightly against the icon.
    - **Required Fix**: Nudge highlight box coordinates (`left: 62%`, `width: 345px`, `height: 34px`) for perfect alignment.

17. **[MINOR - ANIMATION] Scene 7 Mouse Pointer Click Spring Easing**
    - **Timecode**: Frames 1386 - 1460 (local 110 - 184)
    - **Defect**: Cursor click scale animation (1.0 -> 0.85 -> 1.0) is slightly abrupt.
    - **Required Fix**: Use smooth cubic easing interpolation for natural pointer deceleration and click recoil.

18. **[MINOR - POLISH] Visual Consistency of Corner Radii & Borders**
    - **Defect**: Inconsistent border radii (e.g. 24px, 22px, 20px, 18px, 14px, 12px) and border opacity (0.12, 0.16, 0.18, 0.4).
    - **Required Fix**: Adopt `LAYOUT.radii` (card: 16px, inner: 12px, pill: 9999px) and `LAYOUT.borders` (subtle: 1px rgba(255,255,255,0.14), focus: 2px) systematically.

---

## 3. Execution Plan

In accordance with strict priority ordering (Critical -> Major -> Minor):

1. **Step 1: Create Central Layout System (`video/src/layout.ts`)**
   - 8px base grid, 12-column geometry, 96px safe margins, 40px gutters, spacing tokens, standard radii, borders, shadows, and typography scales.
2. **Step 2: Audio Engineering & Mastering (`video/src/audio/`)**
   - Clean dialogue stem: HPF 80Hz, De-ess 6.4kHz, +1.5dB @ 3kHz, compression 2.5:1, true-peak limit.
   - Clean music stem: Low-pass 12kHz, ducking -9 dB under dialogue, 1.5s fade-in, 2.0s fade-out to digital silence.
   - Clean SFX stems: HPF 120Hz, peak at -8 to -12 dBTP relative to voice, micro-fades.
   - Master bus mix: Target -14.0 LUFS integrated (±0.5 LUFS), True Peak ≤ -1.0 dBTP, LRA 6.5 LU.
   - Save stems in `video/public/audio/stems/` and mix script in `video/src/audio/mix.ts`.
3. **Step 3: Fix Critical Visual Collisions & Safe Margins**
   - Scene 1: Fix tagline collision with karaoke box; adjust seal pill to top 96px.
   - Scene 4: Fix headline to top 96px; resize App Window (1320x590) to completely eliminate bottom prompt overlap with karaoke.
   - Kinetic Karaoke: Standardize to `bottom: 96px` across all scenes.
4. **Step 4: Fix Major Layout & Alignment Issues**
   - Scene 2: Standardize BentoCard radii & border tokens.
   - Scene 3: Fix 4-column card text baseline and footer alignment.
   - Scene 5: Fix headline to top 96px; adjust map highlight box padding.
   - Scene 6: Fix headline to top 96px; adjust card height (370px) and optical centering.
   - Scene 7: Polish cursor easing and outro settle.
5. **Step 5: Automated Verification & Master Export**
   - Run audio QA verification script (`loudnorm`, true peak, silent head/tail).
   - Run layout DOM/still verification checks.
   - Export final master video `video/out/taga-ask-ai-promo-v3-final.mp4`.
