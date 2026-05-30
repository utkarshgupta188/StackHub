'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Settings, Sliders, Puzzle, KeyRound, Check, RefreshCw } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';
import { ALL_DEFAULT_PLUGINS } from '@/plugins/registry';

export default function PluginManager() {
  const { plugins, togglePlugin, updatePluginSetting } = usePlugins();
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(plugins[0]?.id || null);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  const activePlugin = plugins.find(p => p.id === selectedPluginId);

  const triggerSaveSetting = (pluginId: string, key: string, val: any) => {
    updatePluginSetting(pluginId, key, val);
    setSaveIndicator(key);
    setTimeout(() => setSaveIndicator(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left List of plugins */}
      <div className="lg:col-span-1 space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-2">
          Available Extensions
        </h2>
        {plugins.map(p => {
          const isSelected = selectedPluginId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPluginId(p.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-[115px] ${
                isSelected
                  ? 'bg-zinc-800/40 border-zinc-700/80 shadow-lg'
                  : 'bg-zinc-950/20 border-zinc-900/60 hover:bg-zinc-900/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 font-sans">{p.name}</h3>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 pr-4 font-sans leading-relaxed">
                    {p.description}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlugin(p.id);
                  }}
                  className="cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {p.enabled ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400 fill-emerald-500/10" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-900/20">
                <span>ID: {p.id}</span>
                <span className={`px-1.5 py-0.2 rounded border font-semibold ${
                  p.enabled
                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}>
                  {p.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Config Settings panel */}
      <div className="lg:col-span-2">
        {activePlugin ? (
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center">
                    <Sliders className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200 font-sans">
                      {activePlugin.name} Preferences
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Configure dynamic api tokens, endpoints, or sync updates variables.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Settings Fields */}
              <div className="space-y-6">
                {Object.entries(activePlugin.settings).map(([key, setting]) => {
                  const isSaved = saveIndicator === key;
                  return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-zinc-900/40 pb-5 last:border-b-0">
                      <div>
                        <label className="text-xs font-bold text-zinc-300 font-sans">
                          {setting.label}
                        </label>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Key: {key}
                        </p>
                      </div>

                      <div className="md:col-span-2 flex items-center gap-3">
                        {setting.type === 'select' ? (
                          <select
                            className="flex-1 bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-800"
                            value={setting.value}
                            onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.value)}
                          >
                            {setting.choices?.map(c => (
                              <option key={c} value={c}>
                                {c} seconds
                              </option>
                            ))}
                          </select>
                        ) : setting.type === 'boolean' ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={setting.value}
                              onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.checked)}
                              className="w-4 h-4 bg-zinc-950 border-zinc-900 rounded focus:ring-zinc-800 accent-zinc-100"
                            />
                            <span className="text-[11px] text-zinc-400 font-medium">Enable feature</span>
                          </div>
                        ) : (
                          <input
                            type={setting.type === 'password' ? 'password' : 'text'}
                            placeholder={setting.placeholder || 'Type config value...'}
                            className="flex-1 bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-800 font-mono"
                            value={setting.value}
                            onChange={(e) => triggerSaveSetting(activePlugin.id, key, e.target.value)}
                          />
                        )}

                        {/* Save indicator badge */}
                        <div className="w-16 flex items-center justify-start text-[10px] font-mono">
                          {isSaved ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> SAVED
                            </span>
                          ) : (
                            <span className="text-zinc-600 flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-zinc-600" /> SYNCED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 text-xs text-zinc-500 font-sans leading-relaxed mt-10">
              StackHub safely encrypts API tokens and config stores inside local sandbox partitions. Ensure variables match the corresponding service specification files.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-900 bg-[#09090b]/20 rounded-xl text-zinc-500 h-full text-center">
            <Puzzle className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-xs font-semibold">Select an extension to configure settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
