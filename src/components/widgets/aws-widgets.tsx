'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Play, Square, HardDrive, AlertTriangle, RefreshCw, BarChart3, Database, ShieldAlert, X, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mockAwsCosts } from '@/plugins/aws';
import { usePlugins } from '@/context/plugin-context';

function AwsConfigAlert({ message }: { message?: string }) {
  const { setActivePage } = usePlugins();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full relative">
      <ShieldAlert className="w-8 h-8 text-sky-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">AWS Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        {message || 'Configure your real AWS Access Keys and Region inside the Extensions settings.'}
      </p>
      
      <div className="flex items-center gap-2 mt-4 shrink-0">
        <button
          onClick={() => setActivePage('/plugins')}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          CONNECT AWS KEYS
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
                <Cloud className="w-4 h-4 text-zinc-100" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  How to generate AWS Keys
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
                  <p className="font-semibold text-zinc-100">Access IAM Console</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Log in to your AWS Management Console. Search for and navigate to **IAM (Identity and Access Management)**.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">2</span>
                <div>
                  <p className="font-semibold text-zinc-100">Select IAM User Credentials</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click **Users** in the sidebar, select your developer user name, and open the **Security credentials** tab.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">3</span>
                <div>
                  <p className="font-semibold text-zinc-100">Create Access Key Pair</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Scroll down to the **Access keys** section and click **Create access key**. Select **Command Line Interface (CLI)** or **Local code** as your use case, check the confirmation, and click Next.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">4</span>
                <div>
                  <p className="font-semibold text-zinc-100">Configure StackHub Settings</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Copy the generated **Access Key ID** (`AKIA...`) and the **Secret Access Key**. Go to StackHub Extensions &rarr; AWS, paste them in, and choose your preferred default region.
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

export function AwsCosts() {
  const [activeMetric, setActiveMetric] = useState<'EC2' | 'S3' | 'RDS'>('EC2');
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/aws?type=instances');
        if (res.ok) {
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
    return <AwsConfigAlert message={errorMessage} />;
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
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api/aws?type=instances');
      if (res.ok) {
        const data = await res.json();
        setInstances(data.instances || []);
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
    fetchInstances();
    const interval = setInterval(fetchInstances, 7000);
    return () => clearInterval(interval);
  }, []);

  const toggleInstance = async (id: string, name: string, currentStatus: string, region: string) => {
    setActioningId(id);
    const action = currentStatus === 'running' ? 'stop' : 'start';

    try {
      const res = await fetch('/api/aws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, region }),
      });
      if (res.ok) {
        fetchInstances();
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
    return <AwsConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        {instances.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Cloud className="w-8 h-8 text-sky-500/80 mx-auto mb-2" />
            <p className="text-xs font-semibold">No EC2 Instances Found</p>
            <p className="text-[9px] text-zinc-650 mt-1">Ensure instances exist in your region.</p>
          </div>
        ) : (
          instances.map(ins => {
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
                  onClick={() => toggleInstance(ins.id, ins.name, ins.status, ins.region)}
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
          })
        )}
      </div>
    </div>
  );
}

export function AwsBuckets() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const res = await fetch('/api/aws?type=buckets');
        if (res.ok) {
          const data = await res.json();
          setBuckets(data.buckets || []);
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
    fetchBuckets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING BUCKETS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2">
        {buckets.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <HardDrive className="w-8 h-8 text-sky-500/80 mx-auto mb-2" />
            <p className="text-xs font-semibold">No S3 Buckets Found</p>
          </div>
        ) : (
          buckets.map(bucket => (
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
          ))
        )}
      </div>
    </div>
  );
}
