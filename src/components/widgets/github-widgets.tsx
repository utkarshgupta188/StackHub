'use client';

import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitBranch, FolderGit, Star, GitFork, AlertCircle, FileCode, CheckCircle2, Eye, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function GithubConfigAlert() {
  const { setActivePage } = usePlugins();
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full">
      <ShieldAlert className="w-8 h-8 text-amber-500/80 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">GitHub API Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        Please configure your real GitHub Personal Access Token (PAT) inside Settings.
      </p>
      <button
        onClick={() => setActivePage('/plugins')}
        className="mt-3.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer border border-zinc-700/30"
      >
        CONNECT GITHUB PAT
      </button>
    </div>
  );
}

export function GithubPullRequests() {
  const { refreshAllData } = usePlugins();
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  const fetchPrs = async () => {
    try {
      const res = await fetch('/api/github?type=prs');
      if (res.ok) {
        const body = await res.json();
        setPrs(body.data || []);
        setErrorState(false);
      } else {
        setErrorState(true);
      }
    } catch (e) {
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrs();
  }, []);

  const handleMerge = async (prId: string, repo: string, owner: string) => {
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', id: prId, repo, owner }),
      });
      if (res.ok) {
        fetchPrs();
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 gap-1.5 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING GITHUB PRS...
      </div>
    );
  }

  if (errorState) {
    return <GithubConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2">
        {prs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-medium">All PRs merged and up to date!</p>
          </div>
        ) : (
          prs.map(pr => (
            <div key={pr.id} className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors flex items-center justify-between text-xs">
              <div className="flex items-start gap-2.5 max-w-[70%]">
                <GitPullRequest className={`w-4 h-4 mt-0.5 shrink-0 ${
                  pr.status === 'passing' ? 'text-emerald-400' : pr.status === 'failing' ? 'text-rose-400' : 'text-amber-400'
                }`} />
                <div>
                  <p className="font-medium text-zinc-200 line-clamp-1">{pr.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-400 font-semibold">{pr.repo}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {pr.branch}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                  pr.status === 'passing'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                    : pr.status === 'failing'
                    ? 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                    : 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                }`}>
                  {pr.reviews}
                </span>
                <button
                  onClick={() => handleMerge(pr.id, pr.repo, pr.owner)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer"
                >
                  Merge
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function GithubRepositories() {
  const [search, setSearch] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch('/api/github?type=repos');
        if (res.ok) {
          const body = await res.json();
          setRepos(body.data || []);
          setErrorState(false);
        } else {
          setErrorState(true);
        }
      } catch (e) {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const filtered = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 gap-1.5 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING REPOS...
      </div>
    );
  }

  if (errorState) {
    return <GithubConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col">
      <input
        type="text"
        placeholder="Filter repositories..."
        className="w-full bg-zinc-950/80 border border-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 rounded px-2.5 py-1.5 focus:outline-none focus:border-zinc-800 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
        {filtered.map(repo => (
          <div key={repo.name} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-900 last:border-b-0">
            <div className="flex items-center gap-2">
              <FolderGit className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-zinc-300">{repo.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-500/80 fill-amber-500/20" />
                {repo.stars}
              </span>
              <span className="flex items-center gap-0.5">
                <GitFork className="w-3 h-3 text-sky-500/80" />
                {repo.forks}
              </span>
              <span className="text-zinc-650">•</span>
              <span className="text-[10px] text-zinc-400">{repo.language}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GithubCommits() {
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch('/api/github?type=commits');
        if (res.ok) {
          const body = await res.json();
          setCommits(body.data || []);
          setErrorState(false);
        } else {
          setErrorState(true);
        }
      } catch (e) {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, []);

  const activeCommit = commits.find(c => c.sha === selectedCommitSha);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-zinc-500 gap-1.5 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOAD COMMITS...
      </div>
    );
  }

  if (errorState) {
    return <GithubConfigAlert />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Left: Commit feed */}
      <div className="space-y-2 overflow-y-auto max-h-[220px]">
        {commits.map(commit => (
          <div
            key={commit.sha}
            onClick={() => setSelectedCommitSha(commit.sha)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-100 ${
              selectedCommitSha === commit.sha
                ? 'bg-zinc-800/40 border-zinc-700/80'
                : 'bg-zinc-950/20 border-zinc-900/60 hover:bg-zinc-900/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-zinc-800/90 border border-zinc-700/30 px-1.5 py-0.5 rounded font-mono text-zinc-400">
                  {commit.sha}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{commit.time}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                <Eye className="w-3 h-3 text-zinc-500" /> Inspect Diff
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans mt-1.5 line-clamp-1">{commit.message}</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Author: {commit.author}</p>
          </div>
        ))}
      </div>

      {/* Right: Diff Inspector */}
      <div className="border border-zinc-900 bg-zinc-950/60 rounded-lg p-3 flex flex-col h-full min-h-[220px] max-h-[220px]">
        {activeCommit ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900 mb-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                Diff Inspector: {activeCommit.sha}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Git diff format</span>
            </div>
            <div className="flex-1 overflow-auto font-mono text-[10px] bg-[#030303] p-2.5 rounded border border-zinc-900 leading-normal select-text">
              {activeCommit.diff.split('\n').map((line: string, idx: number) => {
                let colorClass = 'text-zinc-500';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  colorClass = 'text-emerald-400 bg-emerald-950/20 px-0.5';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  colorClass = 'text-rose-400 bg-rose-950/20 px-0.5';
                } else if (line.startsWith('@@')) {
                  colorClass = 'text-cyan-400 font-semibold';
                } else if (line.startsWith('diff') || line.startsWith('index')) {
                  colorClass = 'text-zinc-655 font-semibold';
                }
                return (
                  <div key={idx} className={colorClass}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <AlertCircle className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
            <p className="text-xs font-semibold">Select a commit</p>
            <p className="text-[10px] text-zinc-655 mt-0.5 text-center px-4">
              Click any commit in the list on the left to inspect the git diff visualizer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
