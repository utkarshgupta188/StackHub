'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PluginProvider, usePlugins } from '@/context/plugin-context';
import Sidebar from '@/components/sidebar';
import DashboardGrid from '@/components/dashboard-grid';
import PluginManager from '@/components/plugin-manager';
import CommandPalette from '@/components/command-palette';
import AuthView from '@/components/auth-view';
import { Search, Activity, GitBranch, Cloud, Terminal, User, Sparkles, Bell } from 'lucide-react';

export default function Root() {
  return (
    <AuthProvider>
      <PluginProvider>
        <AppContent />
      </PluginProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, updateProfile } = useAuth();
  const { activePage, feed, plugins } = usePlugins();

  // Profile Edit Local States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileRole, setProfileRole] = useState(user?.role || 'Full Stack Engineer');
  const [saveIndicator, setSaveIndicator] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Terminal className="w-8 h-8 text-zinc-400 animate-pulse" />
          <p className="text-xs font-mono text-zinc-500">BOOTING STACKHUB DEVELOPER OS...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <AuthView />;
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileName || user.name, profileRole || user.role);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const getFeedIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'github': return <GitBranch className="w-3.5 h-3.5 text-zinc-400" />;
      case 'aws': return <Cloud className="w-3.5 h-3.5 text-sky-400" />;
      case 'docker': return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground h-screen overflow-hidden">
      {/* Dynamic Command Palette Overlay */}
      <CommandPalette />

      {/* Left Navigation Sidebar Panel */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global Toolbar Header */}
        <header className="h-16 border-b border-zinc-900 px-8 flex items-center justify-between shrink-0 bg-[#030303]/40 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 font-mono tracking-wider uppercase">
              WORKSPACE: DEFAULT_POOL
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Clickable command prompt trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="glass-panel border border-zinc-900 px-3.5 py-1.5 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-2 cursor-pointer hover:border-zinc-800/80"
            >
              <span>Search commands...</span>
              <kbd className="bg-zinc-950 border border-zinc-900 px-1 py-0.2 rounded font-bold font-mono text-[9px] text-zinc-500">
                Ctrl+K
              </kbd>
            </button>
            
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System operational" />
          </div>
        </header>

        {/* Dynamic Route Content Shell */}
        <main className="flex-1 flex overflow-hidden">
          {/* Main scroll container */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {activePage === '/dashboard' && (
              <div className="space-y-6">
                {/* Hero Workspace Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-900/60">
                  <div>
                    <h2 className="text-lg font-black text-zinc-100 tracking-tight font-sans">
                      Developer Command Dashboard
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-1">
                      Monitor server fleets, container states, S3 bucket storage sizes, and git logs.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Tagline: "Your Developer Stack. One Hub."</span>
                  </div>
                </div>

                {/* Dashboard grid panel containing dynamically toggleable widget components */}
                <DashboardGrid />
              </div>
            )}

            {activePage === '/plugins' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 tracking-tight font-sans">
                    Workspace Extensions
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans mt-1">
                    Extend workspace capabilities by activating modular plugins and configuring API secrets.
                  </p>
                </div>
                <PluginManager />
              </div>
            )}

            {activePage === '/settings' && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 tracking-tight font-sans">
                    Profile Preferences
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans mt-1">
                    Manage your profile card and system role options inside the developer workspace.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="glass-panel border border-zinc-900 p-6 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-zinc-950/60 border border-zinc-900 text-xs text-zinc-650 rounded-xl px-4 py-3 cursor-not-allowed font-mono"
                      value={user.email}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                      Workspace Nickname
                    </label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-800"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                      System Developer Role
                    </label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-800"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold py-3 px-4 rounded-xl transition-all duration-100 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
                  >
                    {saveIndicator ? 'Saved successfully!' : 'Update profile'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Activities Log Feed pane - only in dashboard route */}
          {activePage === '/dashboard' && (
            <div className="w-80 border-l border-zinc-900 bg-[#060608]/40 overflow-y-auto px-6 py-6 hidden xl:block shrink-0">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-900 mb-6 justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-zinc-300 font-sans tracking-wide uppercase">
                    Recent Activities Feed
                  </h3>
                </div>
                <span className="text-[9px] font-bold font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                  LIVE
                </span>
              </div>

              {/* Feed items list container */}
              <div className="space-y-4">
                {feed.map(item => (
                  <div key={item.id} className="group relative pl-5 text-xs">
                    {/* Activity Feed Bullet Anchor Line */}
                    <div className="absolute left-1.5 top-2.5 bottom-0 w-0.5 bg-zinc-900 group-last:bg-transparent" />
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#060608] border-2 border-zinc-800 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    </div>

                    <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-lg p-2.5 hover:border-zinc-800 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                          {getFeedIcon(item.pluginId)}
                          <span className="font-sans line-clamp-1">{item.title}</span>
                        </div>
                        <span className="text-[9px] text-zinc-600 shrink-0 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-sans font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
