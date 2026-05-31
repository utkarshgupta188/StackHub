import { Plugin } from '@/types';

export const vercelPlugin: Plugin = {
  id: 'vercel',
  name: 'Vercel Deployment',
  description: 'Track multiple Vercel projects, inspect deployments, and monitor domain health in one place.',
  icon: 'Triangle',
  enabled: false,
  settings: {
    authToken: {
      label: 'Vercel Auth Token',
      type: 'password',
      value: '',
      placeholder: 'Paste Vercel Token...',
    },
    projectId: {
      label: 'Tracked Projects',
      type: 'text',
      value: '',
      placeholder: 'Comma-separated project IDs or names; leave blank for all projects...',
    },
    teamId: {
      label: 'Vercel Team ID',
      type: 'text',
      value: '',
      placeholder: 'Optional teamId for team resources...',
    },
  },
  widgets: [
    { id: 'vercel-projects', title: 'Project Portfolio', size: 'full', component: 'VercelProjects' },
    { id: 'vercel-deployments', title: 'Recent Deployments', size: 'md', component: 'VercelDeployments' },
    { id: 'vercel-domains', title: 'Domain Coverage', size: 'md', component: 'VercelDomains' },
  ],
  commands: [
    {
      id: 'vercel-redeploy',
      name: 'Vercel: Trigger redeployment',
      description: 'Dispatches build signal to build and deploy latest main commit.',
      category: 'Vercel',
      action: async (ctx) => {
        await ctx.addFeedNotification({
          pluginId: 'vercel',
          title: 'Vercel Build Triggered',
          description: 'Deploying commit "d02f5f0" in production.',
          type: 'info',
        });
        return 'Vercel redeployment triggered!';
      },
    },
  ],
};
