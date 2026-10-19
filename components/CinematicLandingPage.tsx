'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  VolumeX,
  FastForward,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { INSTITUTIONAL_ERROR_MESSAGE } from '@/lib/auth';

interface CinematicLandingPageProps {
  onEnterChat: () => void;
  currentUser?: { email: string; studentId: string; fullName: string } | null;
  onOpenLogin?: () => void;
  onLoginSuccess?: (user: { email: string; studentId: string; fullName: string }) => void;
}

export function CinematicLandingPage({ 
  onEnterChat, 
  currentUser,
  onOpenLogin,
  onLoginSuccess
}: CinematicLandingPageProps) {
  // Animation stages: 
  // 0 = Initial mount (0ms)
  // 1 = Silhouette & Mascot scale reveal (300ms)
  // 2 = Logo wordmark impact + boom (1100ms)
  // 3 = Content & CTA reveal (1800ms)
  const [animationStage, setAnimationStage] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rememberPreference, setRememberPreference] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check URL params for auth errors or skip intro preference on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('auth_error')) {
        setAuthErrorMessage(INSTITUTIONAL_ERROR_MESSAGE);
        // Clear any stale session on error
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      }
      const skipPref = localStorage.getItem('taga_ask_skip_intro');
      if (skipPref === 'true') {
        setRememberPreference(true);
      }
    } catch {
      // fallback
    }
  }, []);

  // Synthesize cinematic boom effect via Web Audio API without needing external mp3 files
  const playCinematicBoom = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Sub-bass oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Audio autoplay policy blocked; fail gracefully
    }
  };

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationStage(3);
      return;
    }

    const t1 = setTimeout(() => setAnimationStage(1), 300);
    const t2 = setTimeout(() => {
      setAnimationStage(2);
      playCinematicBoom();
    }, 1100);
    const t3 = setTimeout(() => setAnimationStage(3), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [soundEnabled]);

  const handleGetStarted = async () => {
    // Save skip intro preference if checked
    if (rememberPreference) {
      try {
        localStorage.setItem('taga_ask_skip_intro', 'true');
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem('taga_ask_skip_intro');
      } catch {
        // ignore
      }
    }

    // Check if session already active
    if (currentUser) {
      setIsExiting(true);
      setTimeout(() => onEnterChat(), 400);
      return;
    }

    // Verify session with server before redirecting
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
          setIsExiting(true);
          setTimeout(() => onEnterChat(), 400);
          return;
        }
      }
    } catch {
      // Proceed to login
    } finally {
      setIsAuthenticating(false);
    }

    // User is not logged in: initiate Google OAuth or open UMak authentication modal
    try {
      const googleRes = await fetch('/api/auth/google');
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData.configured && googleData.url) {
          window.location.href = googleData.url;
          return;
        }
      }
    } catch {
      // fallback to modal
    }

    // If Google Client ID not yet configured in local environment, open UMak authentication modal
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setIsExiting(true);
      setTimeout(() => onEnterChat(), 400);
    }
  };

  const handleSkip = () => {
    setAnimationStage(3);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#0E2A8F] text-white transition-opacity duration-500 selection:bg-[#3F56CA] selection:text-white ${
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 
        1. BACKGROUND: Full-Bleed UMak Administration Building Photo 
        Blended like a branded UMak "ADVISORY" poster with royal blue overlays
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Solid fallback color prevents flashing */}
        <div className="absolute inset-0 bg-[#0E2A8F] -z-20" />

        {/* Ambient drift container with 1.04 to 1.08 slow scale over 30s */}
        <div className="relative w-full h-full animate-ambient-drift">
          <Image
            src="/images/umak-building.jpg"
            alt="University of Makati Administration Building"
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom filter grayscale-[40%] blur-[2px] transform-gpu"
          />
        </div>

        {/* Blue color wash to give desaturated building the branded UMak advisory poster tint */}
        <div 
          className="absolute inset-0 bg-[#1535A8] mix-blend-multiply opacity-60" 
        />

        {/* 
          Base Overlay: linear-gradient from top-left solid blue (#1535A8 to #0E2A8F at ~94% opacity)
          fading toward bottom-right to ~70% opacity so the building and trees show faintly through
        */}
        <div 
          className="absolute inset-0 hidden md:block"
          style={{
            background: 'linear-gradient(135deg, rgba(21, 53, 168, 0.94) 0%, rgba(14, 42, 143, 0.90) 45%, rgba(14, 42, 143, 0.70) 100%)',
          }}
        />
        {/* Mobile: slightly darker overlay so text stays ultra-readable on small screens */}
        <div 
          className="absolute inset-0 block md:hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(21, 53, 168, 0.96) 0%, rgba(14, 42, 143, 0.93) 50%, rgba(14, 42, 143, 0.76) 100%)',
          }}
        />

        {/* Second Subtle Vignette: dark navy (#050A24 at 35%) at the edges for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5, 10, 36, 0.35) 100%)',
          }}
        />
      </div>

      {/* Top Bar with UMak Seal, Official Title, and Controls */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* UMak Seal & Institutional Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 p-0.5 border border-white/20 backdrop-blur-md shadow-md">
            <Image
              src="/umak-seal.png"
              alt="University of Makati Seal"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white block drop-shadow-xs">
              University of Makati
            </span>
            <span className="text-[10px] text-blue-200/90 font-medium">
              Official Institutional Assistant
            </span>
          </div>
        </div>

        {/* Top Right Controls (Sound Toggle & Skip Intro) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(prev => !prev)}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            title={soundEnabled ? "Sound enabled" : "Sound muted"}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-blue-200 hover:text-white backdrop-blur-md transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D1CA25]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {animationStage < 3 && (
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Intro</span>
            </button>
          )}
        </div>
      </header>

      {/* 
        2. HERO SECTION: Generously Centered Vertically and Horizontally
        Feature cards deleted; only Mascot, Title, Subtitle, Description, and "Get Started" CTA
      */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center my-auto flex-1">
        
        {/* On Rejection / Auth Error Banner */}
        {authErrorMessage && (
          <div 
            role="alert" 
            className="mb-8 w-full max-w-lg px-4 py-3 rounded-2xl bg-[#050A24]/90 border border-[#EC202B]/60 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 backdrop-blur-md shadow-2xl animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-[#EC202B] shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
        )}

        {/* Animated TAGAK Mascot Reveal */}
        <div className="relative mb-6">
          {/* Subtle Golden-Blue Halo */}
          <div 
            className={`absolute -inset-4 rounded-3xl blur-2xl transition-all duration-1000 ${
              animationStage >= 1 
                ? 'opacity-70 bg-gradient-to-r from-[#1535A8] via-[#21ADE3] to-[#D1CA25]' 
                : 'opacity-0'
            }`}
          />

          {/* Mascot Container */}
          <div 
            className={`relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-[#0E2A8F]/80 border-2 border-[#21ADE3]/50 p-4 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-700 ease-out ${
              animationStage >= 1 
                ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
                : 'scale-75 opacity-0 translate-y-6 rotate-[-6deg]'
            }`}
          >
            <Image
              src="/taga-bird.png"
              alt="TAGA-asK AI Heron Mascot"
              width={120}
              height={120}
              priority
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Wordmark: TAGA-asK AI */}
        <div 
          className={`transition-all duration-700 ease-out ${
            animationStage >= 2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#21ADE3] text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D1CA25]" />
            <span>Official Campus Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
            TAGA-asK <span className="text-[#D1CA25] drop-shadow-[0_0_25px_rgba(209,202,37,0.6)]">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 drop-shadow-xs">
            Your UMak AI Companion.
          </p>

          <p className="text-sm md:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
            Grounded strictly in University of Makati official knowledge sources, with verifiable citations and real-time campus guidance.
          </p>
        </div>

        {/* 
          3. SINGLE PRIMARY CTA: "Get Started" Button (Centered, Large, with Arrow)
          Cards are completely removed; spacing is generous and balanced.
        */}
        <div 
          className={`w-full mt-10 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
            animationStage >= 3 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleGetStarted}
            disabled={isAuthenticating}
            className="w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#1535A8] to-[#0E2A8F] hover:from-[#1E45C4] hover:to-[#1535A8] text-white font-bold text-lg shadow-[0_10px_35px_rgba(14,42,143,0.6)] hover:shadow-[0_12px_45px_rgba(33,173,227,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer group border border-white/30 backdrop-blur-md disabled:opacity-60"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#D1CA25]" />
                <span>Checking Credentials...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 text-[#D1CA25] group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>

          {/* Functional "Remember choice & skip intro next time" Checkbox */}
          <label className="mt-5 flex items-center gap-2.5 text-xs sm:text-sm text-blue-100/90 cursor-pointer select-none hover:text-white transition">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/30 text-[#1535A8] focus:ring-0 cursor-pointer"
            />
            <span>Remember choice &amp; skip intro next time</span>
          </label>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200/80 border-t border-white/15">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-900 border border-white/20 shadow-xs">
            <Image
              src="/doerrorin-logo.png"
              alt="DoError!n Logo"
              width={20}
              height={20}
              className="w-full h-full object-contain"
            />
          </div>
          <span>Developed with pride by <strong className="font-semibold text-white">DoError!n</strong></span>
        </div>

        <div className="flex items-center gap-4 text-blue-200/90">
          <span>University of Makati</span>
          <span>•</span>
          <a 
            href="https://taga-askai.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#D1CA25] hover:underline font-semibold"
          >
            taga-askai.vercel.app
          </a>
        </div>
      </footer>
    </div>
  );
}
