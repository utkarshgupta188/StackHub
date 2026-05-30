'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, AlertTriangle, FileText, Search, Database, HardDrive, Trash2, X, RefreshCw, ShieldAlert } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function DockerConfigAlert({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full">
      <ShieldAlert className="w-8 h-8 text-emerald-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">Docker Daemon Not Running</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        {message || 'Ensure Docker Desktop is running locally on your computer to connect containers.'}
      </p>
    </div>
  );
}

export function DockerContainers() {
  const { refreshAllData } = usePlugins();
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/docker?type=containers');
      if (res.ok) {
        const body = await res.json();
        setContainers(body.containers || []);
        setErrorState(false);
      } else {
        const body = await res.json();
        setErrorMessage(body.error || '');
        setErrorState(true);
      }
    } catch (e) {
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, name: string, action: 'start' | 'stop' | 'pause' | 'restart') => {
    try {
      const res = await fetch('/api/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setContainers(data.containers);
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openLogConsole = (id: string) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;

    setSelectedContainerId(id);
    setActiveLogs(container.logs || []);
    setIsStreaming(true);
  };

  // Simulating real console updates or active logging streams
  useEffect(() => {
    if (!selectedContainerId || !isStreaming) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/docker?type=containers');
        if (res.ok) {
          const body = await res.json();
          const target = body.containers.find((c: any) => c.id === selectedContainerId);
          if (target && target.logs) {
            setActiveLogs(target.logs);
          }
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedContainerId, isStreaming]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLogs]);

  const activeContainer = containers.find(c => c.id === selectedContainerId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SCANNING DOCKER SOCKET...
      </div>
    );
  }

  if (errorState) {
    return <DockerConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {!selectedContainerId ? (
        containers.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-semibold">No containers found</p>
            <p className="text-[10px] text-zinc-650 mt-1">
              Start a container locally using "docker run" to see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {containers.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${
                      c.status === 'running' ? 'bg-emerald-500' : c.status === 'paused' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-650'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-200">{c.name}</p>
                      <span className="text-[9px] bg-zinc-900 px-1 py-0.2 rounded font-mono text-zinc-500">{c.id}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                      <span className="text-zinc-400 truncate max-w-[120px]">{c.image}</span>
                      <span>•</span>
                      <span>CPU: {c.cpu}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openLogConsole(c.id)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-[10px] font-mono border border-zinc-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" /> LOGS
                  </button>
                  {c.status === 'running' ? (
                    <>
                      <button
                        onClick={() => handleAction(c.id, c.name, 'pause')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-amber-500/80 p-1.5 rounded border border-zinc-850 cursor-pointer"
                        title="Pause Container"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(c.id, c.name, 'stop')}
                        className="bg-zinc-900 hover:bg-zinc-850 text-rose-500/80 p-1.5 rounded border border-zinc-850 cursor-pointer"
                        title="Stop Container"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(c.id, c.name, 'restart')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-emerald-500/80 p-1.5 rounded border border-zinc-850 cursor-pointer"
                      title="Restart Container"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-500/10" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Console Terminal Simulator View */
        <div className="border border-zinc-900 bg-zinc-950/90 rounded-lg p-3 flex flex-col h-[230px]">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300 font-mono">
                docker logs --tail 25 -f {activeContainer?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStreaming(p => !p)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                  isStreaming ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                }`}
              >
                {isStreaming ? 'PAUSE STREAM' : 'STREAM LOGS'}
              </button>
              <button
                onClick={() => setSelectedContainerId(null)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 hover:bg-zinc-900 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#030303] p-2.5 rounded border border-zinc-900 font-mono text-[10px] leading-relaxed text-emerald-400 select-text terminal-glow">
            {activeLogs.length === 0 ? (
              <div className="text-zinc-650 italic">[No logs found for this container]</div>
            ) : (
              activeLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap break-all border-l-2 border-emerald-950 pl-2 mb-1 py-0.5 text-left">
                  {log}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

export function DockerImages() {
  const { refreshAllData } = usePlugins();
  const [images, setImages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/docker?type=images');
      if (res.ok) {
        const body = await res.json();
        setImages(body.images || []);
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
    fetchImages();
  }, []);

  const filtered = images.filter(img =>
    img.repository.toLowerCase().includes(search.toLowerCase()) ||
    img.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrune = async () => {
    try {
      await fetch('/api/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prune', id: '' }),
      });
      fetchImages();
      await refreshAllData();
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING IMAGES...
      </div>
    );
  }

  if (errorState) {
    return <DockerConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search images..."
              className="w-full bg-zinc-950/80 border border-zinc-900 text-[11px] text-zinc-200 placeholder-zinc-500 rounded pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-zinc-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handlePrune}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-800 text-rose-400 rounded transition-colors cursor-pointer"
            title="Prune dangling builder images"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-[10px] text-zinc-600">No images found</div>
          ) : (
            filtered.map(img => (
              <div key={`${img.repository}-${img.tag}`} className="p-2 rounded-lg border border-zinc-900 bg-zinc-950/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                  <div>
                    <p className="font-semibold text-zinc-300">
                      {img.repository}:{img.tag}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{img.id}</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[9px] text-zinc-400">
                  <p>{img.size}</p>
                  <p className="text-zinc-650">{img.created}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
