'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Globe, Server, Check, X, HelpCircle, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

function CloudflareConfigAlert({ message }: { message?: string }) {
  const { setActivePage } = usePlugins();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center h-full relative">
      <ShieldAlert className="w-8 h-8 text-orange-500 mb-2.5 animate-pulse" />
      <p className="text-xs font-semibold text-zinc-300">Cloudflare Not Connected</p>
      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1 font-sans leading-relaxed">
        {message || 'Connect your real Cloudflare API Token and Zone ID inside the Extensions preference settings.'}
      </p>
      
      <div className="flex items-center gap-2 mt-4 shrink-0">
        <button
          onClick={() => setActivePage('/plugins')}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[9px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          CONNECT CLOUDFLARE
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
                <Globe className="w-4 h-4 text-zinc-100" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  How to generate Cloudflare Token
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
                  <p className="font-semibold text-zinc-100">Access API Tokens</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Log in to your Cloudflare Dashboard. Click on the user profile icon at the top right, select **My Profile**, and open the **API Tokens** tab.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">2</span>
                <div>
                  <p className="font-semibold text-zinc-100">Create DNS Token</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click **Create Token**. Scroll down to find the **Edit Zone DNS** template, and click **Use template**.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">3</span>
                <div>
                  <p className="font-semibold text-zinc-100">Select Domain Zones</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Under **Zone Resources**, select the specific domain zone/site you want to monitor, or select **All zones** to monitor your whole portfolio.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">4</span>
                <div>
                  <p className="font-semibold text-zinc-100">Locate Zone ID & Paste</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click **Create Token** and copy the generated token string. To find your **Zone ID**, navigate to the Overview page of your website inside Cloudflare and copy the Zone ID from the right sidebar. Paste both in StackHub Extensions settings.
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

export function CloudflareDns() {
  const { refreshAllData } = usePlugins();
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDns, setLoadingDns] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const initCloudflare = async () => {
      setLoading(true);
      try {
        const zonesRes = await fetch('/api/cloudflare?type=zones');
        if (!zonesRes.ok) {
          const body = await zonesRes.json();
          setErrorMessage(body.error || 'Failed to fetch zones.');
          setErrorState(true);
          setLoading(false);
          return;
        }
        const zonesData = await zonesRes.json();
        const fetchedZones = zonesData.zones || [];
        setZones(fetchedZones);

        if (fetchedZones.length > 0) {
          const defaultZoneId = fetchedZones[0].id;
          setSelectedZoneId(defaultZoneId);
          
          const dnsRes = await fetch(`/api/cloudflare?type=dns&zoneId=${defaultZoneId}`);
          if (dnsRes.ok) {
            const dnsData = await dnsRes.json();
            setDnsRecords(dnsData.dnsRecords || []);
            setErrorState(false);
          } else {
            const body = await dnsRes.json();
            setErrorMessage(body.error || 'Failed to fetch DNS records.');
            setErrorState(true);
          }
        } else {
          setErrorMessage('No domains found in your Cloudflare account.');
          setErrorState(true);
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Failed to initialize Cloudflare.');
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };

    initCloudflare();
  }, []);

  const handleZoneChange = async (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setLoadingDns(true);
    try {
      const res = await fetch(`/api/cloudflare?type=dns&zoneId=${zoneId}`);
      if (res.ok) {
        const body = await res.json();
        setDnsRecords(body.dnsRecords || []);
        setErrorState(false);
      } else {
        const body = await res.json();
        setErrorMessage(body.error || '');
        setErrorState(true);
      }
    } catch (e) {
      setErrorState(true);
    } finally {
      setLoadingDns(false);
    }
  };

  const toggleProxy = async (id: string, currentProxied: boolean) => {
    setTogglingId(id);
    const targetProxied = !currentProxied;

    try {
      const res = await fetch('/api/cloudflare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleProxy', id, proxied: targetProxied, zoneId: selectedZoneId }),
      });
      if (res.ok) {
        const dnsRes = await fetch(`/api/cloudflare?type=dns&zoneId=${selectedZoneId}`);
        if (dnsRes.ok) {
          const dnsData = await dnsRes.json();
          setDnsRecords(dnsData.dnsRecords || []);
        }
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredRecords = dnsRecords.filter(rec => {
    const query = searchQuery.toLowerCase();
    return (
      rec.name?.toLowerCase().includes(query) ||
      rec.type?.toLowerCase().includes(query) ||
      rec.content?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-zinc-400" /> SCANNING CLOUDFLARE ACCOUNT...
      </div>
    );
  }

  if (errorState) {
    return <CloudflareConfigAlert message={errorMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Cloudflare Zone</span>
              <p className="text-[9px] text-zinc-600 font-sans font-medium">Auto-discovery domains</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter DNS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10px] px-2 py-1 rounded placeholder-zinc-650 outline-none w-28 focus:w-36 focus:border-zinc-800 transition-all font-mono"
            />
            <select
              value={selectedZoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="bg-zinc-950 border border-zinc-850/80 text-zinc-200 text-[10px] font-bold font-mono px-2 py-0.5 rounded outline-none cursor-pointer hover:border-zinc-700 transition-colors focus:ring-1 focus:ring-zinc-800"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id} className="bg-zinc-950 text-zinc-200">
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[160px] max-h-[300px] scrollbar-thin">
          {loadingDns ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500 font-mono text-[10px] gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" /> 
              <span>LOADING DNS RECORDS...</span>
            </div>
          ) : (
            <table className="w-full text-[11px] text-left border-collapse select-text">
              <thead>
                <tr className="border-b border-zinc-900/60 text-zinc-500 font-mono font-bold tracking-wider text-[9px] uppercase">
                  <th className="py-2.5 pr-2 w-16">Type</th>
                  <th className="py-2.5 pr-2 w-1/3">Name</th>
                  <th className="py-2.5 pr-2 w-1/3">Content</th>
                  <th className="py-2.5 pr-2 w-16">TTL</th>
                  <th className="py-2.5 text-right w-24">Proxy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-zinc-300 font-mono">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-600 text-[10px] font-sans">
                      {searchQuery ? 'No records match search query.' : 'No DNS records configured in zone.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => {
                    let typeBadgeClass = 'bg-zinc-900 text-zinc-400 border-zinc-800/80';
                    if (rec.type === 'A' || rec.type === 'AAAA') {
                      typeBadgeClass = 'bg-blue-950/20 text-blue-400 border-blue-900/30';
                    } else if (rec.type === 'CNAME') {
                      typeBadgeClass = 'bg-amber-950/20 text-amber-400 border-amber-900/30';
                    } else if (rec.type === 'MX') {
                      typeBadgeClass = 'bg-purple-950/20 text-purple-400 border-purple-900/30';
                    } else if (rec.type === 'TXT') {
                      typeBadgeClass = 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-zinc-950/25 group transition-colors">
                        <td className="py-3 pr-2">
                          <span className={`border px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${typeBadgeClass}`}>
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-3 pr-2 truncate max-w-[120px] font-sans font-semibold text-zinc-200" title={rec.name}>
                          {rec.name}
                        </td>
                        <td className="py-3 pr-2 truncate max-w-[150px] text-zinc-450 font-mono text-[10px]" title={rec.content}>
                          {rec.content}
                        </td>
                        <td className="py-3 pr-2 text-zinc-500 font-medium">{rec.ttl}</td>
                        <td className="py-3 text-right">
                          <button
                            disabled={togglingId === rec.id}
                            onClick={() => toggleProxy(rec.id, rec.proxied)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                              togglingId === rec.id
                                ? 'bg-zinc-900 border-zinc-900 text-zinc-650'
                                : rec.proxied
                                ? 'bg-orange-950/25 border-orange-900/40 text-orange-400 hover:bg-orange-900/20 shadow-sm'
                                : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-400'
                            }`}
                          >
                            {rec.proxied ? (
                              <>
                                <Server className="w-2.5 h-2.5 text-orange-500 fill-orange-500/20 animate-pulse" />
                                PROXIED
                              </>
                            ) : (
                              'DNS-ONLY'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function CloudflareSecurity() {
  const [events, setEvents] = useState<any[]>([]);
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const res = await fetch('/api/cloudflare?type=security');
        if (res.ok) {
          const body = await res.json();
          setEvents(body.events || []);
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
    fetchSecurity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-zinc-500 font-mono text-[10px] h-full">
        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2 text-zinc-400" /> LOADING THREAT LOGS...
      </div>
    );
  }

  if (errorState) {
    return <CloudflareConfigAlert />;
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">WAF Threat Feed</span>
          </div>
          <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
          {events.map((e, idx) => (
            <div key={idx} className="p-2.5 rounded border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-zinc-800 transition-all flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                {e.action === 'block' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-zinc-200 text-[11px] truncate max-w-[125px]">{e.ip}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 font-sans font-medium">{e.rule} &bull; {e.country}</p>
                </div>
              </div>
              <div className="text-right text-[10px]">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider border ${
                  e.action === 'block'
                    ? 'bg-rose-950/20 border-rose-900/35 text-rose-450'
                    : 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400'
                }`}>
                  {e.action.toUpperCase()}
                </span>
                <p className="text-[9px] text-zinc-600 mt-1 font-sans">{e.datetime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
