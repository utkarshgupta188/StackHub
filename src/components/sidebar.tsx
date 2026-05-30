'use client';

import React from 'react';
import { LayoutDashboard, Puzzle, Settings, Terminal, Activity, LogOut, TerminalSquare, Compass } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';
import { useAuth } from '@/context/auth-context';

export default function Sidebar() {
  const { activePage, setActivePage, plugins } = usePlugins();
  const { user, signOut } = useAuth();

  const enabledCount = plugins.filter(p => p.enabled).length;

  const navigation = [
    { id: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: '/plugins', name: 'Extensions', icon: Puzzle, count: enabledCount },
    { id: '/settings', name: 'Profile Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-900 bg-[#060608] flex flex-col justify-between h-full py-6 shrink-0">
      {/* Header Brand */}
      <div>
        <div className="px-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
            <Terminal className="w-4 h-4 text-zinc-950 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-zinc-100 font-sans">StackHub</h1>
            <p className="text-[10px] text-zinc-500 font-mono font-medium mt-0.5">DEV OS V1.0</p>
          </div>
        </div>

        {/* Global Action Banner */}
        <div className="mx-4 mt-6 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40">
          <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
            Press <kbd className="bg-zinc-900 px-1 py-0.2 border border-zinc-800 rounded font-bold font-mono text-[9px] text-zinc-300">Ctrl+K</kbd> to launch Command Palette.
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="mt-8 px-3 space-y-1">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/60 text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[9px] font-bold font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-500">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="px-4">
        {user && (
          <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}
                alt={user.name}
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate font-sans">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">{user.role}</p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="w-full bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-850 hover:border-zinc-800/80 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out Session
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
