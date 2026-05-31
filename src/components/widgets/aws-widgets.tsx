'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Play, Square, HardDrive, AlertTriangle, RefreshCw, BarChart3, Database, ShieldAlert, X, HelpCircle, Landmark, ShieldCheck, Users, Network, Layers3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [activeMetric, setActiveMetric] = useState<'EC2' | 'S3' | 'RDS' | 'Lambda' | 'Other'>('EC2');
  const [costs, setCosts] = useState<any[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/aws?type=costs');
        if (res.ok) {
          const body = await res.json();
          setCosts(body.costs || []);
          setCurrency(body.currency || 'USD');
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

  const totalCost = costs.reduce((acc, curr) => acc + (curr.Total || 0), 0);
  const availableMetrics = ['EC2', 'S3', 'RDS', 'Lambda', 'Other'] as const;

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

  if (costs.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        No Cost Explorer data returned for the selected period.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <div>
          <span className="text-[10px] text-zinc-500 font-mono">LIVE COST EXPLORER</span>
          <p className="text-xl font-bold text-zinc-100 font-sans mt-0.5">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] text-zinc-500 font-mono">{currency}</span></p>
        </div>
        <div className="flex bg-zinc-950 p-0.5 rounded-full border border-white/5">
          {availableMetrics.map(type => (
            <button
              key={type}
              onClick={() => setActiveMetric(type)}
              className={`text-[9px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeMetric === type ? 'bg-sky-500/15 text-sky-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[120px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={costs} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="awsCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#080b10', borderColor: '#1e293b', borderRadius: '12px' }}
              labelStyle={{ color: '#cbd5e1', fontSize: '10px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#f8fafc', fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke="#38bdf8"
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
      <div className="space-y-2.5 overflow-y-auto max-h-[230px] pr-1 scrollbar-thin">
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

export function AwsLambda() {
  const [functions, setFunctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchLambda = async () => {
      try {
        const res = await fetch('/api/aws?type=lambda');
        if (res.ok) {
          const data = await res.json();
          setFunctions(data.functions || []);
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
    fetchLambda();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING LAMBDAS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert message="AWS Lambda access requires valid IAM credentials and region configuration." />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2 overflow-y-auto max-h-[230px] pr-1">
        {functions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Landmark className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-semibold">No Lambda functions found</p>
          </div>
        ) : (
          functions.map(fn => (
            <div key={`${fn.region}-${fn.name}`} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="font-semibold text-zinc-200 line-clamp-1">{fn.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-zinc-400 font-semibold">{fn.region}</span>
                    <span>•</span>
                    <span>{fn.runtime}</span>
                    <span>•</span>
                    <span>{fn.memory} MB</span>
                    <span>•</span>
                    <span>{fn.timeout}s</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono line-clamp-1">{fn.handler}</p>
                </div>
                <div className="text-right text-[10px] font-mono text-zinc-500 shrink-0">
                  <p>{fn.state}</p>
                  <p>{fn.codeSize?.toLocaleString?.() || fn.codeSize} bytes</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AwsIam() {
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchIam = async () => {
      try {
        const res = await fetch('/api/aws?type=iam');
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary || {});
          setUsers(data.users || []);
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
    fetchIam();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING IAM SUMMARY...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert message="AWS IAM summary requires account-level permissions." />;
  }

  const summaryCards = [
    { label: 'Users', value: summary.Users || 0 },
    { label: 'MFA Enabled', value: summary.AccountMFAEnabled || 0 },
    { label: 'Policies', value: summary.AccountPolicies || 0 },
    { label: 'Roles', value: summary.Roles || 0 },
  ];

  return (
    <div className="h-full flex flex-col justify-between gap-3">
      <div className="grid grid-cols-2 gap-2">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-mono">{card.label}</p>
            <p className="text-sm font-semibold text-zinc-200 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1">
        {users.length === 0 ? (
          <div className="text-center py-6 text-zinc-500">
            <Users className="w-8 h-8 text-sky-400 mx-auto mb-2" />
            <p className="text-xs font-semibold">No IAM users found</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.userId} className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="font-semibold text-zinc-200 truncate">{user.username}</p>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{user.arn}</p>
              </div>
              <div className="text-right text-[10px] font-mono text-zinc-500 shrink-0">
                <p>{user.passwordLastUsed === 'Never' ? 'Never used' : new Date(user.passwordLastUsed).toLocaleDateString()}</p>
                <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AwsVpc() {
  const [vpcs, setVpcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchVpcs = async () => {
      try {
        const res = await fetch('/api/aws?type=vpcs');
        if (res.ok) {
          const data = await res.json();
          setVpcs(data.vpcs || []);
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
    fetchVpcs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING VPCS...
      </div>
    );
  }

  if (errorState) {
    return <AwsConfigAlert message="AWS VPC inventory requires EC2 network permissions." />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2 overflow-y-auto max-h-[230px] pr-1">
        {vpcs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Network className="w-8 h-8 text-sky-400 mx-auto mb-2" />
            <p className="text-xs font-semibold">No VPCs found</p>
          </div>
        ) : (
          vpcs.map(vpc => (
            <div key={vpc.id} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/10 transition-colors text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Layers3 className="w-4 h-4 text-sky-400 shrink-0" />
                    <p className="font-semibold text-zinc-200 line-clamp-1">{vpc.name}</p>
                    {vpc.isDefault && <span className="px-1.5 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 text-[9px] font-mono">DEFAULT</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-zinc-400 font-semibold">{vpc.id}</span>
                    <span>•</span>
                    <span>{vpc.cidr}</span>
                    <span>•</span>
                    <span>{vpc.state}</span>
                    <span>•</span>
                    <span>{vpc.tenancy}</span>
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-zinc-500 shrink-0">
                  <p>{vpc.isDefault ? 'Default' : 'Custom'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
