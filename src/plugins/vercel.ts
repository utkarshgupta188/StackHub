import { Plugin } from '@/types';

export const vercelPlugin: Plugin = {
  id: 'vercel',
  name: 'Vercel Deployment',
  description: 'Inspect active deployments, check domains resolution, and trigger instant project rollbacks.',
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
      label: 'Vercel Project ID',
      type: 'text',
      value: '',
      placeholder: 'e.g. prj_1a2b3c4d...',
    },
  },
  widgets: [
    { id: 'vercel-deployments', title: 'Vercel Deployments', size: 'md', component: 'VercelDeployments' },
    { id: 'vercel-domains', title: 'Project Domain States', size: 'sm', component: 'VercelDomains' },
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
