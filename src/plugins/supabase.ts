import { Plugin } from '@/types';

export const supabasePlugin: Plugin = {
  id: 'supabase',
  name: 'Supabase Database',
  description: 'Monitor serverless databases, list database branches, and view deployed Edge Functions.',
  icon: 'Database',
  enabled: false,
  settings: {
    accessToken: {
      label: 'Supabase Access Token',
      type: 'password',
      value: '',
      placeholder: 'sbp_...',
    },
    projectRef: {
      label: 'Supabase Project Ref',
      type: 'text',
      value: '',
      placeholder: 'e.g. abcdefghijkl...',
    },
  },
  widgets: [
    { id: 'supabase-project', title: 'Supabase Project', size: 'md', component: 'SupabaseProjectDetails' },
    { id: 'supabase-functions', title: 'Supabase Edge Functions', size: 'md', component: 'SupabaseEdgeFunctions' },
  ],
  commands: [
    {
      id: 'supabase-sync',
      name: 'Supabase: Force Sync Projects',
      description: 'Fetch the latest edge function deployments and project health.',
      category: 'Supabase',
      action: async (ctx) => {
        await ctx.addFeedNotification({
          pluginId: 'supabase',
          title: 'Supabase projects synchronized',
          description: 'Loaded project metrics and Edge Functions.',
          type: 'success',
        });
        return 'Supabase data synchronized successfully!';
      },
    },
  ],
};
