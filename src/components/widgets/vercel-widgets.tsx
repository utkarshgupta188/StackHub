'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Triangle, ShieldAlert, GitBranch, Link, ExternalLink, X, HelpCircle, Globe, Rocket, Layers3, ArrowUpRight, RefreshCw, CircleDotDashed, BadgeCheck, Clock3 } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function VercelConfigAlert() {
  const { setActivePage } = usePlugins();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full relative">
      <ShieldAlert className="w-8 h-8 text-indigo-400 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">Vercel Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        Connect your real Vercel Auth Token and Project ID inside the Extensions preference settings.
      </p>
      
      <div className="flex items-center gap-2 mt-4 shrink-0">
        <button
          onClick={() => setActivePage('/plugins')}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          CONNECT VERCEL
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-2.5 py-1.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer font-mono"
        >
          <HelpCircle className="w-3.5 h-3.5" /> HOW TO GET KEY
        </button>
      </div>

      {/* Steps Popup Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-md glass-panel border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Triangle className="w-4 h-4 text-zinc-100" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  How to generate Vercel Token
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 hover:bg-zinc-900 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Content */}
            <div className="overflow-y-auto p-5 text-left text-xs text-zinc-300 font-sans space-y-4 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">1</span>
                <div>
                  <p className="font-semibold text-zinc-100">Access Personal Tokens Settings</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Log in to your Vercel Dashboard. Navigate to your **Account Settings** (click your avatar at top right &rarr; Settings) and click **Tokens** in the left sidebar.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">2</span>
                <div>
                  <p className="font-semibold text-zinc-100">Generate Auth Token</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Enter a descriptive name (e.g. `StackHub-Workspace`), select the scope profile as requested, and click **Create**. Copy the generated token string (`sec_...`).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">3</span>
                <div>
                  <p className="font-semibold text-zinc-100">Locate Project ID</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Open your specific Vercel project dashboard, go to **Project Settings**, scroll down on the General page, and copy your **Project ID** (`prj_...`).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">4</span>
                <div>
                  <p className="font-semibold text-zinc-100">Configure StackHub settings</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Navigate back to StackHub Extensions, choose Vercel, and paste both Vercel Auth Token and Project ID parameters inside settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-900 bg-[#060608]/80 flex justify-end shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4.5 py-2 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VercelDeployments() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        const res = await fetch('/api/vercel?type=deployments');
        if (res.ok) {
          const body = await res.json();
          setDeployments(body.deployments || []);
          setErrorState(false);
        } else {
          setErrorState(true);
        }
      } catch {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    loadDeployments();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-6 text-zinc-500 gap-1.5 font-mono text-[10px] h-full"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING PROJECT DEPLOYMENTS...</div>;
  }

  if (errorState) {
    return <VercelConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2 overflow-y-auto max-h-[230px] pr-1">
        {deployments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <CircleDotDashed className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-medium">No recent deployments found</p>
          </div>
        ) : (
          deployments.map(deployment => (
            <div key={deployment.id} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Rocket className="w-4 h-4 text-indigo-300 shrink-0" />
                    <p className="font-semibold text-zinc-200 line-clamp-1">{deployment.projectName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-zinc-400 font-semibold">{deployment.state}</span>
                    <span>•</span>
                    <span>{deployment.target}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{deployment.createdAt ? new Date(deployment.createdAt).toLocaleString() : 'Live'}</span>
                  </div>
                </div>
                <a
                  href={deployment.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!deployment.url}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                    deployment.url
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-900 text-zinc-600 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  Open <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function VercelProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/vercel?type=projects');
        if (res.ok) {
          const body = await res.json();
          setProjects(body.projects || []);
          setErrorState(false);
        } else {
          setErrorState(true);
        }
      } catch {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const totals = useMemo(() => {
    const live = projects.filter(project => project.live).length;
    const paused = projects.filter(project => project.paused).length;
    const domains = projects.reduce((sum, project) => sum + (project.domainCount || 0), 0);
    return { live, paused, domains };
  }, [projects]);

  if (loading) {
    return <div className="flex items-center justify-center py-6 text-zinc-500 gap-1.5 font-mono text-[10px] h-full"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING PROJECTS...</div>;
  }

  if (errorState) {
    return <VercelConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Projects</p>
          <p className="text-sm font-semibold text-zinc-100 mt-1">{projects.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Live</p>
          <p className="text-sm font-semibold text-emerald-300 mt-1">{totals.live}</p>
        </div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Domains</p>
          <p className="text-sm font-semibold text-indigo-300 mt-1">{totals.domains}</p>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[210px] pr-1">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Layers3 className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No Vercel projects found</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BadgeCheck className="w-4 h-4 text-indigo-300 shrink-0" />
                    <p className="font-semibold text-zinc-200 line-clamp-1">{project.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-zinc-400 font-semibold">{project.framework}</span>
                    <span>•</span>
                    <span>{project.productionBranch}</span>
                    <span>•</span>
                    <span>{project.latestDeployment ? project.latestDeployment.state : 'No deployment yet'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(project.domains || []).slice(0, 3).map((domain: string) => (
                      <span key={domain} className="px-1.5 py-0.5 rounded border border-indigo-400/10 text-[9px] font-mono text-indigo-300 bg-indigo-950/20">
                        {domain}
                      </span>
                    ))}
                    {(project.domains || []).length === 0 && (
                      <span className="text-[10px] text-zinc-500 font-mono">No custom domains assigned</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-zinc-500 shrink-0">
                  <p>{project.live ? 'Live' : project.paused ? 'Paused' : 'Inactive'}</p>
                  <p>{project.domainCount} domain{project.domainCount === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function VercelDomains() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/vercel?type=projects');
        if (res.ok) {
          const body = await res.json();
          setProjects(body.projects || []);
          setErrorState(false);
        } else {
          setErrorState(true);
        }
      } catch {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-6 text-zinc-500 gap-1.5 font-mono text-[10px] h-full"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING DOMAINS...</div>;
  }

  if (errorState) {
    return <VercelConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2 overflow-y-auto max-h-[230px] pr-1">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Globe className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No project domains found</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe className="w-4 h-4 text-indigo-300 shrink-0" />
                    <p className="font-semibold text-zinc-200 line-clamp-1">{project.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.domains || []).length > 0 ? project.domains.slice(0, 4).map((domain: string) => (
                      <span key={domain} className="px-1.5 py-0.5 rounded border border-indigo-400/10 text-[9px] font-mono text-indigo-300 bg-indigo-950/20">
                        {domain}
                      </span>
                    )) : (
                      <span className="text-[10px] text-zinc-500 font-mono">No custom domains assigned</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-zinc-500 shrink-0">
                  <p>{project.domainCount} domain{project.domainCount === 1 ? '' : 's'}</p>
                  <p>{project.live ? 'Live' : project.paused ? 'Paused' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
