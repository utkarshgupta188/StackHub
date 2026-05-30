'use client';

import React from 'react';
import { LayoutDashboard, Puzzle, Settings, Terminal, Activity, LogOut, GitBranch, Cloud, Shield, Triangle } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';
import { useAuth } from '@/context/auth-context';

const PLUGIN_ICON_MAP: Record<string, React.ComponentType<any>> = {
  github: GitBranch,
  aws: Cloud,
  docker: Terminal,
  cloudflare: Shield,
  vercel: Triangle,
};

export default function Sidebar() {
  const { activePage, setActivePage, plugins } = usePlugins();
  const { user, signOut } = useAuth();

  const enabledCount = plugins.filter(p => p.enabled).length;
  const activePlugins = plugins.filter(p => p.enabled);

  const navigation = [
    { id: '/dashboard', name: 'Overview', icon: LayoutDashboard },
    { id: '/plugins', name: 'Extensions', icon: Puzzle, count: enabledCount },
    { id: '/settings', name: 'Profile Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-900/80 bg-[#050508]/85 backdrop-blur-xl flex flex-col justify-between h-full py-6 shrink-0 shadow-2xl relative">
      {/* Brand Header */}
      <div>
        <div className="px-6 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-zinc-100 flex items-center justify-center shadow-md shadow-white/5 shrink-0 relative group">
            <div className="absolute inset-0 bg-sky-400 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition-opacity" />
            <Terminal className="w-4 h-4 text-zinc-950 stroke-[2.5] relative z-10" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-zinc-100 font-sans tracking-wide">StackHub</h1>
            <p className="text-[9px] text-zinc-500 font-mono font-bold mt-0.5 tracking-widest">DEV OS v1.0.0</p>
          </div>
        </div>

        {/* Global Action Banner */}
        <div className="mx-4 mt-6 p-3 rounded-lg border border-zinc-900/60 bg-zinc-950/60 backdrop-blur shadow-inner">
          <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
            Press <kbd className="bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded font-black font-mono text-[9px] text-sky-400 shadow-sm">Ctrl+K</kbd> to launch Command Palette.
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="mt-8 px-3.5 space-y-1.5">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-zinc-850/50 border border-zinc-800 text-zinc-100 shadow-inner'
                    : 'text-zinc-550 hover:bg-zinc-900/40 hover:text-zinc-350 border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-sky-400 rounded-r-md animate-pulse shadow-[0_0_8px_#38bdf8]" />
                )}
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-zinc-550 group-hover:text-zinc-350'}`} />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                    isActive 
                      ? 'bg-sky-950/20 border-sky-900/40 text-sky-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workspace Active Dashboards */}
        {activePlugins.length > 0 && (
          <div className="mt-6 px-4">
            <span className="text-[9px] font-black text-zinc-550 font-mono tracking-widest uppercase block mb-2 px-2.5">
              Service Dashboards
            </span>
            <div className="space-y-1.5">
              {activePlugins.map(p => {
                const Icon = PLUGIN_ICON_MAP[p.id] || Puzzle;
                const isActive = activePage === `/dashboard/${p.id}`;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePage(`/dashboard/${p.id}`)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-zinc-850/50 border border-zinc-800 text-zinc-100 shadow-inner'
                        : 'text-zinc-550 hover:bg-zinc-900/40 hover:text-zinc-350 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 bg-sky-400 rounded-r-md animate-pulse shadow-[0_0_8px_#38bdf8]" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-sky-400' : 'text-zinc-550 group-hover:text-zinc-350'}`} />
                      <span className="truncate max-w-[120px]">{p.name}</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer User Info */}
      <div className="px-4">
        {user && (
          <div className="p-3.5 rounded-xl border border-zinc-900/70 bg-zinc-950/30 backdrop-blur shadow-lg flex flex-col gap-3.5 hover:border-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}
                  alt={user.name}
                  className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-200 truncate font-sans tracking-wide">{user.name}</p>
                <p className="text-[9px] text-zinc-500 truncate font-mono mt-0.5 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="w-full bg-zinc-900/50 hover:bg-zinc-900/90 text-zinc-400 hover:text-rose-450 border border-zinc-850 hover:border-zinc-800 py-2 rounded-lg text-[10px] font-extrabold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" /> SIGN OUT SESSION
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
