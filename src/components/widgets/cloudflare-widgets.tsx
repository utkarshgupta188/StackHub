'use client';

import React from 'react';
import { Shield, ShieldAlert, Globe, Server, Check } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function CloudflareConfigAlert() {
  const { setActivePage } = usePlugins();
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full">
      <ShieldAlert className="w-8 h-8 text-orange-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">Cloudflare Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        Connect your real Cloudflare API Token and Zone ID inside the Extensions preference settings.
      </p>
      <button
        onClick={() => setActivePage('/plugins')}
        className="mt-3.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer border border-zinc-700/30"
      >
        CONNECT CLOUDFLARE
      </button>
    </div>
  );
}

export function CloudflareDns() {
  return <CloudflareConfigAlert />;
}

export function CloudflareSecurity() {
  return <CloudflareConfigAlert />;
}
