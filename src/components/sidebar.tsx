'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Puzzle, Settings, Terminal, LogOut, GitBranch, Cloud, Shield, Triangle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(false);
  const { activePage, setActivePage, plugins } = usePlugins();
  const { user, signOut } = useAuth();

  const enabledCount = plugins.filter(p => p.enabled).length;
  const activePlugins = plugins.filter(p => p.enabled);

  return (
    <aside className={`border-r border-sidebar-border bg-[#090a0f] flex flex-col justify-between h-full py-4 shrink-0 relative transition-all duration-300 ease-in-out z-30 ${collapsed ? 'w-16' : 'w-[260px]'}`}>
      <div>
        {/* Sidebar Header Logo */}
        <div className={`h-16 flex items-center gap-3 px-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10b981]">
            <Terminal className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">StackHub</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Dashboard</span>
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <nav role="navigation" className="flex-1 space-y-4 px-3 py-4">
          
          {/* Overview Section */}
          <div>
            {!collapsed ? (
              <button className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-muted-foreground/60">
                <span className="flex-1 text-start">Overview</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/40" />
              </button>
            ) : (
              <div className="h-4" />
            )}
            
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => setActivePage('/dashboard')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative group ${
                  activePage === '/dashboard'
                    ? 'bg-[#10b981]/15 text-[#10b981]'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                }`}
              >
                <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${activePage === '/dashboard' ? 'text-[#10b981]' : 'text-muted-foreground/50 group-hover:text-foreground/80'}`} />
                {!collapsed && <span className="flex-1 text-left">Dashboard</span>}
              </button>

              <button
                onClick={() => setActivePage('/plugins')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative group ${
                  activePage === '/plugins'
                    ? 'bg-[#10b981]/15 text-[#10b981]'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                }`}
              >
                <Puzzle className={`w-4.5 h-4.5 shrink-0 ${activePage === '/plugins' ? 'text-[#10b981]' : 'text-muted-foreground/50 group-hover:text-foreground/80'}`} />
                {!collapsed && <span className="flex-1 text-left">Extensions</span>}
                {!collapsed && enabledCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#10b981]/15 px-1.5 text-[10px] font-semibold text-[#10b981]">
                    {enabledCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Service Dashboards Section */}
          {activePlugins.length > 0 && (
            <div>
              {!collapsed && (
                <button className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-muted-foreground/60">
                  <span className="flex-1 text-start">Services</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground/40" />
                </button>
              )}
              <div className="mt-1 space-y-0.5">
                {activePlugins.map(p => {
                  const Icon = PLUGIN_ICON_MAP[p.id] || Puzzle;
                  const isPageActive = activePage === `/dashboard/${p.id}`;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePage(`/dashboard/${p.id}`)}
                      className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative group ${
                        isPageActive
                          ? 'bg-[#10b981]/15 text-[#10b981]'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isPageActive ? 'text-[#10b981]' : 'text-muted-foreground/50 group-hover:text-foreground/80'}`} />
                      {!collapsed && <span className="flex-1 text-left truncate">{p.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings Section */}
          <div>
            {!collapsed && (
              <button className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-muted-foreground/60">
                <span className="flex-1 text-start">System</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/40" />
              </button>
            )}
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => setActivePage('/settings')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative group ${
                  activePage === '/settings'
                    ? 'bg-[#10b981]/15 text-[#10b981]'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                }`}
              >
                <Settings className={`w-4.5 h-4.5 shrink-0 ${activePage === '/settings' ? 'text-[#10b981]' : 'text-muted-foreground/50 group-hover:text-foreground/80'}`} />
                {!collapsed && <span className="flex-1 text-left">Settings</span>}
              </button>
            </div>
          </div>

        </nav>
      </div>

      {/* Sidebar Footer User Info */}
      <div className="border-t border-sidebar-border p-3">
        {user && (
          <div className="flex items-center gap-2">
            {!collapsed ? (
              <>
                <div className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981]/80 to-[#10b981] text-[11px] font-bold text-white uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  aria-label="Log out"
                  className="rounded-md p-1.5 text-muted-foreground/50 hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="rounded-md p-1.5 text-muted-foreground/50 hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Circular Collapse Arrow Toggler Button */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        aria-label="Collapse sidebar"
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-[#090a0f] text-muted-foreground hover:text-foreground shadow-md transition-all hover:bg-secondary focus-visible:outline-none cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}


