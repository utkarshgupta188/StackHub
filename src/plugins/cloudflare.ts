import { Plugin } from '@/types';

export const cloudflarePlugin: Plugin = {
  id: 'cloudflare',
  name: 'Cloudflare Proxy',
  description: 'Inspect DNS records, configure SSL/TLS settings, and monitor security firewall blocks.',
  icon: 'Shield',
  enabled: false,
  settings: {
    apiToken: {
      label: 'Cloudflare API Token',
      type: 'password',
      value: '',
      placeholder: 'Paste CF API Token...',
    },
    zoneId: {
      label: 'Cloudflare Zone ID',
      type: 'text',
      value: '',
      placeholder: 'e.g. 1a2b3c4d5e...',
    },
  },
  widgets: [
    { id: 'cloudflare-dns', title: 'Cloudflare DNS Records', size: 'md', component: 'CloudflareDns' },
    { id: 'cloudflare-security', title: 'Security Blocks Feed', size: 'sm', component: 'CloudflareSecurity' },
  ],
  commands: [
    {
      id: 'cloudflare-purge-cache',
      name: 'Cloudflare: Purge all caches',
      description: 'Forces edge cache eviction across all global Cloudflare PoPs.',
      category: 'Cloudflare',
      action: async (ctx) => {
        await ctx.addFeedNotification({
          pluginId: 'cloudflare',
          title: 'Cloudflare cache purged',
          description: 'Evicted A & CNAME resource cache globally.',
          type: 'success',
        });
        return 'Cloudflare cache purged successfully!';
      },
    },
  ],
};
