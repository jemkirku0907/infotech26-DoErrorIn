# TAGA-asK AI — Production Plan (`/notes/plan.md`)

## 1. Overview & Creative Direction
- **Deliverables:**
  - Primary 16:9 Master: `out/taga-ask-ai-promo-v1-16x9.mp4` (`1920x1080` @ `30fps`, `47.70s` / `1431 frames`, H.264 High CRF 16, BT.709, AAC 320k 48kHz, `-14.0 LUFS`).
  - No-Voice 16:9 Master: `out/taga-ask-ai-promo-v1-16x9-no-voice.mp4` (pure chill-hop loop + 59 ElevenLabs SFX events).
  - Hero Lockup Thumbnail: `out/thumbnail.png` (`1920x1080`).
- **Style Homage:** Modeled 1:1 on reference video `ab849a66-d285-4e7d-a59e-ac8276327ea5.mp4` (`@frameonvis` — Tarsi).
- **Voiceover Delivery:** ElevenLabs Sarah (`EXAVITQu4vr4xnSDxMaL`) — calm, breathy, confident modern Apple/fintech studio delivery with short punchy 2-to-5-word phrases and spacious `0.45s–0.85s` SFX pockets.
- **Music & Sound Design:** Warm 96 BPM chill-hop lo-fi R&B beat (Rhodes electric piano seventh chords, punchy kick, crisp rimshot, silky hi-hats, round sub-bass) + 59 frame-accurate ElevenLabs studio foley/UI sound effects.
- **Visual Design:** Dark glassmorphism (`#03061A` midnight void, `#22ABE3` cyan glow, `#F4EB2A` yellow accent), 3D perspective macro camera rig, live authentic `taga-askai.vercel.app` UI mockup elements.

---

## 2. 7-Scene Timeline & Choreography (`1431 Frames` / `47.70s`)

| Scene | Frame Range | Timecode | Duration | Spoken Phrase | Core Visual & Sound Choreography |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Scene 1: Intro** | `0 – 215` | `0.00s – 7.17s` | `7.17s` (`215f`) | *"Campus life moves fast. Too fast to follow. Meet TAGA-asK A.I."* | Kinetic words pop in center screen (`moves fast.` in glowing cyan) $\rightarrow$ whip-down to Campus Inquiry Report card with digital counter flutter (`142` -> `748 Posts`) $\rightarrow$ 5-layer deconstructed brand lockup slam + tagline. |
| **Scene 2: Problem** | `215 – 380` | `7.17s – 12.67s` | `5.50s` (`165f`) | *"Schedules, rooms, policies... all scattered. All unclear."* | 3 dark-glass iOS notification banners stack in 3D depth on *"Schedules,"*, *"rooms,"*, *"policies..."* $\rightarrow$ kinetic swipe *"All scattered."* $\rightarrow$ camera defocus blur drop on *"All unclear."* |
| **Scene 3: Solution** | `380 – 596` | `12.67s – 19.87s` | `7.20s` (`216f`) | *"But what if every answer... just made sense? One place to ask, to verify, to understand."* | Background warms to radiant cyan on *"But what if every answer"* $\rightarrow$ *"Just made sense"* chime $\rightarrow$ 5 dark-glass feature cards cascade in vertically from bottom (modeled on the reference *"Plan"* list). |
| **Scene 4: Hero CIT** | `596 – 851` | `19.87s – 28.37s` | `8.50s` (`255f`) | *"Ask: Where is the C.I.T.? Second Floor, South Wing, Admin Building. Source zero three, page one."* | Camera glides down into live TAGA-asK AI chat $\rightarrow$ query types and clicks send with shockwave $\rightarrow$ answer streams with yellow highlight handles $\rightarrow$ `Source03.pdf, Page 1` chip pops $\rightarrow$ 3D PDF page quote card highlights $\rightarrow$ pointer clicks `"View on map"` and Admin Building pin card drops. |
| **Scene 5: Uploads & Map** | `851 – 1015` | `28.37s – 33.83s` | `5.47s` (`164f`) | *"Upload a schedule, or a photo. Need directions? Open the campus map."* | `Class_Schedule_1stSem.pdf` and `Campus_Notice.png` snap into input bar with cited room reply $\rightarrow$ 3D whip-pan into real UMak Interactive Campus Map visualizer as yellow map pin drops on Admin Building. |
| **Scene 6: Security** | `1015 – 1198` | `33.83s – 39.93s` | `6.10s` (`183f`) | *"UMak accounts only. Protected from spam. No noise, no waiting..."* | UMak email accepted ✓, Gmail rejected ✕ with shake, Rate Limit HTTP 429 shield toast $\rightarrow$ stage clears for centered emerald/cyan pill badge `✓ Verified UMak Companion ready!` bouncing in with signature Apple-Pay confirmation chime! |
| **Scene 7: Outro** | `1198 – 1431` | `39.93s – 47.70s` | `7.77s` (`233f`) | *"...just clarity. TAGA-asK A.I. Ask smarter."* | 3D perspective tilt swing for *"Just clarity."* $\rightarrow$ TAGA-asK AI rounded-square app icon bounces into center screen, then slides left to reveal *"TAGA-asK AI \| Ask Smarter."* and glowing URL pill `taga-askai.vercel.app` while chillhop beat rides out to fade. |

---

## 3. Asset & Foley Production
- **Voiceover Asset:** `video/public/voiceover.mp3` & `public/voiceover.mp3` (48kHz stereo, broadcast processed with -15.5 LUFS vocal chain).
- **SFX Assets:** 15 custom-synthesized stereo 48kHz WAV files in `video/public/sfx/` & `public/sfx/` generated via ElevenLabs Sound Generation API.
- **Music Bed:** `video/public/sfx/music-chillhop-loop.wav` (96 BPM chillhop lo-fi R&B instrumental groove tiled seamlessly across 47.70s with sidechain vocal ducking).
