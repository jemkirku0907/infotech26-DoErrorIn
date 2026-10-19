'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: { email: string; studentId: string; fullName: string }) => void;
}

export function LoginModal({ isOpen, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleInfo, setGoogleInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch('/api/auth/google');
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {
      // fallback
    }
    setGoogleInfo(
      'UMak Google Workspace SSO (@umak.edu.ph) requires institution-level OAuth client ID setup. For this application, you can sign in directly using your UMak email and password below.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGoogleInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    const atIndex = cleanEmail.lastIndexOf('@');
    const domain = atIndex !== -1 ? cleanEmail.slice(atIndex + 1) : '';
    if (domain !== 'umak.edu.ph') {
      setError('Please sign in with your UMak email (@umak.edu.ph).');
      return;
    }

    if (!studentId.trim() || studentId.trim().length < 5) {
      setError('Please provide your valid UMak Student ID number (e.g., K12048592).');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain both letters and numbers for account security.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          studentId: studentId.trim(),
          fullName: fullName.trim() || 'UMak Student',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Please sign in with your UMak email (@umak.edu.ph).');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B132B] shadow-2xl border border-slate-200 dark:border-[#1C2541] overflow-hidden flex flex-col">
        {/* Header with Brand Gradient and Official Logos */}
        <div className="bg-gradient-to-r from-[#3F56CA] to-[#2B3C8E] p-6 text-white text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md">
              <Image 
                src="/taga-ask-logo-light.png" 
                alt="TAGA-asK AI" 
                width={40} 
                height={40} 
                className="object-contain" 
              />
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden border border-white">
              <Image 
                src="/umak-seal.png" 
                alt="UMak Seal" 
                width={48} 
                height={48} 
                className="object-contain" 
              />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight">UMak Student Portal</h2>
          <p className="text-xs text-blue-100 mt-1">
            Sign in with your verified University of Makati institutional credentials
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {error && (
            <div role="alert" className="p-3 rounded-xl bg-[#FDE8E9] dark:bg-red-950/40 border border-[#EC202B]/40 text-[#EC202B] text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {googleInfo && (
            <div className="p-3 rounded-xl bg-[#EEF2FC] dark:bg-blue-950/40 border border-[#3F56CA]/30 text-[#3F56CA] dark:text-[#21ADE3] text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{googleInfo}</span>
            </div>
          )}

          {/* Google Workspace SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1a233a] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with UMak Google Workspace</span>
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#0B132B] px-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
              or enter student credentials
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              UMak Institutional Email <span className="text-[#EC202B]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@umak.edu.ph"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#3F56CA] focus:ring-2 focus:ring-[#3F56CA]/20 transition"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Must end with <code className="text-[#3F56CA] dark:text-[#D1CA25] font-semibold">@umak.edu.ph</code>
            </p>
          </div>

          {/* Accessible Password Field with Show/Hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Student Password <span className="text-[#EC202B]">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Min. 8 characters (letters + numbers)</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#3F56CA] focus:ring-2 focus:ring-[#3F56CA]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID Number <span className="text-[#EC202B]">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. K12048592"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#3F56CA] focus:ring-2 focus:ring-[#3F56CA]/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student Full Name (Optional)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#3F56CA] focus:ring-2 focus:ring-[#3F56CA]/20 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3F56CA] hover:bg-[#2B3C8E] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Institutional Identity...</span>
                </>
              ) : (
                <>
                  <span>Authenticate as UMak Student</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25]" />
              <span>Hashed Credentials • Encrypted Session Cookie</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 bg-slate-900 border border-slate-300 dark:border-slate-700">
                <Image src="/doerrorin-logo.png" alt="DoError!n" width={14} height={14} className="w-full h-full object-contain" />
              </div>
              <span>Developed by DoError!n</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
