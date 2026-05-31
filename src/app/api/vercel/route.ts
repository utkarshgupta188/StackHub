import { NextResponse } from 'next/server';
import { readDb, resolveSecret } from '@/lib/db';

type VercelProject = {
  id: string;
  name: string;
  framework?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  live?: boolean;
  paused?: boolean;
  productionBranch?: string;
  alias?: Array<{ domain?: string; target?: string }>;
  latestDeployments?: Array<any>;
  link?: { repo?: string; org?: string };
};

function normalizeProjectsResponse(body: any): VercelProject[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.projects)) return body.projects;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function formatDate(value?: number | string) {
  if (!value) return '';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function normalizeUrl(value?: string) {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function filterTracked(projects: VercelProject[], tracked: string) {
  const wanted = tracked
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.toLowerCase());

  if (wanted.length === 0) return projects;

  return projects.filter(project => {
    const haystacks = [project.id, project.name].filter(Boolean).map(v => String(v).toLowerCase());
    return haystacks.some(value => wanted.includes(value));
  });
}

async function loadProjects(token: string, teamId?: string, trackedProjects?: string) {
  const params = new URLSearchParams({ limit: '50' });
  if (teamId) params.set('teamId', teamId);

  const res = await fetch(`https://api.vercel.com/v10/projects?${params.toString()}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch Vercel projects');
  }

  const body = await res.json();
  let projects = normalizeProjectsResponse(body);

  if (trackedProjects) {
    projects = filterTracked(projects, trackedProjects);
  }

  return projects.map(project => {
    const latest = project.latestDeployments?.[0];
    const aliasList = Array.isArray(project.alias) ? project.alias : [];
    return {
      id: project.id,
      name: project.name,
      framework: project.framework || 'unknown',
      createdAt: formatDate(project.createdAt),
      updatedAt: formatDate(project.updatedAt),
      live: Boolean(project.live),
      paused: Boolean(project.paused),
      productionBranch: project.productionBranch || 'main',
      repo: project.link?.repo || '',
      org: project.link?.org || '',
      domains: aliasList.map(alias => alias.domain).filter(Boolean),
      domainCount: aliasList.length,
      latestDeployment: latest
        ? {
            id: latest.id,
            name: latest.name,
            state: latest.readyState || latest.state || 'UNKNOWN',
            target: latest.target || 'production',
            url: normalizeUrl(latest.url || latest.deploymentHostname || latest.alias?.[0]?.domain || ''),
            createdAt: formatDate(latest.createdAt || latest.requestedAt),
            aliasCount: Array.isArray(latest.alias) ? latest.alias.length : 0,
          }
        : null,
    };
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'projects';

    const db = readDb();
    const vercelPlugin = db.plugins.find(p => p.id === 'vercel');
    const token = resolveSecret(vercelPlugin?.settings.authToken.value || '');
    const teamId = vercelPlugin?.settings.teamId?.value?.trim?.() || searchParams.get('teamId') || '';
    const trackedProjects = resolveSecret(vercelPlugin?.settings.projectId?.value?.trim?.() || searchParams.get('trackedProjects') || '');

    if (!token || token.trim() === '') {
      return NextResponse.json({ error: 'Vercel Auth Token not configured.' }, { status: 400 });
    }

    const projects = await loadProjects(token, teamId, trackedProjects);

    if (type === 'projects') {
      return NextResponse.json({ projects });
    }

    if (type === 'deployments') {
      const deployments = projects
        .filter(project => project.latestDeployment)
        .map(project => ({
          id: project.latestDeployment!.id || `${project.latestDeployment!.name || 'deployment'}-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          state: project.latestDeployment!.state,
          target: project.latestDeployment!.target,
          url: project.latestDeployment!.url,
          createdAt: project.latestDeployment!.createdAt,
          aliasCount: project.latestDeployment!.aliasCount,
        }))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

      return NextResponse.json({ deployments });
    }

    if (type === 'domains') {
      const domains = projects.flatMap(project =>
        (project.domains || []).map(domain => ({
          projectId: project.id,
          projectName: project.name,
          domain,
          live: project.live,
          paused: project.paused,
        }))
      );

      return NextResponse.json({ domains });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to communicate with Vercel API.' }, { status: 500 });
  }
}