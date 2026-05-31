'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, ShieldCheck, Mail, User, Sparkles, Layers3, Gauge } from 'lucide-react';
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
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 subtle-grid opacity-[0.03] pointer-events-none" />
      
      {/* Background soft glow balls */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-6 relative z-10 animate-fade-in">
        
        {/* Visual Brand Section */}
        <section className="relative rounded-[2rem] border border-sidebar-border p-8 md:p-12 overflow-hidden bg-[#0a0f24]/75 backdrop-blur-xl flex flex-col justify-between min-h-[460px] md:min-h-[550px]">
          <div className="absolute right-0 top-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>StackHub access shell</span>
            </div>
            
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Terminal className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold font-mono">Unified Platform</p>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mt-0.5">Developer operations, one command surface.</h1>
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
              StackHub connects GitHub repositories, AWS credentials, local Docker container sockets, and cloud resources into a single glowing diagnostic panel.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs mt-8">
            <div className="rounded-xl border border-sidebar-border bg-[#070b1c]/60 p-4">
              <Gauge className="w-4 h-4 text-primary mb-2.5" />
              <p className="font-semibold text-foreground">Live telemetry</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">Infrastructure status feeds stay visible without context switching.</p>
            </div>
            <div className="rounded-xl border border-sidebar-border bg-[#070b1c]/60 p-4">
              <Layers3 className="w-4 h-4 text-indigo-400 mb-2.5" />
              <p className="font-semibold text-foreground">Aggregated UI</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">Custom control widgets organized into neat, unified dashboards.</p>
            </div>
            <div className="rounded-xl border border-sidebar-border bg-[#070b1c]/60 p-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2.5" />
              <p className="font-semibold text-foreground">Local storage</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">Secure credentials and environment vars cached on your device.</p>
            </div>
          </div>
        </section>

        {/* Input Panel Section */}
        <section className="glass-card rounded-[2rem] p-8 md:p-12 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex flex-col items-start gap-1 mb-8">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-mono font-bold">Authenticate Session</p>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight mt-0.5">Enter workspace identity</h2>
              <p className="text-xs text-muted-foreground mt-1">Unlock your connected diagnostic components and infrastructure stream.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-[#080c1a] border border-sidebar-border text-xs text-foreground font-semibold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. dev@company.com"
                    className="w-full bg-[#080c1a] border border-sidebar-border text-xs text-foreground font-semibold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all font-mono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-150 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-md shadow-primary/10 active:scale-98"
              >
                {loading ? (
                  <RefreshCwSpinner />
                ) : (
                  <>
                    {isSignUp ? 'Create Workspace Profile' : 'Access Developer Console'}
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[11px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer transition-colors"
              >
                {isSignUp ? 'Already registered? Log in here' : "First time using StackHub? Create a profile"}
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[9px] text-muted-foreground/80 font-mono border-t border-sidebar-border pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted local session credentials</span>
          </div>
        </section>

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

