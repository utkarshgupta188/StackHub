'use client';

import React from 'react';
import { ArrowRight, Settings, Puzzle, HelpCircle } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';
import { GithubIssues, GithubBranches, GithubReleases, GithubUserOverview, GithubPullRequests, GithubRepositories, GithubCommits } from './widgets/github-widgets';
import { AwsLambda, AwsIam, AwsVpc, AwsCosts, AwsInstances, AwsBuckets } from './widgets/aws-widgets';
import { DockerContainers, DockerImages } from './widgets/docker-widgets';
import { CloudflareDns, CloudflareSettings, CloudflareWorkers } from './widgets/cloudflare-widgets';
import { VercelDeployments, VercelDomains, VercelProjects } from './widgets/vercel-widgets';
import { SupabaseProjectDetails, SupabaseEdgeFunctions } from './widgets/supabase-widgets';

const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  GithubIssues,
  GithubBranches,
  GithubReleases,
  GithubUserOverview,
  GithubPullRequests,
  GithubRepositories,
  GithubCommits,
  AwsLambda,
  AwsIam,
  AwsVpc,
  AwsCosts,
  AwsInstances,
  AwsBuckets,
  DockerContainers,
  DockerImages,
  CloudflareDns,
  CloudflareSettings,
  CloudflareWorkers,
  VercelProjects,
  VercelDeployments,
  VercelDomains,
  SupabaseProjectDetails,
  SupabaseEdgeFunctions,
};

const SIZE_MAP = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-1 row-span-1',
  lg: 'col-span-1 lg:col-span-2 row-span-1',
  full: 'col-span-1 lg:col-span-2 row-span-1',
};

const WIDGET_INFO_MAP: Record<string, { desc: string }> = {
  GithubIssues: { desc: "Track active pull requests and community issues." },
  GithubBranches: { desc: "Code branch references and head updates." },
  GithubReleases: { desc: "Compiled build versions and tags." },
  GithubUserOverview: { desc: "Platform profile telemetry stats." },
  GithubPullRequests: { desc: "Review open code pull requests." },
  GithubRepositories: { desc: "Connected git code repositories." },
  GithubCommits: { desc: "Continuous delivery commit registry." },
  AwsLambda: { desc: "Serverless active lambda triggers." },
  AwsIam: { desc: "Identity credentials and user policies." },
  AwsVpc: { desc: "Isolated network and cloud subnets." },
  AwsCosts: { desc: "Infrastructure expense breakdown." },
  AwsInstances: { desc: "Elastic compute cloud host diagnostics." },
  AwsBuckets: { desc: "Simple storage service object stores." },
  DockerContainers: { desc: "Local container diagnostics socket." },
  DockerImages: { desc: "Cached local builder images." },
  CloudflareDns: { desc: "Domain server DNS routing entries." },
  CloudflareWorkers: { desc: "Edge compute workers and endpoint diagnostics." },
  CloudflareSettings: { desc: "Zone Development mode, SSL/TLS, and Security triggers." },
  VercelProjects: { desc: "Connected project deployments grid." },
  VercelDeployments: { desc: "Continuous delivery build contexts." },
  VercelDomains: { desc: "Custom domains routing telemetry." },
  SupabaseProjectDetails: { desc: "PostgreSQL active database and project details." },
  SupabaseEdgeFunctions: { desc: "Serverless edge functions and latency checks." },
};

export default function DashboardGrid({ pluginId }: { pluginId?: string }) {
  const { enabledWidgets, setActivePage } = usePlugins();

  const displayedWidgets = pluginId
    ? enabledWidgets.filter(w => w.pluginId === pluginId)
    : enabledWidgets;

  if (displayedWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 surface-shell rounded-xl border border-border max-w-2xl mx-auto text-center mt-8 animate-fade-in shadow-sm">
        <Puzzle className="w-10 h-10 text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold text-foreground">No active widgets</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed">
          {pluginId
            ? `Please enable the ${pluginId} extension or verify its API token settings to view its dashboard widgets.`
            : 'Enable a plugin to reveal a live dashboard. The default view stays quiet until tools are connected.'}
        </p>
        <button
          onClick={() => setActivePage('/plugins')}
          className="mt-6 border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium px-4 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          Manage plugins and integrations <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in auto-rows-[310px]">
      {displayedWidgets.map(widget => {
        const Component = WIDGET_MAP[widget.component];
        if (!Component) return null;

        const info = WIDGET_INFO_MAP[widget.component] || { desc: "StackHub live component diagnostics." };

        return (
          <div
            key={widget.id}
            id={`widget-${widget.id}`}
            className={`${SIZE_MAP[widget.size]} dashboard-widget rounded-2xl border border-border bg-[#0e1017] p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  {widget.title}
                </h3>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-normal">
                  {info.desc}
                </p>
              </div>
              <button
                onClick={() => setActivePage('/plugins')}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent cursor-pointer shrink-0"
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
