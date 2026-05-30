'use client';

import React from 'react';
import { ArrowRight, Settings, Puzzle, HelpCircle } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';
import { GithubPullRequests, GithubRepositories, GithubCommits } from './widgets/github-widgets';
import { AwsCosts, AwsInstances, AwsBuckets } from './widgets/aws-widgets';
import { DockerContainers, DockerImages } from './widgets/docker-widgets';
import { CloudflareDns, CloudflareSecurity } from './widgets/cloudflare-widgets';
import { VercelDeployments, VercelDomains } from './widgets/vercel-widgets';

const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  GithubPullRequests,
  GithubRepositories,
  GithubCommits,
  AwsCosts,
  AwsInstances,
  AwsBuckets,
  DockerContainers,
  DockerImages,
  CloudflareDns,
  CloudflareSecurity,
  VercelDeployments,
  VercelDomains,
};

const SIZE_MAP = {
  sm: 'col-span-1 lg:col-span-1 row-span-1',
  md: 'col-span-1 lg:col-span-1 xl:col-span-2 row-span-1',
  lg: 'col-span-1 lg:col-span-2 xl:col-span-2 row-span-2',
  full: 'col-span-1 lg:col-span-3 row-span-2',
};

export default function DashboardGrid({ pluginId }: { pluginId?: string }) {
  const { enabledWidgets, setActivePage } = usePlugins();

  const displayedWidgets = pluginId
    ? enabledWidgets.filter(w => w.pluginId === pluginId)
    : enabledWidgets;

  if (displayedWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 glass-panel rounded-xl border border-zinc-900/60 max-w-2xl mx-auto text-center mt-12 animate-fade-in">
        <Puzzle className="w-12 h-12 text-zinc-650 mb-4 animate-bounce" />
        <h3 className="text-base font-bold text-zinc-200 font-sans">No active widgets</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-2 font-sans leading-relaxed">
          {pluginId
            ? `Please enable the ${pluginId} extension or verify its API token settings to view its dashboard widgets.`
            : 'StackHub is an extensible developer operating system. Connect GitHub repositories, monitor S3 bucket bills, start/stop EC2 servers, or stream Docker logs by enabling extensions.'}
        </p>
        <button
          onClick={() => setActivePage('/plugins')}
          className="mt-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-all duration-100 flex items-center gap-2 cursor-pointer shadow-lg shadow-white/5 font-sans"
        >
          Manage plugins and integrations <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in auto-rows-[minmax(180px,auto)]">
      {displayedWidgets.map(widget => {
        const Component = WIDGET_MAP[widget.component];
        if (!Component) return null;

        return (
          <div
            key={widget.id}
            id={`widget-${widget.id}`}
            className={`${SIZE_MAP[widget.size]} glass-card rounded-xl border border-zinc-900/50 p-5 flex flex-col justify-between group shadow-xl`}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-zinc-900/40 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-sky-500 transition-colors shrink-0" />
                <h3 className="text-xs font-bold text-zinc-300 font-sans tracking-wide uppercase">
                  {widget.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePage('/plugins')}
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-all p-1 hover:bg-zinc-800/40 rounded cursor-pointer"
                title="Configure Plugin Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Widget Render Inner Component */}
            <div className="flex-1 min-h-0">
              <Component />
            </div>
          </div>
        );
      })}
    </div>
  );
}
