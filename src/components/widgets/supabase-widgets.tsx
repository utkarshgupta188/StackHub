'use client';

import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, Check, X, RefreshCw, Server, Shield, ExternalLink, Code } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function SupabaseConfigAlert({ message }: { message?: string }) {
  const { setActivePage } = usePlugins();
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full relative">
      <ShieldAlert className="w-8 h-8 text-orange-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">Supabase Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        {message || 'Connect your real Supabase Personal Access Token inside the Extensions preferences settings.'}
      </p>
      <button
        onClick={() => setActivePage('/plugins')}
        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-lg shadow-white/5 mt-4"
      >
        CONNECT SUPABASE
      </button>
    </div>
  );
}

export function SupabaseProjectDetails() {
  const [project, setProject] = useState<any>(null);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch('/api/supabase?type=project');
        if (res.ok) {
          const body = await res.json();
          setProject(body.project);
          setErrorState(false);
        } else {
          const body = await res.json();
          setErrorMessage(body.error || 'Failed to load project details.');
          setErrorState(true);
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Failed to load project details.');
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-zinc-400" /> FETCHING PROJECT TELEMETRY...
      </div>
    );
  }

  if (errorState) {
    return <SupabaseConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between font-mono text-xs text-zinc-300">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Database Console</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 text-[10px] leading-relaxed">
          <div className="p-2.5 rounded border border-zinc-900 bg-zinc-950/20">
            <span className="text-zinc-500 block text-[9px] font-bold">PROJECT NAME</span>
            <span className="text-zinc-200 font-bold text-[11px] truncate block mt-0.5">{project.name}</span>
          </div>

          <div className="p-2.5 rounded border border-zinc-900 bg-zinc-950/20">
            <span className="text-zinc-500 block text-[9px] font-bold">PROJECT REF / REGION</span>
            <span className="text-zinc-300 font-bold block mt-0.5 truncate uppercase">{project.ref} &bull; {project.region}</span>
          </div>

          <div className="col-span-2 p-2.5 rounded border border-zinc-900 bg-zinc-950/20 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-zinc-500 block text-[9px] font-bold">DATABASE API HOST</span>
              <span className="text-zinc-350 block mt-0.5 truncate font-mono text-[9px] pr-2 select-text">{project.db_host}</span>
            </div>
            <a 
              href={`https://supabase.com/dashboard/project/${project.ref}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-850 hover:text-zinc-100 rounded text-zinc-400 transition-colors shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupabaseEdgeFunctions() {
  const [functions, setFunctions] = useState<any[]>([]);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<Record<string, { status: string; latency: number }>>({});
  const { enabledWidgets } = usePlugins();

  const sbPlugin = enabledWidgets.find(w => w.pluginId === 'supabase');
  const projectRef = sbPlugin?.id ? 'projectRef' : ''; // placeholder check, we fetch ref via API anyway

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const res = await fetch('/api/supabase?type=functions');
        if (res.ok) {
          const body = await res.json();
          setFunctions(body.functions || []);
          setErrorState(false);
        } else {
          const body = await res.json();
          setErrorMessage(body.error || 'Failed to fetch functions.');
          setErrorState(true);
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Failed to fetch functions.');
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFunctions();
  }, []);

  const testPing = async (id: string, slug: string) => {
    setPingingId(id);
    try {
      // Find projectRef in config dynamically or fallback
      const dbRes = await fetch('/api/supabase?type=project');
      const dbData = await dbRes.json();
      const ref = dbData.project?.ref || 'mockref1234';

      const pingUrl = `https://${ref}.supabase.co/functions/v1/${slug}`;
      const res = await fetch(`/api/supabase?type=ping&url=${pingUrl}`);
      if (res.ok) {
        const data = await res.json();
        setPingResult(prev => ({
          ...prev,
          [id]: { 
            status: data.online ? 'ONLINE' : 'OFFLINE', 
            latency: data.latency 
          }
        }));
      } else {
        setPingResult(prev => ({
          ...prev,
          [id]: { status: 'OFFLINE', latency: 0 }
        }));
      }
    } catch (e) {
      setPingResult(prev => ({
        ...prev,
        [id]: { status: 'OFFLINE', latency: 0 }
      }));
    } finally {
      setPingingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-zinc-400" /> RETRIEVING EDGE FUNCTIONS...
      </div>
    );
  }

  if (errorState) {
    return <SupabaseConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Serverless Edge Functions</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-650">{functions.length} active</span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
          {functions.length === 0 ? (
            <div className="py-10 text-center text-zinc-650 text-[10px] font-sans">
              No deployed edge functions found.
            </div>
          ) : (
            functions.map(f => {
              const ping = pingResult[f.id];
              return (
                <div key={f.id} className="p-2.5 rounded border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-zinc-800 transition-all flex items-center justify-between text-xs font-mono">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <p className="font-semibold text-zinc-200 text-[11px] truncate max-w-[150px]">{f.name}</p>
                      <span className="text-[8px] bg-zinc-900 px-1 rounded text-zinc-500 font-bold">v{f.version}</span>
                    </div>
                    <p className="text-[8px] text-zinc-600 mt-1 font-mono truncate max-w-[200px]">
                      /functions/v1/{f.slug}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {ping ? (
                      <div className="text-right">
                        <span className={`text-[9px] font-bold block ${
                          ping.status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-500'
                        }`}>
                          {ping.status}
                        </span>
                        <span className="text-[8px] text-zinc-650 font-mono font-semibold">
                          {ping.status === 'ONLINE' ? `${ping.latency}ms` : 'OFFLINE'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-650 font-medium">Updated: {f.updated_at}</span>
                    )}

                    <button
                      disabled={pingingId === f.id}
                      onClick={() => testPing(f.id, f.slug)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                        pingingId === f.id
                          ? 'bg-zinc-900 border-zinc-900 text-zinc-600'
                          : 'bg-zinc-950/80 border-zinc-850 hover:bg-zinc-900 hover:text-zinc-200 text-zinc-400'
                      }`}
                    >
                      {pingingId === f.id ? (
                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-zinc-500" />
                      ) : (
                        'PING'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
