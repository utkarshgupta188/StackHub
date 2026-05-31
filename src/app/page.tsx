'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PluginProvider, usePlugins } from '@/context/plugin-context';
import { ThemeProvider } from '@/context/theme-context';
import Sidebar from '@/components/sidebar';
import DashboardGrid from '@/components/dashboard-grid';
import PluginManager from '@/components/plugin-manager';
import CommandPalette from '@/components/command-palette';
import AuthView from '@/components/auth-view';
import { Search, Activity, GitBranch, Cloud, Terminal, RefreshCw, Layers3, Bell, Clock3, Sparkles, Moon, Palette, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';


export default function Root() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PluginProvider>
          <AppContent />
        </PluginProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const TELEMETRY_DATA = [
  { name: '00:00', 'API Requests': 450, 'Build Times': 850, 'CPU Load': 42 },
  { name: '04:00', 'API Requests': 380, 'Build Times': 920, 'CPU Load': 38 },
  { name: '08:00', 'API Requests': 890, 'Build Times': 1200, 'CPU Load': 68 },
  { name: '12:00', 'API Requests': 1200, 'Build Times': 1100, 'CPU Load': 75 },
  { name: '16:00', 'API Requests': 1420, 'Build Times': 1050, 'CPU Load': 82 },
  { name: '20:00', 'API Requests': 950, 'Build Times': 900, 'CPU Load': 55 },
  { name: '24:00', 'API Requests': 600, 'Build Times': 880, 'CPU Load': 45 },
];

const SERVICE_BREAKDOWN = [
  { name: 'GitHub API', value: 35, color: '#0082f6' },
  { name: 'AWS Cloud', value: 28, color: '#10b981' },
  { name: 'Vercel CDN', value: 22, color: '#38bdf8' },
  { name: 'Docker / Edge', value: 15, color: '#8b5cf6' },
];

function AppContent() {
  const { user, loading, updateProfile } = useAuth();
  const { activePage, feed, plugins, enabledWidgets, runCommandAction, refreshAllData, togglePlugin, setActivePage, addFeedNotification } = usePlugins();

  // Profile Edit Local States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileRole, setProfileRole] = useState(user?.role || 'Full Stack Engineer');
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [quickActionState, setQuickActionState] = useState<string | null>(null);
  const [telemetryMetric, setTelemetryMetric] = useState<'API Requests' | 'Build Times' | 'CPU Load'>('API Requests');
  const [showNotifications, setShowNotifications] = useState(false);

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

  const dashboardPluginId = activePage.startsWith('/dashboard/') ? activePage.replace('/dashboard/', '') : undefined;
  const dashboardPluginName = dashboardPluginId ? plugins.find(p => p.id === dashboardPluginId)?.name || 'Service' : 'Overview';
  const enabledPluginCount = plugins.filter(p => p.enabled).length;
  const latestActivity = feed[0];

  const handleQuickAction = async (actionId: string, label: string) => {
    setQuickActionState(label);
    try {
      if (actionId === 'refresh') {
        await refreshAllData();
        return;
      }
      await runCommandAction(actionId, { setActivePage: () => void 0, refreshAllData });
    } catch (error: any) {
      console.error('Quick action failed:', error);
      if (addFeedNotification) {
        addFeedNotification({
          pluginId: actionId.split('-')[0], // Extract prefix e.g., github
          title: 'Action Disabled',
          description: `The '${label}' command is offline. Please enable the corresponding extension first.`,
          type: 'error',
        });
      }
    } finally {
      setTimeout(() => setQuickActionState(null), 1200);
    }
  };

  return (
    <div className="app-shell flex min-h-screen bg-background text-foreground h-screen overflow-hidden">
      {/* Dynamic Command Palette Overlay */}
      <CommandPalette />

      {/* Left Navigation Sidebar Panel */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-sidebar-border px-8 flex items-center justify-between shrink-0 bg-[#000000] z-20">
          {/* Search bar matching Screenshot 1 */}
          <div className="flex-1 max-w-xs md:max-w-md relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              readOnly
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              placeholder="Search anything..."
              className="w-full bg-[#0c0d12] border border-sidebar-border text-xs text-foreground placeholder-muted-foreground/60 rounded-lg pl-9 pr-12 py-2 focus:outline-none cursor-pointer hover:border-border/40 transition-colors"
            />
            <kbd className="absolute right-3 top-2.5 text-[9px] bg-[#161822] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono">⌘K</kbd>
          </div>

          {/* Right controls matching Screenshot 1 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActivePage('/plugins')}
              className="bg-[#0082f6] hover:bg-[#0072d6] text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>+ New Integration</span>
            </button>

            <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:block">
              <Moon className="w-4 h-4" />
            </button>
            
            <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:block">
              <Palette className="w-4 h-4" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative cursor-pointer text-muted-foreground hover:text-foreground focus:outline-none p-1 rounded-md hover:bg-zinc-900 transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                {feed.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 shadow-2xl z-50 border border-border/80 animate-fade-in text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3 shrink-0">
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Activity Signals</h3>
                      <p className="text-[10px] text-muted-foreground/80 font-normal mt-0.5">Unified Event Stream</p>
                    </div>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#0082f6] hover:underline font-mono font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-0.5">
                    {feed.length === 0 ? (
                      <div className="rounded-xl border border-border bg-muted/20 px-3 py-6 text-xs text-muted-foreground text-center font-mono leading-relaxed">
                        No event signals logged.
                      </div>
                    ) : (
                      feed.slice(0, 8).map(item => (
                        <div key={item.id} className="rounded-xl border border-border bg-[#090d20]/25 p-2.5 hover:border-border/85 transition-all text-xs">
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex gap-2 min-w-0">
                              <div className="mt-0.5 shrink-0">
                                {getFeedIcon(item.pluginId)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground truncate">{item.title}</p>
                                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[8px] font-mono text-muted-foreground/60">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                onClick={() => {
                                  setActivePage(`/dashboard/${item.pluginId}`);
                                  setShowNotifications(false);
                                }}
                                className="inline-flex items-center gap-0.5 rounded border border-border bg-[#0f121d] hover:bg-secondary px-1 py-0.5 text-[8.5px] font-semibold font-mono text-[#0082f6] cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0082f6] text-xs font-bold text-white cursor-pointer uppercase shrink-0" title={user.name}>
              {user.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content Shell */}
        <main className="flex-1 flex overflow-hidden relative z-10">
          {/* Main scroll container */}
          <div className="flex-1 overflow-y-auto px-8 md:px-10 py-8 scrollbar-thin">
            {activePage.startsWith('/dashboard') && (
              <div className="space-y-8 animate-fade-in">
                {/* Dashboard Page Header matching Screenshot 1 */}
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Welcome back, {user.name}. Here's what's happening with your developer stack today.
                  </p>
                </div>

                <div className="space-y-8">
                    {/* Stat Metrics Grid with Sparklines matching Screenshot 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Card 1: Plugins Connected */}
                      <div className="glass-card rounded-2xl p-5.5 pb-0 flex flex-col justify-between overflow-hidden relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Plugins Connected</p>
                            <p className="text-3xl font-extrabold text-foreground mt-2">{enabledPluginCount}</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              <span>↗ +12.5%</span> <span className="text-muted-foreground/60 font-normal">vs last month</span>
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1b3d] text-[#0082f6] shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        </div>
                        {/* Mini Sparkline Chart */}
                        <div className="h-[35px] w-full mt-5 -mx-5.5 overflow-hidden shrink-0">
                          <ResponsiveContainer width="112%" height="100%">
                            <AreaChart data={[{v:1},{v:2},{v:1.5},{v:3},{v:2.5},{v:4},{v:3.5},{v:5}]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorPlugins" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0082f6" stopOpacity={0.12}/>
                                  <stop offset="95%" stopColor="#0082f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke="#0082f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPlugins)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Card 2: Active Panels */}
                      <div className="glass-card rounded-2xl p-5.5 pb-0 flex flex-col justify-between overflow-hidden relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Active Panels</p>
                            <p className="text-3xl font-extrabold text-foreground mt-2">{enabledWidgets.length}</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              <span>↗ +8.2%</span> <span className="text-muted-foreground/60 font-normal">vs last month</span>
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#092621] text-[#10b981] shrink-0">
                            <Layers3 className="w-5 h-5" />
                          </div>
                        </div>
                        {/* Mini Sparkline Chart */}
                        <div className="h-[35px] w-full mt-5 -mx-5.5 overflow-hidden shrink-0">
                          <ResponsiveContainer width="112%" height="100%">
                            <AreaChart data={[{v:3},{v:5},{v:4},{v:8},{v:6},{v:10},{v:9},{v:12}]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorWidgets" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.12}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorWidgets)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Card 3: Recent Signals */}
                      <div className="glass-card rounded-2xl p-5.5 pb-0 flex flex-col justify-between overflow-hidden relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground">Recent Signals</p>
                            <p className="text-3xl font-extrabold text-foreground mt-2">{feed.length}</p>
                            <p className="text-[10px] text-rose-500 font-semibold mt-2 flex items-center gap-1">
                              <span>↘ -3.1%</span> <span className="text-muted-foreground/60 font-normal">vs last month</span>
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1438] text-[#8b5cf6] shrink-0">
                            <Bell className="w-5 h-5" />
                          </div>
                        </div>
                        {/* Mini Sparkline Chart */}
                        <div className="h-[35px] w-full mt-5 -mx-5.5 overflow-hidden shrink-0">
                          <ResponsiveContainer width="112%" height="100%">
                            <AreaChart data={[{v:8},{v:7},{v:6},{v:5},{v:4},{v:4.5},{v:3},{v:3.2}]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.12}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorEvents)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Card 4: API Sync Rate */}
                      <div className="glass-card rounded-2xl p-5.5 pb-0 flex flex-col justify-between overflow-hidden relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground">API Sync Rate</p>
                            <p className="text-3xl font-extrabold text-foreground mt-2">{latestActivity ? '99.9%' : 'Standby'}</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              <span>↗ +24.7%</span> <span className="text-muted-foreground/60 font-normal">vs last month</span>
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b2210] text-[#f59e0b] shrink-0">
                            <Clock3 className="w-5 h-5" />
                          </div>
                        </div>
                        {/* Mini Sparkline Chart */}
                        <div className="h-[35px] w-full mt-5 -mx-5.5 overflow-hidden shrink-0">
                          <ResponsiveContainer width="112%" height="100%">
                            <AreaChart data={[{v:2},{v:4},{v:5},{v:4},{v:7},{v:6},{v:8},{v:10}]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorStatus)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Developer-focused telemetry & load charts */}
                    {!dashboardPluginId && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* System Activity Overview */}
                        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between lg:col-span-2">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-base font-bold text-foreground">System Activity</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">Continuous telemetry and stack network loads</p>
                            </div>
                            <div className="flex bg-[#090a0f] p-1 rounded-lg border border-border">
                              {(['API Requests', 'Build Times', 'CPU Load'] as const).map((metric) => (
                                <button
                                  key={metric}
                                  onClick={() => setTelemetryMetric(metric)}
                                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                    telemetryMetric === metric
                                      ? 'bg-[#12141c] text-foreground border border-border/50 shadow-sm'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {metric === 'Build Times' ? 'Build Times' : metric === 'CPU Load' ? 'CPU Load' : 'API Requests'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={TELEMETRY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorTelemetry" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={telemetryMetric === 'API Requests' ? '#0082f6' : telemetryMetric === 'Build Times' ? '#10b981' : '#8b5cf6'} stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor={telemetryMetric === 'API Requests' ? '#0082f6' : telemetryMetric === 'Build Times' ? '#10b981' : '#8b5cf6'} stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => telemetryMetric === 'Build Times' ? `${v}ms` : telemetryMetric === 'CPU Load' ? `${v}%` : v} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0e1017', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                                  labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                                  itemStyle={{ color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey={telemetryMetric}
                                  stroke={telemetryMetric === 'API Requests' ? '#0082f6' : telemetryMetric === 'Build Times' ? '#10b981' : '#8b5cf6'}
                                  strokeWidth={2}
                                  fillOpacity={1}
                                  fill="url(#colorTelemetry)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Service Load Pie */}
                        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-bold text-foreground">Service Load</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Distribution of active workspace traffic</p>
                          </div>
                          
                          <div className="flex items-center justify-between my-4">
                            <div className="h-[130px] w-[130px] relative shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={SERVICE_BREAKDOWN}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={42}
                                    outerRadius={55}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {SERVICE_BREAKDOWN.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-lg font-extrabold text-foreground">Dev OS</span>
                                <span className="text-[9px] uppercase tracking-wider text-[#10b981] font-mono font-bold">ONLINE</span>
                              </div>
                            </div>

                            <div className="flex-1 pl-4 space-y-2">
                              {SERVICE_BREAKDOWN.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 rounded-full h-2" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground font-medium">{entry.name}</span>
                                  </div>
                                  <span className="font-bold text-foreground">{entry.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-border/50 pt-4 mt-2">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-foreground">SLA System Uptime</span>
                              <span className="font-mono text-emerald-400 font-semibold">99.9% active</span>
                            </div>
                            <div className="w-full bg-[#090a0f] h-2 rounded-full overflow-hidden border border-border">
                              <div className="bg-[#10b981] h-full rounded-full" style={{ width: '99.9%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <DashboardGrid pluginId={dashboardPluginId} />
                  </div>
                </div>
              )}

            {activePage === '/plugins' && (
              <div className="space-y-6 max-w-7xl">
                <div className="relative p-6 md:p-8 rounded-2xl border border-sidebar-border overflow-hidden bg-gradient-to-br from-[#0c1228]/80 to-[#070914]/90 backdrop-blur-xl mb-6">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                    Workspace Extensions
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    Activate third-party server widgets, connect API credentials, and expand your workspace capabilities.
                  </p>
                </div>
                <PluginManager />
              </div>
            )}

            {activePage === '/settings' && (
              <div className="max-w-2xl space-y-6">
                <div className="relative p-6 md:p-8 rounded-2xl border border-sidebar-border overflow-hidden bg-gradient-to-br from-[#0c1228]/80 to-[#070914]/90 backdrop-blur-xl mb-6">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                    Profile Settings
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    Manage your developer profile details and workspace credentials.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-muted/40 border border-sidebar-border text-xs text-muted-foreground/80 rounded-xl px-4 py-3 cursor-not-allowed font-mono"
                      value={user.email}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                      Workspace Nickname
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#080c1a] border border-sidebar-border text-xs text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all font-semibold"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                      System Developer Role
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#080c1a] border border-sidebar-border text-xs text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all font-semibold"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all duration-100 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 active:scale-98"
                  >
                    {saveIndicator ? 'Saved successfully!' : 'Update profile info'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
