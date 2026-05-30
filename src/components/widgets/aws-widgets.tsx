'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Play, Square, HardDrive, AlertTriangle, RefreshCw, BarChart3, Database, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mockAwsCosts, mockAwsS3 } from '@/plugins/aws';
import { usePlugins } from '@/context/plugin-context';

function AwsConfigAlert() {
  const { setActivePage } = usePlugins();
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full">
      <ShieldAlert className="w-8 h-8 text-sky-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">AWS Credentials Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        Please configure your real AWS Access Keys and Region inside the Extensions settings.
      </p>
      <button
        onClick={() => setActivePage('/plugins')}
        className="mt-3.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer border border-zinc-700/30"
      >
        CONNECT AWS KEYS
      </button>
    </div>
  );
}

export function AwsCosts() {
  const [activeMetric, setActiveMetric] = useState<'EC2' | 'S3' | 'RDS'>('EC2');
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/aws');
        setErrorState(!res.ok);
      } catch (e) {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    checkConfig();
  }, []);

  const totalCost = mockAwsCosts.reduce((acc, curr) => acc + curr.EC2 + curr.S3 + curr.RDS, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING AWS BILLS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
        <div>
          <span className="text-[10px] text-zinc-500 font-mono">ESTIMATED BILLING</span>
          <p className="text-xl font-bold text-zinc-100 font-sans mt-0.5">${totalCost.toLocaleString()}</p>
        </div>
        <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-900">
          {(['EC2', 'S3', 'RDS'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveMetric(type)}
              className={`text-[9px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                activeMetric === type ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[120px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockAwsCosts} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="awsCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#09090b', borderColor: '#1f1f23', borderRadius: '6px' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '10px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#f4f4f5', fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke="#3b82f6"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#awsCostGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AwsInstances() {
  const { refreshAllData } = usePlugins();
  const [instances, setInstances] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api/aws');
      if (res.ok) {
        setInstances(await res.json());
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
    fetchInstances();
    const interval = setInterval(fetchInstances, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleInstance = async (id: string, name: string, currentStatus: string) => {
    setActioningId(id);
    const action = currentStatus === 'running' ? 'stop' : 'start';

    try {
      const res = await fetch('/api/aws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setInstances(data.instances);
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING AWS EC2 FLEETS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        {instances.map(ins => {
          const isPending = actioningId === ins.id;
          return (
            <div
              key={ins.id}
              className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Cloud className="w-5 h-5 text-sky-500" />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${
                    isPending
                      ? 'bg-amber-400 animate-ping'
                      : ins.status === 'running'
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">{ins.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-400 font-semibold">{ins.type}</span>
                    <span>•</span>
                    <span>{ins.region}</span>
                    <span>•</span>
                    <span>IP: {ins.ip}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isPending}
                onClick={() => toggleInstance(ins.id, ins.name, ins.status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-medium font-mono border transition-all cursor-pointer ${
                  isPending
                    ? 'bg-zinc-900 text-zinc-650 border-zinc-900 cursor-not-allowed'
                    : ins.status === 'running'
                    ? 'bg-rose-950/20 text-rose-400 border-rose-900/30 hover:bg-rose-900/10'
                    : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/10'
                }`}
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    PENDING...
                  </>
                ) : ins.status === 'running' ? (
                  <>
                    <Square className="w-3 h-3 fill-rose-500/30" />
                    STOP INSTANCE
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-emerald-500/30" />
                    START INSTANCE
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AwsBuckets() {
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/aws');
        setErrorState(!res.ok);
      } catch (e) {
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    checkConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING BUCKETS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2">
        {mockAwsS3.map(bucket => (
          <div key={bucket.name} className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-300 truncate max-w-[140px]">{bucket.name}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{bucket.region}</p>
              </div>
            </div>
            <div className="text-right font-mono text-[10px]">
              <p className="text-zinc-400">{bucket.size}</p>
              <p className="text-zinc-500">{bucket.files.toLocaleString()} files</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
