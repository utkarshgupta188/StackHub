'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Settings, Sliders, Puzzle, KeyRound, Check, RefreshCw, Code, Download, Play } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

export default function PluginManager() {
  const { plugins, togglePlugin, updatePluginSetting, refreshAllData } = usePlugins();
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(plugins[0]?.id || null);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'sdk'>('settings');
  const [manifestText, setManifestText] = useState(JSON.stringify({
    id: "custom-telemetry",
    name: "Custom Telemetry SDK",
    description: "Locally built SDK plugin for tracking microservice latency.",
    icon: "puzzle",
    settings: {
      api_endpoint: {
        label: "REST Ingestion URL",
        type: "text",
        value: "http://localhost:8080/ingest"
      },
      refresh_speed: {
        label: "Sync speed seconds",
        type: "select",
        choices: ["10", "30", "60"],
        value: "30"
      }
    },
    widgets: [
      {
        id: "telemetry-speed",
        title: "Service Latency",
        size: "sm",
        component: "VercelProjects"
      }
    ],
    commands: []
  }, null, 2));

  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const activePlugin = plugins.find(p => p.id === selectedPluginId);

  const triggerSaveSetting = (pluginId: string, key: string, val: any) => {
    updatePluginSetting(pluginId, key, val);
    setSaveIndicator(key);
    setTimeout(() => setSaveIndicator(null), 1500);
  };

  const handleInstallPlugin = async () => {
    setInstallStatus("Syncing...");
    try {
      const parsed = JSON.parse(manifestText);
      if (!parsed.id || !parsed.name) {
        throw new Error("Plugin ID and Name are required fields.");
      }

      const res = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'installPlugin',
          pluginManifest: parsed
        })
      });

      if (res.ok) {
        setInstallStatus("Success! Plugin installed.");
        await refreshAllData();
        setSelectedPluginId(parsed.id);
        setActiveTab('settings');
      } else {
        setInstallStatus("Installation failed via REST API.");
      }
    } catch (e: any) {
      setInstallStatus(`Error: ${e.message || 'Invalid JSON syntax.'}`);
    }
    setTimeout(() => setInstallStatus(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] gap-6 animate-fade-in">
      {/* Left List of plugins */}
      <div className="space-y-3.5">
        <div className="relative p-5 rounded-2xl border border-sidebar-border bg-[#0c1228]/85 backdrop-blur-xl">
          <h2 className="text-[10px] font-bold text-primary font-mono uppercase tracking-[0.2em] mb-2">
            Available Stack Tools
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Toggle connected plugins to spin up automatic metric scrapers and telemetry monitors in your main Dashboard grid.
          </p>
        </div>
        
        {plugins.map(p => {
          const isSelected = selectedPluginId === p.id && activeTab === 'settings';
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPluginId(p.id);
                setActiveTab('settings');
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[125px] relative overflow-hidden ${
                isSelected
                  ? 'bg-[#0e142a]/90 border-primary shadow-lg shadow-primary/5'
                  : 'bg-[#090d20]/50 border-sidebar-border hover:border-border hover:bg-[#0c1228]/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-4">
                  <h3 className="text-xs font-bold text-foreground truncate">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-normal">
                    {p.description}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlugin(p.id);
                  }}
                  className="cursor-pointer transition-all shrink-0 active:scale-95"
                >
                  {p.enabled ? (
                    <ToggleRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono pt-3.5 border-t border-sidebar-border mt-3">
                <span>SLOT: {p.id.toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-md border font-bold ${
                  p.enabled
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/25'
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {p.enabled ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Install Custom SDK Plugin Option */}
        <div
          onClick={() => setActiveTab('sdk')}
          className={`p-5 rounded-2xl border border-dashed cursor-pointer transition-all duration-200 flex flex-col justify-center items-center min-h-[100px] ${
            activeTab === 'sdk'
              ? 'bg-[#10b981]/5 border-primary'
              : 'border-sidebar-border hover:border-primary/50 bg-[#090d20]/20'
          }`}
        >
          <Code className="w-5 h-5 text-primary mb-2" />
          <span className="text-xs font-bold text-foreground">Developer SDK sandbox</span>
          <span className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">Install Custom Extensions</span>
        </div>
      </div>

      {/* Right Config Settings / SDK manifest panel */}
      <div>
        {activeTab === 'sdk' ? (
          /* Developer SDK Tab */
          <div className="glass-card rounded-2xl p-6 md:p-8 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-[180px] h-[180px] bg-primary/5 rounded-full blur-[50px] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-sidebar-border pb-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Code className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground">
                      Developer SDK Sandbox
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Paste a JSON plugin manifest to compile and install your own developer stack integration!
                    </p>
                  </div>
                </div>
              </div>

              {/* Manifest Textarea Editor */}
              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">
                    Plugin Manifest JSON Schema
                  </label>
                  <textarea
                    rows={12}
                    className="w-full bg-[#080c1a] border border-sidebar-border text-xs text-foreground font-mono rounded-xl p-4 focus:outline-none focus:border-primary/50 transition-all leading-relaxed"
                    value={manifestText}
                    onChange={(e) => setManifestText(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleInstallPlugin}
                  className="w-full bg-primary hover:bg-[#0d9668] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-150 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 active:scale-98"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  {installStatus ? installStatus : 'Compile & Install Custom Extension'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-sidebar-border bg-[#070b1c]/70 text-[10px] text-muted-foreground/80 leading-relaxed mt-8 relative z-10 font-mono">
              💡 Any stack tool built using the StackHub Plugin SDK standard will integrate with settings, dashboards, widgets, and the command palettes automatically.
            </div>
          </div>
        ) : activePlugin ? (
          /* Standard settings Tab */
          <div className="glass-card rounded-2xl p-6 md:p-8 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-[180px] h-[180px] bg-primary/5 rounded-full blur-[50px] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-sidebar-border pb-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground">
                      {activePlugin.name} Credentials & Settings
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Configure secure environment headers and cluster metrics synchronization intervals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Settings Fields */}
              <div className="space-y-4 relative z-10">
                {Object.keys(activePlugin.settings).length === 0 ? (
                  <div className="py-10 text-center text-[11px] text-muted-foreground/60 font-mono">
                    No sync credentials required for this stack integration.
                  </div>
                ) : (
                  Object.entries(activePlugin.settings).map(([key, setting]) => {
                    const isSaved = saveIndicator === key;
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-4 items-center border-b border-sidebar-border/60 pb-4 last:border-b-0">
                        <div>
                          <label className="text-xs font-bold text-foreground">
                            {setting.label}
                          </label>
                          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            ID: {key}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {setting.type === 'select' ? (
                            <select
                              className="flex-1 bg-[#080c1a] border border-sidebar-border text-xs text-foreground font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/50 transition-all"
                              value={setting.value}
                              onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.value)}
                            >
                              {setting.choices?.map(c => (
                                <option key={c} value={c}>
                                  {c} seconds interval
                                </option>
                              ))}
                            </select>
                          ) : setting.type === 'boolean' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={setting.value}
                                onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.checked)}
                                className="w-4 h-4 bg-[#080c1a] border-sidebar-border rounded focus:ring-primary accent-primary"
                              />
                              <span className="text-[10px] text-muted-foreground font-semibold">Enable telemetry worker</span>
                            </div>
                          ) : (
                            <input
                              type={setting.type === 'password' ? 'password' : 'text'}
                              placeholder={setting.placeholder || 'Type secure parameter...'}
                              className="flex-1 bg-[#080c1a] border border-sidebar-border text-xs text-foreground font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 transition-all font-mono"
                              value={setting.value}
                              onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.value)}
                            />
                          )}

                          {/* Save indicator badge */}
                          <div className="w-16 flex items-center justify-start text-[9px] font-mono shrink-0">
                            {isSaved ? (
                              <span className="text-primary flex items-center gap-1 font-bold">
                                <Check className="w-3.5 h-3.5 shrink-0" /> SAVED
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 flex items-center gap-1 font-semibold">
                                <KeyRound className="w-3 h-3 text-muted-foreground/50 shrink-0" /> SYNCED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-sidebar-border bg-[#070b1c]/70 text-[10px] text-muted-foreground/80 leading-relaxed mt-8 relative z-10 font-mono">
              🔑 Cryptographic session variables are cached strictly inside your local browser storage context. No metrics are synchronized to off-system servers.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-sidebar-border bg-[#090d20]/30 rounded-2xl text-muted-foreground h-full text-center">
            <Puzzle className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-xs font-bold text-foreground">Select an extension plugin to tune settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
