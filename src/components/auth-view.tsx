'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, ShieldCheck, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function AuthView() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(async () => {
      if (isSignUp) {
        await signUp(email, name);
      } else {
        await signIn(email, name);
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-[420px] glass-panel border border-zinc-900 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center shadow-2xl mb-4">
            <Terminal className="w-5 h-5 text-zinc-950 stroke-[3]" />
          </div>
          <h1 className="text-xl font-black text-zinc-100 font-sans tracking-tight">
            Welcome to StackHub
          </h1>
          <p className="text-xs text-zinc-500 font-sans mt-2 leading-relaxed">
            Connect developer tools, server fleets, databases, and monitoring in a single high-fidelity terminal.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-zinc-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="e.g. dev@company.com"
                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-zinc-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold py-3.5 px-4 rounded-xl transition-all duration-100 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-lg shadow-white/5"
          >
            {loading ? (
              <RefreshCwSpinner />
            ) : (
              <>
                {isSignUp ? 'Create SaaS Account' : 'Authenticate Session'}
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium font-sans cursor-pointer transition-colors"
          >
            {isSignUp ? 'Already registered? Log in here' : "First time using StackHub? Sign up free"}
          </button>
        </div>
      </div>

      {/* Trust Badge footer info */}
      <div className="mt-8 flex items-center gap-2 text-[10px] text-zinc-600 font-mono z-10">
        <ShieldCheck className="w-4 h-4 text-zinc-700" />
        <span>SHA-256 encrypted endpoints and sandbox environments</span>
      </div>
    </main>
  );
}

function RefreshCwSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
