# Reference Visual & Audio Analysis (`/notes/analysis.md`)

## 1. Reference Videos Studied (Visuals + Audio Spectrograms)

### A. `glass-ai-landscape.mp4` (`cc732bef-ffad-40ca-8422-c501f95b3600.mp4` — 20.67s, 30fps)
- **Visual Choreography:**
  - Opens in a deep midnight-black void (`#01030A`) with a concentrated royal-blue/cyan volumetric radial spotlight behind a central glass prompt bar and floating title.
  - **Vertically Z-Stacked Rolodex Glass Cards (`2.5s–6.5s`):** 4 translucent dark-glass cards (`backdrop-filter: blur(32px)`, `1.5px` glowing cyan/blue border) fan out vertically below the prompt bar while two giant out-of-focus 3D orbital rings float on the left and right edges.
  - **Macro Button Focus Pull (`6.5s–8.5s`):** Camera zooms to `1.75x` with `rotateY: -12deg` onto the `[ ✪ Ask AI ]` pill button while peripheral elements blur into depth of field.
  - **3D Carousel Card Swap & Live Waveform (`10.0s–16.0s`):** Multi-column dark-glass cards orbit in 3D perspective (`perspective: 1300px`, `rotateX: 14deg`, `rotateY: -14deg to +10deg`) with a glowing cyan/white sine-wave audio/data waveform pulsing along the bottom edge of the active card.
  - **Inline 3D Gyroscope Ring in Sentence (`16.5s–18.8s`):** Pitch-black void with crisp kinetic sentence where a spinning 3D intertwined neon blue/cyan orbital ring sits inline between words, followed by the centered logo lockup.
- **Audio & Spectrogram Analysis (`qa/spectro_ref2.png`):**
  - **No narrator voiceover and no lower-third subtitle bar.**
  - **Tempo & Beat Grid:** `100 BPM` (`1 beat = 0.60s = 18 frames @ 30fps`). Warm sub-bass pulse (`60–120Hz`) with crisp high-hat/synth transients up to `12kHz`.
  - **Sound Design Pattern:**
    - Card fan-out: layered `pop-card` + airy `whoosh-short` staggered by `4–6 frames`.
    - Button focus pull & click: soft `glass-tap` + `ring-expand` low sweep.
    - Pre-outro silence gap (`18.4s–18.8s`): a dramatic `350ms` near-silence drop right before the final `impact-logo` sub-bass hit at `18.8s`.

### B. `chatgpt-style-vertical.mp4` (`7611d9b3-81d5-4882-921d-7408abc58cd0.mp4` — 23.97s, 30fps, 16:9 widescreen edit)
- **Visual Choreography:**
  - **Curved Neon Laser Arc Opening (`0.0s–3.5s`):** A glowing cyan/blue laser arc traces across pitch black (`0.0s–1.8s`), revealing an inline glowing blue pill word inside a centered question (`"What if [campus answers] were instant?"`).
  - **Steep 3D Tilted Sidebar Dive (`4.5s–6.8s`):** Camera dives at a steep 3D angle (`rotateX: 24deg, rotateY: 14deg, scale: 1.22`) over a dark-glass sidebar with a floating glowing header above the top bezel.
  - **Macro Close-Up Horizontal Input Pan (`8.0s–10.5s`):** Camera zooms to `1.55x` on the left end of the chat input bar and pans horizontally left-to-right across the bar following the live typing caret.
  - **Full-Screen Shockwave Ring on Send Click (`10.5s–11.5s`):** Hand/pointer clicks the circular `↑` Send button on the right, triggering a massive neon blue radial shockwave ring that expands across the entire 16:9 frame.
  - **Giant Horizon-Bleed Gradient Typography (`19.5s–23.0s`):** Massive `220px` metallic blue-to-white gradient headline bleeding off the left and right edges of the horizon while a crisp dark-glass pill sits sharp in the center foreground.
- **Audio & Spectrogram Analysis (`qa/spectro_ref1.png`):**
  - **No narrator voiceover.** Story is 100% visual + on-screen kinetic text + SFX + music.
  - **Sound Design Pattern:**
    - Opening laser arc (`0.2s–1.8s`): `whoosh-long` + high-frequency `shimmer-sweep`.
    - Sidebar 3D dive (`4.5s`): deep `whoosh-panel` with Doppler pitch shift.
    - Input typing (`8.0s–10.2s`): distinct mechanical `type-key` ticks (`3–5kHz` transient spikes on the spectrogram) synced 1:1 with character bursts.
    - Send click shockwave (`10.5s`): `type-send` click + `impact-soft` sub-bass + `ring-expand`.
    - Pre-finale silence drop (`19.7s–20.1s`): complete drop to silence before the massive `impact-logo` bass hit at `20.1s` as the horizon-bleed typography lands.

### C. `reference.mp4` & `reference-gemini-style.mp4`
- **Techniques Extracted:**
  - Right-angle neon connector lines (`strokeDashoffset` draw-on) with glowing endpoint node pop (`pop-chip`).
  - Yellow selection highlight with top-left and bottom-right circular drag handles (`glass-tap`).
  - Bouncing map pin drop with expanding concentric radar rings (`pin-drop`).
  - Rapid tabular counter tick-up (`counter-tick`) and alert toast shake (`deny-thud`).

---

## 2. Summary of Timing, Easing & Sound Rules Applied to TAGA-asK AI
- **Aspect Ratio & Duration:** `1920x1080` (`16:9` widescreen), `30fps`, `46.80s` (`1404 frames`), locked to a `100 BPM` beat grid (`1 beat = 18 frames = 0.60s`, `1 bar = 72 frames = 2.40s`).
- **No Narrator / No Lower-Third Subtitle Bar:** All storytelling happens via large kinetic headlines, live UI typing/streaming, 3D card choreography, music, and frame-accurate SFX.
- **Spring Physics:**
  - `snappy`: `{ damping: 16, stiffness: 180, mass: 0.8 }` (text reveals, chips, check marks)
  - `glassCard`: `{ damping: 18, stiffness: 120, mass: 1.0 }` (3D panel fly-ins, card stack fan-out)
  - `slam`: `{ damping: 14, stiffness: 220, mass: 0.9 }` (Beat 4 `"AI"` logo slam, shockwave hits)
  - `gentle`: `{ damping: 22, stiffness: 90, mass: 1.2 }` (macro camera orbits, focus pulls)
