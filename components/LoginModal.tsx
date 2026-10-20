'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, AlertCircle, ArrowRight, Loader2, X, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess?: (user: { email: string; studentId: string; fullName: string }) => void;
  onClose?: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    try {
      window.location.href = '/api/auth/google?redirect=true';
    } catch (err: unknown) {
      setIsLoading(false);
      setError('Unable to initiate Google Sign-in. Please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0B132B] p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-[#1C2541] overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Login Modal"
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Branding & Header */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <Image
              src="/logo.png"
              alt="University of Makati"
              fill
              sizes="64px"
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            TAGA-asK AI
          </h2>
          <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold text-[#3F56CA] dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified UMak account required</span>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
            Sign in with your official university account to access grounded campus guidance, documents, and interactive visual map.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Google Workspace OAuth Sign-In */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-100 font-semibold text-sm shadow-xs transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#3F56CA]" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google (@umak.edu.ph)</span>
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="rounded-xl bg-slate-50 dark:bg-[#111827]/70 border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Strict Domain Security</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Google Workspace Single Sign-On verifies enrolled students and personnel through their official <strong className="text-slate-800 dark:text-slate-200">@umak.edu.ph</strong> email. Personal Gmail and lookalike domains are rejected automatically.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-[11px] text-slate-400">
          <span>University of Makati • TAGA-asK AI Secure Gateway</span>
        </div>
      </div>
    </div>
  );
}
